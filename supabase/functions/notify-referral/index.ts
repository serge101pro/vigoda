import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { referrer_id, referred_email, bonus_amount } = await req.json();

    console.log("Notifying referrer:", referrer_id, "about new referral:", referred_email);

    if (!referrer_id) {
      return new Response(JSON.stringify({ error: "Missing referrer_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get referrer's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, email, telegram_chat_id")
      .eq("user_id", referrer_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Referrer profile:", profile);

    // Send Telegram notification if chat_id exists
    if (profile.telegram_chat_id && telegramBotToken) {
      const maskedEmail = referred_email ? 
        referred_email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : 
        "новый пользователь";

      const message = `🎉 Отличные новости!\n\nВаш друг ${maskedEmail} зарегистрировался по вашей ссылке!\n\n💰 После первой покупки вы получите ${bonus_amount || 200} бонусных рублей!\n\nПродолжайте приглашать друзей и зарабатывать!`;

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

        const telegramResult = await telegramResponse.json();
        console.log("Telegram notification result:", telegramResult);
      } catch (telegramError) {
        console.error("Telegram notification error:", telegramError);
      }
    }

    // Also store notification for in-app display
    // For now, we'll just log it since we don't have a notifications table
    console.log("Referral notification processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent",
        referrer_name: profile.display_name 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in notify-referral:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
