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
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r"
         style={{
           backgroundColor: 'var(--color-lime-cream)',
           borderColor: 'rgba(0,0,0,0.05)',
           zIndex: 50,
         }}
    >
      <div className="p-6">
        <div 
          className="flex items-center gap-3 mb-8" 
        >
          <Image
            src="/logo.png"
            alt="BitQuest Logo"
            width={140}
            height={70}
            className="object-contain"
          />
        </div>
        <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>เรียนรู้เงียบๆ เติบโตเจี๊ยบๆ 🐥</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgba(232, 115, 74, 0.1)' : 'transparent',
                }}
              >
                <div className="relative">
                  {item.icon(isActive)}
                </div>
                <span
                  className="font-medium"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    color: isActive ? 'var(--color-burnt-orange)' : 'var(--color-text-secondary)',
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section with Dark Mode and Quote */}
      <div className="p-6 mt-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-prompt)' }}>โหมดกลางคืน</span>
          <DarkModeToggle />
        </div>
        <div className="glass-card p-4 rounded-2xl text-center">
            <div className="text-3xl mb-2">💡</div>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                "การเรียนรู้ วันละนิด ดีกว่าการยัดเยียด ในวันเดียว"
            </p>
        </div>
      </div>
    </div>
  );
}
