import { create } from 'zustand';
import db from '../db/database';

const useGoalStore = create((set, get) => ({
  goals: [],
  contributions: [],
  loading: false,

  loadGoals: async () => {
    set({ loading: true });
    const goals = await db.goals.orderBy('createdAt').reverse().toArray();
    const contributions = await db.goalContributions.toArray();
    set({ goals, contributions, loading: false });
  },

  addGoal: async (data) => {
    const id = await db.goals.add({ ...data, currentAmount: data.currentAmount || 0, createdAt: new Date().toISOString() });
    const goal = await db.goals.get(id);
    set((s) => ({ goals: [goal, ...s.goals] }));
    return id;
  },

  updateGoal: async (id, data) => {
    await db.goals.update(id, data);
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }));
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id);
    await db.goalContributions.where('goalId').equals(id).delete();
    set((s) => ({
      goals: s.goals.filter((g) => g.id !== id),
      contributions: s.contributions.filter((c) => c.goalId !== id),
    }));
  },

  addContribution: async (goalId, data) => {
    const id = await db.goalContributions.add({ goalId, ...data, date: data.date || new Date().toISOString() });
    const goal = get().goals.find((g) => g.id === goalId);
    if (goal) {
      const newAmount = (goal.currentAmount || 0) + data.amount;
      await db.goals.update(goalId, { currentAmount: newAmount });
      set((s) => ({
        goals: s.goals.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g)),
        contributions: [...s.contributions, { id, goalId, ...data }],
      }));
    }
    return id;
  },

  getContributions: (goalId) => {
    return get().contributions.filter((c) => c.goalId === goalId);
  },
}));

export default useGoalStore;
