// ============================================
// BitQuest — Lesson Card Component
// Updated to use shared types (Firestore-backed)
// ============================================

'use client';

import { motion } from 'framer-motion';
import { Lesson, SubjectType } from '@/lib/types';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
}

// Subject config maps Thai subject names to display properties
const subjectConfig: Record<SubjectType, {
  badge: string;
  label: string;
  gradient: string;
  borderColor: string;
}> = {
  'ประวัติศาสตร์': {
    badge: 'badge-history',
    label: 'ประวัติศาสตร์',
    gradient: 'linear-gradient(135deg, #a78bfa20, #8b5cf620)',
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  'ภาษาอังกฤษ': {
    badge: 'badge-english',
    label: 'ภาษาอังกฤษ',
    gradient: 'linear-gradient(135deg, #60a5fa20, #3b82f620)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  'วิทยาศาสตร์': {
    badge: 'badge-science',
    label: 'วิทยาศาสตร์',
    gradient: 'linear-gradient(135deg, #34d39920, #05966920)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  'การเงิน': {
    badge: 'badge-finance',
    label: 'การเงิน',
    gradient: 'linear-gradient(135deg, #fcd34d20, #d9770620)',
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  'สังคมศึกษา': {
    badge: 'badge-social',
    label: 'สังคมศึกษา',
    gradient: 'linear-gradient(135deg, #fbbf2420, #f59e0b20)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  'ความรู้ทั่วไป': {
    badge: 'badge-general',
    label: 'ความรู้ทั่วไป',
    gradient: 'linear-gradient(135deg, #34d39920, #10b98120)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
};

// Subject emoji mapping
const subjectEmoji: Record<SubjectType, string> = {
  'ประวัติศาสตร์': '🏛️',
  'ภาษาอังกฤษ': '📖',
  'วิทยาศาสตร์': '🔬',
  'การเงิน': '💸',
  'สังคมศึกษา': '⚖️',
  'ความรู้ทั่วไป': '💡',
};

export default function LessonCard({ lesson, index, isCompleted }: LessonCardProps) {
  const config = subjectConfig[lesson.subject] || subjectConfig['ประวัติศาสตร์'];
  const emoji = subjectEmoji[lesson.subject] || '📚';
  
  // Extract cover image or use a beautiful fallback
  const coverImage = lesson.content.find(c => c.type === 'image')?.imageUrl 
    || `https://source.unsplash.com/featured/?education,${lesson.subject}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      {/* ========================================================== */}
      {/* MOBILE VIEW — Instagram Style (The legacy UI you loved)    */}
      {/* ========================================================== */}
      <div className="block md:hidden bg-white mb-6">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${lesson.subject === 'ประวัติศาสตร์' ? 'from-orange-500 to-purple-500' : 'from-blue-400 to-emerald-400'}`}>
              <div className="bg-white p-1 rounded-full">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                  {emoji}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-black" style={{ fontFamily: 'var(--font-prompt)' }}>BitQuest Explorer</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{config.label}</p>
            </div>
          </div>
          <MoreHorizontal size={20} className="text-slate-400" />
        </div>

        <Link href={`/lesson/${lesson.id}`}>
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            <img 
              src={coverImage} 
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
            {isCompleted && (
              <div className="absolute top-4 right-4 bg-green-500/90 text-white p-2 rounded-full backdrop-blur-sm shadow-xl z-20">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Heart size={26} className="text-slate-700 hover:text-red-500 transition-colors cursor-pointer" />
              <MessageCircle size={26} className="text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer" />
              <Send size={26} className="text-slate-700 hover:rotate-12 transition-transform cursor-pointer" />
            </div>
            <Bookmark size={26} className="text-slate-700 hover:text-amber-500 transition-colors cursor-pointer" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-black flex items-center gap-1.5" style={{ fontFamily: 'var(--font-prompt)' }}>
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">✨</span>
              ถูกใจโดย <span className="text-indigo-600">QuestMaster</span> และ <span className="text-indigo-600">คนอื่นอีก {(index + 1) * 12} คน</span>
            </p>
            
            <p className="text-sm leading-snug" style={{ fontFamily: 'var(--font-prompt)' }}>
              <span className="font-black mr-2">BitQuest</span> 
              {lesson.title}
            </p>
            
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-prompt)' }}>
              {lesson.estimatedTime} • +{(lesson.content?.filter(c => c.type === 'quiz').length || 0) * 20 + 10} EXP
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DESKTOP/IPAD VIEW — Premium Redesign (The new crisp UI)    */}
      {/* ========================================================== */}
      <Link href={`/lesson/${lesson.id}`} className="hidden md:block h-full">
        <motion.div 
          whileHover={{ y: -8 }}
          className="group relative h-full glass-card overflow-hidden flex flex-col transition-all duration-300"
          style={{ 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img 
              src={coverImage} 
              alt={lesson.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
            
            {/* Subject Badge */}
            <div className="absolute top-4 left-4">
              <div 
                className="px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Completed Badge */}
            {isCompleted && (
              <div className="absolute top-4 right-4">
                <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 
                className="text-lg font-bold mb-2 line-clamp-2 leading-tight" 
                style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}
              >
                {lesson.title}
              </h3>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 opacity-60">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ fontFamily: 'var(--font-prompt)' }}>
                    {lesson.estimatedTime}
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--color-exp-gold)' }}>
                  <span className="text-[10px] font-black tracking-widest" style={{ fontFamily: 'var(--font-prompt)' }}>
                    ✨ {(lesson.content?.filter(c => c.type === 'quiz').length || 0) * 20 + 10} EXP
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-orange-50 group-hover:bg-orange-500 group-hover:text-white"
                style={{ color: 'var(--color-burnt-orange)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
