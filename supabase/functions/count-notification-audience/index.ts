import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "v1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AudienceCountRequest {
  type: 'push' | 'email';
  audience: 'all' | 'paid' | 'solo' | 'family' | 'corp';
  activityFilter?: 'all' | 'active_7d' | 'active_30d' | 'inactive_7d' | 'inactive_30d';
  hasEmailFilter?: boolean;
  hasPushFilter?: boolean;
}

serve(async (req: Request) => {
  console.log(`[${VERSION}] Count notification audience request received`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', _version: VERSION }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

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

    const body: AudienceCountRequest = await req.json();
    const { type, audience, activityFilter = 'all', hasEmailFilter = false, hasPushFilter = false } = body;

    console.log(`[${VERSION}] Counting audience for ${type}: audience=${audience}, activity=${activityFilter}`);

    // Build user_id set based on audience
    let userIds: Set<string> = new Set();

    // Step 1: Get user IDs by subscription plan
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

      (subs || []).forEach((s: any) => userIds.add(s.user_id));
    }

    // Step 2: Apply activity filter
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let profilesQuery = supabaseAdmin.from('profiles').select('user_id, email, last_active_at');

    if (audience !== 'all' && userIds.size > 0) {
      profilesQuery = profilesQuery.in('user_id', Array.from(userIds));
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

    // Paginate through all profiles
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

    // Step 3: Filter by email presence if needed
    if (hasEmailFilter) {
      allProfiles = allProfiles.filter(p => p.email && p.email.includes('@'));
    }

    const filteredUserIds = new Set(allProfiles.map(p => p.user_id));

    // Step 4: Count based on notification type
    let count = 0;

    if (type === 'email') {
      // Count profiles with valid emails
      count = allProfiles.filter(p => p.email && p.email.includes('@')).length;
    } else if (type === 'push') {
      // Count push subscriptions for these users
      if (hasPushFilter || filteredUserIds.size > 0) {
        let pushQuery = supabaseAdmin.from('push_subscriptions').select('user_id');
        
        if (filteredUserIds.size > 0) {
          // Paginate the check
          const userIdArray = Array.from(filteredUserIds);
          const uniquePushUsers = new Set<string>();

          for (let i = 0; i < userIdArray.length; i += 1000) {
            const chunk = userIdArray.slice(i, i + 1000);
            const { data, error } = await supabaseAdmin
              .from('push_subscriptions')
              .select('user_id')
              .in('user_id', chunk);
            
            if (error) throw error;
            (data || []).forEach((d: any) => uniquePushUsers.add(d.user_id));
          }
          count = uniquePushUsers.size;
        } else {
          // Count all push subscriptions
          let allPushOffset = 0;
          const uniquePushUsers = new Set<string>();

          while (true) {
            const { data, error } = await supabaseAdmin
              .from('push_subscriptions')
              .select('user_id')
              .range(allPushOffset, allPushOffset + pageSize - 1);
            
            if (error) throw error;
            const chunk = data || [];
            chunk.forEach((d: any) => uniquePushUsers.add(d.user_id));

            if (chunk.length < pageSize) break;
            allPushOffset += pageSize;
          }
          count = uniquePushUsers.size;
        }
      } else {
        // Just count all push subscriptions
        let allPushOffset = 0;
        const uniquePushUsers = new Set<string>();

        while (true) {
          const { data, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('user_id')
            .range(allPushOffset, allPushOffset + pageSize - 1);
          
          if (error) throw error;
          const chunk = data || [];
          chunk.forEach((d: any) => uniquePushUsers.add(d.user_id));

          if (chunk.length < pageSize) break;
          allPushOffset += pageSize;
        }
        count = uniquePushUsers.size;
      }
    }

    console.log(`[${VERSION}] Audience count: ${count}`);

    return new Response(
      JSON.stringify({ 
        count,
        type,
        audience,
        activityFilter,
        _version: VERSION 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error(`[${VERSION}] Error in count-notification-audience:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, _version: VERSION }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
