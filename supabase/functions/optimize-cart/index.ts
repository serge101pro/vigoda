import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Product rules for optimization
const productRules: Record<string, { pack_size: number; unit: string; category: string }> = {
  'яйца': { pack_size: 10, unit: 'шт', category: 'Молочные продукты' },
  'яйцо': { pack_size: 10, unit: 'шт', category: 'Молочные продукты' },
  'молоко': { pack_size: 1000, unit: 'мл', category: 'Молочные продукты' },
  'мука': { pack_size: 1000, unit: 'г', category: 'Бакалея' },
  'сахар': { pack_size: 500, unit: 'г', category: 'Бакалея' },
  'соль': { pack_size: 500, unit: 'г', category: 'Бакалея' },
  'масло сливочное': { pack_size: 200, unit: 'г', category: 'Молочные продукты' },
  'масло растительное': { pack_size: 1000, unit: 'мл', category: 'Бакалея' },
  'рис': { pack_size: 1000, unit: 'г', category: 'Крупы' },
  'гречка': { pack_size: 1000, unit: 'г', category: 'Крупы' },
  'макароны': { pack_size: 500, unit: 'г', category: 'Бакалея' },
  'хлеб': { pack_size: 1, unit: 'шт', category: 'Хлеб' },
  'курица': { pack_size: 1000, unit: 'г', category: 'Мясо и птица' },
  'говядина': { pack_size: 500, unit: 'г', category: 'Мясо и птица' },
  'свинина': { pack_size: 500, unit: 'г', category: 'Мясо и птица' },
  'лосось': { pack_size: 300, unit: 'г', category: 'Рыба' },
  'сыр': { pack_size: 200, unit: 'г', category: 'Молочные продукты' },
  'творог': { pack_size: 200, unit: 'г', category: 'Молочные продукты' },
  'сметана': { pack_size: 200, unit: 'г', category: 'Молочные продукты' },
  'йогурт': { pack_size: 1, unit: 'шт', category: 'Молочные продукты' },
  'картофель': { pack_size: 1000, unit: 'г', category: 'Овощи' },
  'морковь': { pack_size: 500, unit: 'г', category: 'Овощи' },
  'лук': { pack_size: 500, unit: 'г', category: 'Овощи' },
  'чеснок': { pack_size: 1, unit: 'шт', category: 'Овощи' },
  'помидоры': { pack_size: 500, unit: 'г', category: 'Овощи' },
  'огурцы': { pack_size: 500, unit: 'г', category: 'Овощи' },
  'капуста': { pack_size: 1, unit: 'шт', category: 'Овощи' },
  'перец': { pack_size: 1, unit: 'шт', category: 'Овощи' },
  'яблоки': { pack_size: 500, unit: 'г', category: 'Фрукты' },
  'бананы': { pack_size: 500, unit: 'г', category: 'Фрукты' },
  'апельсины': { pack_size: 500, unit: 'г', category: 'Фрукты' },
};

interface CartItemInput {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

interface OptimizedItem {
  id: string;
  name: string;
  original_quantity: number;
  final_quantity: number;
  packs_count: number;
  unit: string;
  category: string;
  is_optimized: boolean;
}

function getProductRule(name: string): { pack_size: number; unit: string; category: string } | null {
  const lowerName = name.toLowerCase();
  for (const [key, rule] of Object.entries(productRules)) {
    if (lowerName.includes(key)) {
      return rule;
    }
  }
  return null;
}

function optimizeItems(items: CartItemInput[]): OptimizedItem[] {
  console.log('Optimizing items:', items);
  
  return items.map(item => {
    const rule = getProductRule(item.name);
    
    if (rule) {
      const packsCount = Math.ceil(item.quantity / rule.pack_size);
      const finalQuantity = packsCount * rule.pack_size;
      
      return {
        id: item.id,
        name: item.name,
        original_quantity: item.quantity,
        final_quantity: finalQuantity,
        packs_count: packsCount,
        unit: rule.unit,
        category: rule.category,
        is_optimized: true,
      };
    }
    
    // No rule found - keep as is
    return {
      id: item.id,
      name: item.name,
      original_quantity: item.quantity,
      final_quantity: item.quantity,
      packs_count: 1,
      unit: item.unit || 'шт',
      category: item.category || 'Прочее',
      is_optimized: false,
    };
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const { items, cart_id } = await req.json();
    
    if (!items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Items array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received items for optimization:', items.length);

    // Optimize the items
    const optimizedItems = optimizeItems(items);

    console.log('Optimization complete:', optimizedItems.length, 'items');

    // If cart_id provided, update cart_items in database
    if (cart_id) {
      console.log('Updating cart_items for cart:', cart_id);
      
      for (const item of optimizedItems) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: item.final_quantity,
            packs_count: item.packs_count,
            category: item.category,
            unit: item.unit,
            is_optimized: item.is_optimized,
          })
          .eq('id', item.id)
          .eq('cart_id', cart_id);

        if (updateError) {
          console.error('Error updating cart item:', item.id, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        optimized_items: optimizedItems,
        summary: {
          total_items: optimizedItems.length,
          optimized_count: optimizedItems.filter(i => i.is_optimized).length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in optimize-cart function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
