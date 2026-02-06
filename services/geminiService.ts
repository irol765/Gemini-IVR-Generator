import { SpeakingSpeed } from "../types";

export const generateSpeech = async (
  text: string, 
  voiceName: string, 
  speed: SpeakingSpeed
): Promise<string> => {
  
  // Create an AbortController for timeout (60 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceName,
        speed
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // CRITICAL: Check if response is actually JSON. 
    // If running `npm run dev` locally, Vite serves `index.html` for unknown routes like /api/tts.
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Server returned non-JSON response:", textResponse);

      // Detect Vite/SPA fallback HTML
      if (textResponse.includes("<!DOCTYPE html>") || textResponse.includes("<html")) {
        throw new Error(
          "Environment Error: Backend API not found. \n" +
          "If running locally, you must use 'vercel dev' to run serverless functions. 'npm run dev' only runs the frontend."
        );
      }
      throw new Error(`Server returned unexpected format: ${response.status} ${response.statusText}. Check console for details.`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server Error: ${response.status}`);
    }

    if (!data.audioData) {
      throw new Error('No audio data received from server');
    }
    
    return data.audioData;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Gemini TTS Error:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("Generation timed out (60s). The model is taking too long.");
    }
    
    throw error;
  }
};