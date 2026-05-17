import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const getCoupleId = () => useAuthStore.getState().couple?.id;

function mapMeeting(row) {
  return {
    ...row,
    completedAt: row.completed_at,
  };
}

const useMeetingStore = create((set, get) => ({
  meetings: [],
  loading: false,

  loadMeetings: async () => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    set({ loading: true });
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('couple_id', coupleId)
      .order('completed_at', { ascending: false });
    set({ meetings: (data || []).map(mapMeeting), loading: false });
  },

  saveMeeting: async (month, year, answers, score) => {
    const coupleId = getCoupleId();
    if (!coupleId) return;
    const existing = get().meetings.find((m) => m.month === month && m.year === year);
    const completedAt = new Date().toISOString();

    if (existing) {
      await supabase.from('meetings')
        .update({ answers, score, completed_at: completedAt })
        .eq('id', existing.id);
      set((s) => ({
        meetings: s.meetings.map((m) =>
          m.id === existing.id ? { ...m, answers, score, completedAt } : m
        ),
      }));
    } else {
      const { data: row } = await supabase
        .from('meetings')
        .insert({ couple_id: coupleId, month, year, answers, score, completed_at: completedAt })
        .select()
        .single();
      if (row) set((s) => ({ meetings: [mapMeeting(row), ...s.meetings] }));
    }
  },

  getMeetingByMonth: (month, year) => {
    return get().meetings.find((m) => m.month === month && m.year === year);
  },
}));

export default useMeetingStore;
