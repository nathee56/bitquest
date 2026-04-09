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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <div className="glass-card overflow-hidden" style={{ borderRadius: '24px', background: 'rgba(255, 255, 255, 0.7)' }}>
        {/* IG Header */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${!isCompleted ? 'insta-ring' : ''} p-[2px]`}>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-white shadow-inner"
              >
                {emoji}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}>
                {config.label}
              </p>
              <p className="text-[10px] opacity-60" style={{ fontFamily: 'var(--font-prompt)' }}>
                bitquest.official • {lesson.id.split('-').pop()}
              </p>
            </div>
          </div>
          <MoreHorizontal size={18} className="text-gray-400" />
        </div>

        {/* Main Post Image */}
        <Link href={`/lesson/${lesson.id}`}>
          <div className="relative aspect-square w-full cursor-pointer overflow-hidden group">
            <img 
              src={coverImage} 
              alt={lesson.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Completed Overlay */}
            {isCompleted && (
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/90 p-3 rounded-full shadow-lg"
                >
                  <span className="text-xl">🙌</span>
                </motion.div>
              </div>
            )}

            {/* CTA Overlay - Like IG Ads */}
            {!isCompleted && (
              <div className="absolute bottom-0 left-0 right-0 py-2.5 px-4 bg-[#0095f6] text-white flex items-center justify-between">
                <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>Learn More</span>
                <span className="text-xs">›</span>
              </div>
            )}
          </div>
        </Link>

        {/* Action Bar */}
        <div className="p-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart size={26} className="hover:text-red-500 transition-colors cursor-pointer stroke-[1.5]" />
            <MessageCircle size={26} className="hover:text-gray-500 transition-colors cursor-pointer stroke-[1.5]" />
            <Send size={26} className="hover:text-gray-500 transition-colors cursor-pointer stroke-[1.5]" />
          </div>
          <Bookmark size={26} className="hover:text-gray-500 transition-colors cursor-pointer stroke-[1.5]" />
        </div>

        {/* Social Proof */}
        <div className="px-3 pt-2">
           <div className="flex items-center gap-1.5">
             <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px]">👤</div>
                <div className="w-5 h-5 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-[10px]">🐶</div>
             </div>
             <p className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-prompt)' }}>
               Liked by <span className="font-bold">user_name</span> and <span className="font-bold">124 others</span>
             </p>
           </div>
        </div>

        {/* Captions */}
        <div className="px-3 pb-5">
          <div className="mt-2 group">
             <p className="text-xs leading-relaxed" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}>
               <span className="font-bold mr-2">{config.label}</span>
               {lesson.title}
             </p>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5 opacity-60">
            <span className="text-[10px] uppercase font-semibold" style={{ fontFamily: 'var(--font-prompt)' }}>
              {lesson.estimatedTime}
            </span>
            <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-exp-gold)' }}>
               ✨ {(lesson.content?.filter(c => c.type === 'quiz').length || 0) * 20 + 10} EXP
            </span>
          </div>

          <Link href={`/lesson/${lesson.id}`}>
             <p className="mt-2 text-[11px] opacity-40 hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-prompt)' }}>
               View all {Math.floor(Math.random() * 50) + 1} comments
             </p>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
