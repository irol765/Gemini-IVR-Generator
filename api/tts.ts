import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function (Web Standard API)
// This signature (taking a Request object) is supported by Vercel and handles body parsing safely.
export default async function handler(request: Request) {
  // Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Server Error: API_KEY is missing in environment variables.");
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: API_KEY missing. Please check Vercel project settings.' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Safely parse JSON body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const { text, voiceName, speed } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prompt Engineering for speed control
    let promptText = text;
    if (speed === 'SLOW') {
      promptText = `Speak slowly and clearly: ${text}`;
    } else if (speed === 'FAST') {
      promptText = `Speak quickly and efficiently: ${text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: promptText,
      config: {
        responseModalities: ["AUDIO"] as any,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      const textData = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textData) {
         return new Response(JSON.stringify({ error: `Gemini returned text instead of audio: "${textData}"` }), { 
           status: 500,
           headers: { 'Content-Type': 'application/json' }
         });
      }
      return new Response(JSON.stringify({ error: 'No audio data received from Gemini API' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ audioData }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}