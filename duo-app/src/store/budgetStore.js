import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const getCoupleId = () => useAuthStore.getState().couple?.id;

function mapBudget(row) {
  return {
    ...row,
    limit: row.limit_amount,
  };
}

const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,

  loadBudgets: async () => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    set({ loading: true });
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('couple_id', coupleId);
    set({ budgets: (data || []).map(mapBudget), loading: false });
  },

  setBudget: async (month, year, category, limit) => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    const existing = get().budgets.find(
      (b) => b.month === month && b.year === year && b.category === category
    );

    if (existing) {
      await supabase.from('budgets').update({ limit_amount: limit }).eq('id', existing.id);
      set((s) => ({
        budgets: s.budgets.map((b) => b.id === existing.id ? { ...b, limit, limit_amount: limit } : b),
      }));
    } else {
      const { data: row } = await supabase
        .from('budgets')
        .insert({ couple_id: coupleId, month, year, category, limit_amount: limit })
        .select()
        .single();
      if (row) set((s) => ({ budgets: [...s.budgets, mapBudget(row)] }));
    }
  },

  deleteBudget: async (id) => {
    await supabase.from('budgets').delete().eq('id', id);
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  getMonthBudgets: (month, year) => {
    return get().budgets.filter((b) => b.month === month && b.year === year);
  },
}));

export default useBudgetStore;
