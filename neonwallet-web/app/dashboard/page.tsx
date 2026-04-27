'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, getBalance, getTotalIncome, getTotalExpenses, getThisMonthTransactions, getCategoryTotals } from '@/lib/store';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { generateAIAdvice } from '@/lib/sms';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import Sidebar from '@/components/Sidebar';
import AddTransaction from '@/components/AddTransaction';

const COLORS = ['#00D4FF','#0066FF','#00FF88','#FF6B35','#FFD700','#FF3D71','#A855F7','#10B981'];

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, transactions } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isAuthenticated) router.replace('/'); }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const balance = getBalance(transactions);
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const thisMonth = getThisMonthTransactions(transactions);
  const monthIncome = getTotalIncome(thisMonth);
  const monthExpenses = getTotalExpenses(thisMonth);
  const categoryData = getCategoryTotals(thisMonth);
  const advice = generateAIAdvice(transactions);

  // Build last 7 days chart
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-GH', { weekday: 'short' });
    const dayTxns = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.toDateString() === d.toDateString();
    });
    return {
      day: label,
      income: dayTxns.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0),
      expense: dayTxns.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
    };
  });

  const recent = transactions.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-dark-900 grid-bg">
      <Sidebar />

      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <p className="text-white/40 text-sm tracking-wider uppercase font-body">Welcome back</p>
            <h1 className="font-display text-2xl font-bold text-white mt-1">DASHBOARD</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="neon-btn flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add
          </button>
        </div>

        {/* Balance Card */}
        <div className="neon-card p-6 mb-6 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
          <p className="section-title">Total Balance</p>
          <div className={`stat-number text-4xl mb-1 ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(balance)}
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/50 text-sm">Income: <span className="text-emerald-400 font-mono">{formatCurrency(totalIncome)}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/50 text-sm">Spent: <span className="text-red-400 font-mono">{formatCurrency(totalExpenses)}</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* This month */}
          <div className="glass-card p-4 animate-slide-up">
            <p className="section-title">This Month</p>
            <p className="stat-number text-white">{formatCurrency(monthIncome - monthExpenses)}</p>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-emerald-400">↑ {formatCurrency(monthIncome)}</span>
              <span className="text-red-400">↓ {formatCurrency(monthExpenses)}</span>
            </div>
            {monthIncome > 0 && (
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-neon-blue rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (monthExpenses / monthIncome) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Total transactions */}
          <div className="glass-card p-4 animate-slide-up">
            <p className="section-title">Transactions</p>
            <p className="stat-number text-white">{transactions.length}</p>
            <p className="text-white/40 text-sm mt-1">{thisMonth.length} this month</p>
          </div>

          {/* Savings rate */}
          <div className="glass-card p-4 animate-slide-up">
            <p className="section-title">Savings Rate</p>
            <p className={`stat-number ${totalIncome > 0 && totalIncome > totalExpenses ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalIncome > 0 ? `${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%` : '—'}
            </p>
            <p className="text-white/40 text-sm mt-1">of total income</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Area chart */}
          <div className="glass-card p-5 animate-slide-up">
            <p className="section-title">Last 7 Days</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={last7}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#0D1525', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`GHS ${v.toFixed(2)}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="glass-card p-5 animate-slide-up">
            <p className="section-title">Spending by Category</p>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                      paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0D1525', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number) => [`GHS ${v.toFixed(2)}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryData.slice(0, 4).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-white/60">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-36 flex items-center justify-center text-white/30 text-sm">No expenses yet</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent transactions */}
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <p className="section-title mb-0">Recent</p>
              <a href="/transactions" className="text-neon-blue/60 text-xs hover:text-neon-blue transition-colors">View all →</a>
            </div>
            {recent.length === 0 ? (
              <div className="text-white/30 text-sm py-8 text-center">No transactions yet</div>
            ) : (
              <div className="space-y-3">
                {recent.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                      t.type === 'income' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      {t.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{t.note}</p>
                      <p className="text-white/30 text-xs">{t.category} · {formatDate(t.date)}</p>
                    </div>
                    <span className={`font-mono text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace('GHS ','')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Advice */}
          <div className="glass-card p-5 animate-slide-up">
            <p className="section-title">AI Spending Advice</p>
            <div className="space-y-3">
              {advice.map((a, i) => (
                <div key={i} className="bg-neon-blue/5 border border-neon-blue/10 rounded-xl p-3 text-sm text-white/70">
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
    </div>
  );
}
