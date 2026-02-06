import { SpeakingSpeed } from "../types";

export const generateSpeech = async (
  text: string, 
  voiceName: string, 
  speed: SpeakingSpeed,
  password?: string
): Promise<string> => {
  
  // Create an AbortController for timeout (90 seconds - TTS can be slow)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (password) {
    headers['x-access-password'] = password;
  }

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        text,
        voiceName,
        speed
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // CRITICAL: Check if response is actually JSON. 
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Server returned non-JSON response:", textResponse);

      // Detect Vite/SPA fallback HTML
      if (textResponse.includes("<!DOCTYPE html>") || textResponse.includes("<html")) {
        throw new Error(
          "Environment Error: Backend API not found. \n" +
          "Are you running 'vercel dev'? (Required for API support)\n" +
          "Do not use 'npm run dev' or 'vite' directly."
        );
      }
      throw new Error(`Server returned unexpected format: ${response.status} ${response.statusText}. See console.`);
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authorization Failed: Password required or incorrect.");
      }
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
      throw new Error("Request timed out (90s). The server might be busy or the connection was lost. Please try again.");
    }
    
    throw error;
  }
};