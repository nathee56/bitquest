'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';

const navItems = [
  {
    href: '/',
    label: 'หน้าแรก',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2"
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'โปรไฟล์',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
          stroke={active ? '#e8734a' : '#a39e98'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.02)]"
         style={{
           backgroundColor: 'rgba(245, 247, 232, 0.85)', // var(--color-lime-cream) with opacity
           backdropFilter: 'blur(16px)',
           borderColor: 'rgba(0,0,0,0.06)',
           zIndex: 50,
         }}
    >
      {/* Top Banner / Logo */}
      <div className="p-8 pb-4">
        <Link href="/" className="block group">
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-100/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Image
              src="/logo.png"
              alt="BitQuest Logo"
              width={160}
              height={80}
              className="object-contain relative z-10 transition-transform group-hover:scale-105"
            />
          </div>
          <p className="text-[10px] mt-3 font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-prompt)' }}>
            Explorer Edition
          </p>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-8 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block relative">
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bar"
                  className="absolute left-0 top-2 bottom-2 w-1.5 bg-orange-500 rounded-r-full shadow-[2px_0_10px_rgba(232,115,74,0.3)]"
                />
              )}
              
              <motion.div
                whileHover={{ x: 6, backgroundColor: isActive ? 'rgba(232, 115, 74, 0.12)' : 'rgba(0,0,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'shadow-sm' : ''}`}
                style={{
                  backgroundColor: isActive ? 'rgba(232, 115, 74, 0.08)' : 'transparent',
                }}
              >
                <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(232,115,74,0.4)]' : ''}`}>
                  {item.icon(isActive)}
                </div>
                <span
                  className={`font-bold text-sm transition-colors duration-300`}
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    color: isActive ? 'var(--color-burnt-orange)' : 'var(--color-text-secondary)',
                  }}
                >
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Mascot & Dark Mode */}
      <div className="p-6 mt-auto">
        {/* Dark Mode Toggle Area */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Appearance</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-prompt)' }}>Dark Theme</span>
          </div>
          <DarkModeToggle />
        </div>

        {/* Mascot Message Widget */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-200 to-indigo-200 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative glass-card p-5 rounded-3xl border-white/50 bg-white/40 overflow-hidden">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl shadow-inner">💡</div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Daily Tip</span>
             </div>
             <p className="text-[11px] leading-relaxed font-medium italic opacity-70" style={{ color: 'var(--color-text-primary)' }}>
                 "การเรียนรู้ วันละนิด ดีกว่าการยัดเยียด ในวันเดียว"
             </p>
             
             {/* Decorative Background Icon */}
             <div className="absolute -right-2 -bottom-2 text-4xl opacity-5 grayscale">🦊</div>
          </div>
        </div>
        
        {/* App Version / Tagline */}
        <div className="mt-8 text-center">
           <p className="text-[9px] font-bold tracking-widest opacity-30 uppercase" style={{ fontFamily: 'var(--font-prompt)' }}>
             BitQuest v2.0 • Build 2024
           </p>
        </div>
      </div>
    </div>
  );
}
