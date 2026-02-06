import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertOctagon } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (password: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const success = await onLogin(password);
      if (!success) {
        setError('Incorrect password. Please try again. / 密码错误，请重试。');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600 opacity-10 blur-xl rounded-full transform -translate-y-10 scale-150"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <Lock className="text-white h-8 w-8" />
            </div>
          </div>
          <h2 className="relative z-10 text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="relative z-10 text-slate-400 text-sm">访问受限：请输入密码继续</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password / 密码
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Enter access code..."
                  autoFocus
                />
                <ShieldCheck className="absolute left-3 top-3.5 text-slate-400 h-5 w-5" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                <AlertOctagon size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isLoading || !password
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
              }`}
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Login / 登录</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              This application is protected. Contact administrator for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};