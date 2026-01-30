import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "v1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log(`[${VERSION}] Process scheduled notifications triggered`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Find pending notifications that are due
    const now = new Date().toISOString();
    const { data: pendingNotifications, error: fetchError } = await supabaseAdmin
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error(`[${VERSION}] Error fetching scheduled notifications:`, fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log(`[${VERSION}] No pending notifications to process`);
      return new Response(
        JSON.stringify({ processed: 0, _version: VERSION }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[${VERSION}] Found ${pendingNotifications.length} notifications to process`);

    let processedCount = 0;

    for (const notification of pendingNotifications) {
      try {
        // Mark as processing
        await supabaseAdmin
          .from('scheduled_notifications')
          .update({ status: 'processing' })
          .eq('id', notification.id);

        // Call the appropriate send function
        const functionName = notification.type === 'push' ? 'send-mass-push' : 'send-mass-email';
        
        const payload: any = {
          audience: notification.audience,
          activityFilter: notification.activity_filter,
          hasEmailFilter: notification.has_email_filter,
          hasPushFilter: notification.has_push_filter,
        };

        if (notification.type === 'push') {
          payload.title = notification.title;
          payload.body = notification.body;
          payload.url = notification.url;
          payload.tag = 'scheduled-notification';
        } else {
          payload.subject = notification.title;
          payload.htmlContent = notification.html_content || notification.body;
          payload.textContent = notification.body;
        }

        // Create a fake authorization using service role (these functions verify superadmin internally)
        // For scheduled notifications, we need to bypass auth since cron doesn't have user context
        // We'll modify the functions to accept a special header for scheduled processing

        const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'X-Scheduled-Notification': 'true',
            'X-Created-By': notification.created_by,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
          await supabaseAdmin
            .from('scheduled_notifications')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              sent_count: result.sent || 0,
              failed_count: result.failed || 0,
              total_count: result.total || 0,
            })
            .eq('id', notification.id);

          console.log(`[${VERSION}] Notification ${notification.id} completed: ${result.sent} sent`);
          processedCount++;
        } else {
          await supabaseAdmin
            .from('scheduled_notifications')
            .update({
              status: 'failed',
              processed_at: new Date().toISOString(),
              error_message: result.error || 'Unknown error',
            })
            .eq('id', notification.id);

          console.error(`[${VERSION}] Notification ${notification.id} failed:`, result.error);
        }
      } catch (notifError) {
        console.error(`[${VERSION}] Error processing notification ${notification.id}:`, notifError);
        
        await supabaseAdmin
          .from('scheduled_notifications')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            error_message: notifError instanceof Error ? notifError.message : 'Unknown error',
          })
          .eq('id', notification.id);
      }
    }

    console.log(`[${VERSION}] Processed ${processedCount} notifications`);

    return new Response(
      JSON.stringify({ processed: processedCount, _version: VERSION }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error(`[${VERSION}] Error in process-scheduled-notifications:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, _version: VERSION }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
