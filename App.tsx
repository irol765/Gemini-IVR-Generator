import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from './services/geminiService';
import { decodeBase64Audio, resampleAudioBuffer, encodeToWav } from './utils/audioUtils';
import { ControlPanel } from './components/ControlPanel';
import { GeneratedAudioData, SpeakingSpeed, AudioSampleRate } from './types';
import { UI_TEXT, VOICES } from './constants';
import { Phone, Download, Play, Pause, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[0].id);
  const [selectedSpeed, setSelectedSpeed] = useState<SpeakingSpeed>(SpeakingSpeed.NORMAL);
  const [selectedSampleRate, setSelectedSampleRate] = useState<AudioSampleRate>(AudioSampleRate.RATE_5000);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedAudioData | null>(null);
  
  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setIsPlaying(false);

    try {
      // 1. Call Gemini API
      const base64Audio = await generateSpeech(text, selectedVoice, selectedSpeed);

      // 2. Process Audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await decodeBase64Audio(base64Audio, audioContext);
      
      // 3. Resample to target rate (e.g., 5000Hz or 8000Hz)
      const resampledBuffer = await resampleAudioBuffer(decodedBuffer, selectedSampleRate);
      
      // 4. Encode to WAV
      const wavBlob = encodeToWav(resampledBuffer);
      const wavUrl = URL.createObjectURL(wavBlob);

      setResult({
        blob: wavBlob,
        url: wavUrl,
        duration: resampledBuffer.duration,
        sampleRate: selectedSampleRate
      });

      // Cleanup context
      audioContext.close();

    } catch (err) {
      console.error(err);
      setError("Failed to generate audio. Please check your API Key and internet connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset playing state when audio ends
  const handleAudioEnded = () => setIsPlaying(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      
      <header className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 shadow-inner">
          <Phone className="text-blue-600" size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {UI_TEXT.title}
        </h1>
        <p className="text-slate-500 font-medium">
          {UI_TEXT.subtitle}
        </p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        
        <ControlPanel
          text={text}
          setText={setText}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          selectedSpeed={selectedSpeed}
          setSelectedSpeed={setSelectedSpeed}
          selectedSampleRate={selectedSampleRate}
          setSelectedSampleRate={setSelectedSampleRate}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{UI_TEXT.audioPreview}</h3>
                <p className="text-sm text-slate-500">
                  {result.duration.toFixed(2)}s • {result.sampleRate}Hz • 16-bit Mono
                </p>
              </div>
              <button
                onClick={togglePlayback}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>
            </div>
            
            <audio 
              ref={audioRef} 
              src={result.url} 
              onEnded={handleAudioEnded}
              className="hidden" 
            />

            <div className="p-6 bg-slate-50/50">
              <a
                href={result.url}
                download={`voicemail-greeting-${selectedSampleRate}Hz.wav`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                <Download size={20} />
                {UI_TEXT.downloadBtn}
              </a>
              <p className="text-center text-xs text-slate-400 mt-3">
                {UI_TEXT.specs} • Suitable for Answering Machines
              </p>
            </div>
          </div>
        )}

      </main>

      <footer className="mt-12 text-slate-400 text-sm">
        <p>Powered by Google Gemini 2.5 Flash TTS</p>
      </footer>
    </div>
  );
};

export default App;
