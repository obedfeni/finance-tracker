'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, getThisMonthTransactions, getCategoryTotals } from '@/lib/store';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Sidebar from '@/components/Sidebar';

const COLORS = ['#00D4FF','#0066FF','#00FF88','#FF6B35','#FFD700','#FF3D71','#A855F7','#10B981'];

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated, transactions } = useStore();
  const [period, setPeriod] = useState<'week'|'month'|'year'>('month');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isAuthenticated) router.replace('/'); }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  // Filter by period
  const now = new Date();
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    if (period === 'week') {
      const start = new Date(); start.setDate(now.getDate() - 7);
      return d >= start;
    }
    if (period === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return d.getFullYear() === now.getFullYear();
  });

  const income = filtered.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expenses = filtered.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : '0';

  const categoryData = getCategoryTotals(filtered);

  // Monthly trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('en-GH', { month: 'short' });
    const monthTxns = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return {
      month: label,
      income: monthTxns.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0),
      expenses: monthTxns.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
    };
  });

  return (
    <div className="flex min-h-screen bg-dark-900 grid-bg">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <p className="text-white/40 text-sm tracking-wider uppercase">Analytics</p>
            <h1 className="font-display text-2xl font-bold text-white mt-1">REPORTS</h1>
          </div>
          <button onClick={() => exportToCSV(filtered)} className="neon-btn text-sm">Export CSV</button>
        </div>

        {/* Period filter */}
        <div className="flex gap-2 mb-6 animate-slide-up">
          {(['week','month','year'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                period === p ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue' : 'border-white/10 text-white/50 hover:text-white'
              }`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-slide-up">
          {[
            { label: 'Income', value: formatCurrency(income), color: 'text-emerald-400' },
            { label: 'Expenses', value: formatCurrency(expenses), color: 'text-red-400' },
            { label: 'Savings', value: formatCurrency(savings), color: savings >= 0 ? 'text-neon-blue' : 'text-red-400' },
            { label: 'Save Rate', value: `${savingsRate}%`, color: parseFloat(savingsRate) >= 20 ? 'text-emerald-400' : 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`font-display text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bar chart */}
          <div className="glass-card p-5 animate-slide-up">
            <p className="section-title">Monthly Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#0D1525', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`GHS ${v.toFixed(2)}`, '']}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-white/50"><div className="w-2.5 h-2.5 rounded bg-emerald-400"/> Income</div>
              <div className="flex items-center gap-1.5 text-xs text-white/50"><div className="w-2.5 h-2.5 rounded bg-red-400"/> Expenses</div>
            </div>
          </div>

          {/* Pie */}
          <div className="glass-card p-5 animate-slide-up">
            <p className="section-title">Spending Breakdown</p>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0D1525', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number) => [`GHS ${v.toFixed(2)}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categoryData.slice(0, 5).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60 text-sm flex-1">{d.name}</span>
                      <span className="font-mono text-sm text-white/80">{formatCurrency(d.value).replace('GHS ','')}</span>
                      <span className="text-white/30 text-xs w-10 text-right">
                        {expenses > 0 ? `${Math.round((d.value / expenses) * 100)}%` : '0%'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-white/30 text-sm">No expenses in this period</div>
            )}
          </div>
        </div>

        {/* Line chart - balance over time */}
        <div className="glass-card p-5 animate-slide-up">
          <p className="section-title">Balance Trend (6 Months)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthlyData.map((m, i, arr) => ({
              ...m,
              balance: arr.slice(0, i + 1).reduce((a, x) => a + x.income - x.expenses, 0)
            }))}>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0D1525', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`GHS ${v.toFixed(2)}`, 'Balance']}
              />
              <Line type="monotone" dataKey="balance" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
