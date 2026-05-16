import { create } from 'zustand';
import db from '../db/database';

const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,

  loadTransactions: async () => {
    set({ loading: true });
    const transactions = await db.transactions.orderBy('date').reverse().toArray();
    set({ transactions, loading: false });
  },

  addTransaction: async (data) => {
    const id = await db.transactions.add({ ...data, createdAt: new Date().toISOString() });
    const transaction = await db.transactions.get(id);
    set((s) => ({ transactions: [transaction, ...s.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) }));
    return id;
  },

  updateTransaction: async (id, data) => {
    await db.transactions.update(id, data);
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  getByMonth: (month, year) => {
    const { transactions } = get();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  },
}));

export default useTransactionStore;
