export enum VoiceGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface VoiceOption {
  id: string; // Gemini voice name (e.g., 'Puck', 'Kore')
  name: string; // Display name
  gender: VoiceGender;
  description: string;
}

export enum AudioSampleRate {
  RATE_5000 = 5000,
  RATE_8000 = 8000, // Standard Telephony
  RATE_24000 = 24000, // High Fidelity
}

export enum SpeakingSpeed {
  SLOW = 'SLOW',
  NORMAL = 'NORMAL',
  FAST = 'FAST',
}

export interface GeneratedAudioData {
  blob: Blob;
  url: string;
  duration: number;
  sampleRate: number;
}
