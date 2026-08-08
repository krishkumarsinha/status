import { repositoryFactory } from "@/lib/repositories/factory";
import {
  Habit,
  HealthEntry,
  MoodEntry,
  Transaction,
  Budget,
  SavingsGoal,
  JournalEntry,
  UserSettings,
} from "@/types";

export const DEFAULT_USER_ID = "demo_user";

/**
 * Lazy Server-Side Data Fetcher for Habits
 */
export async function getHabitsServer(userId: string = DEFAULT_USER_ID): Promise<Habit[]> {
  try {
    const repo = repositoryFactory.getHabitRepository();
    return await repo.getAll(userId);
  } catch (error) {
    console.error("[Server Fetcher] Error fetching habits:", error);
    return [];
  }
}

/**
 * Lazy Server-Side Data Fetcher for Health Entries
 */
export async function getHealthEntriesServer(userId: string = DEFAULT_USER_ID): Promise<HealthEntry[]> {
  try {
    const repo = repositoryFactory.getHealthRepository();
    return await repo.getAll(userId);
  } catch (error) {
    console.error("[Server Fetcher] Error fetching health entries:", error);
    return [];
  }
}

/**
 * Lazy Server-Side Data Fetcher for Mood Logs
 */
export async function getMoodEntriesServer(userId: string = DEFAULT_USER_ID): Promise<MoodEntry[]> {
  try {
    const repo = repositoryFactory.getMoodRepository();
    return await repo.getAll(userId);
  } catch (error) {
    console.error("[Server Fetcher] Error fetching mood entries:", error);
    return [];
  }
}

/**
 * Lazy Server-Side Data Fetcher for Finance Transactions, Budgets, and Savings Goals
 */
export async function getFinanceDataServer(userId: string = DEFAULT_USER_ID): Promise<{
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}> {
  try {
    const repo = repositoryFactory.getFinanceRepository();
    const [transactions, budgets, savingsGoals] = await Promise.all([
      repo.getTransactions(userId),
      repo.getBudgets(userId),
      repo.getSavingsGoals(userId),
    ]);
    return { transactions, budgets, savingsGoals };
  } catch (error) {
    console.error("[Server Fetcher] Error fetching finance data:", error);
    return { transactions: [], budgets: [], savingsGoals: [] };
  }
}

/**
 * Lazy Server-Side Data Fetcher for Journal Entries
 */
export async function getJournalEntriesServer(userId: string = DEFAULT_USER_ID): Promise<JournalEntry[]> {
  try {
    const repo = repositoryFactory.getJournalRepository();
    return await repo.getAll(userId);
  } catch (error) {
    console.error("[Server Fetcher] Error fetching journal entries:", error);
    return [];
  }
}

/**
 * Lazy Server-Side Data Fetcher for User Settings
 */
export async function getUserSettingsServer(userId: string = DEFAULT_USER_ID): Promise<UserSettings | null> {
  try {
    const repo = repositoryFactory.getSettingsRepository();
    return await repo.get(userId);
  } catch (error) {
    console.error("[Server Fetcher] Error fetching user settings:", error);
    return null;
  }
}
