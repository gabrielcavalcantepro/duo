import { create } from 'zustand';
import db from '../db/database';

const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,

  loadBudgets: async () => {
    set({ loading: true });
    const budgets = await db.budgets.toArray();
    set({ budgets, loading: false });
  },

  setBudget: async (month, year, category, limit) => {
    const existing = get().budgets.find(
      (b) => b.month === month && b.year === year && b.category === category
    );
    if (existing) {
      await db.budgets.update(existing.id, { limit });
      set((s) => ({
        budgets: s.budgets.map((b) => (b.id === existing.id ? { ...b, limit } : b)),
      }));
    } else {
      const id = await db.budgets.add({ month, year, category, limit, createdAt: new Date().toISOString() });
      const budget = await db.budgets.get(id);
      set((s) => ({ budgets: [...s.budgets, budget] }));
    }
  },

  deleteBudget: async (id) => {
    await db.budgets.delete(id);
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  getMonthBudgets: (month, year) => {
    return get().budgets.filter((b) => b.month === month && b.year === year);
  },
}));

export default useBudgetStore;
