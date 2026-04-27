'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, formatTime, exportToCSV, exportToJSON } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import AddTransaction from '@/components/AddTransaction';

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍽️', Transport: '🚗', Airtime: '📱', Bills: '⚡', Shopping: '🛍️',
  Entertainment: '🎮', Health: '🏥', Education: '📚', Savings: '💰',
  Salary: '💼', Business: '📊', Transfer: '↔️', 'MoMo Received': '📲', Other: '📌',
};

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated, transactions, deleteTransaction } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all'|'income'|'expense'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isAuthenticated) router.replace('/'); }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const filtered = transactions.filter((t) => {
    const matchSearch = !search || t.note.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex min-h-screen bg-dark-900 grid-bg">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-up">
          <div>
            <p className="text-white/40 text-sm tracking-wider uppercase">Finance</p>
            <h1 className="font-display text-2xl font-bold text-white mt-1">TRANSACTIONS</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(transactions)} className="glass-card px-3 py-2 text-white/60 hover:text-white text-xs border border-white/10 hover:border-white/20 transition-all rounded-xl">
              Export CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="neon-btn flex items-center gap-2 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="input-field pl-10" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {(['all','income','expense'] as const).map((f) => (
              <button key={f} onClick={() => setFilterType(f)}
                className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                  filterType === f
                    ? f === 'income' ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                      : f === 'expense' ? 'bg-red-400/10 border-red-400/30 text-red-400'
                      : 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                    : 'border-white/10 text-white/50 hover:text-white'
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          <div className="glass-card p-3 text-center">
            <p className="text-white/40 text-xs mb-1">Showing</p>
            <p className="font-display text-lg text-white">{filtered.length}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-white/40 text-xs mb-1">In</p>
            <p className="font-display text-lg text-emerald-400">
              {formatCurrency(filtered.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0)).replace('GHS ','')}
            </p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-white/40 text-xs mb-1">Out</p>
            <p className="font-display text-lg text-red-400">
              {formatCurrency(filtered.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0)).replace('GHS ','')}
            </p>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <p className="text-white/20 text-4xl mb-3">💳</p>
            <p className="text-white/40">No transactions found</p>
            <button onClick={() => setShowAdd(true)} className="neon-btn mt-4 text-sm">Add your first transaction</button>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            {filtered.map((t) => (
              <div key={t.id} className="glass-card p-4 flex items-center gap-4 hover:border-white/10 transition-all group">
                <div className="text-2xl w-10 text-center">{CATEGORY_ICONS[t.category] || '📌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{t.note}</p>
                    {t.network && t.network !== 'Manual' && (
                      <span className="text-xs text-neon-blue/50 bg-neon-blue/5 border border-neon-blue/10 px-1.5 py-0.5 rounded-md font-mono">
                        {t.network}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/30 text-xs">{t.category}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/30 text-xs">{formatDate(t.date)} {formatTime(t.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-display font-bold text-base ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount).replace('GHS ', '')}
                  </span>
                  <button
                    onClick={() => { if (confirm('Delete this transaction?')) deleteTransaction(t.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
    </div>
  );
}
