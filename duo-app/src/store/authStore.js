import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import db from '../db/database';

const useAuthStore = create(
  persist(
    (set, get) => ({
      couple: null,
      activeUser: null,
      isOnboarded: false,

      setCouple: (couple) => set({ couple, isOnboarded: true }),
      setActiveUser: (user) => set({ activeUser: user }),

      loadCouple: async () => {
        const couples = await db.couple.toArray();
        if (couples.length > 0) {
          const couple = couples[0];
          set({ couple, isOnboarded: true, activeUser: get().activeUser || couple.partner1Name });
        }
      },

      updateCouple: async (data) => {
        const { couple } = get();
        if (!couple) return;
        await db.couple.update(couple.id, data);
        set({ couple: { ...couple, ...data } });
      },

      clearCouple: async () => {
        await db.couple.clear();
        await db.transactions.clear();
        await db.goals.clear();
        await db.goalContributions.clear();
        await db.budgets.clear();
        await db.meetings.clear();
        await db.challengeDays.clear();
        await db.splitBills.clear();
        await db.categories.clear();
        set({ couple: null, activeUser: null, isOnboarded: false });
      },
    }),
    {
      name: 'duo-auth',
      partialize: (state) => ({
        activeUser: state.activeUser,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);

export default useAuthStore;
