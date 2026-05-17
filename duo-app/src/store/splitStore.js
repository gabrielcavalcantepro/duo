import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const getCoupleId = () => useAuthStore.getState().couple?.id;

function mapSplit(row) {
  return {
    ...row,
    totalAmount: row.total_amount,
    paidBy: row.paid_by,
    splitType: row.split_type,
    customSplit: row.items || null,
  };
}

const useSplitStore = create((set, get) => ({
  splits: [],
  loading: false,

  loadSplits: async () => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    set({ loading: true });
    const { data } = await supabase
      .from('split_bills')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date', { ascending: false });
    set({ splits: (data || []).map(mapSplit), loading: false });
  },

  addSplit: async (data) => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    const { data: row } = await supabase
      .from('split_bills')
      .insert({
        couple_id: coupleId,
        description: data.description,
        total_amount: data.totalAmount,
        paid_by: data.paidBy,
        split_type: data.splitType,
        items: data.customSplit || null,
        settled: false,
        date: data.date || new Date().toISOString(),
      })
      .select()
      .single();
    if (row) set((s) => ({ splits: [mapSplit(row), ...s.splits] }));
    return row?.id;
  },

  settleSplit: async (id) => {
    await supabase.from('split_bills').update({ settled: true }).eq('id', id);
    set((s) => ({
      splits: s.splits.map((sp) => sp.id === id ? { ...sp, settled: true } : sp),
    }));
  },

  deleteSplit: async (id) => {
    await supabase.from('split_bills').delete().eq('id', id);
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
