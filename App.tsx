import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from './services/geminiService';
import { decodeBase64Audio, resampleAudioBuffer, encodeToWav } from './utils/audioUtils';
import { ControlPanel } from './components/ControlPanel';
import { LoginScreen } from './components/LoginScreen'; // Import Login
import { GeneratedAudioData, SpeakingSpeed, AudioSampleRate } from './types';
import { UI_TEXT, VOICES } from './constants';
import { Phone, Download, Play, Pause, AlertCircle, LogOut } from 'lucide-react';

const AUTH_STORAGE_KEY = 'gemini_ivr_auth_code';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [authPassword, setAuthPassword] = useState<string>('');

  // --- App State ---
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[0].id);
  const [selectedSpeed, setSelectedSpeed] = useState<SpeakingSpeed>(SpeakingSpeed.NORMAL);
  const [selectedSampleRate, setSelectedSampleRate] = useState<AudioSampleRate>(AudioSampleRate.RATE_5000);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedAudioData | null>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Auth Logic ---
  const verifyPassword = async (pwd: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthPassword(pwd);
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_STORAGE_KEY, pwd);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Auth verification failed", e);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedPwd = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedPwd) {
        const isValid = await verifyPassword(storedPwd);
        if (!isValid) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        // If no stored password, check if the server is in Open Mode (no password set)
        // by sending an empty password. If server allows, we are in.
        // Actually, better UX: just show login screen. If server is open, any password works or we can auto-check.
        // Let's keep it simple: Show login screen unless storage exists.
      }
      setIsAuthChecking(false);
    };
    initAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthPassword('');
    setIsAuthenticated(false);
    setResult(null);
    setText("");
  };

  // --- Main Logic ---

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setIsPlaying(false);

    try {
      // Pass authPassword to service
      const base64Audio = await generateSpeech(text, selectedVoice, selectedSpeed, authPassword);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await decodeBase64Audio(base64Audio, audioContext);
      const resampledBuffer = await resampleAudioBuffer(decodedBuffer, selectedSampleRate);
      const wavBlob = encodeToWav(resampledBuffer);
      const wavUrl = URL.createObjectURL(wavBlob);

      setResult({
        blob: wavBlob,
        url: wavUrl,
        duration: resampledBuffer.duration,
        sampleRate: selectedSampleRate
      });

      audioContext.close();

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Authorization")) {
        // If API says unauthorized (maybe password rotated), logout user
        handleLogout();
        alert("Session expired. Please login again.");
      } else {
        setError(err.message || "Failed to generate audio.");
      }
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

  const handleAudioEnded = () => setIsPlaying(false);

  // --- Render ---

  if (isAuthChecking) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={verifyPassword} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      
      <header className="mb-8 text-center space-y-2 relative w-full max-w-2xl">
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="absolute right-0 top-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>

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
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm uppercase tracking-wider">Error</span>
              <span className="font-medium text-sm whitespace-pre-wrap">{error}</span>
            </div>
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