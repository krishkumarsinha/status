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

// ============================================================================
// SOLID Repository Contracts (Interface Segregation Principle)
// ============================================================================

export interface IHabitRepository {
  getAll(userId: string): Promise<Habit[]>;
  save(userId: string, habit: Habit): Promise<void>;
  delete(userId: string, habitId: string): Promise<void>;
}

export interface IHealthRepository {
  getAll(userId: string): Promise<HealthEntry[]>;
  save(userId: string, entry: HealthEntry): Promise<void>;
  delete(userId: string, entryId: string): Promise<void>;
}

export interface IMoodRepository {
  getAll(userId: string): Promise<MoodEntry[]>;
  save(userId: string, entry: MoodEntry): Promise<void>;
  delete(userId: string, entryId: string): Promise<void>;
}

export interface IFinanceRepository {
  getTransactions(userId: string): Promise<Transaction[]>;
  saveTransaction(userId: string, tx: Transaction): Promise<void>;
  deleteTransaction(userId: string, txId: string): Promise<void>;
  getBudgets(userId: string): Promise<Budget[]>;
  saveBudgets(userId: string, budgets: Budget[]): Promise<void>;
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  saveSavingsGoal(userId: string, goal: SavingsGoal): Promise<void>;
  deleteSavingsGoal(userId: string, goalId: string): Promise<void>;
}

export interface IJournalRepository {
  getAll(userId: string): Promise<JournalEntry[]>;
  save(userId: string, entry: JournalEntry): Promise<void>;
  delete(userId: string, entryId: string): Promise<void>;
}

export interface ISettingsRepository {
  get(userId: string): Promise<UserSettings | null>;
  save(userId: string, settings: UserSettings): Promise<void>;
}

export interface IUserProfileRepository {
  get(userId: string): Promise<UserProfile | null>;
  save(userId: string, profile: UserProfile): Promise<void>;
}

export interface IRepositoryContainer {
  habits: IHabitRepository;
  health: IHealthRepository;
  mood: IMoodRepository;
  finance: IFinanceRepository;
  journal: IJournalRepository;
  settings: ISettingsRepository;
  userProfile: IUserProfileRepository;
}
