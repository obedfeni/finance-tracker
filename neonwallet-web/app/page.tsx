'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const { pin, setAuthenticated, isAuthenticated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const handleDigit = (d: string) => {
    if (input.length >= 4) return;
    const next = input + d;
    setInput(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === pin) {
          setAuthenticated(true);
          router.push('/dashboard');
        } else {
          setShake(true);
          setError('Wrong PIN');
          setInput('');
          setTimeout(() => { setShake(false); setError(''); }, 600);
        }
      }, 100);
    }
  };

  const handleBack = () => setInput((p) => p.slice(0, -1));

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-blue/3 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00D4FF" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#00D4FF" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#00D4FF" strokeWidth="2" strokeLinejoin="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold neon-text tracking-wider">NEONWALLET</span>
          </div>
          <p className="text-white/40 text-sm font-body tracking-widest uppercase">Mobile Money Tracker</p>
        </div>

        {/* PIN dots */}
        <div className={`flex flex-col items-center gap-6 ${shake ? 'animate-bounce' : ''}`}>
          <p className="text-white/60 text-sm tracking-wider uppercase font-body">Enter PIN</p>
          <div className="flex gap-4">
            {[0,1,2,3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  i < input.length
                    ? 'bg-neon-blue border-neon-blue shadow-neon-sm'
                    : 'border-white/20 bg-transparent'
                }`}
              />
            ))}
          </div>
          {error && <p className="text-red-400 text-sm animate-fade-in">{error}</p>}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => (
            <button
              key={i}
              onClick={() => d === '⌫' ? handleBack() : d ? handleDigit(d) : null}
              disabled={!d}
              className={`
                w-20 h-20 rounded-2xl font-display text-xl font-bold transition-all duration-150
                ${d === '⌫'
                  ? 'bg-dark-700 border border-white/10 text-white/60 hover:bg-dark-600 hover:text-white active:scale-95'
                  : d
                  ? 'bg-dark-700 border border-white/10 text-white hover:bg-neon-blue/10 hover:border-neon-blue/40 hover:text-neon-blue hover:shadow-neon-sm active:scale-95'
                  : 'opacity-0 pointer-events-none'
                }
              `}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="text-white/20 text-xs font-mono">Default PIN: 1234</p>
      </div>
    </div>
  );
}
