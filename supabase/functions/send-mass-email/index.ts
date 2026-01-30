import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const VERSION = "v1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MassEmailRequest {
  subject: string;
  htmlContent: string;
  textContent?: string;
  targetUserIds?: string[]; // If empty, send to all users with emails
  audience?: 'all' | 'paid' | 'solo' | 'family' | 'corp';
}

serve(async (req: Request) => {
  console.log(`[${VERSION}] Mass email request received`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error(`[${VERSION}] RESEND_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "Email service not configured", _version: VERSION }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', _version: VERSION }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // 1) Validate JWT (prefer getClaims, fallback to getUser for compatibility)
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

    const body: MassEmailRequest = await req.json();
    const { subject, htmlContent, textContent, targetUserIds, audience = 'all' } = body;

    if (!subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: "Subject and HTML content are required", _version: VERSION }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[${VERSION}] Sending mass email: "${subject}"`);

    // Resolve audience -> user ids (server-side, with service role)
    let effectiveTargetUserIds: string[] | null =
      targetUserIds && targetUserIds.length > 0 ? targetUserIds : null;

    if (!effectiveTargetUserIds && audience !== 'all') {
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

      if (subsError) {
        console.error(`[${VERSION}] Error fetching subscriptions:`, subsError);
        return new Response(
          JSON.stringify({ error: subsError.message, _version: VERSION }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      effectiveTargetUserIds = (subs || []).map((s: any) => s.user_id).filter(Boolean);
    }

    // Get user emails from profiles
    let profiles: any[] = [];
    if (effectiveTargetUserIds && effectiveTargetUserIds.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < effectiveTargetUserIds.length; i += chunkSize) {
        const chunk = effectiveTargetUserIds.slice(i, i + chunkSize);
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('user_id, email, display_name')
          .in('user_id', chunk);
        if (error) {
          console.error(`[${VERSION}] Error fetching profiles:`, error);
          return new Response(
            JSON.stringify({ error: error.message, _version: VERSION }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        profiles = profiles.concat(data || []);
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
          .from('profiles')
          .select('user_id, email, display_name')
          .range(offset, offset + pageSize - 1);

        if (error) {
          console.error(`[${VERSION}] Error fetching profiles:`, error);
          return new Response(
            JSON.stringify({ error: error.message, _version: VERSION }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const chunk = data || [];
        profiles = profiles.concat(chunk);

        if (chunk.length < pageSize) break;
        offset += pageSize;
      }
    }

    // Filter profiles with valid emails
    const validProfiles = profiles?.filter(p => p.email && p.email.includes('@')) || [];

    if (validProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No valid email addresses found",
          sent: 0,
          failed: 0,
          _version: VERSION 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails in batches (Resend has rate limits)
    const batchSize = 10;
    const delayBetweenBatches = 1000; // 1 second

    for (let i = 0; i < validProfiles.length; i += batchSize) {
      const batch = validProfiles.slice(i, i + batchSize);
      
      const results = await Promise.all(
        batch.map(async (profile) => {
          try {
            const { error } = await resend.emails.send({
              from: "Vigoda <onboarding@resend.dev>",
              to: [profile.email],
              subject: subject,
              html: htmlContent,
              text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
            });

            if (error) {
              console.error(`[${VERSION}] Error sending to ${profile.email}:`, error);
              errors.push(`${profile.email}: ${error.message}`);
              return false;
            }

            return true;
          } catch (err) {
            console.error(`[${VERSION}] Exception sending to ${profile.email}:`, err);
            errors.push(`${profile.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return false;
          }
        })
      );
      
      sentCount += results.filter(r => r).length;
      failedCount += results.filter(r => !r).length;

      // Wait between batches to avoid rate limiting
      if (i + batchSize < validProfiles.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log(`[${VERSION}] Mass email complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        total: validProfiles.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Return first 10 errors
        _version: VERSION 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error(`[${VERSION}] Error in send-mass-email:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, _version: VERSION }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
