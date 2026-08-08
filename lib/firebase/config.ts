import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Checks whether valid Firebase credentials have been configured in environment.
 */
export function isFirebaseConfigured(): boolean {
  return (
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your_api_key_here" &&
    !!firebaseConfig.projectId
  );
}

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== "undefined" || getApps().length > 0) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // SSR fallback initialization
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

/**
 * Ensures an active Firebase Auth user session (attaching an anonymous user if no session exists).
 */
export async function ensureFirebaseAuth(): Promise<User | null> {
  if (!isFirebaseConfigured() || typeof window === "undefined") return null;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (error) {
          console.warn("[Firebase Auth] Anonymous authentication not active in Firebase Console:", error);
          resolve(null);
        }
      }
    });
  });
}

/**
 * Returns current authenticated user ID or fallback user ID.
 */
export function getCurrentUserId(fallback: string = "demo_user"): string {
  if (auth?.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  return fallback;
}

export { app, db, auth };
