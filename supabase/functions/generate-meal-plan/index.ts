import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const VERSION = "v1.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Using Gemini API directly
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isRateLimited = error instanceof Error && 
        (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'));
      
      if (isRateLimited && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[${VERSION}] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

interface MealInfo {
  type: string;
  dishCount: number;
  includeSoup: boolean;
}

interface MealPlanRequest {
  cuisines: string[];
  diets: string[];
  calories: number | null;
  allergies: string[];
  servings: number;
  meals: MealInfo[] | string[];
  days: number;
}

serve(async (req) => {
  console.log(`[${VERSION}] Meal plan generation request received`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      console.error(`[${VERSION}] GEMINI_API_KEY not configured`);
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured', 
          errorCode: 'CONFIG_ERROR',
          _version: VERSION 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const body: MealPlanRequest = await req.json();
    const { cuisines, diets, calories, allergies, servings, meals, days } = body;

    console.log(`[${VERSION}] Generating meal plan with params:`, body);

    // Handle both old format (string[]) and new format (MealInfo[])
    let mealsDescription = '';
    if (meals.length > 0 && typeof meals[0] === 'object') {
      const mealInfos = meals as MealInfo[];
      mealsDescription = mealInfos.map(m => {
        let desc = `${m.type} (${m.dishCount} ${m.dishCount === 1 ? 'блюдо' : m.dishCount < 5 ? 'блюда' : 'блюд'}`;
        if (m.includeSoup) {
          desc += ', обязательно включи первое блюдо - суп';
        }
        desc += ')';
        return desc;
      }).join(', ');
    } else {
      mealsDescription = (meals as string[]).join(', ');
    }

    const prompt = `Ты — профессиональный диетолог и шеф-повар. Создай детальный план питания.

ПАРАМЕТРЫ:
- Дней: ${days}
- Порций: ${servings}
- Приёмы пищи: ${mealsDescription}
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
1. Создай план на ${days} дней с приёмами: ${mealsDescription}
2. Если для приёма пищи указано несколько блюд - создай несколько объектов meal для этого приёма
3. Если указано "суп" - обязательно добавь первое блюдо (суп) в этот приём пищи
4. Все блюда должны быть реалистичными и вкусными
5. photo_search_query — ключевые слова на английском для поиска HD фото еды (например: "chicken soup bowl", "grilled salmon plate")
6. Список покупок должен быть сгруппирован и суммирован
7. КБЖУ должно быть реалистичным для каждого блюда
8. Рецепты должны быть подробными с 4-8 шагами`;

    // Using Google Gemini API directly with retry logic
    const generateWithGemini = async () => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 16000,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${VERSION}] AI API error:`, errorText);
        
        // Parse error for specific handling
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.code === 429) {
            throw new Error('RATE_LIMIT_EXCEEDED');
          }
        } catch (e) {
          // Not JSON, continue with generic error
        }
        
        throw new Error(`AI API error: ${response.status}`);
      }
      
      return response.json();
    };

    let data;
    try {
      data = await retryWithBackoff(generateWithGemini, 3, 2000);
    } catch (retryError) {
      const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
      
      if (errorMessage.includes('RATE_LIMIT') || errorMessage.includes('429')) {
        console.error(`[${VERSION}] Rate limit exceeded after retries`);
        return new Response(
          JSON.stringify({ 
            error: 'Сервис временно перегружен. Попробуйте через несколько минут.',
            errorCode: 'RATE_LIMIT',
            _version: VERSION 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw retryError;
    }
    
    // Extract content from Gemini response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error(`[${VERSION}] Gemini response:`, JSON.stringify(data));
      throw new Error('No content in Gemini response');
    }

    console.log(`[${VERSION}] AI response received, parsing...`);

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

    console.log(`[${VERSION}] Meal plan generated successfully`);

    return new Response(JSON.stringify({ plan, _version: VERSION }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${VERSION}] Error generating meal plan:`, errorMessage);
    
    // Provide user-friendly error messages
    let userMessage = 'Произошла ошибка при генерации плана питания';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (errorMessage.includes('JSON')) {
      userMessage = 'Ошибка обработки данных. Попробуйте ещё раз.';
      errorCode = 'PARSE_ERROR';
    } else if (errorMessage.includes('API')) {
      userMessage = 'Сервис ИИ временно недоступен. Попробуйте позже.';
      errorCode = 'API_ERROR';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage, errorCode, _version: VERSION }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
