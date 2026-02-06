import { GoogleGenAI, Modality } from "@google/genai";

// Vercel Serverless Function (Node.js)
export default async function handler(req: any, res: any) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-access-password'
  );

  // 2. Handle Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // --- SECURITY CHECK ---
    const serverPassword = process.env.ACCESS_PASSWORD;
    if (serverPassword) {
      const clientPassword = req.headers['x-access-password'];
      // Allow if passwords match, OR if the header is missing but the server logic handles it (strict mode: require it)
      if (clientPassword !== serverPassword) {
        console.warn("Unauthorized access attempt to /api/tts");
        return res.status(401).json({ error: 'Unauthorized: Invalid Access Password' });
      }
    }
    // ----------------------

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: API_KEY is missing in environment variables.");
      return res.status(500).json({ 
        error: 'Server Misconfiguration: API_KEY not found. Please check Vercel settings.' 
      });
    }

    // Vercel (and Express-like environments) automatically populate req.body if Content-Type is application/json
    const body = req.body;
    
    // Fallback parsing
    const { text, voiceName, speed } = typeof body === 'string' ? JSON.parse(body) : body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    // 4. Initialize SDK
    const ai = new GoogleGenAI({ apiKey });

    let promptText = text;
    if (speed === 'SLOW') {
      promptText = `Speak slowly, clearly, and deliberately: ${text}`;
    } else if (speed === 'FAST') {
      promptText = `Speak briskly and efficiently: ${text}`;
    }

    // 5. Call API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: promptText,
      config: {
        responseModalities: [Modality.AUDIO], 
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
      console.error("Gemini Response Missing Audio. Content received:", JSON.stringify(response.candidates?.[0]?.content));
      
      if (textData) {
        return res.status(500).json({ error: `Model refused to generate audio: "${textData}"` });
      }
      return res.status(500).json({ error: 'Gemini API returned no audio data.' });
    }

    // 6. Success
    return res.status(200).json({ audioData });

  } catch (error: any) {
    console.error("Unhandled API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Server Error';
    return res.status(500).json({ 
      error: errorMessage,
      details: error.toString()
    });
  }
}