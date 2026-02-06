import { GoogleGenAI } from "@google/genai";

/**
 * Vercel Serverless Function (Node.js Runtime)
 * Uses standard (req, res) signature instead of Web Standard (Request, Response)
 * to ensure maximum compatibility with Vercel's default environment.
 */
export default async function handler(req: any, res: any) {
  // CORS (Optional: allows local dev from different ports if needed, but mainly for structure)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel automatically parses JSON body into req.body
    const { text, voiceName, speed } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Server Error: Missing API_KEY in environment variables.");
      return res.status(500).json({ error: 'Server configuration error: API_KEY missing. Please add it to your Vercel project settings or .env file.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prompt Engineering for speed control
    let promptText = text;
    if (speed === 'SLOW') {
      promptText = `Speak slowly and clearly: ${text}`;
    } else if (speed === 'FAST') {
      promptText = `Speak quickly and efficiently: ${text}`;
    }

    // Call Gemini API
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
         // This usually happens if the model refuses to generate audio (policy violation or misunderstanding)
         return res.status(500).json({ error: `Gemini refused to generate audio and returned text: "${textData}"` });
      }
      return res.status(500).json({ error: 'No audio data received from Gemini API' });
    }

    // Return successful JSON response
    return res.status(200).json({ audioData });

  } catch (error: any) {
    console.error("API Execution Error:", error);
    // Return the actual error message to the client for debugging
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: error.toString() 
    });
  }
}