import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  is_checked: boolean;
  product_id: string | null;
}

interface ShoppingList {
  id: string;
  name: string;
  is_shared: boolean;
  created_at: string;
  items: ShoppingListItem[];
}

export function useShoppingLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: listsData, error: listsError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;

      // Fetch items for each list
      const listsWithItems = await Promise.all(
        (listsData || []).map(async (list) => {
          const { data: itemsData } = await supabase
            .from('shopping_list_items')
            .select('*')
            .eq('list_id', list.id)
            .order('created_at', { ascending: true });

          return {
            ...list,
            items: (itemsData || []).map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity || 1,
              is_checked: item.is_checked || false,
              product_id: item.product_id,
            })),
          };
        })
      );

      setLists(listsWithItems);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (name: string) => {
    if (!user) {
      toast({ title: 'Войдите в аккаунт', description: 'Для создания списка необходима авторизация' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      await fetchLists();
      toast({ title: 'Список создан' });
      return data;
    } catch (error) {
      console.error('Error creating list:', error);
      toast({ title: 'Ошибка', description: 'Не удалось создать список', variant: 'destructive' });
      return null;
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
      await fetchLists();
      toast({ title: 'Список удалён' });
      return true;
    } catch (error) {
      console.error('Error deleting list:', error);
      return false;
    }
  };

  const addItemToList = async (listId: string, name: string, quantity: number = 1, productId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          list_id: listId,
          name,
          quantity,
          product_id: productId || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchLists();
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  };

  const updateItem = async (itemId: string, updates: { name?: string; quantity?: number; is_checked?: boolean }) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      await fetchLists();
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchLists();
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  };

  const toggleItemChecked = async (itemId: string, isChecked: boolean) => {
    return updateItem(itemId, { is_checked: isChecked });
  };

  return {
    lists,
    loading,
    createList,
    deleteList,
    addItemToList,
    updateItem,
    deleteItem,
    toggleItemChecked,
    refetch: fetchLists,
  };
}
