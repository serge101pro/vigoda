import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramNotifyRequest {
  type: 
    | "coop_cart_ready" 
    | "new_order" 
    | "order_approval_needed" 
    | "order_approved" 
    | "order_rejected"
    | "referral_activated"
    | "order_status_update"
    | "discount_alert"
    | "shopping_reminder"
    | "welcome";
  organizationId?: string;
  userId?: string;
  data?: Record<string, unknown>;
}

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Telegram API error:", error);
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, organizationId, userId, data }: TelegramNotifyRequest = await req.json();

    console.log(`Processing notification type: ${type}, org: ${organizationId}, user: ${userId}`);

    const chatIds: string[] = [];

    // If userId is provided, get user's telegram chat ID
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("telegram_chat_id, display_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile?.telegram_chat_id) {
        chatIds.push(profile.telegram_chat_id);
      }
    }

    // If organizationId is provided, get org and manager chat IDs
    if (organizationId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name, telegram_chat_id")
        .eq("id", organizationId)
        .maybeSingle();

      if (org?.telegram_chat_id && !chatIds.includes(org.telegram_chat_id)) {
        chatIds.push(org.telegram_chat_id);
      }

      // Get managers with telegram IDs
      const { data: managers } = await supabase
        .from("org_members")
        .select("user_id")
        .eq("organization_id", organizationId)
        .in("role", ["admin", "manager"])
        .eq("is_active", true);

      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("telegram_chat_id")
          .in("user_id", managerIds);

        profiles?.forEach(p => {
          if (p.telegram_chat_id && !chatIds.includes(p.telegram_chat_id)) {
            chatIds.push(p.telegram_chat_id);
          }
        });
      }
    }

    if (chatIds.length === 0) {
      console.log("No Telegram chat IDs configured for notifications");
      return new Response(
        JSON.stringify({ success: true, message: "No chat IDs configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build message based on type
    let message = "";
    
    switch (type) {
      case "coop_cart_ready":
        message = `🛒 <b>Совместная корзина готова!</b>\n\n` +
          `📦 Организация: ${data?.orgName || "—"}\n` +
          `💰 Сумма: ${data?.total || 0} ₽\n` +
          `📊 Товаров: ${data?.itemsCount || 0}\n\n` +
          `⏰ Автозаказ будет оформлен в ${data?.autoOrderTime || "11:15"}`;
        break;

      case "new_order":
        message = `📝 <b>Новый заказ!</b>\n\n` +
          `👤 Сотрудник: ${data?.employeeName || "—"}\n` +
          `📦 Товаров: ${data?.itemsCount || 0}\n` +
          `💰 Сумма: ${data?.total || 0} ₽\n` +
          `📂 Категория: ${data?.category || "Обед"}`;
        break;

      case "order_approval_needed":
        message = `⚠️ <b>Требуется согласование!</b>\n\n` +
          `👤 Сотрудник: ${data?.employeeName || "—"}\n` +
          `📦 Заказ: ${data?.orderNumber || ""}\n` +
          `💰 Сумма: ${data?.total || 0} ₽\n\n` +
          `⏳ Ожидает вашего решения`;
        break;

      case "order_approved":
        message = `✅ <b>Заказ согласован!</b>\n\n` +
          `📦 Заказ: ${data?.orderNumber || ""}\n` +
          `👤 Одобрил: ${data?.approverName || "Менеджер"}\n` +
          `💬 Комментарий: ${data?.comment || "Без комментария"}`;
        break;

      case "order_rejected":
        message = `❌ <b>Заказ отклонён!</b>\n\n` +
          `📦 Заказ: ${data?.orderNumber || ""}\n` +
          `👤 Отклонил: ${data?.approverName || "Менеджер"}\n` +
          `💬 Причина: ${data?.reason || "Не указана"}`;
        break;

      case "referral_activated":
        message = `🎉 <b>Реферал активирован!</b>\n\n` +
          `👤 Ваш друг ${data?.referredName || "пользователь"} совершил первую покупку!\n` +
          `💰 Вам начислено: ${data?.bonusAmount || 500} ₽\n\n` +
          `🎁 Продолжайте приглашать друзей и получайте бонусы!`;
        break;

      case "order_status_update":
        message = `📦 <b>Статус заказа обновлён</b>\n\n` +
          `🆔 Заказ: #${data?.orderId || ""}\n` +
          `📊 Статус: ${data?.status || "—"}\n` +
          `${data?.estimatedDelivery ? `🚚 Ожидаемая доставка: ${data.estimatedDelivery}` : ""}`;
        break;

      case "discount_alert":
        message = `🔥 <b>Скидка на любимый товар!</b>\n\n` +
          `📦 ${data?.productName || "Товар"}\n` +
          `💰 Старая цена: ${data?.oldPrice || 0} ₽\n` +
          `🏷️ Новая цена: ${data?.newPrice || 0} ₽\n` +
          `📉 Экономия: ${data?.discount || 0}%`;
        break;

      case "shopping_reminder":
        message = `🛒 <b>Напоминание о покупках</b>\n\n` +
          `📝 У вас ${data?.itemsCount || 0} товаров в списке покупок\n` +
          `⏰ Самое время сходить за покупками!`;
        break;

      case "welcome":
        message = `👋 <b>Добро пожаловать в ВыгодноТут!</b>\n\n` +
          `🎁 Вам доступны персональные скидки и акции\n` +
          `📊 Отслеживайте свою экономию\n` +
          `🛒 Создавайте списки покупок\n\n` +
          `Приятных покупок! 💚`;
        break;

      default:
        message = `📢 Уведомление от ВыгодноТут`;
    }

    // Send to all chat IDs
    const results = [];
    for (const chatId of chatIds) {
      try {
        await sendTelegramMessage(botToken, chatId, message);
        results.push({ chatId, success: true });
        console.log(`Message sent to chat ${chatId}`);
      } catch (error) {
        console.error(`Failed to send to ${chatId}:`, error);
        results.push({ chatId, success: false, error: String(error) });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in telegram-notify:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
