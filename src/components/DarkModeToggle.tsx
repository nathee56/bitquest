// ============================================
// BitQuest — Dark Mode Toggle Button
// Sun/Moon switch with smooth animation
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playPop } from '@/lib/soundEffects';
import { hapticLight } from '@/lib/haptics';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference or system preference
    const saved = localStorage.getItem('bitquest-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    playPop();
    hapticLight();
    
    const next = !isDark;
    setIsDark(next);

    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bitquest-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bitquest-theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.85, rotate: 20 }}
      whileHover={{ scale: 1.1 }}
      onClick={toggle}
      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border transition-all"
      style={{
        backgroundColor: isDark ? '#1e293b' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0,0,0,0.08)',
        boxShadow: isDark ? '0 0 12px rgba(139, 92, 246, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      title={isDark ? 'เปิดโหมดกลางวัน' : 'เปิดโหมดกลางคืน'}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-lg"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </motion.button>
  );
}
