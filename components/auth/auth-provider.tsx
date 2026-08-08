"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { saveUserProfileCloud, getUserProfileCloud } from "@/lib/firebase/firestore-service";
import { useHabitStore } from "@/lib/stores/habit-store";
import { useHealthStore } from "@/lib/stores/health-store";
import { useMoodStore } from "@/lib/stores/mood-store";
import { useFinanceStore } from "@/lib/stores/finance-store";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirebaseActive: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOutUser: () => Promise<void>;
  reloadAllStores: (uid?: string) => Promise<void>;
  clearAllStores: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isFirebaseActive: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInAnonymously: async () => {},
  signOutUser: async () => {},
  reloadAllStores: async () => {},
  clearAllStores: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFirebaseActive = isFirebaseConfigured();

  const loadHabits = useHabitStore((state) => state.loadHabits);
  const resetHabits = useHabitStore((state) => state.resetStore);

  const loadHealth = useHealthStore((state) => state.loadHealth);
  const resetHealth = useHealthStore((state) => state.resetStore);

  const loadMood = useMoodStore((state) => state.loadMood);
  const resetMood = useMoodStore((state) => state.resetStore);

  const loadFinances = useFinanceStore((state) => state.loadFinances);
  const resetFinances = useFinanceStore((state) => state.resetStore);

  const loadJournal = useJournalStore((state) => state.loadJournal);
  const resetJournal = useJournalStore((state) => state.resetStore);

  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const resetSettings = useSettingsStore((state) => state.resetStore);

  const clearAllStores = useCallback(() => {
    resetHabits();
    resetHealth();
    resetMood();
    resetFinances();
    resetJournal();
    resetSettings();
  }, [resetHabits, resetHealth, resetMood, resetFinances, resetJournal, resetSettings]);

  const reloadAllStores = useCallback(
    async (targetUid?: string) => {
      const uid = targetUid || user?.uid;
      if (!uid) {
        clearAllStores();
        return;
      }
      await Promise.all([
        loadHabits(uid),
        loadHealth(uid),
        loadMood(uid),
        loadFinances(uid),
        loadJournal(uid),
        loadSettings(uid),
      ]);
    },
    [user, loadHabits, loadHealth, loadMood, loadFinances, loadJournal, loadSettings, clearAllStores]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    if (!isFirebaseActive) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        await reloadAllStores(currentUser.uid);
      } else {
        clearAllStores();
      }
    });

    return () => unsubscribe();
  }, [isFirebaseActive, reloadAllStores, clearAllStores]);

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseActive) {
      throw new Error(
        "Firebase credentials in .env.local are unconfigured or using placeholder values. Please set your real Firebase API key and Project ID in .env.local to sign in."
      );
    }
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      await reloadAllStores(res.user.uid);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === "auth/invalid-credential" || error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password") {
        throw new Error("Invalid email or password. Please check your credentials.");
      } else if (error?.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.");
      } else if (error?.code === "auth/too-many-requests") {
        throw new Error("Access temporarily disabled due to failed attempts. Please try again later.");
      } else {
        throw new Error(error?.message || "Failed to sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!isFirebaseActive) {
      throw new Error(
        "Firebase credentials in .env.local are unconfigured or using placeholder values. Please set your real Firebase API key and Project ID in .env.local to create an account."
      );
    }
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        await saveUserProfileCloud(res.user.uid, {
          displayName: name,
          avatarEmoji: "zap",
          joinedDate: new Date().toISOString(),
        });
      }
      setUser(res.user);
      await reloadAllStores(res.user.uid);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === "auth/email-already-in-use") {
        throw new Error("An account with this email address already exists. Please sign in instead.");
      } else if (error?.code === "auth/weak-password") {
        throw new Error("Password should be at least 6 characters long.");
      } else if (error?.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (error?.code === "auth/operation-not-allowed") {
        throw new Error("Email/Password accounts are not enabled in your Firebase Console. Please enable Email/Password provider under Authentication > Sign-in method.");
      } else {
        throw new Error(error?.message || "Failed to create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    if (!isFirebaseActive) {
      throw new Error("Firebase credentials in .env.local are unconfigured or using placeholder values.");
    }
    setIsLoading(true);
    try {
      const res = await firebaseSignInAnonymously(auth);
      setUser(res.user);
      await reloadAllStores(res.user.uid);
    } finally {
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    if (!isFirebaseActive) {
      setUser(null);
      clearAllStores();
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      clearAllStores();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebaseActive,
        signInWithEmail,
        signUpWithEmail,
        signInAnonymously,
        signOutUser,
        reloadAllStores,
        clearAllStores,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
