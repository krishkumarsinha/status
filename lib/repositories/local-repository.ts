import {
  IHabitRepository,
  IHealthRepository,
  IMoodRepository,
  IFinanceRepository,
  IJournalRepository,
  ISettingsRepository,
  IUserProfileRepository,
} from "./interfaces";
import {
  Habit,
  HealthEntry,
  MoodEntry,
  Transaction,
  Budget,
  SavingsGoal,
  JournalEntry,
  UserSettings,
  UserProfile,
} from "@/types";

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore local storage quota / browser restrictions
  }
}

export class LocalHabitRepository implements IHabitRepository {
  async getAll(): Promise<Habit[]> {
    return getLocal<Habit[]>("habit-storage-items", []);
  }
  async save(_userId: string, habit: Habit): Promise<void> {
    const habits = await this.getAll();
    const idx = habits.findIndex((h) => h.id === habit.id);
    if (idx >= 0) {
      habits[idx] = habit;
    } else {
      habits.push(habit);
    }
    setLocal("habit-storage-items", habits);
  }
  async delete(_userId: string, habitId: string): Promise<void> {
    const habits = await this.getAll();
    setLocal(
      "habit-storage-items",
      habits.filter((h) => h.id !== habitId)
    );
  }
}

export class LocalHealthRepository implements IHealthRepository {
  async getAll(): Promise<HealthEntry[]> {
    return getLocal<HealthEntry[]>("health-storage-items", []);
  }
  async save(_userId: string, entry: HealthEntry): Promise<void> {
    const entries = await this.getAll();
    const idx = entries.findIndex((e) => e.id === entry.id || e.date === entry.date);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    setLocal("health-storage-items", entries);
  }
  async delete(_userId: string, entryId: string): Promise<void> {
    const entries = await this.getAll();
    setLocal(
      "health-storage-items",
      entries.filter((e) => e.id !== entryId)
    );
  }
}

export class LocalMoodRepository implements IMoodRepository {
  async getAll(): Promise<MoodEntry[]> {
    return getLocal<MoodEntry[]>("mood-storage-items", []);
  }
  async save(_userId: string, entry: MoodEntry): Promise<void> {
    const entries = await this.getAll();
    const idx = entries.findIndex((e) => e.id === entry.id || e.date === entry.date);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    setLocal("mood-storage-items", entries);
  }
  async delete(_userId: string, entryId: string): Promise<void> {
    const entries = await this.getAll();
    setLocal(
      "mood-storage-items",
      entries.filter((e) => e.id !== entryId)
    );
  }
}

export class LocalFinanceRepository implements IFinanceRepository {
  async getTransactions(): Promise<Transaction[]> {
    return getLocal<Transaction[]>("finance-transactions-items", []);
  }
  async saveTransaction(_userId: string, tx: Transaction): Promise<void> {
    const txs = await this.getTransactions();
    const idx = txs.findIndex((t) => t.id === tx.id);
    if (idx >= 0) {
      txs[idx] = tx;
    } else {
      txs.unshift(tx);
    }
    setLocal("finance-transactions-items", txs);
  }
  async deleteTransaction(_userId: string, txId: string): Promise<void> {
    const txs = await this.getTransactions();
    setLocal(
      "finance-transactions-items",
      txs.filter((t) => t.id !== txId)
    );
  }
  async getBudgets(): Promise<Budget[]> {
    return getLocal<Budget[]>("finance-budgets-items", []);
  }
  async saveBudgets(_userId: string, budgets: Budget[]): Promise<void> {
    setLocal("finance-budgets-items", budgets);
  }
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return getLocal<SavingsGoal[]>("finance-savings-items", []);
  }
  async saveSavingsGoal(_userId: string, goal: SavingsGoal): Promise<void> {
    const goals = await this.getSavingsGoals();
    const idx = goals.findIndex((g) => g.id === goal.id);
    if (idx >= 0) {
      goals[idx] = goal;
    } else {
      goals.push(goal);
    }
    setLocal("finance-savings-items", goals);
  }
  async deleteSavingsGoal(_userId: string, goalId: string): Promise<void> {
    const goals = await this.getSavingsGoals();
    setLocal(
      "finance-savings-items",
      goals.filter((g) => g.id !== goalId)
    );
  }
}

export class LocalJournalRepository implements IJournalRepository {
  async getAll(): Promise<JournalEntry[]> {
    return getLocal<JournalEntry[]>("journal-storage-items", []);
  }
  async save(_userId: string, entry: JournalEntry): Promise<void> {
    const entries = await this.getAll();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.unshift(entry);
    }
    setLocal("journal-storage-items", entries);
  }
  async delete(_userId: string, entryId: string): Promise<void> {
    const entries = await this.getAll();
    setLocal(
      "journal-storage-items",
      entries.filter((e) => e.id !== entryId)
    );
  }
}

export class LocalSettingsRepository implements ISettingsRepository {
  async get(): Promise<UserSettings | null> {
    return getLocal<UserSettings | null>("settings-storage-items", null);
  }
  async save(_userId: string, settings: UserSettings): Promise<void> {
    setLocal("settings-storage-items", settings);
  }
}

export class LocalUserProfileRepository implements IUserProfileRepository {
  async get(): Promise<UserProfile | null> {
    return getLocal<UserProfile | null>("user-profile-items", null);
  }
  async save(_userId: string, profile: UserProfile): Promise<void> {
    setLocal("user-profile-items", profile);
  }
}
