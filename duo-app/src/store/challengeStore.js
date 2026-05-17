import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const getCoupleId = () => useAuthStore.getState().couple?.id;

function mapDay(row) {
  return {
    ...row,
    completedAt: row.completed_at,
  };
}

const useChallenge = create(
  persist(
    (set, get) => ({
      days: [],
      startDate: null,
      loading: false,

      loadChallenge: async () => {
        const coupleId = getCoupleId();
        if (!coupleId) return;
        set({ loading: true });
        const { data } = await supabase
          .from('challenge_days')
          .select('*')
          .eq('couple_id', coupleId)
          .order('day', { ascending: true });
        set({ days: (data || []).map(mapDay), loading: false });
      },

      startChallenge: async () => {
        const coupleId = getCoupleId();
        if (!coupleId) return;
        await supabase.from('challenge_days').delete().eq('couple_id', coupleId);
        const startDate = new Date().toISOString();
        set({ days: [], startDate });
      },

      completeDay: async (day, note = '') => {
        const coupleId = getCoupleId();
        if (!coupleId) return;
        const existing = get().days.find((d) => d.day === day);
        const completedAt = new Date().toISOString();

        if (existing) {
          await supabase.from('challenge_days')
            .update({ completed: true, completed_at: completedAt, note })
            .eq('id', existing.id);
          set((s) => ({
            days: s.days.map((d) => d.day === day ? { ...d, completed: true, completedAt, note } : d),
          }));
        } else {
          const { data: row } = await supabase
            .from('challenge_days')
            .insert({ couple_id: coupleId, day, completed: true, completed_at: completedAt, note })
            .select()
            .single();
          if (row) set((s) => ({ days: [...s.days, mapDay(row)] }));
        }
      },

      resetChallenge: async () => {
        const coupleId = getCoupleId();
        if (!coupleId) return;
        await supabase.from('challenge_days').delete().eq('couple_id', coupleId);
        set({ days: [], startDate: new Date().toISOString() });
      },

      getCompletedCount: () => get().days.filter((d) => d.completed).length,
      isDayCompleted: (day) => !!get().days.find((d) => d.day === day && d.completed),
    }),
    { name: 'duo-challenge', partialize: (s) => ({ startDate: s.startDate }) }
  )
);

export default useChallenge;
