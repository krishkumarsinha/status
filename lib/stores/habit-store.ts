import { create } from 'zustand';
import { format, subDays, parseISO } from 'date-fns';
import { Habit } from '@/types';
import { getTrackingDate, isDateLocked } from '@/lib/date-utils';
import { repositoryFactory } from '@/lib/repositories/factory';
import { getCurrentUserId } from '@/lib/firebase/config';

interface HabitStore {
  habits: Habit[];
  isLoading: boolean;
  isLoaded: boolean;
  loadHabits: (userId?: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>, userId?: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>, userId?: string) => Promise<void>;
  deleteHabit: (id: string, userId?: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string, overrideLock?: boolean, userId?: string) => Promise<void>;
  getStreak: (habitId: string) => number;
  resetStore: () => void;
}

export const useHabitStore = create<HabitStore>()((set, get) => ({
  habits: [],
  isLoading: false,
  isLoaded: false,

  resetStore: () => set({ habits: [], isLoading: false, isLoaded: false }),

  loadHabits: async (userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set({ isLoading: true });
    try {
      const habits = await repositoryFactory.getHabitRepository().getAll(uid);
      set({ habits, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error('[HabitStore] Error loading habits from Firestore:', error);
      set({ isLoading: false });
    }
  },

  addHabit: async (habitData, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completions: [],
    };

    set((state) => ({ habits: [...state.habits, newHabit] }));

    try {
      await repositoryFactory.getHabitRepository().save(uid, newHabit);
    } catch (error) {
      console.error('[HabitStore] Error saving habit to Firestore:', error);
    }
  },

  updateHabit: async (id, updates, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let updatedHabit: Habit | null = null;
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id === id) {
          updatedHabit = { ...habit, ...updates };
          return updatedHabit;
        }
        return habit;
      }),
    }));

    if (updatedHabit) {
      try {
        await repositoryFactory.getHabitRepository().save(uid, updatedHabit);
      } catch (error) {
        console.error('[HabitStore] Error updating habit in Firestore:', error);
      }
    }
  },

  deleteHabit: async (id, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    }));

    try {
      await repositoryFactory.getHabitRepository().delete(uid, id);
    } catch (error) {
      console.error('[HabitStore] Error deleting habit from Firestore:', error);
    }
  },

  toggleCompletion: async (habitId, date, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    if (isDateLocked(date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Date ${date} is locked from edits.`);
      return;
    }

    let targetHabit: Habit | null = null;

    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit;

        const existingCompletionIndex = habit.completions.findIndex(
          (c) => c.date === date
        );

        let newCompletions = [...habit.completions];

        if (existingCompletionIndex >= 0) {
          const currentCount = habit.completions[existingCompletionIndex].count;
          if (currentCount >= habit.targetCount) {
            newCompletions = newCompletions.filter((_, i) => i !== existingCompletionIndex);
          } else {
            newCompletions[existingCompletionIndex].count += 1;
          }
        } else {
          newCompletions.push({ date, count: 1 });
        }

        targetHabit = { ...habit, completions: newCompletions };
        return targetHabit;
      }),
    }));

    if (targetHabit) {
      try {
        await repositoryFactory.getHabitRepository().save(uid, targetHabit);
      } catch (error) {
        console.error('[HabitStore] Error toggling completion in Firestore:', error);
      }
    }
  },

  getStreak: (habitId) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const isCompletedOn = (dateStr: string) =>
      habit.completions.some((c) => c.date === dateStr && c.count >= habit.targetCount);

    const trackingToday = getTrackingDate();
    const trackingYesterday = format(subDays(parseISO(trackingToday), 1), 'yyyy-MM-dd');

    let streak = 0;
    let checkDate: Date;

    if (isCompletedOn(trackingToday)) {
      streak = 1;
      checkDate = subDays(parseISO(trackingToday), 1);
    } else if (isCompletedOn(trackingYesterday)) {
      streak = 0;
      checkDate = subDays(parseISO(trackingToday), 1);
    } else {
      return 0;
    }

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (isCompletedOn(dateStr)) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  },
}));
