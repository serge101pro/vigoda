import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "v1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MassPushRequest {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  targetUserIds?: string[]; // If empty, send to all users with subscriptions
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
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

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );

    return true;
  } catch (error) {
    console.error(`[${VERSION}] Error sending web push:`, error);
    return false;
  }
}

serve(async (req: Request) => {
  console.log(`[${VERSION}] Mass push notification request received`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error(`[${VERSION}] VAPID keys not configured`);
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured", _version: VERSION }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', _version: VERSION }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify caller is superadmin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', _version: VERSION }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is superadmin
    const { data: superadminData } = await supabase
      .from('superadmin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!superadminData) {
      return new Response(
        JSON.stringify({ error: 'Access denied. Superadmin only.', _version: VERSION }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: MassPushRequest = await req.json();
    const { title, body: notificationBody, url, tag, targetUserIds } = body;

    if (!title || !notificationBody) {
      return new Response(
        JSON.stringify({ error: "Title and body are required", _version: VERSION }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[${VERSION}] Sending mass push notification: "${title}"`);

    // Get push subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    
    if (targetUserIds && targetUserIds.length > 0) {
      query = query.in('user_id', targetUserIds);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error(`[${VERSION}] Error fetching subscriptions:`, subError);
      return new Response(
        JSON.stringify({ error: subError.message, _version: VERSION }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No push subscriptions found",
          sent: 0,
          failed: 0,
          _version: VERSION 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: PushPayload = {
      title,
      body: notificationBody,
      url: url || "/",
      tag: tag || "mass-notification",
    };

    let sentCount = 0;
    let failedCount = 0;
    const failedSubscriptionIds: string[] = [];

    // Send to all subscriptions in batches
    const batchSize = 50;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      
      const results = await Promise.all(
        batch.map(async (sub) => {
          const success = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
            vapidPublicKey,
            vapidPrivateKey
          );
          
          if (!success) {
            failedSubscriptionIds.push(sub.id);
          }
          
          return success;
        })
      );
      
      sentCount += results.filter(r => r).length;
      failedCount += results.filter(r => !r).length;
    }

    // Clean up failed subscriptions
    if (failedSubscriptionIds.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", failedSubscriptionIds);
      
      console.log(`[${VERSION}] Removed ${failedSubscriptionIds.length} invalid subscriptions`);
    }

    console.log(`[${VERSION}] Mass push complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        total: subscriptions.length,
        _version: VERSION 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error(`[${VERSION}] Error in send-mass-push:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, _version: VERSION }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
