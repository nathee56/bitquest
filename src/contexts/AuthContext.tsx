// ============================================
// BitQuest — Authentication & State Context
// Replaces Zustand store with Firebase-backed React Context
// ============================================

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
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
import { checkLevelUp, calculateStreak, EXP_DAILY_LOGIN, generateDailyQuests, isQuestResetReady } from '@/lib/gamification';

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
  deductHeart: () => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  unlockItem: (type: 'mascot' | 'frame' | 'hat' | 'accessory', id: string) => Promise<void>;
  equipItem: (type: 'mascot' | 'frame' | 'hat' | 'accessory', id: string) => Promise<void>;
  
  // Quests
  updateQuestProgress: (type: 'complete_lessons' | 'perfect_combo' | 'play_boss', amount: number) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;

  // Shop Boost
  activateExpBoost: (durationMinutes: number) => Promise<void>;
  refillHearts: () => Promise<void>;
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
  // ─── Merge Guest data into Firebase account ───
  const mergeGuestData = useCallback(async (user: User, existingProfile: UserProfile, existingProgress: UserProgress) => {
    if (typeof window === 'undefined') return { profile: existingProfile, progress: existingProgress };
    
    const guestProfileStr = localStorage.getItem('guest_profile');
    const guestProgressStr = localStorage.getItem('guest_progress');
    
    if (!guestProfileStr || !guestProgressStr) return { profile: existingProfile, progress: existingProgress };
    
    try {
      const guestProfile = JSON.parse(guestProfileStr);
      const guestProgress = JSON.parse(guestProgressStr);
      
      // Skip merge if guest has no meaningful progress
      if (!guestProgress.completedLessons?.length && (guestProfile.currentEXP || 0) === 0) {
        localStorage.removeItem('guest_profile');
        localStorage.removeItem('guest_progress');
        localStorage.removeItem('has_seen_first_lesson_login');
        return { profile: existingProfile, progress: existingProgress };
      }

      // Max-merge strategy: take the higher value for each field
      const mergedProfile: UserProfile = {
        ...existingProfile,
        coins: Math.max(existingProfile.coins || 0, guestProfile.coins || 0),
        currentEXP: Math.max(existingProfile.currentEXP || 0, guestProfile.currentEXP || 0),
        currentLevel: Math.max(existingProfile.currentLevel || 1, guestProfile.currentLevel || 1),
        streakCount: Math.max(existingProfile.streakCount || 0, guestProfile.streakCount || 0),
        consecutiveCorrect: Math.max(existingProfile.consecutiveCorrect || 0, guestProfile.consecutiveCorrect || 0),
        // Union unlocked items
        unlockedMascotStyles: [...new Set([...(existingProfile.unlockedMascotStyles || ['default']), ...(guestProfile.unlockedMascotStyles || [])])],
        unlockedProfileFrames: [...new Set([...(existingProfile.unlockedProfileFrames || ['default']), ...(guestProfile.unlockedProfileFrames || [])])],
        unlockedHats: [...new Set([...(existingProfile.unlockedHats || []), ...(guestProfile.unlockedHats || [])])],
        unlockedAccessories: [...new Set([...(existingProfile.unlockedAccessories || []), ...(guestProfile.unlockedAccessories || [])])],
      };

      // Union completed lessons
      const mergedProgress: UserProgress = {
        uid: user.uid,
        completedLessons: [...new Set([...(existingProgress.completedLessons || []), ...(guestProgress.completedLessons || [])])],
      };

      // Write merged data to Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: mergedProfile.coins,
        currentEXP: mergedProfile.currentEXP,
        currentLevel: mergedProfile.currentLevel,
        streakCount: mergedProfile.streakCount,
        consecutiveCorrect: mergedProfile.consecutiveCorrect,
        unlockedMascotStyles: mergedProfile.unlockedMascotStyles,
        unlockedProfileFrames: mergedProfile.unlockedProfileFrames,
        unlockedHats: mergedProfile.unlockedHats,
        unlockedAccessories: mergedProfile.unlockedAccessories,
      });

      const progressRef = doc(db, 'user_progress', user.uid);
      await updateDoc(progressRef, {
        completedLessons: mergedProgress.completedLessons,
      });

      // Clear guest data
      localStorage.removeItem('guest_profile');
      localStorage.removeItem('guest_progress');
      localStorage.removeItem('has_seen_first_lesson_login');
      
      console.log('✅ Guest data merged successfully!');
      return { profile: mergedProfile, progress: mergedProgress };
    } catch (e) {
      console.error('Error merging guest data:', e);
      return { profile: existingProfile, progress: existingProgress };
    }
  }, []);

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
          coins: data.coins ?? 100,
          hearts: data.hearts ?? 5,
          lastHeartLoss: data.lastHeartLoss?.toDate() || null,
          unlockedMascotStyles: data.unlockedMascotStyles || ['default'],
          unlockedProfileFrames: data.unlockedProfileFrames || ['default'],
          equippedMascotStyle: data.equippedMascotStyle || 'default',
          equippedProfileFrame: data.equippedProfileFrame || 'default',
        };

        // Apply streak logic
        const streakResult = calculateStreak(profile.lastLoginDate, profile.streakCount);
        const isNewDay = streakResult.streakAction === 'increment';
        
        profile.streakCount = streakResult.newStreakCount;
        profile.lastLoginDate = new Date();

        const pDate = data.lastQuestRefreshDate ? data.lastQuestRefreshDate.toDate() : null;
        if (isQuestResetReady(pDate)) {
          profile.dailyQuests = generateDailyQuests();
          profile.lastQuestRefreshDate = new Date();
        } else {
          profile.dailyQuests = data.dailyQuests || generateDailyQuests();
          profile.lastQuestRefreshDate = pDate || new Date();
        }

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
          dailyQuests: profile.dailyQuests,
          lastQuestRefreshDate: Timestamp.fromDate(profile.lastQuestRefreshDate!),
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
          coins: 100,
          hearts: 5,
          lastHeartLoss: null,
          unlockedMascotStyles: ['default'],
          unlockedProfileFrames: ['default'],
          equippedMascotStyle: 'default',
          equippedProfileFrame: 'default',
          dailyQuests: generateDailyQuests(),
          lastQuestRefreshDate: new Date(),
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
          coins: profile.coins,
          hearts: profile.hearts,
          lastHeartLoss: null,
          unlockedMascotStyles: profile.unlockedMascotStyles,
          unlockedProfileFrames: profile.unlockedProfileFrames,
          equippedMascotStyle: profile.equippedMascotStyle,
          equippedProfileFrame: profile.equippedProfileFrame,
          dailyQuests: profile.dailyQuests,
          lastQuestRefreshDate: Timestamp.fromDate(profile.lastQuestRefreshDate!),
        });
      }

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

      // 3. Merge guest data if available
      const merged = await mergeGuestData(user, profile, progress);
      profile = merged.profile;
      progress = merged.progress;

      setUserProfile(profile);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }, [mergeGuestData]);

  // ─── Listen to Firebase Auth state ───
  useEffect(() => {
    const initGuest = () => {
      if (typeof window !== 'undefined') {
        const storedProfileStr = localStorage.getItem('guest_profile');
        const storedProgressStr = localStorage.getItem('guest_progress');
        
        if (storedProfileStr && storedProgressStr) {
          const rawProfile = JSON.parse(storedProfileStr);
          const profile = {
            ...rawProfile,
            coins: rawProfile.coins ?? 100,
            hearts: rawProfile.hearts ?? 5,
            lastHeartLoss: rawProfile.lastHeartLoss ? new Date(rawProfile.lastHeartLoss) : null,
            unlockedMascotStyles: rawProfile.unlockedMascotStyles || ['default'],
            unlockedProfileFrames: rawProfile.unlockedProfileFrames || ['default'],
            equippedMascotStyle: rawProfile.equippedMascotStyle || 'default',
            equippedProfileFrame: rawProfile.equippedProfileFrame || 'default',
          };
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

          const qDate = rawProfile.lastQuestRefreshDate ? new Date(rawProfile.lastQuestRefreshDate) : null;
          if (isQuestResetReady(qDate)) {
            profile.dailyQuests = generateDailyQuests();
            profile.lastQuestRefreshDate = new Date();
          } else {
            profile.dailyQuests = rawProfile.dailyQuests || generateDailyQuests();
            profile.lastQuestRefreshDate = qDate || new Date();
          }

          localStorage.setItem('guest_profile', JSON.stringify(profile));
          setUserProfile(profile);
          setUserProgress(JSON.parse(storedProgressStr));
          setLoading(false);
          return;
        }
      }
      
      const newGuestProfile: UserProfile = {
        uid: 'guest',
        displayName: 'นักสำรวจ (Guest)',
        email: '',
        currentLevel: 1,
        currentEXP: 0,
        streakCount: 1, // Start at 1 for the first visit
        lastLoginDate: new Date(),
        consecutiveCorrect: 0,
        coins: 100,
        hearts: 5,
        lastHeartLoss: null,
        unlockedMascotStyles: ['default'],
        unlockedProfileFrames: ['default'],
        unlockedHats: [],
        unlockedAccessories: [],
        equippedMascotStyle: 'default',
        equippedProfileFrame: 'default',
        equippedHat: 'none',
        equippedAccessory: 'none',
        photoURL: '',
        dailyQuests: generateDailyQuests(),
        lastQuestRefreshDate: new Date(),
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
        consecutiveCorrect: 0,
        coins: 100,
        hearts: 5,
        lastHeartLoss: null,
        unlockedMascotStyles: ['default'],
        unlockedProfileFrames: ['default'],
        unlockedHats: [],
        unlockedAccessories: [],
        equippedMascotStyle: 'default',
        equippedProfileFrame: 'default',
        equippedHat: 'none',
        equippedAccessory: 'none',
        photoURL: '',
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
        coins: 100,
        hearts: 5,
        lastHeartLoss: null,
        unlockedMascotStyles: ['default'],
        unlockedProfileFrames: ['default'],
        unlockedHats: [],
        unlockedAccessories: [],
        equippedMascotStyle: 'default',
        equippedProfileFrame: 'default',
        equippedHat: 'none',
        equippedAccessory: 'none',
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

    // Check EXP Boost
    let finalAmount = amount;
    if (userProfile.expBoostUntil && new Date(userProfile.expBoostUntil) > new Date()) {
      finalAmount = amount * 2;
    }

    const totalEXP = userProfile.currentEXP + finalAmount;
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
      localStorage.removeItem('has_seen_first_lesson_login');
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
      coins: 100,
      hearts: 5,
      lastHeartLoss: null,
      unlockedMascotStyles: ['default'],
      unlockedProfileFrames: ['default'],
      unlockedHats: [],
      unlockedAccessories: [],
      equippedMascotStyle: 'default',
      equippedProfileFrame: 'default',
      equippedHat: 'none',
      equippedAccessory: 'none',
      photoURL: '',
      dailyQuests: generateDailyQuests(),
      lastQuestRefreshDate: new Date(),
    });
    setUserProgress({
      uid: 'guest',
      completedLessons: [],
    });
  }, []);

  // ─── Gamification & Shop Methods ───
  const deductHeart = useCallback(async () => {
    setUserProfile(prev => {
      if (!prev || prev.hearts <= 0) return prev;
      const newHearts = prev.hearts - 1;
      const newLastLoss = prev.hearts === 5 ? new Date() : prev.lastHeartLoss;
      const updated = { ...prev, hearts: newHearts, lastHeartLoss: newLastLoss };
      
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { hearts: newHearts, lastHeartLoss: newLastLoss ? Timestamp.fromDate(newLastLoss) : null });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updated));
      }
      return updated;
    });
  }, [firebaseUser]);

  const addCoins = useCallback(async (amount: number) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      const updated = { ...prev, coins: prev.coins + amount };
      
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { coins: updated.coins });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updated));
      }
      return updated;
    });
  }, [firebaseUser]);

  const spendCoins = useCallback(async (amount: number) => {
    let success = false;
    
    // We cannot use functional update sequentially if we need to return `success` synchronously 
    // based on the previous state. Instead, we use a Promise / async wrapper.
    if (!userProfile || userProfile.coins < amount) return false;
    
    const updated = { ...userProfile, coins: userProfile.coins - amount };
    setUserProfile(updated);
    
    if (firebaseUser && db) {
      await updateDoc(doc(db, 'users', firebaseUser.uid), { coins: updated.coins });
    } else if (userProfile.uid === 'guest' && typeof window !== 'undefined') {
      localStorage.setItem('guest_profile', JSON.stringify(updated));
    }
    return true;
  }, [userProfile, firebaseUser]);

  const unlockItem = useCallback(async (type: 'mascot' | 'frame' | 'hat' | 'accessory', id: string) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      let updated = { ...prev };
      
      let hasChange = false;
      if (type === 'mascot' && !prev.unlockedMascotStyles?.includes(id)) {
        updated.unlockedMascotStyles = [...(prev.unlockedMascotStyles || []), id];
        hasChange = true;
      } else if (type === 'frame' && !prev.unlockedProfileFrames?.includes(id)) {
        updated.unlockedProfileFrames = [...(prev.unlockedProfileFrames || []), id];
        hasChange = true;
      } else if (type === 'hat' && !prev.unlockedHats?.includes(id)) {
        updated.unlockedHats = [...(prev.unlockedHats || []), id];
        hasChange = true;
      } else if (type === 'accessory' && !prev.unlockedAccessories?.includes(id)) {
        updated.unlockedAccessories = [...(prev.unlockedAccessories || []), id];
        hasChange = true;
      }
      
      if (!hasChange) return prev;
      
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { 
          unlockedMascotStyles: updated.unlockedMascotStyles,
          unlockedProfileFrames: updated.unlockedProfileFrames,
          unlockedHats: updated.unlockedHats,
          unlockedAccessories: updated.unlockedAccessories,
        });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updated));
      }
      return updated;
    });
  }, [firebaseUser]);

  const equipItem = useCallback(async (type: 'mascot' | 'frame' | 'hat' | 'accessory', id: string) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      let updated = { ...prev };
      if (type === 'mascot') updated.equippedMascotStyle = id;
      if (type === 'frame') updated.equippedProfileFrame = id;
      if (type === 'hat') updated.equippedHat = id;
      if (type === 'accessory') updated.equippedAccessory = id;
      
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { 
          equippedMascotStyle: updated.equippedMascotStyle,
          equippedProfileFrame: updated.equippedProfileFrame,
          equippedHat: updated.equippedHat,
          equippedAccessory: updated.equippedAccessory,
        });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updated));
      }
      return updated;
    });
  }, [firebaseUser]);

  // ─── Quests ───
  const updateQuestProgress = useCallback(async (type: 'complete_lessons' | 'perfect_combo' | 'play_boss', amount: number) => {
    setUserProfile(prev => {
      if (!prev || !prev.dailyQuests) return prev;
      
      let updated = false;
      const newQuests = prev.dailyQuests.map(q => {
        if (q.type === type && !q.completed) {
          const newProgress = Math.min(q.goal, q.progress + amount);
          if (newProgress !== q.progress) updated = true;
          return { ...q, progress: newProgress, completed: newProgress >= q.goal };
        }
        return q;
      });

      if (!updated) return prev;

      const newProfile = { ...prev, dailyQuests: newQuests };
      
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { dailyQuests: newQuests });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(newProfile));
      }
      
      return newProfile;
    });
  }, [firebaseUser]);

  const claimQuestReward = useCallback(async (questId: string) => {
    setUserProfile(prev => {
      if (!prev || !prev.dailyQuests) return prev;

      const quest = prev.dailyQuests.find(q => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return prev;

      const newQuests = prev.dailyQuests.map(q => 
        q.id === questId ? { ...q, claimed: true } : q
      );

      const newCoins = prev.coins + quest.rewardCoins;
      const newProfile = { ...prev, dailyQuests: newQuests, coins: newCoins };
      
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { 
          dailyQuests: newQuests,
          coins: newCoins 
        });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(newProfile));
      }
      
      return newProfile;
    });
  }, [firebaseUser]);

  // ─── Heart Regeneration ───
  useEffect(() => {
    if (!userProfile || userProfile.hearts >= 5 || !userProfile.lastHeartLoss) return;
    
    const REGEN_TIME_MS = 7 * 60 * 1000; // 7 minutes
    const interval = setInterval(() => {
      const now = Date.now();
      const lossTime = userProfile.lastHeartLoss!.getTime();
      const timeDiff = now - lossTime;
      
      const heartsToRegen = Math.floor(timeDiff / REGEN_TIME_MS);
      if (heartsToRegen > 0) {
        const newHearts = Math.min(5, userProfile.hearts + heartsToRegen);
        const newLossTime = newHearts === 5 ? null : new Date(lossTime + (heartsToRegen * REGEN_TIME_MS));
        
        const updated = { ...userProfile, hearts: newHearts, lastHeartLoss: newLossTime };
        setUserProfile(updated);
        
        if (firebaseUser && db) {
           updateDoc(doc(db, 'users', firebaseUser.uid), { hearts: newHearts, lastHeartLoss: newLossTime ? Timestamp.fromDate(newLossTime) : null });
        } else if (userProfile.uid === 'guest' && typeof window !== 'undefined') {
           localStorage.setItem('guest_profile', JSON.stringify(updated));
        }
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [userProfile, firebaseUser]);

  // ─── Activate EXP Boost ───
  const activateExpBoost = useCallback(async (durationMinutes: number) => {
    const boostUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    setUserProfile(prev => {
      if (!prev) return prev;
      const updated = { ...prev, expBoostUntil: boostUntil };
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { expBoostUntil: Timestamp.fromDate(boostUntil) });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updated));
      }
      return updated;
    });
  }, [firebaseUser]);

  // ─── Refill Hearts ───
  const refillHearts = useCallback(async () => {
    setUserProfile(prev => {
      if (!prev) return prev;
      const updated = { ...prev, hearts: 5, lastHeartLoss: null };
      if (firebaseUser && db) {
        updateDoc(doc(db, 'users', firebaseUser.uid), { hearts: 5, lastHeartLoss: null });
      } else if (prev.uid === 'guest' && typeof window !== 'undefined') {
        localStorage.setItem('guest_profile', JSON.stringify(updated));
      }
      return updated;
    });
  }, [firebaseUser]);

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
    deductHeart,
    addCoins,
    spendCoins,
    unlockItem,
    equipItem,
    updateQuestProgress,
    claimQuestReward,
    activateExpBoost,
    refillHearts,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
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
