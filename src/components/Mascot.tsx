// ============================================
// BitQuest — Mascot (น้องบิท) Guide Component
// Floating character that pops up with encouragement
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mascotMessages = [
  { text: 'สู้ๆ นะ! เธอทำได้! 💪', emoji: '🦊' },
  { text: 'เก่งมาก ลุยต่อเลย!', emoji: '🌟' },
  { text: 'ด่านต่อไปท้าทายหน่อยนะ~', emoji: '🧠' },
  { text: 'พักสายตาบ้างนะ 👀', emoji: '🐱' },
  { text: 'วันนี้เรียนดีมาก! 🎯', emoji: '🦊' },
  { text: 'ความรู้คือพลัง! ⚡', emoji: '🌈' },
  { text: 'อีกนิดเดียวก็ครบด่านแล้ว!', emoji: '🏃' },
  { text: 'หมั่นทบทวนด้วยนะ~', emoji: '📖' },
  { text: 'เยี่ยมไปเลย ตอบถูกหมด!', emoji: '🎉' },
  { text: 'บิทเชียร์ให้นะ! ❤️', emoji: '🦊' },
];

export default function Mascot() {
  const [isVisible, setIsVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show mascot periodically
  useEffect(() => {
    if (!isMounted) return;

    // Show after 8 seconds initially
    const initialTimer = setTimeout(() => {
      setMessageIndex(Math.floor(Math.random() * mascotMessages.length));
      setIsVisible(true);
    }, 8000);

    // Then show every 45 seconds
    const interval = setInterval(() => {
      setMessageIndex(Math.floor(Math.random() * mascotMessages.length));
      setIsVisible(true);
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isMounted]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const hideTimer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(hideTimer);
    }
  }, [isVisible]);

  const currentMessage = mascotMessages[messageIndex];

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[45] flex flex-col items-end gap-2 pointer-events-none md:bottom-8 md:right-8">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="pointer-events-auto"
          >
            {/* Speech Bubble */}
            <div
              className="relative px-4 py-3 rounded-2xl rounded-br-sm shadow-lg max-w-[200px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-prompt)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {currentMessage.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Avatar */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setMessageIndex(Math.floor(Math.random() * mascotMessages.length));
          setIsVisible(true);
        }}
        className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl border-2 border-white/50 float-animation"
        style={{
          background: 'linear-gradient(135deg, #ff9a76, #e8734a)',
          boxShadow: '0 4px 20px rgba(232, 115, 74, 0.3)',
        }}
      >
        {currentMessage.emoji}
      </motion.button>
    </div>
  );
}
