import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Использование Edge Runtime для минимальной задержки

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Системный промпт, который заставляет ИИ возвращать структурированный JSON
    const SYSTEM_PROMPT = {
      role: "system",
      content: `Ты — профессиональный шеф-повар и диетолог. 
      ОТВЕЧАЙ СТРОГО В ФОРМАТЕ JSON. Не пиши никакого лишнего текста до или после JSON.
      
      Структура ответа:
      {
        "name": "Название блюда",
        "description": "Краткое описание (1-2 предложения)",
        "prepTime": "Время приготовления (например, 30 мин)",
        "calories": "Калорийность (число)",
        "ingredients": ["список строк"],
        "instructions": ["шаги приготовления"],
        "image_url": "Прямая ссылка на фото блюда с Unsplash (используй https://images.unsplash.com/photo-...)"
      }
      
      Если пользователь просит рецепт, генерируй его по этой структуре. 
      Используй только качественные и существующие ссылки на изображения.`
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          SYSTEM_PROMPT,
          ...messages
        ],
        // response_format помогает модели придерживаться JSON структуры
        response_format: { type: "json_object" },
        temperature: 0.6, // Немного ниже для большей точности формата
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return NextResponse.json({ error: 'Ошибка API Groq' }, { status: response.status });
    }

    const data = await response.json();
    
    // Возвращаем результат клиенту
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
