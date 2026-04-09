'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  displayName: string;
  streakCount: number;
}

export default function Header({ displayName }: HeaderProps) {
  const { userProfile } = useAuth();
  
  const level = userProfile?.currentLevel || 1;
  const streak = userProfile?.streakCount || 0;
  const exp = userProfile?.currentEXP || 0;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-[60] w-full px-5 py-3 md:hidden bg-white/85 backdrop-blur-2xl border-b border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between mb-3 mt-1">
        {/* Logo Mini */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BitQuest Logo"
            width={44}
            height={44}
            className="object-contain drop-shadow-sm"
            priority
          />
          <div className="flex flex-col">
            <h1 className="text-sm font-black leading-tight text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>BitQuest</h1>
            <p className="text-[10px] font-bold text-slate-400" style={{ fontFamily: 'var(--font-prompt)' }}>หวัดดี, {displayName}</p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <DarkModeToggle />
        </div>
      </div>

      {/* Game Stats HUD (Pills) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 hide-scrollbar">
        
        {/* Level Pill */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-indigo-100 bg-indigo-50"
        >
          <span className="text-[16px]">🛡️</span>
          <span className="text-indigo-600 text-sm font-black tracking-wide" style={{ fontFamily: 'var(--font-mali)' }}>
            Lv.{level}
          </span>
        </motion.div>

        {/* Hearts Pill */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[70px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl border-2 border-rose-100 bg-rose-50"
        >
          <span className="text-[14px]">❤️</span>
          <span className="text-rose-600 text-sm font-black tracking-wide" style={{ fontFamily: 'var(--font-mali)' }}>
            {userProfile?.hearts ?? 5}
          </span>
        </motion.div>

        {/* Coins Pill */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[70px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl border-2 border-yellow-100 bg-yellow-50"
        >
          <span className="text-[14px]">🪙</span>
          <span className="text-yellow-600 text-sm font-black tracking-wide" style={{ fontFamily: 'var(--font-mali)' }}>
            {userProfile?.coins ?? 0}
          </span>
        </motion.div>

        {/* Streak Pill */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[70px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl border-2 border-orange-100 bg-orange-50"
        >
          <span className="text-[14px]">🔥</span>
          <span className="text-orange-600 text-sm font-black tracking-wide" style={{ fontFamily: 'var(--font-mali)' }}>
            {streak}
          </span>
        </motion.div>

      </div>
    </motion.header>
  );
}
