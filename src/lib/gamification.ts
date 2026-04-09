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

// === Daily Quests System ===

const QUEST_POOL: Omit<DailyQuest, 'id' | 'progress' | 'completed' | 'claimed'>[] = [
  { type: 'complete_lessons', title: 'เรียนจบ 2 บทเรียน', goal: 2, rewardCoins: 30 },
  { type: 'complete_lessons', title: 'เรียนจบ 3 บทเรียน', goal: 3, rewardCoins: 50 },
  { type: 'perfect_combo', title: 'ตอบถูกติดกัน 3 ครั้ง', goal: 3, rewardCoins: 20 },
  { type: 'perfect_combo', title: 'ตอบถูกติดกัน 5 ครั้ง', goal: 5, rewardCoins: 40 },
  { type: 'play_boss', title: 'ท้าทายบอส 1 ครั้ง', goal: 1, rewardCoins: 25 },
  { type: 'play_boss', title: 'สู้บอส 3 ครั้ง', goal: 3, rewardCoins: 60 },
];

export function generateDailyQuests(): DailyQuest[] {
  // Shuffle pool and pick 3
  const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  return selected.map(q => ({
    ...q,
    id: `quest_${Math.random().toString(36).substr(2, 9)}`,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}
