import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface MealPlanRequest {
  cuisines: string[];
  diets: string[];
  calories: number | null;
  allergies: string[];
  servings: number;
  meals: string[];
  days: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: MealPlanRequest = await req.json();
    const { cuisines, diets, calories, allergies, servings, meals, days } = body;

    console.log('Generating meal plan with params:', body);

    const prompt = `Ты — профессиональный диетолог и шеф-повар. Создай детальный план питания.

ПАРАМЕТРЫ:
- Дней: ${days}
- Порций: ${servings}
- Приёмы пищи: ${meals.join(', ')}
${cuisines.length > 0 ? `- Кухни: ${cuisines.join(', ')}` : ''}
${diets.length > 0 ? `- Диеты: ${diets.join(', ')}` : ''}
${calories ? `- Целевые калории в день: ${calories}` : ''}
${allergies.length > 0 ? `- Исключить аллергены: ${allergies.join(', ')}` : ''}

Верни ТОЛЬКО валидный JSON без markdown:

{
  "days": [
    {
      "day": 1,
      "date": "День 1",
      "meals": [
        {
          "type": "Завтрак",
          "meal": {
            "name": "Название блюда",
            "calories": 400,
            "protein": 25,
            "carbs": 40,
            "fat": 15,
            "photo_search_query": "oatmeal berries breakfast",
            "recipe": {
              "ingredients": [
                {"name": "Овсяные хлопья", "amount": "80г", "category": "Крупы"}
              ],
              "steps": ["Шаг 1...", "Шаг 2..."],
              "cooking_time": 15,
              "servings": ${servings}
            }
          }
        }
      ],
      "total_calories": 1800
    }
  ],
  "shopping_list": [
    {
      "category": "Овощи",
      "items": [{"name": "Помидоры", "amount": "500г"}]
    },
    {
      "category": "Мясо и рыба",
      "items": [{"name": "Куриная грудка", "amount": "800г"}]
    },
    {
      "category": "Молочные продукты",
      "items": [{"name": "Молоко", "amount": "1л"}]
    },
    {
      "category": "Крупы и макароны",
      "items": [{"name": "Рис", "amount": "300г"}]
    },
    {
      "category": "Фрукты",
      "items": [{"name": "Яблоки", "amount": "1кг"}]
    },
    {
      "category": "Специи и соусы",
      "items": [{"name": "Оливковое масло", "amount": "100мл"}]
    }
  ],
  "summary": {
    "avg_calories": 1800,
    "avg_protein": 100,
    "avg_carbs": 200,
    "avg_fat": 60
  }
}

Требования:
1. Создай план на ${days} дней с приёмами: ${meals.join(', ')}
2. Все блюда должны быть реалистичными и вкусными
3. photo_search_query — ключевые слова на английском для поиска фото
4. Список покупок должен быть сгруппирован и суммирован
5. КБЖУ должно быть реалистичным для каждого блюда
6. Рецепты должны быть подробными с 4-8 шагами`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing...');

    // Clean and parse JSON
    let cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find JSON object boundaries
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON found in response');
    }

    cleanedContent = cleanedContent.slice(jsonStart, jsonEnd);
    
    const plan = JSON.parse(cleanedContent);

    console.log('Meal plan generated successfully');

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating meal plan:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
