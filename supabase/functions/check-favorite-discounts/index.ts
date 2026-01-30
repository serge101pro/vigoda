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

interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
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

async function sendWebPushNotification(
  subscription: PushSubscription,
  product: DiscountedProduct,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const webPush = await import("https://esm.sh/web-push@3.6.7");
    
    webPush.setVapidDetails(
      "mailto:support@vigoda.app",
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title: `🔥 Скидка ${product.discount}%!`,
      body: `${product.productName}: ${product.oldPrice}₽ → ${product.newPrice}₽`,
      url: "/deals",
      tag: `discount-${product.productId}`,
    });

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload
    );

    return true;
  } catch (error) {
    console.error("Error sending web push:", error);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    
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
          .select("telegram_enabled, discount_alerts, push_enabled")
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

    // Send notifications
    const notificationResults = [];
    
    // Group products by user for efficient notification sending
    const productsByUser = new Map<string, DiscountedProduct[]>();
    for (const product of discountedProducts) {
      const existing = productsByUser.get(product.userId) || [];
      existing.push(product);
      productsByUser.set(product.userId, existing);
    }

    for (const [userId, products] of productsByUser) {
      const firstProduct = products[0];
      
      // Send Telegram notification
      if (botToken && firstProduct.telegramChatId) {
        try {
          await sendTelegramNotification(botToken, firstProduct.telegramChatId, firstProduct);
          notificationResults.push({
            userId,
            productName: firstProduct.productName,
            telegram: "sent",
          });
          console.log(`Sent Telegram notification to ${firstProduct.telegramChatId} for ${firstProduct.productName}`);
        } catch (err) {
          console.error(`Failed to send Telegram to ${firstProduct.telegramChatId}:`, err);
          notificationResults.push({
            userId,
            productName: firstProduct.productName,
            telegram: "failed",
          });
        }
      }

      // Send Web Push notification if VAPID keys are configured
      if (vapidPublicKey && vapidPrivateKey) {
        // Get user's push subscriptions
        const { data: pushSubs } = await supabase
          .from("push_subscriptions")
          .select("id, endpoint, p256dh, auth")
          .eq("user_id", userId);

        if (pushSubs && pushSubs.length > 0) {
          for (const sub of pushSubs) {
            try {
              const success = await sendWebPushNotification(
                sub as PushSubscription,
                firstProduct,
                vapidPublicKey,
                vapidPrivateKey
              );
              
              if (success) {
                notificationResults.push({
                  userId,
                  productName: firstProduct.productName,
                  webPush: "sent",
                });
                console.log(`Sent Web Push to user ${userId} for ${firstProduct.productName}`);
              } else {
                // Remove invalid subscription
                await supabase
                  .from("push_subscriptions")
                  .delete()
                  .eq("id", sub.id);
              }
            } catch (err) {
              console.error(`Failed to send Web Push:`, err);
            }
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
