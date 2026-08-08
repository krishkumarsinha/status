import { useState, useCallback } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  getHabitsCloud,
  saveHabitCloud,
  getHealthEntriesCloud,
  saveHealthEntryCloud,
  getMoodEntriesCloud,
  saveMoodEntryCloud,
  getTransactionsCloud,
  saveTransactionCloud,
  getBudgetsCloud,
  saveBudgetsCloud,
  getSavingsGoalsCloud,
  saveSavingsGoalCloud,
  getJournalEntriesCloud,
  saveJournalEntryCloud,
  getUserSettingsCloud,
  saveUserSettingsCloud,
} from "@/lib/firebase/firestore-service";
import { useHabitStore } from "./habit-store";
import { useHealthStore } from "./health-store";
import { useMoodStore } from "./mood-store";
import { useFinanceStore } from "./finance-store";
import { useJournalStore } from "./journal-store";
import { useSettingsStore } from "./settings-store";

export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  isCloudConfigured: boolean;
}

/**
 * Custom React hook providing automated two-way cloud sync between local Zustand stores and Firestore.
 */
export function useCloudSync(userId: string | null = "demo_user") {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    isCloudConfigured: isFirebaseConfigured(),
  });

  const pushToCloud = useCallback(async () => {
    if (!userId || !isFirebaseConfigured()) return;
    setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const habits = useHabitStore.getState().habits;
      const healthEntries = useHealthStore.getState().entries;
      const moodEntries = useMoodStore.getState().entries;
      const transactions = useFinanceStore.getState().transactions;
      const budgets = useFinanceStore.getState().budgets;
      const savingsGoals = useFinanceStore.getState().savingsGoals;
      const journalEntries = useJournalStore.getState().entries;
      const settings = useSettingsStore.getState().settings;

      await Promise.all([
        ...habits.map((h) => saveHabitCloud(userId, h)),
        ...healthEntries.map((e) => saveHealthEntryCloud(userId, e)),
        ...moodEntries.map((m) => saveMoodEntryCloud(userId, m)),
        ...transactions.map((t) => saveTransactionCloud(userId, t)),
        saveBudgetsCloud(userId, budgets),
        ...savingsGoals.map((s) => saveSavingsGoalCloud(userId, s)),
        ...journalEntries.map((j) => saveJournalEntryCloud(userId, j)),
        saveUserSettingsCloud(userId, settings),
      ]);

      setSyncState({
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
        isCloudConfigured: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sync data to Firestore";
      setSyncState((prev) => ({ ...prev, isSyncing: false, error: message }));
    }
  }, [userId]);

  const pullFromCloud = useCallback(async () => {
    if (!userId || !isFirebaseConfigured()) return;
    setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const [
        cloudHabits,
        cloudHealth,
        cloudMood,
        cloudTransactions,
        cloudBudgets,
        cloudSavings,
        cloudJournal,
        cloudSettings,
      ] = await Promise.all([
        getHabitsCloud(userId),
        getHealthEntriesCloud(userId),
        getMoodEntriesCloud(userId),
        getTransactionsCloud(userId),
        getBudgetsCloud(userId),
        getSavingsGoalsCloud(userId),
        getJournalEntriesCloud(userId),
        getUserSettingsCloud(userId),
      ]);

      if (cloudHabits.length > 0) {
        useHabitStore.setState({ habits: cloudHabits });
      }
      if (cloudHealth.length > 0) {
        useHealthStore.setState({ entries: cloudHealth });
      }
      if (cloudMood.length > 0) {
        useMoodStore.setState({ entries: cloudMood });
      }
      if (cloudTransactions.length > 0 || cloudBudgets.length > 0 || cloudSavings.length > 0) {
        useFinanceStore.setState({
          transactions: cloudTransactions.length > 0 ? cloudTransactions : useFinanceStore.getState().transactions,
          budgets: cloudBudgets.length > 0 ? cloudBudgets : useFinanceStore.getState().budgets,
          savingsGoals: cloudSavings.length > 0 ? cloudSavings : useFinanceStore.getState().savingsGoals,
        });
      }
      if (cloudJournal.length > 0) {
        useJournalStore.setState({ entries: cloudJournal });
      }
      if (cloudSettings) {
        useSettingsStore.setState({ settings: cloudSettings });
      }

      setSyncState({
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
        isCloudConfigured: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to pull data from Firestore";
      setSyncState((prev) => ({ ...prev, isSyncing: false, error: message }));
    }
  }, [userId]);

  return {
    ...syncState,
    pushToCloud,
    pullFromCloud,
  };
}
