import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  comment?: string;
  is_default: boolean;
  lat?: number;
  lng?: number;
}

export function useDeliveryAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async (address: Omit<DeliveryAddress, 'id'>) => {
    if (!user) return null;

    try {
      // If new address is default, unset other defaults
      if (address.is_default) {
        await supabase
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('delivery_addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [data, ...prev]);
      toast.success('Адрес добавлен');
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Не удалось добавить адрес');
      return null;
    }
  };

  const updateAddress = async (id: string, updates: Partial<DeliveryAddress>) => {
    if (!user) return false;

    try {
      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('delivery_addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAddresses(prev =>
        prev.map(addr => (addr.id === id ? { ...addr, ...updates } : addr))
      );
      toast.success('Адрес обновлён');
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Не удалось обновить адрес');
      return false;
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success('Адрес удалён');
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Не удалось удалить адрес');
      return false;
    }
  };

  const setDefaultAddress = async (id: string) => {
    return updateAddress(id, { is_default: true });
  };

  return {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
