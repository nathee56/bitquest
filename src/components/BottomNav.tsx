'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

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
    href: '/leaderboard',
    label: 'อันดับ',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 21H16M12 17V21M7 4H17M17 4C17 4 19 4 19 7C19 10 17 10 17 10H15M7 4C7 4 5 4 5 7C5 10 7 10 7 10H9M15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10M15 10H9"
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
    href: '/shop',
    label: 'ร้านค้า',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H5L5.4 5M5.4 5H21L19 13H7M5.4 5L7 13M7 13L4 18H20M10 21C10 21.5523 9.55228 22 9 22C8.44772 22 8 21.5523 8 21C8 20.4477 8.44772 20 9 20C9.55228 20 10 20.4477 10 21ZM19 21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21C17 20.4477 17.4477 20 18 20C18.5523 20 19 20.4477 19 21Z" stroke={active ? '#e8734a' : '#a39e98'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bottom-nav md:hidden">
      <motion.nav
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
        className="mx-4 mb-4 px-6 py-3 flex items-center justify-around"
        style={{
          background: 'rgba(255, 254, 249, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 -2px 24px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className="relative">
                  {item.icon(isActive)}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-burnt-orange)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    color: isActive ? 'var(--color-burnt-orange)' : 'var(--color-text-muted)',
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
