import { create } from 'zustand';
import { UserSettings } from '@/types';
import { repositoryFactory } from '@/lib/repositories/factory';
import { getCurrentUserId } from '@/lib/firebase/config';

interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;
  isLoaded: boolean;
  loadSettings: (userId?: string) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>, userId?: string) => Promise<void>;
  resetStore: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  unitSystem: 'metric',
  weekStartDay: 'monday',
  dailyWaterGoal: 2500,
  dailyStepsGoal: 10000,
  targetSleepHours: 8,
  currency: 'INR',
  monthlyBudget: 50000,
  reminders: {
    habitsReminder: false,
    habitsReminderTime: '09:00',
    healthReminder: false,
    healthReminderTime: '20:00',
    moodReminder: false,
    moodReminderTime: '21:00',
  },
};

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  isLoaded: false,

  resetStore: () => set({ settings: DEFAULT_SETTINGS, isLoading: false, isLoaded: false }),

  loadSettings: async (userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set({ isLoading: true });
    try {
      const cloudSettings = await repositoryFactory.getSettingsRepository().get(uid);
      if (cloudSettings) {
        set({ settings: cloudSettings, isLoaded: true, isLoading: false });
      } else {
        set({ isLoaded: true, isLoading: false });
      }
    } catch (error) {
      console.error('[SettingsStore] Error loading settings from Firestore:', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let newSettings: UserSettings | null = null;
    set((state) => {
      newSettings = {
        ...state.settings,
        ...updates,
        reminders: updates.reminders
          ? { ...state.settings.reminders, ...updates.reminders }
          : state.settings.reminders,
      };
      return { settings: newSettings };
    });

    if (newSettings) {
      try {
        await repositoryFactory.getSettingsRepository().save(uid, newSettings);
      } catch (error) {
        console.error('[SettingsStore] Error saving settings to Firestore:', error);
      }
    }
  },
}));
