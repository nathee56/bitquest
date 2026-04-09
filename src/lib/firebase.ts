// ============================================
// BitQuest — Firebase Configuration
// ============================================
// ⚠️  IMPORTANT: Replace the config values below
//     with your actual Firebase project credentials.
//     Find them at: Firebase Console → Project Settings → General
// ============================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID",
};

// Initialize Firebase (prevent duplicate initialization in dev)
let app: any;
let authObj: any = null;
let dbObj: any = null;
let googleProviderObj: any = null;
let analyticsObj: any = null;

try {
  // If API Key is unconfigured, deliberately throw to skip init
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey) {
    throw new Error('Unconfigured API Key');
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  authObj = getAuth(app);
  dbObj = getFirestore(app);
  googleProviderObj = new GoogleAuthProvider();
  
  // Analytics only works in browser
  if (typeof window !== 'undefined') {
    isSupported().then(yes => yes && (analyticsObj = getAnalytics(app)));
  }
} catch (error) {
  console.warn('Firebase initialization skipped: Invalid config or missing API key. App will run in Offline / Guest Mode.');
  // Keep them null so we know it's fake. The AuthContext and Pages will fallback gracefully.
}

// === Exports ===
export const auth = authObj;
export const db = dbObj;
export const googleProvider = googleProviderObj;
export const analytics = analyticsObj;
