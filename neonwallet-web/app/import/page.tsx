'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { parseMultipleSMS, parseSMS } from '@/lib/sms';
import { formatCurrency } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

export default function ImportPage() {
  const router = useRouter();
  const { isAuthenticated, importSmsTransactions } = useStore();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseSMS>[]>([]);
  const [step, setStep] = useState<'input'|'preview'|'done'>('input');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isAuthenticated) router.replace('/'); }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const handleParse = () => {
    const results = parseMultipleSMS(text);
    setParsed(results);
    setStep('preview');
  };

  const handleImport = () => {
    const valid = parsed.filter(Boolean) as NonNullable<ReturnType<typeof parseSMS>>[];
    importSmsTransactions(valid);
    setStep('done');
  };

  const EXAMPLES = [
    'You have received GHS 500.00 from Kwame Mensah. Your new balance is GHS 1,200.00. MTN MoMo.',
    'GHS 25.00 has been sent to 0244123456. Your new balance is GHS 1,175.00. MTN MoMo.',
    'Payment of GHS 60.00 to ECG Ghana successful. Reference: ECG001234.',
  ];

  return (
    <div className="flex min-h-screen bg-dark-900 grid-bg">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-24 md:pb-8 max-w-3xl">
        <div className="mb-8 animate-slide-up">
          <p className="text-white/40 text-sm tracking-wider uppercase">Auto Import</p>
          <h1 className="font-display text-2xl font-bold text-white mt-1">SMS IMPORT</h1>
        </div>

        {step === 'input' && (
          <div className="space-y-6 animate-slide-up">
            {/* How it works */}
            <div className="neon-card p-5">
              <p className="section-title">How it works</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/60">
                {[
                  { step: '1', label: 'Copy your MoMo SMS', desc: 'Copy any MTN, Telecel or AirtelTigo transaction message' },
                  { step: '2', label: 'Paste below', desc: 'Paste one or multiple messages into the text area' },
                  { step: '3', label: 'Auto-import', desc: 'NeonWallet parses and imports them automatically' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-display text-xs font-bold flex-shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-white font-medium mb-0.5">{s.label}</p>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* iPhone shortcut info */}
            <div className="glass-card p-4 border-amber-400/20">
              <div className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="text-amber-400 font-medium text-sm mb-1">iPhone Users</p>
                  <p className="text-white/50 text-sm">
                    On iPhone: long-press your MoMo SMS → tap <strong className="text-white/70">Copy</strong> → paste here. 
                    Or use the Apple Shortcuts guide in <code className="text-neon-blue/70 bg-neon-blue/5 px-1 rounded">SHORTCUT_SETUP.md</code> for one-tap import.
                  </p>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="glass-card p-4">
              <p className="section-title">Example SMS formats</p>
              <div className="space-y-2">
                {EXAMPLES.map((ex, i) => (
                  <div key={i} className="bg-dark-800 rounded-xl p-3 font-mono text-xs text-white/50 cursor-pointer hover:text-white/80 hover:bg-dark-700 transition-all"
                    onClick={() => setText((p) => p ? p + '\n\n' + ex : ex)}>
                    {ex}
                    <span className="text-neon-blue/50 ml-2">← click to add</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Text area */}
            <div>
              <label className="section-title block">Paste SMS Messages</label>
              <textarea
                className="input-field font-mono text-sm min-h-40 resize-none"
                placeholder="Paste your MoMo SMS messages here. You can paste multiple messages."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="w-full neon-btn py-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Parse Messages →
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">Found <span className="text-neon-blue font-bold">{parsed.filter(Boolean).length}</span> transaction{parsed.filter(Boolean).length !== 1 ? 's' : ''}</p>
              <button onClick={() => setStep('input')} className="text-white/40 hover:text-white text-sm transition-colors">← Back</button>
            </div>

            {parsed.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-white/30 text-4xl mb-3">🔍</p>
                <p className="text-white/50 mb-2">No transactions detected</p>
                <p className="text-white/30 text-sm">Make sure you pasted valid MoMo SMS messages</p>
                <button onClick={() => setStep('input')} className="neon-btn mt-4 text-sm">Try Again</button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {parsed.filter(Boolean).map((t, i) => t && (
                    <div key={i} className="glass-card p-4 flex items-center gap-4 animate-slide-up">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                        t.type === 'income' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {t.type === 'income' ? '↑' : '↓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{t.note}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-white/30 text-xs">{t.category}</span>
                          <span className="text-white/20 text-xs">·</span>
                          <span className="text-neon-blue/50 text-xs font-mono">{t.network}</span>
                        </div>
                      </div>
                      <span className={`font-display font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount).replace('GHS ', '')}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={handleImport} className="w-full neon-btn py-3">
                  Import {parsed.filter(Boolean).length} Transaction{parsed.filter(Boolean).length !== 1 ? 's' : ''}
                </button>
              </>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">IMPORTED!</h2>
            <p className="text-white/50 mb-8">Your transactions have been added</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setText(''); setParsed([]); setStep('input'); }} className="neon-btn">Import More</button>
              <button onClick={() => router.push('/transactions')} className="glass-card px-5 py-2 text-white border border-white/10 hover:border-white/20 transition-all rounded-xl text-sm">
                View All
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
