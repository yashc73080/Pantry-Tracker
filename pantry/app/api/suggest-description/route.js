import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { itemName } = await req.json();
    console.log('Received item name:', itemName);  // Debug log

    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured');  // Debug log
      return new NextResponse(JSON.stringify({ error: 'OpenAI API key not configured' }), { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
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

    return new NextResponse(JSON.stringify({ suggestion }), { 
      status: 200, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);  // Debug log
    return new NextResponse(JSON.stringify({ error: 'Error generating suggestion', details: error.message }), { 
      status: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}