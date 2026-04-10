// ============================================
// BitQuest — Gamification Engine
// Pure functions for EXP, leveling, and streaks
// ============================================

import { DailyQuest } from "./types";

// === Constants ===
export const LEVEL_CAP = 99;
export const BASE_EXP = 100;
export const EXP_SUMMARY = 15;   // +15 EXP per summary page viewed
export const EXP_IMAGE = 15;     // +15 EXP per image page viewed
export const EXP_QUIZ_CORRECT = 20; // +20 EXP per correct quiz answer
export const EXP_DAILY_LOGIN = 50;  // +50 EXP for first login of the day

// === Level Formula ===
// Next Level EXP = Math.floor(100 * Math.pow(CurrentLevel, 1.15))
export function getExpForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_CAP) return Infinity;
  return Math.floor(BASE_EXP * Math.pow(currentLevel, 1.15));
}

// === Level Up Check ===
// Handles cascading level-ups (if enough EXP for multiple levels)
export function checkLevelUp(
  currentLevel: number,
  currentEXP: number
): { newLevel: number; newEXP: number; didLevelUp: boolean } {
  let level = currentLevel;
  let exp = currentEXP;
  let didLevelUp = false;

  while (level < LEVEL_CAP) {
    const required = getExpForNextLevel(level);
    if (exp >= required) {
      exp -= required;
      level += 1;
      didLevelUp = true;
    } else {
      break;
    }
  }

  return { newLevel: level, newEXP: exp, didLevelUp };
}

// === Streak Logic ===
// Determines streak state based on last login time
export function calculateStreak(
  lastLoginDate: Date | null,
  currentStreakCount: number
): { newStreakCount: number; streakAction: 'increment' | 'reset' | 'same' } {
  if (!lastLoginDate) {
    // First login ever — start a streak
    return { newStreakCount: 1, streakAction: 'increment' };
  }

  const now = new Date();
  const diffMs = now.getTime() - lastLoginDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24 && diffHours < 48) {
    // Between 24 and 48 hours — streak continues!
    return {
      newStreakCount: currentStreakCount + 1,
      streakAction: 'increment',
    };
  } else if (diffHours >= 48) {
    // More than 48 hours — streak broken
    return { newStreakCount: 0, streakAction: 'reset' };
  } else {
    // Less than 24 hours — same day, no change
    return { newStreakCount: currentStreakCount, streakAction: 'same' };
  }
}

// === Daily Quests System (Fixed Daily + 1:00 AM Reset) ===

export function isQuestResetReady(lastRefreshDate: Date | null): boolean {
  if (!lastRefreshDate) return true;
  
  const now = new Date();
  const lastResetTime = new Date(now);
  lastResetTime.setHours(1, 0, 0, 0); // 1:00 AM
  
  // If current time is before 1:00 AM today, the most recent reset was yesterday at 1:00 AM
  if (now < lastResetTime) {
    lastResetTime.setDate(lastResetTime.getDate() - 1);
  }
  
  // If the last refresh was before the most recent 1:00 AM, then reset!
  return lastRefreshDate < lastResetTime;
}

export function generateDailyQuests(): DailyQuest[] {
  // Static daily quests specified by user
  const dailyQuests: Omit<DailyQuest, 'id' | 'progress' | 'completed' | 'claimed'>[] = [
    { type: 'complete_lessons', title: 'เรียนจบ 2 บทเรียน', goal: 2, rewardCoins: 30 },
    { type: 'perfect_combo', title: 'ตอบถูกติดกัน 3 ครั้ง', goal: 3, rewardCoins: 20 },
    { type: 'play_boss', title: 'ท้าทายบอส 1 ครั้ง', goal: 1, rewardCoins: 25 },
  ];
  
  return dailyQuests.map((q, i) => ({
    ...q,
    id: `daily_${i}`,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

