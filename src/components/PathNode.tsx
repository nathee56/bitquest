// ============================================
// BitQuest — Learning Path Node Component
// 3D bouncy nodes with tooltips
// ============================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson, SubjectType } from '@/lib/types';
import Link from 'next/link';

interface PathNodeProps {
  lesson: Lesson;
  status: 'locked' | 'active' | 'completed';
  position: { x: number }; // Percentage offset from center
  isBoss?: boolean;
}

const subjectColors: Record<SubjectType, string> = {
  'ประวัติศาสตร์': '#a78bfa',
  'ภาษาอังกฤษ': '#60a5fa',
  'สังคมศึกษา': '#fbbf24',
  'ความรู้ทั่วไป': '#34d399', // Emerald color
  'วิทยาศาสตร์': '#10b981', // Emerald
  'การเงิน': '#eab308', // Yellow
};

const subjectEmoji: Record<SubjectType, string> = {
  'ประวัติศาสตร์': '🏛️',
  'ภาษาอังกฤษ': '📖',
  'สังคมศึกษา': '⚖️',
  'ความรู้ทั่วไป': '💡',
  'วิทยาศาสตร์': '🔬',
  'การเงิน': '💸',
};

export default function PathNode({ lesson, status, position, isBoss = false }: PathNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use a rocky color for locked nodes
  const color = status === 'locked' ? '#94a3b8' : (subjectColors[lesson.subject] || '#e8734a');
  const shadowColor = status === 'locked' ? '#64748b' : (status === 'completed' ? '#f59e0b' : '#cc5c35');
  
  const emoji = subjectEmoji[lesson.subject] || '📚';
  
  const nodeSizeClass = isBoss ? 'w-28 h-28 text-5xl' : 'w-24 h-24 text-4xl';

  return (
    <div className="relative flex flex-col items-center" style={{ marginLeft: `${position.x}%` }}>
      {/* The Node Button */}
      <div className="relative group">
        
        {/* Boss Indicator Crown */}
        {isBoss && (
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className={`absolute -top-8 left-1/2 -translate-x-1/2 text-4xl drop-shadow-md z-30 ${status === 'locked' ? 'grayscale opacity-50' : ''}`}
          >
            👑
          </motion.div>
        )}

        <motion.button
          whileHover={status !== 'locked' ? { scale: 1.1, translateY: -4 } : { scale: 1.05 }}
          whileTap={status !== 'locked' ? { scale: 0.95, translateY: 4 } : { scale: 0.9, rotate: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }}
          onClick={() => status !== 'locked' && setIsOpen(!isOpen)}
          className={`duo-node-3d ${nodeSizeClass} rounded-full flex items-center justify-center shadow-inner z-10 ${status === 'locked' ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
          style={{ 
            backgroundColor: color,
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: `inset 0 -6px 0 rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.5)`
          }}
        >
          {status === 'completed' ? '⭐' : (status === 'locked' ? (isBoss ? '🔒' : '🪨') : emoji)}

          {/* Glowing Ring for Active */}
          {status === 'active' && (
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-[-8px] rounded-full border-4 border-white pointer-events-none"
            />
          )}
        </motion.button>

        {/* 3D shadow depth */}
        <div 
          className={`duo-node-shadow ${isBoss ? 'w-28 h-28' : 'w-24 h-24'}`} 
          style={{ 
            backgroundColor: shadowColor,
            boxShadow: status !== 'locked' ? `0 10px 20px rgba(0,0,0,0.1)` : 'none'
          }}
        />
      </div>

      {/* Lesson Title (Subtle label below node) */}
      <div className="mt-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/40">
        <p 
          className="text-[10px] font-bold uppercase tracking-wider text-slate-700 text-center min-w-[60px] max-w-[100px] truncate"
          style={{ fontFamily: 'var(--font-prompt)' }}
        >
          {lesson.title.split('?')[0].split(':')[0]}
        </p>
      </div>

      {/* Tooltip Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key={`backdrop-${lesson.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]" 
            onClick={() => setIsOpen(false)} 
          />
        )}
        {isOpen && (
          <motion.div
            key={`popover-${lesson.id}`}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-6 z-[70] w-64 glass-card p-5 text-center shadow-2xl"
              style={{ borderRadius: '24px' }}
            >
              <div 
                className="text-xs font-bold mb-1 uppercase tracking-widest"
                style={{ color: color, fontFamily: 'var(--font-prompt)' }}
              >
                {lesson.subject}
              </div>
              <h3 
                className="text-sm font-bold mb-3"
                style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}
              >
                {lesson.title}
              </h3>
              
              <div className="flex items-center justify-center gap-3 mb-4 text-xs opacity-60">
                <span>⏱ {lesson.estimatedTime}</span>
                <span>✨ +20 EXP</span>
              </div>

              <Link href={`/lesson/${lesson.id}`}>
                <button 
                  className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg active:translate-y-1 transition-all"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 4px 0 ${shadowColor}`,
                    fontFamily: 'var(--font-prompt)'
                  }}
                >
                  เริ่มลุยเลย! 🚀
                </button>
              </Link>

              {/* Tooltip Arrow */}
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
                style={{ backgroundColor: 'white', marginTop: '-8px' }}
              />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
