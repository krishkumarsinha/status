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
} from "./index";

// ============================================================================
// Firestore Collection Constants
// ============================================================================

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  HABITS: "habits",
  HEALTH_ENTRIES: "health_entries",
  MOOD_ENTRIES: "mood_entries",
  TRANSACTIONS: "transactions",
  BUDGETS: "budgets",
  SAVINGS_GOALS: "savings_goals",
  JOURNAL_ENTRIES: "journal_entries",
  USER_SETTINGS: "settings",
} as const;

export type FirestoreCollection =
  (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS];

// ============================================================================
// Common Cloud Envelope
// ============================================================================

export interface CloudDocumentMeta {
  userId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// Cloud Data Schemas
// ============================================================================

/**
 * User Profile Document Schema (`users/{userId}`)
 */
export interface CloudUserProfile extends CloudDocumentMeta {
  displayName: string;
  email?: string;
  avatarEmoji: string;
  joinedDate: string;
}

/**
 * Habit Cloud Document Schema (`users/{userId}/habits/{habitId}` or `habits/{habitId}`)
 */
export interface CloudHabit extends Habit, CloudDocumentMeta {}

/**
 * Health Entry Cloud Document Schema (`users/{userId}/health_entries/{date}`)
 */
export interface CloudHealthEntry extends HealthEntry, CloudDocumentMeta {}

/**
 * Mood Entry Cloud Document Schema (`users/{userId}/mood_entries/{date}`)
 */
export interface CloudMoodEntry extends MoodEntry, CloudDocumentMeta {}

/**
 * Financial Transaction Cloud Document Schema (`users/{userId}/transactions/{txId}`)
 */
export interface CloudTransaction extends Transaction, CloudDocumentMeta {}

/**
 * Finance Budget Document Schema (`users/{userId}/budgets/{category}`)
 */
export interface CloudBudget extends Budget, CloudDocumentMeta {}

/**
 * Savings Goal Cloud Document Schema (`users/{userId}/savings_goals/{goalId}`)
 */
export interface CloudSavingsGoal extends SavingsGoal, CloudDocumentMeta {}

/**
 * Journal Entry Cloud Document Schema (`users/{userId}/journal_entries/{entryId}`)
 */
export interface CloudJournalEntry extends JournalEntry, CloudDocumentMeta {}

/**
 * User Settings Cloud Document Schema (`users/{userId}/settings/preferences`)
 */
export interface CloudUserSettings extends UserSettings, CloudDocumentMeta {}

// ============================================================================
// Batch User Data Package for Backup & Full Sync
// ============================================================================

export interface UserFullCloudSnapshot {
  profile?: CloudUserProfile;
  settings?: CloudUserSettings;
  habits: CloudHabit[];
  healthEntries: CloudHealthEntry[];
  moodEntries: CloudMoodEntry[];
  transactions: CloudTransaction[];
  budgets: CloudBudget[];
  savingsGoals: CloudSavingsGoal[];
  journalEntries: CloudJournalEntry[];
  exportedAt: string;
}
