// ============================================
// BitQuest — Search Page (Firestore-backed)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, SubjectType } from '@/lib/types';
import { defaultLessons } from '@/data/defaultLessons';
import LessonCard from '@/components/LessonCard';
import BottomNav from '@/components/BottomNav';

const subjects: { label: string; value: string }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ประวัติศาสตร์', value: 'ประวัติศาสตร์' },
  { label: 'ภาษาอังกฤษ', value: 'ภาษาอังกฤษ' },
  { label: 'วิทยาศาสตร์', value: 'วิทยาศาสตร์' },
  { label: 'การเงิน', value: 'การเงิน' },
  { label: 'สังคมศึกษา', value: 'สังคมศึกษา' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('all');
  const { userProgress } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  // Fetch lessons from Firestore
  useEffect(() => {
    const fetchLessons = async () => {
      if (!db) {
        setLessons(defaultLessons);
        setLoadingLessons(false);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, 'lessons'));
        if (snapshot.empty) {
          setLessons(defaultLessons);
        } else {
          const fetched: Lesson[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Lesson[];
          setLessons(fetched);
        }
      } catch (error) {
        setLessons(defaultLessons);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, []);

  const filtered = lessons.filter((lesson) => {
    const matchesQuery = query === '' || lesson.title.toLowerCase().includes(query.toLowerCase());
    const matchesSubject = activeSubject === 'all' || lesson.subject === activeSubject;
    return matchesQuery && matchesSubject;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-28 md:pb-12"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
      <div className="max-w-7xl mx-auto px-5 pt-8 md:pt-12">
        {/* Header Section */}
        <div className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-bold mb-2" 
            style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}
          >
            ค้นหาการผจญภัย 🔍
          </motion.h1>
          <p className="text-sm md:text-base opacity-60 max-w-2xl" style={{ fontFamily: 'var(--font-prompt)' }}>
            ค้นหาบทเรียนและเควสที่คุณต้องการ เริ่มต้นการเรียนรู้ที่สนุกสนานและท้าทายได้ที่นี่
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-12 sticky top-4 z-40">
          <div 
            className="glass-card p-2 md:p-3 flex flex-col md:flex-row gap-4 items-center"
            style={{ 
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Search Input Group */}
            <div className="relative flex-1 w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาบทเรียน หรือ หัวข้อที่คุณสนใจ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-gray-50/50 rounded-2xl outline-none border border-transparent focus:border-orange-200 focus:bg-white transition-all text-base"
                style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Subject Chips (Tablet/Desktop) */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {subjects.map((s) => (
                <motion.button
                  key={s.value}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSubject(s.value)}
                  className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    backgroundColor: activeSubject === s.value ? 'var(--color-burnt-orange)' : 'white',
                    color: activeSubject === s.value ? 'white' : 'var(--color-text-secondary)',
                    border: activeSubject === s.value ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    boxShadow: activeSubject === s.value ? '0 8px 16px rgba(232, 115, 74, 0.25)' : 'none',
                  }}
                >
                  {s.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-gray-500" style={{ fontFamily: 'var(--font-prompt)' }}>
            {filtered.length} บทเรียนที่พบ
          </p>
        </div>

        {/* Grid Container — Responsive: Full-width Feed on Mobile, Grid on Desktop */}
        {loadingLessons ? (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full mb-4"
            />
            <p className="font-medium text-gray-400" style={{ fontFamily: 'var(--font-prompt)' }}>กำลังเตรียมบทเรียน...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 md:gap-8 -mx-5 md:mx-0">
            <AnimatePresence mode="popLayout">
              {filtered.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isCompleted={(userProgress?.completedLessons || []).includes(lesson.id)}
                />
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-20 text-center"
              >
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-mali)' }}>ไม่พบการผจญภัยที่ระบุ</h3>
                <p className="text-gray-400 max-w-xs mx-auto text-sm" style={{ fontFamily: 'var(--font-prompt)' }}>
                  ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะ พยายามเข้านักสำรวจ!
                </p>
                <button 
                  onClick={() => {setQuery(''); setActiveSubject('all');}}
                  className="mt-6 text-orange-600 font-bold text-sm underline md:hover:text-orange-700"
                  style={{ fontFamily: 'var(--font-prompt)' }}
                >
                  แสดงทั้งหมด
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </motion.div>
  );
}
