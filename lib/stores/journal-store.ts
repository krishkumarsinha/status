import { create } from 'zustand';
import { JournalEntry } from '@/types';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { getTrackingDate, isDateLocked } from '@/lib/date-utils';
import { repositoryFactory } from '@/lib/repositories/factory';
import { getCurrentUserId } from '@/lib/firebase/config';

interface JournalStore {
  entries: JournalEntry[];
  isLoading: boolean;
  isLoaded: boolean;
  loadJournal: (userId?: string) => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>, overrideLock?: boolean, userId?: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>, overrideLock?: boolean, userId?: string) => Promise<void>;
  deleteEntry: (id: string, overrideLock?: boolean, userId?: string) => Promise<void>;
  toggleBookmark: (id: string, userId?: string) => Promise<void>;
  getTodayEntry: () => JournalEntry | undefined;
  getEntryByDate: (date: string) => JournalEntry | undefined;
  getEntriesByDate: (date: string) => JournalEntry[];
  getEntriesByRange: (startDate: Date, endDate: Date) => JournalEntry[];
  resetStore: () => void;
}

export const useJournalStore = create<JournalStore>()((set, get) => ({
  entries: [],
  isLoading: false,
  isLoaded: false,

  resetStore: () => set({ entries: [], isLoading: false, isLoaded: false }),

  loadJournal: async (userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set({ isLoading: true });
    try {
      const entries = await repositoryFactory.getJournalRepository().getAll(uid);
      set({ entries, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error('[JournalStore] Error loading journal entries from Firestore:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    if (isDateLocked(entryData.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Journal entry for date ${entryData.date} is locked from new additions.`);
      return;
    }

    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ entries: [newEntry, ...state.entries] }));

    try {
      await repositoryFactory.getJournalRepository().save(uid, newEntry);
    } catch (error) {
      console.error('[JournalStore] Error saving journal entry to Firestore:', error);
    }
  },

  updateEntry: async (id, updates, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().entries.find((e) => e.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Date ${existing.date} is locked from edits.`);
      return;
    }

    const now = new Date().toISOString();
    let updatedEntry: JournalEntry | null = null;

    set((state) => ({
      entries: state.entries.map((entry) => {
        if (entry.id === id) {
          updatedEntry = { ...entry, ...updates, updatedAt: now };
          return updatedEntry;
        }
        return entry;
      }),
    }));

    if (updatedEntry) {
      try {
        await repositoryFactory.getJournalRepository().save(uid, updatedEntry);
      } catch (error) {
        console.error('[JournalStore] Error updating journal entry in Firestore:', error);
      }
    }
  },

  deleteEntry: async (id, overrideLock = true, userId) => {
    const uid = userId || getCurrentUserId("demo_user");

    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }));

    try {
      await repositoryFactory.getJournalRepository().delete(uid, id);
    } catch (error) {
      console.error('[JournalStore] Error deleting journal entry from Firestore:', error);
    }
  },

  toggleBookmark: async (id, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let targetEntry: JournalEntry | null = null;
    set((state) => ({
      entries: state.entries.map((entry) => {
        if (entry.id === id) {
          targetEntry = { ...entry, isBookmarked: !entry.isBookmarked };
          return targetEntry;
        }
        return entry;
      }),
    }));

    if (targetEntry) {
      try {
        await repositoryFactory.getJournalRepository().save(uid, targetEntry);
      } catch (error) {
        console.error('[JournalStore] Error toggling bookmark in Firestore:', error);
      }
    }
  },

  getTodayEntry: () => {
    const todayStr = getTrackingDate();
    return get().entries.find((entry) => entry.date === todayStr);
  },

  getEntryByDate: (dateStr) => {
    return get().entries.find((entry) => entry.date === dateStr);
  },

  getEntriesByDate: (dateStr) => {
    return get()
      .entries.filter((entry) => entry.date === dateStr)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  getEntriesByRange: (startDate, endDate) => {
    return get().entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
  },
}));
