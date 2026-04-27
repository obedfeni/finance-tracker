import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Airtime'
  | 'Bills'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Savings'
  | 'Salary'
  | 'Business'
  | 'Transfer'
  | 'MoMo Received'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  note: string;
  date: string; // ISO string
  network?: 'MTN' | 'Telecel' | 'AirtelTigo' | 'Manual';
  smsRaw?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  color: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

interface NeonWalletState {
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  currency: string;
  isAuthenticated: boolean;
  pin: string;

  // Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setBudget: (b: Budget) => void;
  setAuthenticated: (v: boolean) => void;
  setPin: (pin: string) => void;
  importSmsTransactions: (txns: Omit<Transaction, 'id'>[]) => void;
}

export const useStore = create<NeonWalletState>()(
  persist(
    (set) => ({
      transactions: [],
      goals: [],
      budgets: [],
      currency: 'GHS',
      isAuthenticated: false,
      pin: '1234',

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: `txn_${Date.now()}_${Math.random().toString(36).slice(2)}` },
            ...s.transactions,
          ],
        })),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addGoal: (g) =>
        set((s) => ({
          goals: [...s.goals, { ...g, id: `goal_${Date.now()}` }],
        })),

      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      setBudget: (b) =>
        set((s) => ({
          budgets: [
            ...s.budgets.filter((x) => x.category !== b.category),
            b,
          ],
        })),

      setAuthenticated: (v) => set({ isAuthenticated: v }),
      setPin: (pin) => set({ pin }),

      importSmsTransactions: (txns) =>
        set((s) => ({
          transactions: [
            ...txns.map((t) => ({
              ...t,
              id: `txn_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            })),
            ...s.transactions,
          ],
        })),
    }),
    { name: 'neonwallet-storage' }
  )
);

// Selectors
export const getBalance = (transactions: Transaction[]) => {
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
};

export const getTotalIncome = (transactions: Transaction[]) =>
  transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);

export const getTotalExpenses = (transactions: Transaction[]) =>
  transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

export const getThisMonthTransactions = (transactions: Transaction[]) => {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
};

export const getCategoryTotals = (transactions: Transaction[]) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const map: Record<string, number> = {};
  expenses.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};
