// ============================================
// BitQuest — Shared TypeScript Interfaces
// All types match the Firestore schema exactly
// ============================================

// === Subject Types ===
// Firestore stores subjects as Thai strings
export type SubjectType = 'ประวัติศาสตร์' | 'สังคมศึกษา' | 'ภาษาอังกฤษ' | 'ความรู้ทั่วไป';

// === Lesson Content Block ===
// Each lesson contains an array of these content blocks
export interface LessonContent {
  type: 'summary' | 'image' | 'quiz';
  text?: string;           // For 'summary' type
  imageUrl?: string;       // For 'image' type
  question?: string;       // For 'quiz' type
  options?: string[];      // For 'quiz' type (e.g., ["A","B","C","D"])
  correctIndex?: number;   // For 'quiz' type (0-based index)
  explanation?: string;    // For 'quiz' type — shown after answering
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
}

// === User Progress (Firestore: `user_progress` collection) ===
export interface UserProgress {
  uid: string;
  completedLessons: string[]; // Array of lesson IDs
}
