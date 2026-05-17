import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const getCoupleId = () => useAuthStore.getState().couple?.id;

const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,

  loadTransactions: async () => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    set({ loading: true });
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date', { ascending: false });
    // Map snake_case → camelCase
    const transactions = (data || []).map(mapTransaction);
    set({ transactions, loading: false });
  },

  addTransaction: async (data) => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    const { data: row } = await supabase
      .from('transactions')
      .insert({
        couple_id: coupleId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description,
        paid_by: data.paidBy,
        date: data.date,
        is_shared: data.isShared ?? true,
        installments: data.installments ?? 1,
        installment_current: data.installmentCurrent ?? 1,
      })
      .select()
      .single();
    if (row) {
      const t = mapTransaction(row);
      set((s) => ({ transactions: [t, ...s.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) }));
      return row.id;
    }
  },

  updateTransaction: async (id, data) => {
    const dbData = {};
    if ('paidBy' in data) { dbData.paid_by = data.paidBy; }
    if ('isShared' in data) { dbData.is_shared = data.isShared; }
    if ('installmentCurrent' in data) { dbData.installment_current = data.installmentCurrent; }
    const merged = { ...data, ...dbData };
    // Remove camelCase keys that were converted
    ['paidBy', 'isShared', 'installmentCurrent'].forEach(k => delete merged[k]);

    await supabase.from('transactions').update(merged).eq('id', id);
    set((s) => ({
      transactions: s.transactions.map((t) => t.id === id ? { ...t, ...data } : t),
    }));
  },

  deleteTransaction: async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
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

function mapTransaction(row) {
  return {
    ...row,
    paidBy: row.paid_by,
    isShared: row.is_shared,
    installmentCurrent: row.installment_current,
  };
}

export default useTransactionStore;
