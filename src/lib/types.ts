// ============================================
// BitQuest — Shared TypeScript Interfaces
// All types match the Firestore schema exactly
// ============================================

// === Subject Types ===
// Firestore stores subjects as Thai strings
export type SubjectType = 'ประวัติศาสตร์' | 'สังคมศึกษา' | 'ภาษาอังกฤษ' | 'ความรู้ทั่วไป' | 'วิทยาศาสตร์' | 'การเงิน';

// === Daily Quests ===
export interface DailyQuest {
  id: string;             // generated id
  type: 'complete_lessons' | 'perfect_combo' | 'play_boss'; 
  title: string;
  progress: number;
  goal: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

// === Lesson Content Block ===
// Each lesson contains an array of these content blocks
export interface LessonContent {
  type: 'summary' | 'image' | 'quiz' | 'matching' | 'fill_blank' | 'ordering';
  text?: string;           // For 'summary' type
  imageUrl?: string;       // For 'image' type
  question?: string;       // For 'quiz' type
  options?: string[];      // For 'quiz' type (e.g., ["A","B","C","D"])
  correctIndex?: number;   // For 'quiz' type (0-based index)
  explanation?: string;    // For 'quiz' type — shown after answering

  // Matching: จับคู่คำศัพท์
  matchPairs?: { term: string; definition: string }[];

  // Fill in the blank: เติมคำในช่องว่าง
  sentence?: string;      // e.g. "กรุง___คือเมืองหลวงเก่าของไทย"
  blankAnswer?: string;   // e.g. "ศรีอยุธยา"
  // Ordering: เรียงลำดับเหตุการณ์
  correctOrder?: string[]; // ลำดับที่ถูกต้อง
}

// === Lesson Document (Firestore: `lessons` collection) ===
export interface Lesson {
  id: string;              // Firestore document ID
  subject: SubjectType;
  title: string;
  estimatedTime: string;   // e.g., "3 นาที"
  content: LessonContent[];
}

// === User Profile (Firestore: `users` collection) ===
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  currentLevel: number;    // Max 99
  currentEXP: number;
  streakCount: number;
  lastLoginDate: Date | null;
  consecutiveCorrect: number; // For 'Invincible Sage' badge
  photoURL?: string;
  
  // Gamification & Shop
  coins: number;
  hearts: number;         // Max 5
  lastHeartLoss: Date | null;
  equippedMascotStyle?: string;
  equippedProfileFrame?: string;
  equippedHat?: string;
  equippedAccessory?: string;
  unlockedMascotStyles?: string[];
  unlockedProfileFrames?: string[];
  unlockedHats?: string[];
  unlockedAccessories?: string[];
  
  // Quests & Boss
  dailyQuests?: DailyQuest[];
  lastQuestRefreshDate?: Date | null;

  // Boost
  expBoostUntil?: Date | null; // EXP x2 จนกว่าถึงเวลานี้
}

// === User Progress (Firestore: `user_progress` collection) ===
export interface UserProgress {
  uid: string;
  completedLessons: string[]; // Array of lesson IDs
}
