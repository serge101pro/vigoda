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
}

serve(async (req: Request) => {
  console.log(`[${VERSION}] Mass email request received`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
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

    const body: MassEmailRequest = await req.json();
    const { subject, htmlContent, textContent, targetUserIds } = body;

    if (!subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: "Subject and HTML content are required", _version: VERSION }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[${VERSION}] Sending mass email: "${subject}"`);

    // Get user emails from profiles
    let query = supabase.from("profiles").select("user_id, email, display_name");
    
    if (targetUserIds && targetUserIds.length > 0) {
      query = query.in('user_id', targetUserIds);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error(`[${VERSION}] Error fetching profiles:`, profilesError);
      return new Response(
        JSON.stringify({ error: profilesError.message, _version: VERSION }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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
              from: "Vigoda <noreply@lifocus.lovable.app>",
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
