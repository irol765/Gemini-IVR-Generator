import { VoiceGender, VoiceOption, AudioSampleRate, SpeakingSpeed } from './types';

export const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Kore (Female/女声)', gender: VoiceGender.FEMALE, description: 'Calm, soothing / 平静，舒缓' },
  { id: 'Fenrir', name: 'Fenrir (Male/男声)', gender: VoiceGender.MALE, description: 'Deep, authoritative / 深沉，权威' },
  { id: 'Puck', name: 'Puck (Male/男声)', gender: VoiceGender.MALE, description: 'Clear, energetic / 清晰，有力' },
  { id: 'Zephyr', name: 'Zephyr (Female/女声)', gender: VoiceGender.FEMALE, description: 'Gentle, balanced / 温柔，平衡' },
  { id: 'Charon', name: 'Charon (Male/男声)', gender: VoiceGender.MALE, description: 'Low, serious / 低沉，严肃' },
];

export const SAMPLE_RATE_OPTIONS = [
  { value: AudioSampleRate.RATE_5000, label: '5 kHz (Legacy/低带宽) - ~80kbps' },
  { value: AudioSampleRate.RATE_8000, label: '8 kHz (Standard Phone/标准电话) - 128kbps' },
  { value: AudioSampleRate.RATE_24000, label: '24 kHz (Hi-Fi/高保真)' },
];

export const SPEED_OPTIONS = [
  { value: SpeakingSpeed.SLOW, label: 'Slow / 慢速' },
  { value: SpeakingSpeed.NORMAL, label: 'Normal / 正常' },
  { value: SpeakingSpeed.FAST, label: 'Fast / 快速' },
];

export const UI_TEXT = {
  title: 'Gemini IVR Generator',
  subtitle: 'AI Voicemail & Answering Machine Assistant / 电话答录机语音生成助手',
  inputLabel: 'Greeting Text / 问候语文本',
  inputPlaceholder: 'Please leave a message after the beep... / 请在“滴”声后留言...',
  voiceLabel: 'Voice & Tone / 声音与语调',
  speedLabel: 'Speed / 语速',
  formatLabel: 'Output Format / 导出格式',
  generateBtn: 'Generate Audio / 生成语音',
  downloadBtn: 'Download .wav / 下载录音',
  processing: 'Processing... / 处理中...',
  error: 'Error / 错误',
  audioPreview: 'Preview / 试听',
  specs: 'Specifications: WAV, 16-bit PCM',
};
