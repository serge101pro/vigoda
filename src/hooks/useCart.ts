import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CartItemDB {
  id: string;
  cart_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category: string | null;
  packs_count: number | null;
  is_optimized: boolean | null;
  created_at: string;
}

export interface OptimizedCartItem extends CartItemDB {
  final_quantity: number;
  original_quantity: number;
}

export interface ImportCartItemInput {
  name: string;
  quantity: number;
  unit?: string | null;
  category?: string | null;
}

export function useCart() {
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItemDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Get or create active cart for user
  const getOrCreateCart = useCallback(async () => {
    if (!user) return null;

    try {
      // Try to find latest active cart (limit 1 avoids errors if multiple active carts exist)
      const { data: existingCart, error: findError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Error finding cart:', findError);
        return null;
      }

      if (existingCart) {
        return existingCart.id;
      }

      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: user.id, status: 'active' })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating cart:', createError);
        return null;
      }

      return newCart.id;
    } catch (err) {
      console.error('Error in getOrCreateCart:', err);
      return null;
    }
  }, [user]);

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const activeCartId = await getOrCreateCart();
      if (!activeCartId) {
        setLoading(false);
        return;
      }

      setCartId(activeCartId);

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', activeCartId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching cart items:', error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error('Error in fetchCartItems:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, getOrCreateCart]);

  // Import a batch of items into the DB cart (useful when the user has a local cart but DB cart is empty).
  const importItems = useCallback(async (inputItems: ImportCartItemInput[]) => {
    if (!user) {
      toast.error('Войдите в систему для синхронизации корзины');
      return false;
    }

    const normalized = (inputItems || [])
      .map((i) => ({
        name: (i?.name || '').trim(),
        quantity: Number(i?.quantity || 0),
        unit: i?.unit ?? 'шт',
        category: i?.category ?? null,
      }))
      .filter((i) => i.name.length > 0 && Number.isFinite(i.quantity) && i.quantity > 0);

    if (normalized.length === 0) return true;

    try {
      let activeCartId = cartId;
      if (!activeCartId) {
        activeCartId = await getOrCreateCart();
        if (!activeCartId) {
          toast.error('Не удалось создать корзину');
          return false;
        }
        setCartId(activeCartId);
      }

      const { data: existingItems, error: existingError } = await supabase
        .from('cart_items')
        .select('id,name,quantity,unit,category')
        .eq('cart_id', activeCartId);

      if (existingError) throw existingError;

      const byName = new Map<string, (typeof existingItems)[number]>();
      (existingItems || []).forEach((row) => byName.set(row.name.toLowerCase(), row));

      // Merge duplicates in input by name (case-insensitive)
      const merged = new Map<string, { name: string; quantity: number; unit: string | null; category: string | null }>();
      for (const i of normalized) {
        const key = i.name.toLowerCase();
        const prev = merged.get(key);
        merged.set(key, {
          name: i.name,
          quantity: (prev?.quantity || 0) + i.quantity,
          unit: i.unit,
          category: i.category,
        });
      }

      const toInsert: Array<{ cart_id: string; name: string; quantity: number; unit: string | null; category: string | null }> = [];
      const toUpdate: Array<{ id: string; quantity: number; unit: string | null; category: string | null }> = [];

      for (const [key, i] of merged.entries()) {
        const existing = byName.get(key);
        if (existing) {
          toUpdate.push({
            id: existing.id,
            quantity: Number(existing.quantity || 0) + i.quantity,
            unit: i.unit ?? existing.unit,
            category: i.category ?? existing.category,
          });
        } else {
          toInsert.push({
            cart_id: activeCartId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            category: i.category,
          });
        }
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from('cart_items').insert(toInsert);
        if (error) throw error;
      }

      if (toUpdate.length > 0) {
        // Supabase doesn't support per-row updates in a single call without a stored procedure.
        await Promise.all(
          toUpdate.map((u) =>
            supabase
              .from('cart_items')
              .update({ quantity: u.quantity, unit: u.unit, category: u.category })
              .eq('id', u.id)
          )
        );
      }

      await fetchCartItems();
      return true;
    } catch (err) {
      console.error('Error importing items to DB cart:', err);
      toast.error('Ошибка при синхронизации корзины');
      return false;
    }
  }, [user, cartId, getOrCreateCart, fetchCartItems]);

  // Add item to cart
  const addItem = useCallback(async (name: string, quantity: number, unit?: string, category?: string) => {
    if (!user) {
      toast.error('Войдите в систему для добавления в корзину');
      return false;
    }

    try {
      let activeCartId = cartId;
      if (!activeCartId) {
        activeCartId = await getOrCreateCart();
        if (!activeCartId) {
          toast.error('Не удалось создать корзину');
          return false;
        }
        setCartId(activeCartId);
      }

      // Check if item already exists
      const existingItem = items.find(i => i.name.toLowerCase() === name.toLowerCase());
      
      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: activeCartId,
            name,
            quantity,
            unit: unit || 'шт',
            category: category || null,
          });

        if (error) throw error;
      }

      await fetchCartItems();
      return true;
    } catch (err) {
      console.error('Error adding item:', err);
      toast.error('Ошибка при добавлении в корзину');
      return false;
    }
  }, [user, cartId, items, getOrCreateCart, fetchCartItems]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      setItems(prev => prev.filter(i => i.id !== itemId));
      return true;
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Ошибка при удалении товара');
      return false;
    }
  }, []);

  // Update item quantity
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      ));
      return true;
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Ошибка при обновлении количества');
      return false;
    }
  }, [removeItem]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!cartId) return false;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;
      
      setItems([]);
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Ошибка при очистке корзины');
      return false;
    }
  }, [cartId]);

  // Optimize cart with AI
  const optimizeCart = useCallback(async (): Promise<OptimizedCartItem[] | null> => {
    // Re-fetch to ensure we have the latest data
    if (!user) {
      toast.error('Войдите в систему для использования AI-оптимизации');
      return null;
    }
    
    // Get fresh cart data
    let activeCartId = cartId;
    if (!activeCartId) {
      activeCartId = await getOrCreateCart();
    }
    
    if (!activeCartId) {
      toast.error('Не удалось найти корзину');
      return null;
    }
    
    // Fetch current items from DB to ensure fresh data
    const { data: freshItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', activeCartId);
    
    if (fetchError) {
      console.error('Error fetching cart items:', fetchError);
      toast.error('Ошибка при загрузке корзины');
      return null;
    }
    
    if (!freshItems || freshItems.length === 0) {
      toast.error('Корзина пуста');
      return null;
    }

    setOptimizing(true);
    try {
      const itemsToOptimize = freshItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
      }));

      const { data, error } = await supabase.functions.invoke('optimize-cart', {
        body: { items: itemsToOptimize, cart_id: activeCartId }
      });

      if (error) throw error;

      if (data.success && data.optimized_items) {
        // Refetch items to get updated values
        await fetchCartItems();
        
        toast.success(
          `Оптимизировано ${data.summary.optimized_count} из ${data.summary.total_items} товаров`
        );
        
        return data.optimized_items;
      }

      return null;
    } catch (err) {
      console.error('Error optimizing cart:', err);
      toast.error('Ошибка при оптимизации корзины');
      return null;
    } finally {
      setOptimizing(false);
    }
  }, [user, cartId, getOrCreateCart, fetchCartItems]);

  // Load cart on mount and user change
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Прочее';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CartItemDB[]>);

  return {
    cartId,
    items,
    groupedItems,
    loading,
    optimizing,
    addItem,
    importItems,
    removeItem,
    updateItemQuantity,
    clearCart,
    optimizeCart,
    refetch: fetchCartItems,
  };
}
