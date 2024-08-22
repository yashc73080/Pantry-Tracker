import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const systemPrompt = `
You are an assistant that suggests categories for pantry items in one word. 
Suggest a category (Fruit, Vegetable, Dairy, Grain, or Other) for the pantry item.
`;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.text();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: data },
    ],
    model: "gpt-4o-mini",
    max_tokens: 10,
  });

  const suggestion = completion.choices[0].message.content.trim();
  return NextResponse.json({ suggestion });
};