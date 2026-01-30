import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ImageRequest {
  mealName: string;
  searchQuery: string;
  mealPlanId?: string;
  dayIndex: number;
  mealIndex: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mealName, searchQuery, mealPlanId, dayIndex, mealIndex }: ImageRequest = await req.json();
    
    console.log(`Generating image for meal: ${mealName}, query: ${searchQuery}`);

    // Generate image using Lovable AI gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: `Generate a beautiful, appetizing, professional food photography image of: ${mealName}. The dish should look delicious, well-plated, with good lighting, high resolution, restaurant quality presentation. Style: modern food photography, clean background, soft natural lighting.`
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation API error:', errorText);
      
      // Fallback to Unsplash
      const fallbackUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(searchQuery)},food,dish`;
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrl: fallbackUrl,
          source: 'unsplash'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.log('No image in response, using fallback');
      const fallbackUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(searchQuery)},food,dish`;
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrl: fallbackUrl,
          source: 'unsplash'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If mealPlanId is provided, save to storage
    if (mealPlanId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Convert base64 to blob
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileName = `meal-plans/${mealPlanId}/day${dayIndex}_meal${mealIndex}_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('meal-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // Return the base64 data as fallback
        return new Response(
          JSON.stringify({ 
            success: true, 
            imageUrl: imageData,
            source: 'generated'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data: publicUrl } = supabase
        .storage
        .from('meal-images')
        .getPublicUrl(fileName);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrl: publicUrl.publicUrl,
          source: 'storage'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageData,
        source: 'generated'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating meal image:', errorMessage);
    
    // Fallback to placeholder
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
      }),
      { 
        status: 200, // Return 200 with fallback image
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
