import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { referrer_id, referred_name, bonus_amount } = await req.json();

    if (!referrer_id) {
      return new Response(
        JSON.stringify({ error: "referrer_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get referrer's profile to check for telegram_chat_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("telegram_chat_id, email, display_name")
      .eq("user_id", referrer_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notifications = [];

    // Send Telegram notification if chat_id is configured
    if (profile.telegram_chat_id && telegramBotToken) {
      const message = `🎉 Отличные новости!\n\nВаш друг ${referred_name || "Новый пользователь"} совершил первый заказ!\n\n💰 Вам начислено ${bonus_amount || 200} бонусных рублей!\n\nПриглашайте больше друзей и зарабатывайте вместе с Выгода!`;

      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: profile.telegram_chat_id,
              text: message,
              parse_mode: "HTML",
            }),
          }
        );

        if (telegramResponse.ok) {
          notifications.push("telegram");
        }
      } catch (err) {
        console.error("Telegram notification error:", err);
      }
    }

    // Here you could also send email notification using Resend
    // For now, we'll just log it
    if (profile.email) {
      console.log(`Would send email to ${profile.email} about referral activation`);
      notifications.push("email_logged");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notifications,
        message: `Notifications sent: ${notifications.join(", ") || "none"}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
