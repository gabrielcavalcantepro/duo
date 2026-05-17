import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const getCoupleId = () => useAuthStore.getState().couple?.id;

function mapGoal(row) {
  return {
    ...row,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
  };
}

function mapContribution(row) {
  return {
    ...row,
    goalId: row.goal_id,
    paidBy: row.paid_by,
  };
}

const useGoalStore = create((set, get) => ({
  goals: [],
  contributions: [],
  loading: false,

  loadGoals: async () => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    set({ loading: true });
    const [{ data: goals }, { data: contributions }] = await Promise.all([
      supabase.from('goals').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }),
      supabase.from('goal_contributions').select('*').eq('couple_id', coupleId),
    ]);
    set({
      goals: (goals || []).map(mapGoal),
      contributions: (contributions || []).map(mapContribution),
      loading: false,
    });
  },

  addGoal: async (data) => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    const { data: row } = await supabase
      .from('goals')
      .insert({
        couple_id: coupleId,
        name: data.name,
        emoji: data.emoji || '🎯',
        target_amount: data.targetAmount,
        current_amount: data.currentAmount || 0,
        deadline: data.deadline || null,
        color: data.color || '#D4537E',
        priority: data.priority || 'média',
        completed: false,
      })
      .select()
      .single();
    if (row) {
      set((s) => ({ goals: [mapGoal(row), ...s.goals] }));
      return row.id;
    }
  },

  updateGoal: async (id, data) => {
    const dbData = { ...data };
    if ('targetAmount' in data) { dbData.target_amount = data.targetAmount; delete dbData.targetAmount; }
    if ('currentAmount' in data) { dbData.current_amount = data.currentAmount; delete dbData.currentAmount; }

    await supabase.from('goals').update(dbData).eq('id', id);
    set((s) => ({
      goals: s.goals.map((g) => g.id === id ? { ...g, ...data } : g),
    }));
  },

  deleteGoal: async (id) => {
    await supabase.from('goals').delete().eq('id', id);
    set((s) => ({
      goals: s.goals.filter((g) => g.id !== id),
      contributions: s.contributions.filter((c) => c.goalId !== id),
    }));
  },

  addContribution: async (goalId, data) => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    const { data: row } = await supabase
      .from('goal_contributions')
      .insert({
        goal_id: goalId,
        couple_id: coupleId,
        amount: data.amount,
        paid_by: data.paidBy,
        note: data.note || null,
        date: data.date || new Date().toISOString(),
      })
      .select()
      .single();

    const goal = get().goals.find((g) => g.id === goalId);
    if (goal) {
      const newAmount = (goal.currentAmount || 0) + data.amount;
      await supabase.from('goals').update({ current_amount: newAmount }).eq('id', goalId);
      set((s) => ({
        goals: s.goals.map((g) => g.id === goalId ? { ...g, currentAmount: newAmount, current_amount: newAmount } : g),
        contributions: [...s.contributions, row ? mapContribution(row) : { goalId, ...data }],
      }));
    }
    return row?.id;
  },

  getContributions: (goalId) => {
    return get().contributions.filter((c) => c.goalId === goalId);
  },
}));

export default useGoalStore;
