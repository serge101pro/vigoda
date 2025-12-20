import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';

interface OrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  delivery_address?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface CreateOrderData {
  total_amount: number;
  delivery_address?: string;
  payment_method?: string;
  items: Omit<OrderItem, 'id'>[];
}

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const clearCart = useAppStore((state) => state.clearCart);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          
          return {
            ...order,
            order_items: items || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Необходима авторизация',
          description: 'Войдите в аккаунт для оформления заказа',
          variant: 'destructive',
        });
        return null;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderData.total_amount,
          delivery_address: orderData.delivery_address,
          payment_method: orderData.payment_method,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      clearCart();

      // Refresh orders list
      await fetchOrders();

      toast({
        title: 'Заказ оформлен!',
        description: `Номер заказа: ${order.id.slice(0, 8).toUpperCase()}`,
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOrders = async () => {
    await fetchOrders();
    return orders;
  };

  const getOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh orders
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };

  return {
    orders,
    isLoading,
    loading,
    createOrder,
    getOrders,
    getOrderItems,
    updateOrderStatus,
    refetch: fetchOrders,
  };
}
