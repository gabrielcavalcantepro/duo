import { create } from 'zustand';
import db from '../db/database';

const useMeetingStore = create((set, get) => ({
  meetings: [],
  loading: false,

  loadMeetings: async () => {
    set({ loading: true });
    const meetings = await db.meetings.orderBy('completedAt').reverse().toArray();
    set({ meetings, loading: false });
  },

  saveMeeting: async (month, year, answers, score) => {
    const existing = get().meetings.find((m) => m.month === month && m.year === year);
    const completedAt = new Date().toISOString();
    if (existing) {
      await db.meetings.update(existing.id, { answers, score, completedAt });
      set((s) => ({
        meetings: s.meetings.map((m) =>
          m.id === existing.id ? { ...m, answers, score, completedAt } : m
        ),
      }));
    } else {
      const id = await db.meetings.add({ month, year, answers, score, completedAt });
      const meeting = await db.meetings.get(id);
      set((s) => ({ meetings: [meeting, ...s.meetings] }));
    }
  },

  getMeetingByMonth: (month, year) => {
    return get().meetings.find((m) => m.month === month && m.year === year);
  },
}));

export default useMeetingStore;
