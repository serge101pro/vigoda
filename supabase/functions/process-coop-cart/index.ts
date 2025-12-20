import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("process-coop-cart function called at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Get current time in Moscow timezone (UTC+3)
    const now = new Date();
    const moscowOffset = 3 * 60; // Moscow is UTC+3
    const moscowTime = new Date(now.getTime() + moscowOffset * 60 * 1000);
    const currentHour = moscowTime.getUTCHours();
    const currentMinute = moscowTime.getUTCMinutes();

    console.log(`Current Moscow time: ${currentHour}:${currentMinute}`);

    // Check if it's around 11:15 (allow a 5-minute window)
    const isAutoOrderTime = currentHour === 11 && currentMinute >= 15 && currentMinute <= 20;

    if (!isAutoOrderTime) {
      console.log("Not auto-order time, skipping...");
      return new Response(
        JSON.stringify({ message: "Not auto-order time", currentTime: `${currentHour}:${currentMinute}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all active coop carts with items
    const { data: coopCarts, error: cartsError } = await supabase
      .from("coop_carts")
      .select(`
        *,
        organizations (id, name, contact_email),
        coop_cart_items (*)
      `)
      .eq("is_active", true);

    if (cartsError) {
      console.error("Error fetching coop carts:", cartsError);
      throw cartsError;
    }

    console.log(`Found ${coopCarts?.length || 0} active coop carts`);

    const processedOrders: any[] = [];

    for (const cart of coopCarts || []) {
      if (!cart.coop_cart_items || cart.coop_cart_items.length === 0) {
        console.log(`Cart ${cart.id} has no items, skipping...`);
        continue;
      }

      // Calculate total
      const totalAmount = cart.coop_cart_items.reduce(
        (sum: number, item: any) => sum + item.unit_price * item.quantity,
        0
      );

      console.log(`Processing cart ${cart.id} with ${cart.coop_cart_items.length} items, total: ${totalAmount}`);

      // Get unique user IDs who added items
      const userIds = [...new Set(cart.coop_cart_items.map((item: any) => item.added_by))];

      // Create order for each user or one combined order
      // For simplicity, create one combined order from the organization
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userIds[0], // First user as order owner
          total_amount: totalAmount,
          status: "pending",
          delivery_address: cart.delivery_address,
          payment_method: "org_balance",
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        continue;
      }

      // Create order items
      const orderItems = cart.coop_cart_items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
      }

      // Deduct from organization balance
      const { data: orgBalance } = await supabase
        .from("org_balances")
        .select("balance")
        .eq("organization_id", cart.organization_id)
        .single();

      if (orgBalance) {
        await supabase
          .from("org_balances")
          .update({ balance: orgBalance.balance - totalAmount })
          .eq("organization_id", cart.organization_id);

        // Record transaction
        await supabase
          .from("org_balance_transactions")
          .insert({
            organization_id: cart.organization_id,
            amount: -totalAmount,
            type: "order_payment",
            description: `Автозаказ: ${cart.name}`,
            order_id: order.id,
          });
      }

      // Clear cart items after successful order
      await supabase
        .from("coop_cart_items")
        .delete()
        .eq("cart_id", cart.id);

      processedOrders.push({
        orderId: order.id,
        cartId: cart.id,
        organizationId: cart.organization_id,
        totalAmount,
        itemsCount: cart.coop_cart_items.length,
      });

      // Send email notification
      if (resend && cart.organizations?.contact_email) {
        try {
          await resend.emails.send({
            from: "Доставка <orders@resend.dev>",
            to: [cart.organizations.contact_email],
            subject: `Заказ #${order.id.slice(0, 8)} оформлен`,
            html: `
              <h1>Заказ успешно оформлен!</h1>
              <p>Организация: <strong>${cart.organizations.name}</strong></p>
              <p>Сумма заказа: <strong>${totalAmount.toLocaleString('ru-RU')} ₽</strong></p>
              <p>Количество позиций: ${cart.coop_cart_items.length}</p>
              <p>Адрес доставки: ${cart.delivery_address || 'Не указан'}</p>
              <hr />
              <p>Заказ будет доставлен в ближайшее время.</p>
            `,
          });
          console.log(`Email sent to ${cart.organizations.contact_email}`);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    }

    console.log(`Processed ${processedOrders.length} orders`);

    return new Response(
      JSON.stringify({
        success: true,
        processedOrders,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in process-coop-cart function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
