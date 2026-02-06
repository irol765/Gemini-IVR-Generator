import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function Handler
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { text, voiceName, speed } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: API_KEY missing' }), { status: 500 });
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
         return new Response(JSON.stringify({ error: `Gemini returned text instead of audio: ${textData}` }), { status: 500 });
      }
      return new Response(JSON.stringify({ error: 'No audio data received' }), { status: 500 });
    }

    return new Response(JSON.stringify({ audioData }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}