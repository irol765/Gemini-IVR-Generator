# Project Identity
**Name**: Gemini IVR Voice Generator
**Theme**: Professional, Clean, Utility-focused (Blues, Grays, White).
**Purpose**: Generate high-quality text-to-speech audio specifically formatted for legacy and modern telephone systems (IVR).

# Tech Stack
*   **Framework**: React 18+ (TypeScript)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **AI Provider**: Google GenAI SDK (`@google/genai`)
*   **Audio Processing**: Native Web Audio API (OfflineAudioContext)

# Environment Variables
The application requires the following keys to be available in `process.env` (Vercel Project Settings):
*   `API_KEY`: Google Gemini API Key.
*   `ACCESS_PASSWORD`: (Optional) A password to protect the application. If not set, the app is open.

# Engineering Standards
1.  **Bilingual UI**: All text must be bilingual (English/Chinese).
2.  **Defensive Audio Handling**: Audio contexts and buffers must be handled safely to prevent memory leaks.
3.  **Strict Typing**: All audio processing utilities must use strict TypeScript types.
4.  **No Mock Data**: Use real AI generation; handle API errors gracefully.
