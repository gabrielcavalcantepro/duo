import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import db from '../db/database';

const useChallenge = create(
  persist(
    (set, get) => ({
      days: [],
      startDate: null,
      loading: false,

      loadChallenge: async () => {
        set({ loading: true });
        const days = await db.challengeDays.orderBy('day').toArray();
        set({ days, loading: false });
      },

      startChallenge: async () => {
        await db.challengeDays.clear();
        const startDate = new Date().toISOString();
        set({ days: [], startDate });
      },

      completeDay: async (day, note = '') => {
        const existing = get().days.find((d) => d.day === day);
        const completedAt = new Date().toISOString();
        if (existing) {
          await db.challengeDays.update(existing.id, { completed: true, completedAt, note });
          set((s) => ({
            days: s.days.map((d) => (d.day === day ? { ...d, completed: true, completedAt, note } : d)),
          }));
        } else {
          const id = await db.challengeDays.add({ day, completed: true, completedAt, note });
          const record = await db.challengeDays.get(id);
          set((s) => ({ days: [...s.days, record] }));
        }
      },

      resetChallenge: async () => {
        await db.challengeDays.clear();
        set({ days: [], startDate: new Date().toISOString() });
      },

      getCompletedCount: () => get().days.filter((d) => d.completed).length,
      isDayCompleted: (day) => !!get().days.find((d) => d.day === day && d.completed),
    }),
    { name: 'duo-challenge', partialize: (s) => ({ startDate: s.startDate }) }
  )
);

export default useChallenge;
