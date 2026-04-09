// ============================================
// BitQuest — Stats Bar Component
// Updated to use shared gamification utility
// ============================================

'use client';

import { motion } from 'framer-motion';
import { getExpForNextLevel } from '@/lib/gamification';

interface StatsBarProps {
  currentLevel: number;
  currentEXP: number;
  streakCount: number;
}

export default function StatsBar({ currentLevel, currentEXP, streakCount }: StatsBarProps) {
  const expNeeded = getExpForNextLevel(currentLevel);
  const progress = Math.min((currentEXP / expNeeded) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mx-5 mb-5"
    >
      <div className="bento-grid">
        {/* Level Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card p-4 flex flex-col items-center justify-center"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
            }}
          >
            <span className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-mali)' }}>
              {currentLevel}
            </span>
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-prompt)' }}
          >
            Level
          </span>
        </motion.div>

        {/* EXP Progress Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card p-4 flex flex-col justify-center"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-prompt)' }}>
              ✨ EXP
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-exp-gold)', fontFamily: 'var(--font-prompt)' }}>
              {currentEXP}/{expNeeded}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-lime-cream-dark)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
              }}
            />
          </div>

          <span
            className="text-xs mt-1.5"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-prompt)' }}
          >
            อีก {expNeeded - currentEXP} EXP จะ Level Up!
          </span>
        </motion.div>

        {/* Daily Quest Card (Wide) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="glass-card bento-item-wide p-4 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 154, 118, 0.12), rgba(232, 115, 74, 0.08))',
            borderColor: 'rgba(255, 154, 118, 0.25)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl float-animation">🎯</div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}
                >
                  Daily Quest
                </p>
                <p
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}
                >
                  เรียน 3 บท รับ +50 EXP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: i === 0 ? 'var(--color-quiz-correct)' : 'var(--color-lime-cream-deeper)',
                    backgroundColor: i === 0 ? 'var(--color-quiz-correct)' : 'transparent',
                  }}
                >
                  {i === 0 && <span className="text-white text-xs">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
