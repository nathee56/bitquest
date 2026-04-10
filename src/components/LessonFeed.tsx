// ============================================
// BitQuest — Lesson Feed Component
// Now with loading state, empty state, and functional filters
// ============================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson } from '@/lib/types';
import LessonCard from './LessonCard';

interface LessonFeedProps {
  lessons: Lesson[];
  completedLessons: string[];
  loading?: boolean;
}

const filterOptions = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ประวัติศาสตร์', value: 'ประวัติศาสตร์' },
  { label: 'ภาษาอังกฤษ', value: 'ภาษาอังกฤษ' },
  { label: 'วิทยาศาสตร์', value: 'วิทยาศาสตร์' },
  { label: 'การเงิน', value: 'การเงิน' },
  { label: 'สังคมศึกษา', value: 'สังคมศึกษา' },
];

export default function LessonFeed({ lessons, completedLessons, loading }: LessonFeedProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredLessons = activeFilter === 'all'
    ? lessons
    : lessons.filter((l) => l.subject === activeFilter);

  return (
    <div className="px-5 pb-28">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex items-center justify-between mb-4"
      >
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}
        >
          📚 บทเรียนวันนี้
        </h2>
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--color-lime-cream-dark)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-prompt)',
          }}
        >
          {filteredLessons.length} Quest
        </span>
      </motion.div>

      {/* Subject Filter Chips — Now functional! */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 mb-5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {filterOptions.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(opt.value)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all"
            style={{
              fontFamily: 'var(--font-prompt)',
              backgroundColor: activeFilter === opt.value ? 'var(--color-burnt-orange)' : 'rgba(255, 254, 249, 0.8)',
              color: activeFilter === opt.value ? 'white' : 'var(--color-text-secondary)',
              border: activeFilter === opt.value ? 'none' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: activeFilter === opt.value ? '0 2px 12px rgba(232, 115, 74, 0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-10 h-10 rounded-full mx-auto mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
            }}
          />
          <p className="text-sm" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
            กำลังโหลดบทเรียน...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLessons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-5xl mb-4"
          >
            📭
          </motion.div>
          <h3
            className="text-base font-bold mb-2"
            style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}
          >
            ยังไม่มีบทเรียนในวันนี้
          </h3>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}
          >
            {activeFilter !== 'all'
              ? 'ลองเลือกวิชาอื่นดูนะ หรือรอบทเรียนใหม่ 🌟'
              : 'อดมรอสักครู่นะ! บทเรียนกำลังจะมาเร็วๆ นี้ ✨'}
          </p>
        </motion.div>
      )}

      {/* Lesson Cards — IG Feed Layout */}
      {!loading && (
        <div className="flex flex-col gap-2 max-w-xl mx-auto">
          <AnimatePresence>
            {filteredLessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                isCompleted={completedLessons.includes(lesson.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
