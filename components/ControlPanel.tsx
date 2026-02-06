import React from 'react';
import { VOICES, SPEED_OPTIONS, SAMPLE_RATE_OPTIONS, UI_TEXT } from '../constants';
import { VoiceOption, SpeakingSpeed, AudioSampleRate } from '../types';
import { Mic, Zap, Settings, Type } from 'lucide-react';

interface ControlPanelProps {
  text: string;
  setText: (s: string) => void;
  selectedVoice: string;
  setSelectedVoice: (s: string) => void;
  selectedSpeed: SpeakingSpeed;
  setSelectedSpeed: (s: SpeakingSpeed) => void;
  selectedSampleRate: AudioSampleRate;
  setSelectedSampleRate: (r: AudioSampleRate) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  text, setText, selectedVoice, setSelectedVoice, selectedSpeed, setSelectedSpeed,
  selectedSampleRate, setSelectedSampleRate, isGenerating, onGenerate
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-slate-100">
      
      {/* Text Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Type size={18} className="text-blue-600" />
          {UI_TEXT.inputLabel}
        </label>
        <textarea
          className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none placeholder-slate-400"
          placeholder={UI_TEXT.inputPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Mic size={18} className="text-purple-600" />
            {UI_TEXT.voiceLabel}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`flex flex-col items-start p-3 rounded-lg border transition-all ${
                  selectedVoice === voice.id 
                    ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-200' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-slate-800 text-sm">{voice.name}</span>
                <span className="text-xs text-slate-500">{voice.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tech Specs */}
        <div className="space-y-6">
          {/* Speed */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Zap size={18} className="text-amber-500" />
              {UI_TEXT.speedLabel}
            </label>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedSpeed(opt.value)}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${
                    selectedSpeed === opt.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Rate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Settings size={18} className="text-slate-600" />
              {UI_TEXT.formatLabel}
            </label>
            <select
              value={selectedSampleRate}
              onChange={(e) => setSelectedSampleRate(Number(e.target.value) as AudioSampleRate)}
              className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {SAMPLE_RATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 px-1">
              Note: 5kHz is very low quality. 8kHz is standard for IVR.
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !text.trim()}
        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] ${
          isGenerating || !text.trim()
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
        }`}
      >
        {isGenerating ? UI_TEXT.processing : UI_TEXT.generateBtn}
      </button>
    </div>
  );
};