// Пример для Vercel Edge Function
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const { prompt } = await req.json();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }]
    }),
  });

  return new Response(response.body, {
    headers: { 'Content-Type': 'application/json' },
  });
}
