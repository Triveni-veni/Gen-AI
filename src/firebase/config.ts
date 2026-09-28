import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// User-provided default Firebase configuration from project prompt
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyAn8S-zE22DZxhIk08fOjsMehoPQQQFFcs",
  authDomain: "gen-ai-3fe58.firebaseapp.com",
  projectId: "gen-ai-3fe58",
  storageBucket: "gen-ai-3fe58.firebasestorage.app",
  messagingSenderId: "79188034957",
  appId: "1:79188034957:web:8956994d481894b53f69c4",
  measurementId: "G-YTXRN00GEP"
};

const STORAGE_KEY = 'authvault_custom_firebase_config';

export function getStoredFirebaseConfig(): { config: FirebaseConfigType; isCustom: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.apiKey && parsed.authDomain && parsed.projectId) {
        return { config: parsed, isCustom: true };
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored firebase config:', e);
  }
  return { config: DEFAULT_FIREBASE_CONFIG, isCustom: false };
}

export function saveCustomFirebaseConfig(config: FirebaseConfigType) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

const { config: activeConfig } = getStoredFirebaseConfig();

export let firebaseApp: FirebaseApp;
export let auth: Auth;

if (!getApps().length) {
  firebaseApp = initializeApp(activeConfig);
} else {
  firebaseApp = getApp();
}

auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
