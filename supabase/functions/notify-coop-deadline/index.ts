import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active coop carts
    const { data: coopCarts, error: cartsError } = await supabase
      .from("coop_carts")
      .select("*, organizations(name)")
      .eq("is_active", true);

    if (cartsError) throw cartsError;

    const notifications: string[] = [];

    for (const cart of coopCarts || []) {
      // Get all members of this organization
      const { data: members, error: membersError } = await supabase
        .from("org_members")
        .select("user_id")
        .eq("organization_id", cart.organization_id)
        .eq("is_active", true);

      if (membersError) {
        console.error("Error fetching members:", membersError);
        continue;
      }

      // Get profiles with emails
      const userIds = members?.map(m => m.user_id) || [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email, display_name, user_id")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        continue;
      }

      // Get cart items count
      const { count: itemsCount } = await supabase
        .from("coop_cart_items")
        .select("*", { count: "exact", head: true })
        .eq("cart_id", cart.id);

      // Send email notifications
      if (resendApiKey && profiles && profiles.length > 0) {
        const resend = new Resend(resendApiKey);
        
        for (const profile of profiles) {
          if (!profile.email) continue;

          try {
            await resend.emails.send({
              from: "Вкусвилл B2B <noreply@resend.dev>",
              to: [profile.email],
              subject: "⏰ Осталось 30 минут до закрытия совместной корзины!",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #16a34a;">Совместная корзина закрывается!</h2>
                  <p>Привет${profile.display_name ? `, ${profile.display_name}` : ''}!</p>
                  <p>Напоминаем, что совместная корзина <strong>${cart.organizations?.name || 'вашей организации'}</strong> закрывается через 30 минут.</p>
                  
                  <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Товаров в корзине:</strong> ${itemsCount || 0}</p>
                    <p style="margin: 8px 0 0 0;"><strong>Дедлайн:</strong> ${cart.deadline_time}</p>
                    <p style="margin: 8px 0 0 0;"><strong>Автозаказ:</strong> ${cart.auto_order_time}</p>
                  </div>
                  
                  <p>Если вы хотите добавить что-то в заказ — самое время это сделать!</p>
                  
                  <a href="https://your-app-url.com/organization/coop-cart" 
                     style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                    Открыть корзину
                  </a>
                  
                  <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                    Это автоматическое уведомление. Если вы не хотите получать такие письма, измените настройки в личном кабинете.
                  </p>
                </div>
              `,
            });

            notifications.push(`Sent to ${profile.email}`);
          } catch (emailError) {
            console.error(`Error sending email to ${profile.email}:`, emailError);
          }
        }
      }
    }

    console.log(`Deadline notifications sent: ${notifications.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${notifications.length} notifications`,
        details: notifications
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in notify-coop-deadline:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
