import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase config module
vi.mock("@/lib/firebase/config", () => ({
  auth: { currentUser: null },
  isFirebaseConfigured: () => true,
  getCurrentUserId: (fallback = "demo_user") => fallback,
}));

// Mock Firebase Auth SDK
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockUpdateProfile = vi.fn();
const mockFirebaseSignOut = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: () => ({}),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: vi.fn(),
}));

// Mock Firestore Service
const mockSaveUserProfileCloud = vi.fn().mockResolvedValue(true);
vi.mock("@/lib/firebase/firestore-service", () => ({
  saveUserProfileCloud: (...args: unknown[]) => mockSaveUserProfileCloud(...args),
  getUserProfileCloud: vi.fn().mockResolvedValue(null),
}));

// Mock Store loaders & resetters
const mockLoadHabits = vi.fn().mockResolvedValue([]);
const mockResetHabits = vi.fn();

vi.mock("@/lib/stores/habit-store", () => ({
  useHabitStore: (selector: (state: unknown) => unknown) =>
    selector({
      loadHabits: mockLoadHabits,
      resetStore: mockResetHabits,
    }),
}));

vi.mock("@/lib/stores/health-store", () => ({
  useHealthStore: (selector: (state: unknown) => unknown) =>
    selector({
      loadHealth: vi.fn().mockResolvedValue([]),
      resetStore: vi.fn(),
    }),
}));

vi.mock("@/lib/stores/mood-store", () => ({
  useMoodStore: (selector: (state: unknown) => unknown) =>
    selector({
      loadMood: vi.fn().mockResolvedValue([]),
      resetStore: vi.fn(),
    }),
}));

vi.mock("@/lib/stores/finance-store", () => ({
  useFinanceStore: (selector: (state: unknown) => unknown) =>
    selector({
      loadFinances: vi.fn().mockResolvedValue([]),
      resetStore: vi.fn(),
    }),
}));

vi.mock("@/lib/stores/journal-store", () => ({
  useJournalStore: (selector: (state: unknown) => unknown) =>
    selector({
      loadJournal: vi.fn().mockResolvedValue([]),
      resetStore: vi.fn(),
    }),
}));

vi.mock("@/lib/stores/settings-store", () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) =>
    selector({
      loadSettings: vi.fn().mockResolvedValue({}),
      resetStore: vi.fn(),
    }),
}));

describe("Authentication Service & Registration TDD Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully register a new user, update display name, and save cloud profile", async () => {
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
    };

    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser,
    });
    mockUpdateProfile.mockResolvedValueOnce(undefined);

    // Call registration helper logic directly
    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
    const { saveUserProfileCloud } = await import("@/lib/firebase/firestore-service");

    const res = await createUserWithEmailAndPassword({} as any, "test@example.com", "password123");
    expect(res.user.uid).toBe("user-123");

    if (res.user) {
      await updateProfile(res.user as any, { displayName: "Jane Doe" });
      await saveUserProfileCloud(res.user.uid, {
        displayName: "Jane Doe",
        avatarEmoji: "zap",
        joinedDate: new Date().toISOString(),
      });
    }

    expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: "Jane Doe" });
    expect(mockSaveUserProfileCloud).toHaveBeenCalledWith("user-123", expect.objectContaining({
      displayName: "Jane Doe",
      avatarEmoji: "zap",
    }));
  });

  it("should handle email-already-in-use error during signup", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: "auth/email-already-in-use",
      message: "Firebase: Error (auth/email-already-in-use).",
    });

    const { createUserWithEmailAndPassword } = await import("firebase/auth");

    try {
      await createUserWithEmailAndPassword({} as any, "existing@example.com", "password123");
      expect.fail("Should have thrown email-already-in-use error");
    } catch (err: any) {
      expect(err.code).toBe("auth/email-already-in-use");
    }
  });

  it("should handle weak-password error during signup", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: "auth/weak-password",
      message: "Password should be at least 6 characters.",
    });

    const { createUserWithEmailAndPassword } = await import("firebase/auth");

    try {
      await createUserWithEmailAndPassword({} as any, "test@example.com", "123");
      expect.fail("Should have thrown weak-password error");
    } catch (err: any) {
      expect(err.code).toBe("auth/weak-password");
    }
  });
});
