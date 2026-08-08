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
  getHabitsCloud,
  saveHabitCloud,
  deleteHabitCloud,
  getHealthEntriesCloud,
  saveHealthEntryCloud,
  deleteHealthEntryCloud,
  getMoodEntriesCloud,
  saveMoodEntryCloud,
  deleteMoodEntryCloud,
  getTransactionsCloud,
  saveTransactionCloud,
  deleteTransactionCloud,
  getBudgetsCloud,
  saveBudgetsCloud,
  getSavingsGoalsCloud,
  saveSavingsGoalCloud,
  deleteSavingsGoalCloud,
  getJournalEntriesCloud,
  saveJournalEntryCloud,
  deleteJournalEntryCloud,
  getUserSettingsCloud,
  saveUserSettingsCloud,
  getUserProfileCloud,
  saveUserProfileCloud,
} from "@/lib/firebase/firestore-service";
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

export class FirestoreHabitRepository implements IHabitRepository {
  async getAll(userId: string): Promise<Habit[]> {
    return getHabitsCloud(userId);
  }
  async save(userId: string, habit: Habit): Promise<void> {
    return saveHabitCloud(userId, habit);
  }
  async delete(userId: string, habitId: string): Promise<void> {
    return deleteHabitCloud(userId, habitId);
  }
}

export class FirestoreHealthRepository implements IHealthRepository {
  async getAll(userId: string): Promise<HealthEntry[]> {
    return getHealthEntriesCloud(userId);
  }
  async save(userId: string, entry: HealthEntry): Promise<void> {
    return saveHealthEntryCloud(userId, entry);
  }
  async delete(userId: string, entryId: string): Promise<void> {
    return deleteHealthEntryCloud(userId, entryId);
  }
}

export class FirestoreMoodRepository implements IMoodRepository {
  async getAll(userId: string): Promise<MoodEntry[]> {
    return getMoodEntriesCloud(userId);
  }
  async save(userId: string, entry: MoodEntry): Promise<void> {
    return saveMoodEntryCloud(userId, entry);
  }
  async delete(userId: string, entryId: string): Promise<void> {
    return deleteMoodEntryCloud(userId, entryId);
  }
}

export class FirestoreFinanceRepository implements IFinanceRepository {
  async getTransactions(userId: string): Promise<Transaction[]> {
    return getTransactionsCloud(userId);
  }
  async saveTransaction(userId: string, tx: Transaction): Promise<void> {
    return saveTransactionCloud(userId, tx);
  }
  async deleteTransaction(userId: string, txId: string): Promise<void> {
    return deleteTransactionCloud(userId, txId);
  }
  async getBudgets(userId: string): Promise<Budget[]> {
    return getBudgetsCloud(userId);
  }
  async saveBudgets(userId: string, budgets: Budget[]): Promise<void> {
    return saveBudgetsCloud(userId, budgets);
  }
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return getSavingsGoalsCloud(userId);
  }
  async saveSavingsGoal(userId: string, goal: SavingsGoal): Promise<void> {
    return saveSavingsGoalCloud(userId, goal);
  }
  async deleteSavingsGoal(userId: string, goalId: string): Promise<void> {
    return deleteSavingsGoalCloud(userId, goalId);
  }
}

export class FirestoreJournalRepository implements IJournalRepository {
  async getAll(userId: string): Promise<JournalEntry[]> {
    return getJournalEntriesCloud(userId);
  }
  async save(userId: string, entry: JournalEntry): Promise<void> {
    return saveJournalEntryCloud(userId, entry);
  }
  async delete(userId: string, entryId: string): Promise<void> {
    return deleteJournalEntryCloud(userId, entryId);
  }
}

export class FirestoreSettingsRepository implements ISettingsRepository {
  async get(userId: string): Promise<UserSettings | null> {
    return getUserSettingsCloud(userId);
  }
  async save(userId: string, settings: UserSettings): Promise<void> {
    return saveUserSettingsCloud(userId, settings);
  }
}

export class FirestoreUserProfileRepository implements IUserProfileRepository {
  async get(userId: string): Promise<UserProfile | null> {
    return getUserProfileCloud(userId);
  }
  async save(userId: string, profile: UserProfile): Promise<void> {
    return saveUserProfileCloud(userId, profile);
  }
}
