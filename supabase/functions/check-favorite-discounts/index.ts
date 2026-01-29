import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiscountedProduct {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  userId: string;
  telegramChatId: string | null;
}

async function sendTelegramNotification(
  botToken: string, 
  chatId: string, 
  product: DiscountedProduct
) {
  const message = `🔥 <b>Скидка на товар из избранного!</b>\n\n` +
    `📦 ${product.productName}\n` +
    `💰 Старая цена: ${product.oldPrice} ₽\n` +
    `🏷️ Новая цена: ${product.newPrice} ₽\n` +
    `📉 Экономия: ${product.discount}%\n\n` +
    `⚡ Успейте купить по выгодной цене!`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting favorite discounts check...");

    // Get all favorites with product info
    const { data: favorites, error: favError } = await supabase
      .from("favorites")
      .select(`
        user_id,
        product_id,
        products (
          id,
          name,
          price,
          old_price
        )
      `)
      .not("product_id", "is", null);

    if (favError) {
      console.error("Error fetching favorites:", favError);
      throw favError;
    }

    console.log(`Found ${favorites?.length || 0} favorites with products`);

    // Find products that are on sale (have old_price > price)
    const discountedProducts: DiscountedProduct[] = [];

    for (const fav of favorites || []) {
      const product = fav.products as unknown as { id: string; name: string; price: number; old_price: number | null } | null;
      
      if (product && product.old_price && product.old_price > product.price) {
        const discount = Math.round(((product.old_price - product.price) / product.old_price) * 100);
        
        // Get user's telegram_chat_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("telegram_chat_id")
          .eq("user_id", fav.user_id)
          .maybeSingle();

        // Check notification settings
        const { data: settings } = await supabase
          .from("notification_settings")
          .select("telegram_enabled, discount_alerts")
          .eq("user_id", fav.user_id)
          .maybeSingle();

        // Only add if user has discount alerts enabled
        if (settings?.discount_alerts !== false) {
          discountedProducts.push({
            productId: product.id,
            productName: product.name,
            oldPrice: product.old_price,
            newPrice: product.price,
            discount,
            userId: fav.user_id,
            telegramChatId: profile?.telegram_chat_id || null,
          });
        }
      }
    }

    console.log(`Found ${discountedProducts.length} discounted favorites`);

    // Send Telegram notifications
    const notificationResults = [];
    
    if (botToken) {
      for (const product of discountedProducts) {
        if (product.telegramChatId) {
          try {
            await sendTelegramNotification(botToken, product.telegramChatId, product);
            notificationResults.push({
              userId: product.userId,
              productName: product.productName,
              telegram: "sent",
            });
            console.log(`Sent Telegram notification to ${product.telegramChatId} for ${product.productName}`);
          } catch (err) {
            console.error(`Failed to send Telegram to ${product.telegramChatId}:`, err);
            notificationResults.push({
              userId: product.userId,
              productName: product.productName,
              telegram: "failed",
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checked: favorites?.length || 0,
        discounted: discountedProducts.length,
        notifications: notificationResults,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in check-favorite-discounts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
