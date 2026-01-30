import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Запуск на Edge-серверах для максимальной скорости

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // llama-3.3-70b-versatile — мощная модель уровня GPT-4
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Ты — профессиональный шеф-повар и диетолог. Давай четкие и полезные советы по рецептам."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка генерации AI' }, { status: 500 });
  }
}
