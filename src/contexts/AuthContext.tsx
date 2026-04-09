// ============================================
// BitQuest — Authentication & State Context
// Replaces Zustand store with Firebase-backed React Context
// ============================================

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { UserProfile, UserProgress } from '@/lib/types';
import { checkLevelUp, calculateStreak, EXP_DAILY_LOGIN } from '@/lib/gamification';

// === Context Shape ===
interface AuthContextType {
  // Auth state
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  userProgress: UserProgress | null;
  loading: boolean;
  showDailyNotice: boolean;
  setDailyNotice: (show: boolean) => void;

  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Gamification methods
  addEXP: (amount: number) => Promise<{ didLevelUp: boolean; newLevel: number }>;
  completeLesson: (lessonId: string) => Promise<void>;
  updateConsecutiveCorrect: (correct: boolean) => Promise<void>;
  resetGuestProgress: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === Provider ===
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDailyNotice, setShowDailyNotice] = useState(false);

  // ─── Fetch or create user documents in Firestore ───
  const initializeUserData = useCallback(async (user: User) => {
    try {
      // 1. Fetch or create `users` document
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      let profile: UserProfile;

      if (userSnap.exists()) {
        // Existing user — load profile
        const data = userSnap.data();
        profile = {
          uid: user.uid,
          displayName: data.displayName || user.displayName || 'นักผจญภัย',
          email: data.email || user.email || '',
          currentLevel: data.currentLevel || 1,
          currentEXP: data.currentEXP || 0,
          streakCount: data.streakCount || 0,
          lastLoginDate: data.lastLoginDate?.toDate() || null,
          consecutiveCorrect: data.consecutiveCorrect || 0,
          photoURL: data.photoURL || user.photoURL || '',
        };

        // Apply streak logic
        const streakResult = calculateStreak(profile.lastLoginDate, profile.streakCount);
        const isNewDay = streakResult.streakAction === 'increment';
        
        profile.streakCount = streakResult.newStreakCount;
        profile.lastLoginDate = new Date();

        // If it's a new day, award daily login bonus
        if (isNewDay) {
          const { newLevel, newEXP } = checkLevelUp(profile.currentLevel, profile.currentEXP + EXP_DAILY_LOGIN);
          profile.currentLevel = newLevel;
          profile.currentEXP = newEXP;
          setShowDailyNotice(true);
        }

        // Update Firestore with new streak, login date, and potentially EXP/Level
        await updateDoc(userRef, {
          streakCount: profile.streakCount,
          lastLoginDate: Timestamp.fromDate(profile.lastLoginDate),
           currentLevel: profile.currentLevel,
          currentEXP: profile.currentEXP,
          photoURL: profile.photoURL,
        });
      } else {
        // New user — create initial profile
        profile = {
          uid: user.uid,
          displayName: user.displayName || 'นักผจญภัย',
          email: user.email || '',
          currentLevel: 1,
          currentEXP: 0,
          streakCount: 1,
           lastLoginDate: new Date(),
          consecutiveCorrect: 0,
          photoURL: user.photoURL || '',
        };

        await setDoc(userRef, {
          uid: profile.uid,
          displayName: profile.displayName,
          email: profile.email,
          currentLevel: profile.currentLevel,
          currentEXP: profile.currentEXP,
          streakCount: profile.streakCount,
           lastLoginDate: Timestamp.fromDate(profile.lastLoginDate!),
          consecutiveCorrect: profile.consecutiveCorrect,
          photoURL: profile.photoURL,
        });
      }

      setUserProfile(profile);

      // 2. Fetch or create `user_progress` document
      const progressRef = doc(db, 'user_progress', user.uid);
      const progressSnap = await getDoc(progressRef);

      let progress: UserProgress;

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        progress = {
          uid: user.uid,
          completedLessons: data.completedLessons || [],
        };
      } else {
        progress = {
          uid: user.uid,
          completedLessons: [],
        };
        await setDoc(progressRef, {
          uid: user.uid,
          completedLessons: [],
        });
      }

      setUserProgress(progress);
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }, []);

  // ─── Listen to Firebase Auth state ───
  useEffect(() => {
    const initGuest = () => {
      if (typeof window !== 'undefined') {
        const storedProfileStr = localStorage.getItem('guest_profile');
        const storedProgressStr = localStorage.getItem('guest_progress');
        
        if (storedProfileStr && storedProgressStr) {
          const profile = JSON.parse(storedProfileStr);
          // Convert string date back to Date object
          const lastDate = profile.lastLoginDate ? new Date(profile.lastLoginDate) : null;
          
          const streakResult = calculateStreak(lastDate, profile.streakCount);
          const isNewDay = streakResult.streakAction === 'increment';
          
          profile.streakCount = streakResult.newStreakCount;
          profile.lastLoginDate = new Date();

          if (isNewDay) {
            const { newLevel, newEXP } = checkLevelUp(profile.currentLevel, profile.currentEXP + EXP_DAILY_LOGIN);
            profile.currentLevel = newLevel;
            profile.currentEXP = newEXP;
            setShowDailyNotice(true);
          }

          localStorage.setItem('guest_profile', JSON.stringify(profile));
          setUserProfile(profile);
          setUserProgress(JSON.parse(storedProgressStr));
          setLoading(false);
          return;
        }
      }
      
      const newGuestProfile = {
        uid: 'guest',
        displayName: 'นักสำรวจ (Guest)',
        email: '',
        currentLevel: 1,
        currentEXP: 0,
        streakCount: 1, // Start at 1 for the first visit
        lastLoginDate: new Date(),
        consecutiveCorrect: 0,
      };
      
      setUserProfile(newGuestProfile);
      setUserProgress({
        uid: 'guest',
        completedLessons: [],
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(newGuestProfile));
        localStorage.setItem('guest_progress', JSON.stringify({ uid: 'guest', completedLessons: [] }));
      }
      setLoading(false);
    };

    if (!auth) {
      initGuest();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        await initializeUserData(user);
      } else {
        // Initialize Guest Mode for "Try Before Login" with LocalStorage
        initGuest();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [initializeUserData]);

  // ─── Sign In with Google ───
  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, []);

  // ─── Sign In with Email/Password ───
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  }, []);

  // ─── Sign Up with Email/Password ───
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    if (!auth || !db) throw new Error('Firebase Auth or DB is not initialized');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // After auth creation, we create the Firestore user doc
      // with the provided displayName (onAuthStateChanged will call initializeUserData)
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: displayName,
        email: email,
        currentLevel: 1,
        currentEXP: 0,
        streakCount: 1,
        lastLoginDate: Timestamp.fromDate(new Date()),
      });

      // Also create progress doc
      const progressRef = doc(db, 'user_progress', result.user.uid);
      await setDoc(progressRef, {
        uid: result.user.uid,
        completedLessons: [],
      });

      // Manually update local state since onAuthStateChanged
      // might race with the setDoc above
      setUserProfile({
        uid: result.user.uid,
        displayName: displayName,
        email: email,
        currentLevel: 1,
        currentEXP: 0,
        streakCount: 1,
        lastLoginDate: new Date(),
        consecutiveCorrect: 0,
        photoURL: '',
      });

      setUserProgress({
        uid: result.user.uid,
        completedLessons: [],
      });
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  }, []);

  // ─── Sign Out ───
  const signOut = useCallback(async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setUserProgress(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }, []);

  // ─── Add EXP (writes to Firestore immediately) ───
  const addEXP = useCallback(async (amount: number): Promise<{ didLevelUp: boolean; newLevel: number }> => {
    if (!userProfile) {
      return { didLevelUp: false, newLevel: 0 };
    }

    const totalEXP = userProfile.currentEXP + amount;
    const { newLevel, newEXP, didLevelUp } = checkLevelUp(userProfile.currentLevel, totalEXP);

    // Update local state immediately for responsive UI
    const updatedProfile = {
      ...userProfile,
      currentLevel: newLevel,
      currentEXP: newEXP,
    };
    setUserProfile(updatedProfile);

    // Write to Firestore if logged in
    if (firebaseUser && db) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
          currentLevel: newLevel,
          currentEXP: newEXP,
        });
      } catch (error) {
        console.error('Error updating EXP in Firestore:', error);
      }
    } else if (userProfile.uid === 'guest') {
      // Save Guest state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updatedProfile));
      }
    }

    return { didLevelUp, newLevel };
  }, [userProfile, firebaseUser]);

  // ─── Complete Lesson ───
  const completeLesson = useCallback(async (lessonId: string) => {
    if (!userProgress) return;

    if (userProgress.completedLessons.includes(lessonId)) return;

    const updatedLessons = [...userProgress.completedLessons, lessonId];

    // Update local state
    setUserProgress({
      ...userProgress,
      completedLessons: updatedLessons,
    });

    // Write to Firestore if logged in
    if (firebaseUser && db) {
      try {
        const progressRef = doc(db, 'user_progress', firebaseUser.uid);
        await updateDoc(progressRef, {
          completedLessons: updatedLessons,
        });
      } catch (error) {
        console.error('Error updating progress in Firestore:', error);
      }
    } else if (userProgress.uid === 'guest') {
      // Save Guest state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guest_progress', JSON.stringify({
          ...userProgress,
          completedLessons: updatedLessons,
        }));
      }
    }
  }, [userProgress, firebaseUser]);

  // ─── Update Consecutive Correct ───
  const updateConsecutiveCorrect = useCallback(async (correct: boolean) => {
    if (!userProfile) return;

    const newCount = correct ? (userProfile.consecutiveCorrect || 0) + 1 : 0;
    const updatedProfile = {
      ...userProfile,
      consecutiveCorrect: newCount,
    };

    setUserProfile(updatedProfile);

    // Write to Firestore if logged in
    if (firebaseUser && db) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
          consecutiveCorrect: newCount,
        });
      } catch (error) {
        console.error('Error updating consecutiveCorrect in Firestore:', error);
      }
    } else if (userProfile.uid === 'guest') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updatedProfile));
      }
    }
  }, [userProfile, firebaseUser]);

  // ─── Reset Guest Progress ───
  const resetGuestProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_profile');
      localStorage.removeItem('guest_progress');
    }
    setUserProfile({
      uid: 'guest',
      displayName: 'นักสำรวจ (Guest)',
      email: '',
      currentLevel: 1,
      currentEXP: 0,
      streakCount: 0,
      lastLoginDate: new Date(),
      consecutiveCorrect: 0,
    });
    setUserProgress({
      uid: 'guest',
      completedLessons: [],
    });
  }, []);

  // ─── Context Value ───
  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    userProgress,
    loading,
    showDailyNotice,
    setDailyNotice: setShowDailyNotice,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    addEXP,
    completeLesson,
    updateConsecutiveCorrect,
    resetGuestProgress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// === Hook ===
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
