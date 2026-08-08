import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured, ensureFirebaseAuth, getCurrentUserId } from "./config";
import {
  FIRESTORE_COLLECTIONS,
  CloudHabit,
  CloudHealthEntry,
  CloudMoodEntry,
  CloudTransaction,
  CloudBudget,
  CloudSavingsGoal,
  CloudJournalEntry,
  CloudUserSettings,
  CloudUserProfile,
  UserFullCloudSnapshot,
} from "@/types/firestore";
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
// Generic Firestore Typed Converter Helper
// ============================================================================

export function sanitizeForFirestore<T>(data: T): DocumentData {
  if (data === undefined) return {};
  if (data === null || typeof data !== "object") return data as DocumentData;

  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as unknown as DocumentData;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as DocumentData;
}

function createConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T): DocumentData => {
      return sanitizeForFirestore(data);
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => {
      return snapshot.data() as T;
    },
  };
}

// ============================================================================
// Error Handler Helper
// ============================================================================

function handleFirestoreError(action: string, error: unknown): void {
  const err = error as { code?: string; message?: string };
  if (err?.code === "permission-denied") {
    console.warn(
      `[Firestore Permission Denied] ${action}. Ensure Firestore rules in Firebase Console permit access or user is authenticated. See firestore.rules.`
    );
  } else {
    console.error(`[Firestore Error] ${action}:`, error);
  }
}

function resolveUserId(userId?: string): string {
  if (userId && userId !== "demo_user") return userId;
  return getCurrentUserId("demo_user");
}

export function getSubCollectionRef<T extends DocumentData>(
  userId: string,
  subCollectionName: string
) {
  const targetUid = resolveUserId(userId);
  return collection(
    db,
    FIRESTORE_COLLECTIONS.USERS,
    targetUid,
    subCollectionName
  ).withConverter(createConverter<T>());
}

// ============================================================================
// 1. User Profile Service
// ============================================================================

export async function getUserProfileCloud(userId: string): Promise<CloudUserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid).withConverter(createConverter<CloudUserProfile>());
    const snap = await getDoc(userDocRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError("getUserProfileCloud", error);
    return null;
  }
}

export async function saveUserProfileCloud(userId: string, profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid).withConverter(createConverter<CloudUserProfile>());
    const now = new Date().toISOString();
    const cloudData: CloudUserProfile = {
      ...profile,
      userId: targetUid,
      createdAt: profile.joinedDate || now,
      updatedAt: now,
    };
    await setDoc(userDocRef, cloudData, { merge: true });
  } catch (error) {
    handleFirestoreError("saveUserProfileCloud", error);
  }
}

// ============================================================================
// 2. Habit Cloud API
// ============================================================================

export async function getHabitsCloud(userId: string): Promise<Habit[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudHabit>(userId, FIRESTORE_COLLECTIONS.HABITS);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getHabitsCloud", error);
    return [];
  }
}

export async function saveHabitCloud(userId: string, habit: Habit): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.HABITS, habit.id).withConverter(createConverter<CloudHabit>());
    const now = new Date().toISOString();
    const cloudHabit: CloudHabit = {
      ...habit,
      userId: targetUid,
      createdAt: habit.createdAt || now,
      updatedAt: now,
    };
    await setDoc(docRef, cloudHabit, { merge: true });
  } catch (error) {
    handleFirestoreError("saveHabitCloud", error);
  }
}

export async function deleteHabitCloud(userId: string, habitId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.HABITS, habitId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError("deleteHabitCloud", error);
  }
}

// ============================================================================
// 3. Health Entries Cloud API
// ============================================================================

export async function getHealthEntriesCloud(userId: string): Promise<HealthEntry[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudHealthEntry>(userId, FIRESTORE_COLLECTIONS.HEALTH_ENTRIES);
    const q = query(colRef, orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getHealthEntriesCloud", error);
    return [];
  }
}

export async function saveHealthEntryCloud(userId: string, entry: HealthEntry): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.HEALTH_ENTRIES, entry.id).withConverter(createConverter<CloudHealthEntry>());
    const now = new Date().toISOString();
    const cloudEntry: CloudHealthEntry = {
      ...entry,
      userId: targetUid,
      createdAt: entry.date,
      updatedAt: now,
    };
    await setDoc(docRef, cloudEntry, { merge: true });
  } catch (error) {
    handleFirestoreError("saveHealthEntryCloud", error);
  }
}

export async function deleteHealthEntryCloud(userId: string, entryId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.HEALTH_ENTRIES, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError("deleteHealthEntryCloud", error);
  }
}

// ============================================================================
// 4. Mood Entries Cloud API
// ============================================================================

export async function getMoodEntriesCloud(userId: string): Promise<MoodEntry[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudMoodEntry>(userId, FIRESTORE_COLLECTIONS.MOOD_ENTRIES);
    const q = query(colRef, orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getMoodEntriesCloud", error);
    return [];
  }
}

export async function saveMoodEntryCloud(userId: string, entry: MoodEntry): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.MOOD_ENTRIES, entry.id).withConverter(createConverter<CloudMoodEntry>());
    const now = new Date().toISOString();
    const cloudEntry: CloudMoodEntry = {
      ...entry,
      userId: targetUid,
      createdAt: entry.date,
      updatedAt: now,
    };
    await setDoc(docRef, cloudEntry, { merge: true });
  } catch (error) {
    handleFirestoreError("saveMoodEntryCloud", error);
  }
}

export async function deleteMoodEntryCloud(userId: string, entryId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.MOOD_ENTRIES, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError("deleteMoodEntryCloud", error);
  }
}

// ============================================================================
// 5. Financial Transactions, Budgets & Savings API
// ============================================================================

export async function getTransactionsCloud(userId: string): Promise<Transaction[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudTransaction>(userId, FIRESTORE_COLLECTIONS.TRANSACTIONS);
    const q = query(colRef, orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getTransactionsCloud", error);
    return [];
  }
}

export async function saveTransactionCloud(userId: string, tx: Transaction): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.TRANSACTIONS, tx.id).withConverter(createConverter<CloudTransaction>());
    const now = new Date().toISOString();
    const cloudTx: CloudTransaction = {
      ...tx,
      userId: targetUid,
      createdAt: tx.date,
      updatedAt: now,
    };
    await setDoc(docRef, cloudTx, { merge: true });
  } catch (error) {
    handleFirestoreError("saveTransactionCloud", error);
  }
}

export async function deleteTransactionCloud(userId: string, txId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.TRANSACTIONS, txId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError("deleteTransactionCloud", error);
  }
}

export async function getBudgetsCloud(userId: string): Promise<Budget[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudBudget>(userId, FIRESTORE_COLLECTIONS.BUDGETS);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getBudgetsCloud", error);
    return [];
  }
}

export async function saveBudgetsCloud(userId: string, budgets: Budget[]): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    budgets.forEach((budget) => {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.BUDGETS, budget.category).withConverter(createConverter<CloudBudget>());
      batch.set(docRef, { ...budget, userId: targetUid, createdAt: now, updatedAt: now }, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError("saveBudgetsCloud", error);
  }
}

export async function getSavingsGoalsCloud(userId: string): Promise<SavingsGoal[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudSavingsGoal>(userId, FIRESTORE_COLLECTIONS.SAVINGS_GOALS);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getSavingsGoalsCloud", error);
    return [];
  }
}

export async function saveSavingsGoalCloud(userId: string, goal: SavingsGoal): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.SAVINGS_GOALS, goal.id).withConverter(createConverter<CloudSavingsGoal>());
    const now = new Date().toISOString();
    const cloudGoal: CloudSavingsGoal = {
      ...goal,
      userId: targetUid,
      createdAt: goal.createdAt || now,
      updatedAt: now,
    };
    await setDoc(docRef, cloudGoal, { merge: true });
  } catch (error) {
    handleFirestoreError("saveSavingsGoalCloud", error);
  }
}

export async function deleteSavingsGoalCloud(userId: string, goalId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.SAVINGS_GOALS, goalId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError("deleteSavingsGoalCloud", error);
  }
}

// ============================================================================
// 6. Journal API
// ============================================================================

export async function getJournalEntriesCloud(userId: string): Promise<JournalEntry[]> {
  if (!isFirebaseConfigured()) return [];
  await ensureFirebaseAuth();
  try {
    const colRef = getSubCollectionRef<CloudJournalEntry>(userId, FIRESTORE_COLLECTIONS.JOURNAL_ENTRIES);
    const q = query(colRef, orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError("getJournalEntriesCloud", error);
    return [];
  }
}

export async function saveJournalEntryCloud(userId: string, entry: JournalEntry): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.JOURNAL_ENTRIES, entry.id).withConverter(createConverter<CloudJournalEntry>());
    const now = new Date().toISOString();
    const cloudEntry: CloudJournalEntry = {
      ...entry,
      userId: targetUid,
      createdAt: entry.createdAt || now,
      updatedAt: entry.updatedAt || now,
    };
    await setDoc(docRef, cloudEntry, { merge: true });
  } catch (error) {
    handleFirestoreError("saveJournalEntryCloud", error);
  }
}

export async function deleteJournalEntryCloud(userId: string, entryId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.JOURNAL_ENTRIES, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError("deleteJournalEntryCloud", error);
  }
}

// ============================================================================
// 7. Settings API
// ============================================================================

export async function getUserSettingsCloud(userId: string): Promise<UserSettings | null> {
  if (!isFirebaseConfigured()) return null;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.USER_SETTINGS, "preferences").withConverter(createConverter<CloudUserSettings>());
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError("getUserSettingsCloud", error);
    return null;
  }
}

export async function saveUserSettingsCloud(userId: string, settings: UserSettings): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, targetUid, FIRESTORE_COLLECTIONS.USER_SETTINGS, "preferences").withConverter(createConverter<CloudUserSettings>());
    const now = new Date().toISOString();
    const cloudSettings: CloudUserSettings = {
      ...settings,
      userId: targetUid,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(docRef, cloudSettings, { merge: true });
  } catch (error) {
    handleFirestoreError("saveUserSettingsCloud", error);
  }
}

// ============================================================================
// 8. Full User Cloud Backup & Sync Routine
// ============================================================================

export async function pullCloudSnapshot(userId: string): Promise<UserFullCloudSnapshot | null> {
  if (!isFirebaseConfigured()) return null;
  await ensureFirebaseAuth();
  const targetUid = resolveUserId(userId);

  try {
    const [
      profile,
      settings,
      habits,
      healthEntries,
      moodEntries,
      transactions,
      budgets,
      savingsGoals,
      journalEntries,
    ] = await Promise.all([
      getUserProfileCloud(targetUid),
      getUserSettingsCloud(targetUid),
      getHabitsCloud(targetUid),
      getHealthEntriesCloud(targetUid),
      getMoodEntriesCloud(targetUid),
      getTransactionsCloud(targetUid),
      getBudgetsCloud(targetUid),
      getSavingsGoalsCloud(targetUid),
      getJournalEntriesCloud(targetUid),
    ]);

    const now = new Date().toISOString();

    return {
      profile: profile || undefined,
      settings: settings
        ? { ...settings, userId: targetUid, createdAt: now, updatedAt: now }
        : undefined,
      habits: habits.map((h) => ({ ...h, userId: targetUid, createdAt: h.createdAt || now, updatedAt: now })),
      healthEntries: healthEntries.map((e) => ({ ...e, userId: targetUid, createdAt: e.date, updatedAt: now })),
      moodEntries: moodEntries.map((m) => ({ ...m, userId: targetUid, createdAt: m.date, updatedAt: now })),
      transactions: transactions.map((t) => ({ ...t, userId: targetUid, createdAt: t.date, updatedAt: now })),
      budgets: budgets.map((b) => ({ ...b, userId: targetUid, createdAt: now, updatedAt: now })),
      savingsGoals: savingsGoals.map((s) => ({ ...s, userId: targetUid, createdAt: s.createdAt || now, updatedAt: now })),
      journalEntries: journalEntries.map((j) => ({ ...j, userId: targetUid, createdAt: j.createdAt || now, updatedAt: now })),
      exportedAt: now,
    };
  } catch (error) {
    handleFirestoreError("pullCloudSnapshot", error);
    return null;
  }
}
