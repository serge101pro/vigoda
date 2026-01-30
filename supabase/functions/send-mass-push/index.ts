import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "v1.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MassPushRequest {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  targetUserIds?: string[];
  audience?: 'all' | 'paid' | 'solo' | 'family' | 'corp';
  activityFilter?: 'all' | 'active_7d' | 'active_30d' | 'inactive_7d' | 'inactive_30d';
  hasEmailFilter?: boolean;
  hasPushFilter?: boolean;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let webPushModule: any | null = null;
async function getWebPushModule() {
  if (!webPushModule) {
    webPushModule = await import("https://esm.sh/web-push@3.6.7");
  }
  return webPushModule;
}

async function sendWebPush(
  webPush: any,
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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

    const token = authHeader.replace('Bearer ', '');

    // 1) Validate JWT (prefer getClaims, fallback to getUser)
    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    let callerUserId: string | null = null;
    try {
      const maybeGetClaims = (supabaseAuth.auth as any).getClaims;
      if (typeof maybeGetClaims === 'function') {
        const { data, error } = await maybeGetClaims.call(supabaseAuth.auth, token);
        if (!error && data?.claims?.sub) callerUserId = data.claims.sub;
      }
    } catch {
      // ignore
    }

    if (!callerUserId) {
      const { data, error } = await supabaseAuth.auth.getUser(token);
      if (error || !data?.user?.id) {
        return new Response(
          JSON.stringify({ error: 'Invalid token', _version: VERSION }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      callerUserId = data.user.id;
    }

    // 2) Admin DB client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is superadmin
    const { data: superadminData } = await supabaseAdmin
      .from('superadmin_users')
      .select('id')
      .eq('user_id', callerUserId)
      .maybeSingle();
    
    if (!superadminData) {
      return new Response(
        JSON.stringify({ error: 'Access denied. Superadmin only.', _version: VERSION }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const reqBody: MassPushRequest = await req.json();
    const { 
      title, 
      body: notificationBody, 
      url, 
      tag, 
      targetUserIds, 
      audience = 'all',
      activityFilter = 'all',
      hasEmailFilter = false,
    } = reqBody;

    if (!title || !notificationBody) {
      return new Response(
        JSON.stringify({ error: "Title and body are required", _version: VERSION }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[${VERSION}] Sending mass push: "${title}", audience=${audience}, activity=${activityFilter}`);

    // Step 1: Get base user IDs from subscription filter
    let baseUserIds: Set<string> | null = null;

    if (audience !== 'all') {
      let subQuery = supabaseAdmin
        .from('user_subscriptions')
        .select('user_id')
        .eq('is_active', true);

      if (audience === 'paid') {
        subQuery = subQuery.in('plan', ['solo', 'family', 'corp']);
      } else {
        subQuery = subQuery.eq('plan', audience);
      }

      const { data: subs, error: subsError } = await subQuery;
      if (subsError) throw subsError;

      baseUserIds = new Set((subs || []).map((s: any) => s.user_id).filter(Boolean));
    }

    // Step 2: Apply activity filter via profiles
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let profilesQuery = supabaseAdmin.from('profiles').select('user_id, email, last_active_at');

    if (baseUserIds && baseUserIds.size > 0) {
      profilesQuery = profilesQuery.in('user_id', Array.from(baseUserIds));
    }

    if (activityFilter === 'active_7d') {
      profilesQuery = profilesQuery.gte('last_active_at', sevenDaysAgo);
    } else if (activityFilter === 'active_30d') {
      profilesQuery = profilesQuery.gte('last_active_at', thirtyDaysAgo);
    } else if (activityFilter === 'inactive_7d') {
      profilesQuery = profilesQuery.lt('last_active_at', sevenDaysAgo);
    } else if (activityFilter === 'inactive_30d') {
      profilesQuery = profilesQuery.lt('last_active_at', thirtyDaysAgo);
    }

    // Paginate profiles
    let allProfiles: any[] = [];
    const pageSize = 1000;
    let offset = 0;

    while (true) {
      const { data, error } = await profilesQuery.range(offset, offset + pageSize - 1);
      if (error) throw error;
      const chunk = data || [];
      allProfiles = allProfiles.concat(chunk);
      if (chunk.length < pageSize) break;
      offset += pageSize;
    }

    // Step 3: Apply email filter if needed
    if (hasEmailFilter) {
      allProfiles = allProfiles.filter(p => p.email && p.email.includes('@'));
    }

    // Use target user IDs if provided, otherwise use filtered profiles
    let effectiveTargetUserIds: string[] | null = 
      targetUserIds && targetUserIds.length > 0 
        ? targetUserIds 
        : (activityFilter !== 'all' || audience !== 'all' || hasEmailFilter)
          ? allProfiles.map(p => p.user_id)
          : null;

    // Get push subscriptions
    let subscriptions: any[] = [];
    if (effectiveTargetUserIds && effectiveTargetUserIds.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < effectiveTargetUserIds.length; i += chunkSize) {
        const chunk = effectiveTargetUserIds.slice(i, i + chunkSize);
        const { data, error } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .in('user_id', chunk);
        if (error) {
          console.error(`[${VERSION}] Error fetching subscriptions:`, error);
          return new Response(
            JSON.stringify({ error: error.message, _version: VERSION }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        subscriptions = subscriptions.concat(data || []);
      }
    } else if (effectiveTargetUserIds && effectiveTargetUserIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No recipients for selected audience',
          sent: 0,
          failed: 0,
          total: 0,
          _version: VERSION,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      // NOTE: Supabase has a default 1000-row limit; paginate to truly send to all.
      const pageSize = 1000;
      let offset = 0;
      while (true) {
        const { data, error } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .range(offset, offset + pageSize - 1);

        if (error) {
          console.error(`[${VERSION}] Error fetching subscriptions:`, error);
          return new Response(
            JSON.stringify({ error: error.message, _version: VERSION }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const chunk = data || [];
        subscriptions = subscriptions.concat(chunk);

        if (chunk.length < pageSize) break;
        offset += pageSize;
      }
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

    const webPush = await getWebPushModule();
    webPush.setVapidDetails(
      "mailto:support@vigoda.app",
      vapidPublicKey,
      vapidPrivateKey
    );

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
            webPush,
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload
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
      await supabaseAdmin
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
