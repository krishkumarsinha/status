import { create } from 'zustand';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { HealthEntry } from '@/types';
import { getTrackingDate, isDateLocked } from '@/lib/date-utils';
import { repositoryFactory } from '@/lib/repositories/factory';
import { getCurrentUserId } from '@/lib/firebase/config';

interface HealthStore {
  entries: HealthEntry[];
  isLoading: boolean;
  isLoaded: boolean;
  loadHealth: (userId?: string) => Promise<void>;
  addEntry: (entryData: Partial<HealthEntry> & { date?: string }, overrideLock?: boolean, userId?: string) => Promise<void>;
  upsertTodayEntry: (updates: Partial<HealthEntry>, userId?: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<HealthEntry>, overrideLock?: boolean, userId?: string) => Promise<void>;
  deleteEntry: (id: string, overrideLock?: boolean, userId?: string) => Promise<void>;
  getEntryByDate: (date: string) => HealthEntry | undefined;
  getTodayEntry: () => HealthEntry | undefined;
  getEntriesByRange: (startDate: Date, endDate: Date) => HealthEntry[];
  resetStore: () => void;
}

export const useHealthStore = create<HealthStore>()((set, get) => ({
  entries: [],
  isLoading: false,
  isLoaded: false,

  resetStore: () => set({ entries: [], isLoading: false, isLoaded: false }),

  loadHealth: async (userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set({ isLoading: true });
    try {
      const entries = await repositoryFactory.getHealthRepository().getAll(uid);
      set({ entries, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error('[HealthStore] Error loading health entries from Firestore:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const date = entryData.date || getTrackingDate();
    if (isDateLocked(date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Date ${date} is locked.`);
      return;
    }

    let targetEntry: HealthEntry | null = null;
    set((state) => {
      const existingIndex = state.entries.findIndex((e) => e.date === date);
      if (existingIndex >= 0) {
        const newEntries = [...state.entries];
        newEntries[existingIndex] = {
          ...newEntries[existingIndex],
          ...entryData,
        };
        targetEntry = newEntries[existingIndex];
        return { entries: newEntries };
      } else {
        const newEntry: HealthEntry = {
          id: crypto.randomUUID(),
          date,
          ...entryData,
        };
        targetEntry = newEntry;
        return { entries: [...state.entries, newEntry] };
      }
    });

    if (targetEntry) {
      try {
        await repositoryFactory.getHealthRepository().save(uid, targetEntry);
      } catch (error) {
        console.error('[HealthStore] Error adding health entry to Firestore:', error);
      }
    }
  },

  upsertTodayEntry: async (updates, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const today = getTrackingDate();
    let targetEntry: HealthEntry | null = null;

    set((state) => {
      const existingIndex = state.entries.findIndex((e) => e.date === today);
      if (existingIndex >= 0) {
        const newEntries = [...state.entries];
        newEntries[existingIndex] = {
          ...newEntries[existingIndex],
          ...updates,
        };
        targetEntry = newEntries[existingIndex];
        return { entries: newEntries };
      } else {
        const newEntry: HealthEntry = {
          id: crypto.randomUUID(),
          date: today,
          ...updates,
        };
        targetEntry = newEntry;
        return { entries: [...state.entries, newEntry] };
      }
    });

    if (targetEntry) {
      try {
        await repositoryFactory.getHealthRepository().save(uid, targetEntry);
      } catch (error) {
        console.error('[HealthStore] Error upserting health entry to Firestore:', error);
      }
    }
  },

  updateEntry: async (id, updates, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().entries.find((e) => e.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Health entry on date ${existing.date} is locked.`);
      return;
    }

    let updatedEntry: HealthEntry | null = null;
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
        await repositoryFactory.getHealthRepository().save(uid, updatedEntry);
      } catch (error) {
        console.error('[HealthStore] Error updating health entry in Firestore:', error);
      }
    }
  },

  deleteEntry: async (id, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().entries.find((e) => e.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Health entry on date ${existing.date} is locked.`);
      return;
    }

    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }));

    try {
      await repositoryFactory.getHealthRepository().delete(uid, id);
    } catch (error) {
      console.error('[HealthStore] Error deleting health entry from Firestore:', error);
    }
  },

  getEntryByDate: (date) => {
    return get().entries.find((e) => e.date === date);
  },

  getTodayEntry: () => {
    const today = getTrackingDate();
    return get().entries.find((e) => e.date === today);
  },

  getEntriesByRange: (startDate, endDate) => {
    return get().entries.filter((e) => {
      const entryDate = parseISO(e.date);
      return isWithinInterval(entryDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
  },
}));
