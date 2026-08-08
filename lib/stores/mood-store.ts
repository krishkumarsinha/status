import { create } from 'zustand';
import { MoodEntry, SlotMoodLog } from '@/types';
import { getTrackingDate, isDateLocked } from '@/lib/date-utils';
import { repositoryFactory } from '@/lib/repositories/factory';
import { getCurrentUserId } from '@/lib/firebase/config';

interface MoodStore {
  entries: MoodEntry[];
  isLoading: boolean;
  isLoaded: boolean;
  loadMood: (userId?: string) => Promise<void>;
  addEntry: (entry: Omit<MoodEntry, 'id'> | (Omit<MoodEntry, 'id' | 'date'> & { date?: string }), targetDate?: string, userId?: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<MoodEntry>, overrideLock?: boolean, userId?: string) => Promise<void>;
  deleteEntry: (id: string, overrideLock?: boolean, userId?: string) => Promise<void>;
  logTimeSlotMood: (arg1: string | Omit<SlotMoodLog, 'loggedAt'> | SlotMoodLog, arg2?: string | Omit<SlotMoodLog, 'loggedAt'> | SlotMoodLog, userId?: string) => Promise<void>;
  addSlotLog: (arg1: string | Omit<SlotMoodLog, 'loggedAt'> | SlotMoodLog, arg2?: string | Omit<SlotMoodLog, 'loggedAt'> | SlotMoodLog, userId?: string) => Promise<void>;
  getEntryByDate: (date: string) => MoodEntry | undefined;
  getTodayEntry: () => MoodEntry | undefined;
  resetStore: () => void;
}

export const useMoodStore = create<MoodStore>()((set, get) => ({
  entries: [],
  isLoading: false,
  isLoaded: false,

  resetStore: () => set({ entries: [], isLoading: false, isLoaded: false }),

  loadMood: async (userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set({ isLoading: true });
    try {
      const entries = await repositoryFactory.getMoodRepository().getAll(uid);
      set({ entries, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error('[MoodStore] Error loading mood entries from Firestore:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData, targetDate, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const date = (entryData as { date?: string }).date || targetDate || getTrackingDate();
    let savedEntry: MoodEntry | null = null;

    set((state) => {
      const existingIndex = state.entries.findIndex((e) => e.date === date);
      if (existingIndex >= 0) {
        const updatedEntries = [...state.entries];
        updatedEntries[existingIndex] = {
          ...updatedEntries[existingIndex],
          ...entryData,
          date,
        };
        savedEntry = updatedEntries[existingIndex];
        return { entries: updatedEntries };
      }

      const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        date,
        moodScore: entryData.moodScore || 3,
        energyLevel: entryData.energyLevel || 3,
        tags: entryData.tags || [],
        note: entryData.note,
        slotLogs: entryData.slotLogs || [],
      };
      savedEntry = newEntry;
      return { entries: [...state.entries, newEntry] };
    });

    if (savedEntry) {
      try {
        await repositoryFactory.getMoodRepository().save(uid, savedEntry);
      } catch (error) {
        console.error('[MoodStore] Error saving mood entry to Firestore:', error);
      }
    }
  },

  updateEntry: async (id, updates, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().entries.find((e) => e.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Mood entry on date ${existing.date} is locked.`);
      return;
    }

    let updatedEntry: MoodEntry | null = null;

    set((state) => ({
      entries: state.entries.map((entry) => {
        if (entry.id === id) {
          updatedEntry = { ...entry, ...updates };
          return updatedEntry;
        }
        return entry;
      }),
    }));

    if (updatedEntry) {
      try {
        await repositoryFactory.getMoodRepository().save(uid, updatedEntry);
      } catch (error) {
        console.error('[MoodStore] Error updating mood entry in Firestore:', error);
      }
    }
  },

  deleteEntry: async (id, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().entries.find((e) => e.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Mood entry on date ${existing.date} is locked.`);
      return;
    }

    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }));

    try {
      await repositoryFactory.getMoodRepository().delete(uid, id);
    } catch (error) {
      console.error('[MoodStore] Error deleting mood entry from Firestore:', error);
    }
  },

  logTimeSlotMood: async (arg1, arg2, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let date: string;
    let slotLogData: Omit<SlotMoodLog, 'loggedAt'> | SlotMoodLog;

    if (typeof arg1 === 'string') {
      date = arg1;
      slotLogData = arg2 as Omit<SlotMoodLog, 'loggedAt'>;
    } else {
      slotLogData = arg1;
      date = (typeof arg2 === 'string' ? arg2 : undefined) || getTrackingDate();
    }

    const fullSlotLog: SlotMoodLog = {
      ...slotLogData,
      loggedAt: (slotLogData as SlotMoodLog).loggedAt || new Date().toISOString(),
    };

    let targetEntry: MoodEntry | null = null;

    set((state) => {
      const existingIndex = state.entries.findIndex((e) => e.date === date);

      if (existingIndex >= 0) {
        const existingEntry = state.entries[existingIndex];
        const existingSlots = existingEntry.slotLogs || [];
        const slotIndex = existingSlots.findIndex((s) => s.slotId === slotLogData.slotId);

        let newSlots: SlotMoodLog[];
        if (slotIndex >= 0) {
          newSlots = [...existingSlots];
          newSlots[slotIndex] = fullSlotLog;
        } else {
          newSlots = [...existingSlots, fullSlotLog];
        }

        const updatedEntries = [...state.entries];
        updatedEntries[existingIndex] = {
          ...existingEntry,
          moodScore: fullSlotLog.moodScore,
          energyLevel: fullSlotLog.energyLevel,
          slotLogs: newSlots,
        };
        targetEntry = updatedEntries[existingIndex];
        return { entries: updatedEntries };
      } else {
        const newEntry: MoodEntry = {
          id: crypto.randomUUID(),
          date,
          moodScore: fullSlotLog.moodScore,
          energyLevel: fullSlotLog.energyLevel,
          tags: [],
          slotLogs: [fullSlotLog],
        };
        targetEntry = newEntry;
        return { entries: [...state.entries, newEntry] };
      }
    });

    if (targetEntry) {
      try {
        await repositoryFactory.getMoodRepository().save(uid, targetEntry);
      } catch (error) {
        console.error('[MoodStore] Error saving slot mood log to Firestore:', error);
      }
    }
  },

  addSlotLog: async (arg1, arg2, userId) => {
    return get().logTimeSlotMood(arg1, arg2, userId);
  },

  getEntryByDate: (date) => {
    return get().entries.find((e) => e.date === date);
  },

  getTodayEntry: () => {
    const today = getTrackingDate();
    return get().entries.find((e) => e.date === today);
  },
}));
