import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramNotifyRequest {
  type: "coop_cart_ready" | "new_order" | "order_approval_needed" | "order_approved" | "order_rejected";
  organizationId: string;
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

    const { type, organizationId, data }: TelegramNotifyRequest = await req.json();

    console.log(`Processing notification type: ${type} for org: ${organizationId}`);

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("name, telegram_chat_id")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      console.error("Organization not found:", orgError);
      throw new Error("Organization not found");
    }

    // Get managers with telegram IDs
    const { data: managers, error: managersError } = await supabase
      .from("org_members")
      .select("user_id, role")
      .eq("organization_id", organizationId)
      .in("role", ["admin", "manager"])
      .eq("is_active", true);

    if (managersError) {
      console.error("Error fetching managers:", managersError);
    }

    // Get manager profiles with telegram chat IDs
    const managerIds = managers?.map(m => m.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("telegram_chat_id, display_name")
      .in("user_id", managerIds);

    // Collect all chat IDs to notify
    const chatIds: string[] = [];
    
    // Add organization's main chat if exists
    if (org.telegram_chat_id) {
      chatIds.push(org.telegram_chat_id);
    }

    // Add individual manager chats
    profiles?.forEach(p => {
      if (p.telegram_chat_id && !chatIds.includes(p.telegram_chat_id)) {
        chatIds.push(p.telegram_chat_id);
      }
    });

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
          `📦 Организация: ${org.name}\n` +
          `💰 Сумма: ${data?.total || 0} ₽\n` +
          `📊 Товаров: ${data?.itemsCount || 0}\n\n` +
          `⏰ Автозаказ будет оформлен в ${data?.autoOrderTime || "11:15"}`;
        break;

      case "new_order":
        message = `📝 <b>Новый заказ!</b>\n\n` +
          `👤 Сотрудник: ${data?.employeeName || "Неизвестно"}\n` +
          `📦 Товаров: ${data?.itemsCount || 0}\n` +
          `💰 Сумма: ${data?.total || 0} ₽\n` +
          `📂 Категория: ${data?.category || "Обед"}`;
        break;

      case "order_approval_needed":
        message = `⚠️ <b>Требуется согласование!</b>\n\n` +
          `👤 Сотрудник: ${data?.employeeName || "Неизвестно"}\n` +
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

      default:
        message = `📢 Уведомление от ${org.name}`;
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
