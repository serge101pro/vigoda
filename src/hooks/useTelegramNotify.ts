import { supabase } from '@/integrations/supabase/client';

export type NotificationType =
  | 'coop_cart_ready'
  | 'new_order'
  | 'order_approval_needed'
  | 'order_approved'
  | 'order_rejected'
  | 'referral_activated'
  | 'order_status_update'
  | 'discount_alert'
  | 'shopping_reminder'
  | 'welcome';

interface SendNotificationParams {
  type: NotificationType;
  organizationId?: string;
  userId?: string;
  data?: Record<string, unknown>;
}

export function useTelegramNotify() {
  const sendNotification = async (params: SendNotificationParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('telegram-notify', {
        body: params,
      });

      if (error) {
        console.error('Error sending Telegram notification:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error invoking telegram-notify:', error);
      return { success: false, error };
    }
  };

  const sendWelcomeNotification = (userId: string) => {
    return sendNotification({ type: 'welcome', userId });
  };

  const sendReferralActivatedNotification = (
    userId: string,
    referredName: string,
    bonusAmount: number
  ) => {
    return sendNotification({
      type: 'referral_activated',
      userId,
      data: { referredName, bonusAmount },
    });
  };

  const sendOrderStatusUpdate = (
    userId: string,
    orderId: string,
    status: string,
    estimatedDelivery?: string
  ) => {
    return sendNotification({
      type: 'order_status_update',
      userId,
      data: { orderId, status, estimatedDelivery },
    });
  };

  const sendDiscountAlert = (
    userId: string,
    productName: string,
    oldPrice: number,
    newPrice: number,
    discount: number
  ) => {
    return sendNotification({
      type: 'discount_alert',
      userId,
      data: { productName, oldPrice, newPrice, discount },
    });
  };

  const sendShoppingReminder = (userId: string, itemsCount: number) => {
    return sendNotification({
      type: 'shopping_reminder',
      userId,
      data: { itemsCount },
    });
  };

  return {
    sendNotification,
    sendWelcomeNotification,
    sendReferralActivatedNotification,
    sendOrderStatusUpdate,
    sendDiscountAlert,
    sendShoppingReminder,
  };
}
