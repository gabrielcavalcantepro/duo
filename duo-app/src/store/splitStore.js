import { create } from 'zustand';
import db from '../db/database';

const useSplitStore = create((set, get) => ({
  splits: [],
  loading: false,

  loadSplits: async () => {
    set({ loading: true });
    const splits = await db.splitBills.orderBy('date').reverse().toArray();
    set({ splits, loading: false });
  },

  addSplit: async (data) => {
    const id = await db.splitBills.add({ ...data, settled: false, date: data.date || new Date().toISOString() });
    const split = await db.splitBills.get(id);
    set((s) => ({ splits: [split, ...s.splits] }));
    return id;
  },

  settleSplit: async (id) => {
    await db.splitBills.update(id, { settled: true, settledAt: new Date().toISOString() });
    set((s) => ({
      splits: s.splits.map((sp) => (sp.id === id ? { ...sp, settled: true } : sp)),
    }));
  },

  deleteSplit: async (id) => {
    await db.splitBills.delete(id);
    set((s) => ({ splits: s.splits.filter((sp) => sp.id !== id) }));
  },

  getBalance: (partner1Name, partner2Name) => {
    const { splits } = get();
    let balance = 0;
    splits.filter((s) => !s.settled).forEach((s) => {
      const { totalAmount, paidBy, splitType, customSplit } = s;
      if (splitType === '50/50') {
        const half = totalAmount / 2;
        if (paidBy === partner1Name) balance += half;
        else balance -= half;
      } else if (splitType === 'custom' && customSplit) {
        if (paidBy === partner1Name) balance += customSplit.person2;
        else balance -= customSplit.person1;
      }
    });
    return balance;
  },
}));

export default useSplitStore;
