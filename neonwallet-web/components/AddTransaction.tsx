'use client';
import { useState } from 'react';
import { useStore, Category, TransactionType } from '@/lib/store';
import { parseSMSCommand } from '@/lib/sms';

const CATEGORIES: Category[] = [
  'Food','Transport','Airtime','Bills','Shopping','Entertainment',
  'Health','Education','Savings','Salary','Business','Transfer','MoMo Received','Other'
];

const INCOME_CATS: Category[] = ['Salary','Business','MoMo Received','Transfer','Other'];
const EXPENSE_CATS: Category[] = ['Food','Transport','Airtime','Bills','Shopping','Entertainment','Health','Education','Other'];

interface Props {
  onClose: () => void;
}

export default function AddTransaction({ onClose }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('Food');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickCmd, setQuickCmd] = useState('');
  const [tab, setTab] = useState<'form'|'quick'>('form');
  const [error, setError] = useState('');
  const { addTransaction } = useStore();

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Enter a valid amount'); return;
    }
    if (!note.trim()) { setError('Add a note'); return; }
    addTransaction({
      type, category, amount: parseFloat(amount), note: note.trim(),
      date: new Date(date).toISOString(), network: 'Manual',
    });
    onClose();
  };

  const handleQuick = () => {
    const parsed = parseSMSCommand(quickCmd);
    if (!parsed) { setError('Try: "spent 40 food" or "received 500 salary"'); return; }
    addTransaction(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-700 border border-white/10 rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-base font-bold text-white tracking-wide">ADD TRANSACTION</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['form','quick'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t ? 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue' : 'text-white/40 hover:text-white'
              }`}>
              {t === 'form' ? '📝 Form' : '⚡ Quick'}
            </button>
          ))}
        </div>

        {tab === 'quick' ? (
          <div className="space-y-4">
            <p className="text-white/50 text-sm">Type a command like:</p>
            <div className="bg-dark-800 rounded-xl p-3 font-mono text-xs text-neon-blue/70 space-y-1">
              <div>spent 40 food waakye</div>
              <div>received 500 salary kwame</div>
              <div>spent 25 transport bolt</div>
            </div>
            <input
              className="input-field font-mono"
              placeholder="spent 40 food..."
              value={quickCmd}
              onChange={(e) => setQuickCmd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuick()}
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleQuick} className="w-full neon-btn py-3 text-sm">Import</button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {(['income','expense'] as const).map((t) => (
                <button key={t} onClick={() => { setType(t); setCategory(t === 'income' ? 'Salary' : 'Food'); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    type === t
                      ? t === 'income'
                        ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                        : 'bg-red-400/10 border-red-400/30 text-red-400'
                      : 'border-white/10 text-white/40 hover:text-white'
                  }`}>
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Amount (GHS)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₵</span>
                <input className="input-field pl-8 font-mono text-lg" type="number" min="0" step="0.01"
                  placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {cats.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      category === c ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue' : 'border-white/10 text-white/50 hover:text-white'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Note</label>
              <input className="input-field" placeholder="What was this for?" value={note}
                onChange={(e) => setNote(e.target.value)} />
            </div>

            {/* Date */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Date</label>
              <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleSubmit} className="w-full neon-btn py-3 text-sm">Add Transaction</button>
          </div>
        )}
      </div>
    </div>
  );
}
