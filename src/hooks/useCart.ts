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
      // Try to find active cart
      const { data: existingCart, error: findError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
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
    if (!cartId || items.length === 0) {
      toast.error('Корзина пуста');
      return null;
    }

    setOptimizing(true);
    try {
      const itemsToOptimize = items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
      }));

      const { data, error } = await supabase.functions.invoke('optimize-cart', {
        body: { items: itemsToOptimize, cart_id: cartId }
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
  }, [cartId, items, fetchCartItems]);

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
    removeItem,
    updateItemQuantity,
    clearCart,
    optimizeCart,
    refetch: fetchCartItems,
  };
}
