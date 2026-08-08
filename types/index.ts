// ============================================================================
// Habit Types
// ============================================================================

export interface HabitCompletion {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
}

export type HabitCategory = "health" | "productivity" | "learning" | "fitness" | "mindfulness" | "social" | "other";

export type HabitFrequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  createdAt: string; // ISO date string
  completions: HabitCompletion[];
  color?: string; // optional accent color
  icon?: string; // optional icon name from lucide
}

// ============================================================================
// Health Types
// ============================================================================

export interface Workout {
  type: string;
  durationMinutes: number;
}

export interface HealthEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  weight?: number; // in kg (stored always in metric, converted on display)
  sleepHours?: number;
  waterIntake?: number; // in ml
  steps?: number;
  workout?: Workout;
}

// ============================================================================
// Mood & Emotion Types
// ============================================================================

export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface TimeSlot {
  id: string; // e.g. "06:00-09:00"
  label: string;
  shortLabel: string;
  startHour: number;
  endHour: number;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "06:00-09:00", label: "Early Morning (6 AM - 9 AM)", shortLabel: "6-9 AM", startHour: 6, endHour: 9 },
  { id: "09:00-12:00", label: "Late Morning (9 AM - 12 PM)", shortLabel: "9-12 PM", startHour: 9, endHour: 12 },
  { id: "12:00-15:00", label: "Early Afternoon (12 PM - 3 PM)", shortLabel: "12-3 PM", startHour: 12, endHour: 15 },
  { id: "15:00-18:00", label: "Late Afternoon (3 PM - 6 PM)", shortLabel: "3-6 PM", startHour: 15, endHour: 18 },
  { id: "18:00-21:00", label: "Evening (6 PM - 9 PM)", shortLabel: "6-9 PM", startHour: 18, endHour: 21 },
  { id: "21:00-00:00", label: "Night (9 PM - 12 AM)", shortLabel: "9-12 AM", startHour: 21, endHour: 24 },
  { id: "00:00-03:00", label: "Late Night (12 AM - 3 AM)", shortLabel: "12-3 AM", startHour: 0, endHour: 3 },
  { id: "03:00-06:00", label: "Dawn (3 AM - 6 AM)", shortLabel: "3-6 AM", startHour: 3, endHour: 6 },
];

export interface SpecificEmotion {
  id: string;
  name: string;
  emoji: string;
  category: "positive" | "peaceful" | "high-energy" | "anxious" | "low" | "angry";
}

export const SPECIFIC_EMOTIONS: SpecificEmotion[] = [
  // Positive / Joyful
  { id: "happy", name: "Happy", emoji: "😊", category: "positive" },
  { id: "grateful", name: "Grateful", emoji: "🙏", category: "positive" },
  { id: "excited", name: "Excited", emoji: "🎉", category: "positive" },
  { id: "proud", name: "Proud", emoji: "🦁", category: "positive" },
  { id: "loved", name: "Loved", emoji: "🥰", category: "positive" },

  // Peaceful / Calm
  { id: "calm", name: "Calm", emoji: "😌", category: "peaceful" },
  { id: "relaxed", name: "Relaxed", emoji: "🌿", category: "peaceful" },
  { id: "content", name: "Content", emoji: "🙂", category: "peaceful" },
  { id: "mindful", name: "Mindful", emoji: "🧘", category: "peaceful" },

  // Focused / Productive / High Energy
  { id: "focused", name: "Focused", emoji: "🎯", category: "high-energy" },
  { id: "energetic", name: "Energetic", emoji: "⚡", category: "high-energy" },
  { id: "motivated", name: "Motivated", emoji: "🚀", category: "high-energy" },
  { id: "creative", name: "Creative", emoji: "💡", category: "high-energy" },

  // Anxious / Stressed
  { id: "anxious", name: "Anxious", emoji: "😰", category: "anxious" },
  { id: "stressed", name: "Stressed", emoji: "😫", category: "anxious" },
  { id: "overwhelmed", name: "Overwhelmed", emoji: "🤯", category: "anxious" },
  { id: "restless", name: "Restless", emoji: "🫨", category: "anxious" },

  // Low / Sad / Exhausted
  { id: "sad", name: "Sad", emoji: "😢", category: "low" },
  { id: "tired", name: "Tired / Exhausted", emoji: "😴", category: "low" },
  { id: "lonely", name: "Lonely", emoji: "🥺", category: "low" },
  { id: "bored", name: "Bored", emoji: "🥱", category: "low" },
  { id: "numb", name: "Numb", emoji: "🫥", category: "low" },

  // Angry / Frustrated
  { id: "frustrated", name: "Frustrated", emoji: "😤", category: "angry" },
  { id: "annoyed", name: "Annoyed", emoji: "😒", category: "angry" },
  { id: "angry", name: "Angry", emoji: "😡", category: "angry" },
];

export const MOOD_TAGS = [
  "stressed",
  "grateful",
  "tired",
  "focused",
  "anxious",
  "motivated",
  "calm",
  "creative",
  "social",
  "lonely",
  "energetic",
  "productive",
] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];

export const MOOD_EMOJIS: Record<MoodScore, { emoji: string; label: string }> = {
  1: { emoji: "😢", label: "Terrible" },
  2: { emoji: "😔", label: "Bad" },
  3: { emoji: "😐", label: "Okay" },
  4: { emoji: "😊", label: "Good" },
  5: { emoji: "🤩", label: "Amazing" },
};

export interface SlotMoodLog {
  slotId: string; // e.g. "09:00-12:00"
  moodScore: MoodScore;
  primaryEmotionId: string;
  secondaryEmotionIds?: string[];
  energyLevel: EnergyLevel;
  note?: string;
  loggedAt: string;
}

export interface MoodEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  moodScore: MoodScore;
  energyLevel: EnergyLevel;
  tags: MoodTag[];
  note?: string;
  slotLogs?: SlotMoodLog[];
}

// ============================================================================
// Settings Types
// ============================================================================

export type UnitSystem = "metric" | "imperial";
export type WeekStartDay = "monday" | "sunday";
export type Currency = "INR" | "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

export interface ReminderPreferences {
  habitsReminder: boolean;
  habitsReminderTime: string; // HH:mm
  healthReminder: boolean;
  healthReminderTime: string;
  moodReminder: boolean;
  moodReminderTime: string;
}

export interface UserSettings {
  unitSystem: UnitSystem;
  weekStartDay: WeekStartDay;
  dailyWaterGoal: number; // in ml
  dailyStepsGoal: number;
  targetSleepHours: number;
  currency: Currency;
  monthlyBudget: number; // total monthly budget target
  reminders: ReminderPreferences;
}

// ============================================================================
// Finance Types
// ============================================================================

export type TransactionType = "income" | "expense";

export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "housing",
  "entertainment",
  "shopping",
  "health",
  "education",
  "bills",
  "subscriptions",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "gift",
  "refund",
  "other",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export const CATEGORY_EMOJIS: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  housing: "🏠",
  entertainment: "🎬",
  shopping: "🛍️",
  health: "💊",
  education: "📚",
  bills: "📄",
  subscriptions: "📱",
  salary: "💼",
  freelance: "💻",
  investment: "📈",
  gift: "🎁",
  refund: "↩️",
  other: "📦",
};

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  isRecurring?: boolean;
}

export interface Budget {
  category: ExpenseCategory;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category?: string;
  targetDate?: string; // YYYY-MM-DD
  icon?: string;
  createdAt: string;
}

// ============================================================================
// Journal Types
// ============================================================================

export const JOURNAL_TAGS = [
  "personal",
  "work",
  "travel",
  "gratitude",
  "reflection",
  "goals",
  "ideas",
  "memories",
  "learning",
  "creative",
] as const;

export type JournalTag = (typeof JOURNAL_TAGS)[number];

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  mood?: MoodScore;
  tags: JournalTag[];
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Account Types
// ============================================================================

export interface UserProfile {
  displayName: string;
  avatarEmoji: string;
  joinedDate: string; // ISO date
}

// ============================================================================
// Utility Types
// ============================================================================

export type DateRange = "7d" | "14d" | "30d" | "90d" | "365d";

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

