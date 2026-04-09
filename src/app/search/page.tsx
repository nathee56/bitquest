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
      className="min-h-screen pb-28"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}>
            🔍 ค้นหาบทเรียน
          </h1>

          {/* Search Input */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(255, 254, 249, 0.9)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="พิมพ์ชื่อบทเรียน..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}
            />
            {query && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuery('')}
                style={{ color: 'var(--color-text-muted)' }}
              >
                ✕
              </motion.button>
            )}
          </div>

          {/* Subject Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {subjects.map((s) => (
              <motion.button
                key={s.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSubject(s.value)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all"
                style={{
                  fontFamily: 'var(--font-prompt)',
                  backgroundColor: activeSubject === s.value ? 'var(--color-burnt-orange)' : 'rgba(255, 254, 249, 0.8)',
                  color: activeSubject === s.value ? 'white' : 'var(--color-text-secondary)',
                  border: activeSubject === s.value ? 'none' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: activeSubject === s.value ? '0 2px 12px rgba(232, 115, 74, 0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="px-5">
          {loadingLessons ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-10 h-10 rounded-full mx-auto mb-3"
                style={{
                  background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
                }}
              />
              <p className="text-sm" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
                กำลังโหลด...
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
                พบ {filtered.length} Quest
              </p>
              <AnimatePresence>
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
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
                    ไม่พบบทเรียนที่ค้นหา
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav />
      </motion.div>
  );
}
