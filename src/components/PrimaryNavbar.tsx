'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  {
    href: '/',
    label: 'หน้าแรก',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    label: 'อันดับ',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 21H16M12 17V21M7 4H17M17 4C17 4 19 4 19 7C19 10 17 10 17 10H15M7 4C7 4 5 4 5 7C5 10 7 10 7 10H9M15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10M15 10H9"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'ค้นหา',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/shop',
    label: 'ร้านค้า',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H5L5.4 5M5.4 5H21L19 13H7M5.4 5L7 13M7 13L4 18H20M10 21C10 21.5523 9.55228 22 9 22C8.44772 22 8 21.5523 8 21C8 20.4477 8.44772 20 9 20C9.55228 20 10 20.4477 10 21ZM19 21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21C17 20.4477 17.4477 20 18 20C18.5523 20 19 20.4477 19 21Z" stroke={active ? '#e8734a' : '#a39e98'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'โปรไฟล์',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function PrimaryNavbar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  
  const level = userProfile?.currentLevel || 1;
  const streak = userProfile?.streakCount || 0;
  const coins = userProfile?.coins || 0;
  const hearts = userProfile?.hearts ?? 5;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] hidden md:block">
      {/* Blur Background Layer */}
      <div 
        className="absolute inset-0 backdrop-blur-2xl bg-white/70 border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      />
      
      <div className="relative max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Left Section: Branding */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative">
             <div className="absolute -inset-2 bg-orange-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <Image 
               src="/logo.png" 
               alt="BitQuest Logo" 
               width={48} 
               height={48} 
               className="relative z-10 transition-transform group-hover:scale-105"
             />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-burnt-orange)' }}>
              BitQuest
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Explorer</span>
          </div>
        </Link>

        {/* Center Section: Navigation Links */}
        <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`}>
                    {item.icon(isActive)}
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isActive ? 'text-slate-800' : 'text-slate-500'
                    }`}
                    style={{ fontFamily: 'var(--font-prompt)' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="pc-nav-active"
                      className="w-1.5 h-1.5 rounded-full bg-orange-500"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right Section: Stats & Settings */}
        <div className="flex items-center gap-6">
          {/* Stats Pills Display for PC */}
          <div className="flex items-center gap-3">
             {/* Level */}
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl">
               <span className="text-lg">🛡️</span>
               <span className="text-xs font-black text-indigo-600">Lv.{level}</span>
             </div>
             {/* Hearts */}
             <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl">
               <span className="text-lg">❤️</span>
               <span className="text-xs font-black text-rose-600">{hearts}</span>
             </div>
             {/* Coins */}
             <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
               <span className="text-lg">🪙</span>
               <span className="text-xs font-black text-amber-600">{coins}</span>
             </div>
             {/* Streak */}
             <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl">
               <span className="text-lg">🔥</span>
               <span className="text-xs font-black text-orange-600">{streak}</span>
             </div>
          </div>

          <div className="w-px h-8 bg-slate-200" />
          
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
