import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { itemName } = await request.json();
    console.log('Received item name:', itemName);  // Debug log

    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured');  // Debug log
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: "You are an assistant that suggests categories for pantry items in one word.",
        },
        {
          role: "user",
          content: `Suggest a category (Fruit, Vegetable, Dairy, Grain, or Other) for the pantry item: ${itemName}`,
        },
      ],
      max_tokens: 10,
    });

    const suggestion = completion.choices[0].message.content.trim();
    console.log('Generated suggestion:', suggestion);  // Debug log

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error:', error);  // Debug log
    return NextResponse.json({ error: 'Error generating suggestion', details: error.message }, { status: 500 });
  }
}