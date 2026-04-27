'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

const GOAL_COLORS = ['#00D4FF','#10B981','#F59E0B','#A855F7','#EF4444','#0066FF'];

export default function GoalsPage() {
  const router = useRouter();
  const { isAuthenticated, goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [form, setForm] = useState({ name: '', target: '', deadline: '', color: GOAL_COLORS[0] });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isAuthenticated) router.replace('/'); }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const handleAdd = () => {
    if (!form.name || !form.target || parseFloat(form.target) <= 0) return;
    addGoal({ name: form.name, target: parseFloat(form.target), saved: 0, deadline: form.deadline, color: form.color });
    setForm({ name: '', target: '', deadline: '', color: GOAL_COLORS[0] });
    setShowForm(false);
  };

  const handleDeposit = (id: string) => {
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      const goal = goals.find((g) => g.id === id);
      if (goal) updateGoal(id, { saved: Math.min(goal.target, goal.saved + amt) });
    }
    setShowDeposit(null);
    setDepositAmount('');
  };

  return (
    <div className="flex min-h-screen bg-dark-900 grid-bg">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <p className="text-white/40 text-sm tracking-wider uppercase">Finance</p>
            <h1 className="font-display text-2xl font-bold text-white mt-1">SAVINGS GOALS</h1>
          </div>
          <button onClick={() => setShowForm(true)} className="neon-btn flex items-center gap-2 text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Goal
          </button>
        </div>

        {goals.length === 0 && !showForm ? (
          <div className="glass-card p-16 text-center animate-fade-in">
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-white/40 mb-2">No savings goals yet</p>
            <p className="text-white/30 text-sm mb-6">Set a goal for your next big purchase or dream</p>
            <button onClick={() => setShowForm(true)} className="neon-btn">Create First Goal</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, (g.saved / g.target) * 100);
              const done = pct >= 100;
              return (
                <div key={g.id} className="glass-card p-5 animate-slide-up relative overflow-hidden group">
                  {done && (
                    <div className="absolute top-3 right-10 text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      ✓ Complete
                    </div>
                  )}
                  <button
                    onClick={() => { if (confirm('Delete this goal?')) deleteGoal(g.id); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${g.color}15`, border: `1px solid ${g.color}30` }}>
                      🎯
                    </div>
                    <div>
                      <p className="text-white font-semibold">{g.name}</p>
                      {g.deadline && (
                        <p className="text-white/30 text-xs">Target: {new Date(g.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/60">Saved: <span className="text-white font-mono">{formatCurrency(g.saved)}</span></span>
                      <span className="text-white/60">Goal: <span className="font-mono" style={{ color: g.color }}>{formatCurrency(g.target)}</span></span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}88)` }}
                      />
                    </div>
                    <p className="text-right text-xs mt-1" style={{ color: g.color }}>{pct.toFixed(1)}%</p>
                  </div>

                  {!done && (
                    showDeposit === g.id ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">₵</span>
                          <input className="input-field pl-7 py-2 text-sm" type="number" placeholder="0.00"
                            value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDeposit(g.id)} autoFocus />
                        </div>
                        <button onClick={() => handleDeposit(g.id)} className="neon-btn text-sm px-3 py-2">Add</button>
                        <button onClick={() => setShowDeposit(null)} className="text-white/40 hover:text-white px-2 transition-colors">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeposit(g.id)}
                        className="w-full py-2 rounded-xl border text-sm transition-all"
                        style={{ borderColor: `${g.color}30`, color: g.color, background: `${g.color}08` }}>
                        + Add Savings
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Goal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="relative w-full max-w-md bg-dark-700 border border-white/10 rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
              <h2 className="font-display text-base font-bold text-white tracking-wide mb-6">NEW GOAL</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Goal Name</label>
                  <input className="input-field" placeholder="e.g. New iPhone, Holiday, Emergency Fund"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Target Amount (GHS)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₵</span>
                    <input className="input-field pl-8 font-mono" type="number" min="0" placeholder="0.00"
                      value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Deadline (optional)</label>
                  <input className="input-field" type="date" value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Color</label>
                  <div className="flex gap-2">
                    {GOAL_COLORS.map((c) => (
                      <button key={c} onClick={() => setForm({ ...form, color: c })}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{ background: c, boxShadow: form.color === c ? `0 0 12px ${c}` : 'none', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 glass-card py-3 text-white/60 border border-white/10 rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleAdd} className="flex-1 neon-btn py-3 text-sm">Create Goal</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
