// ============================================
// BitQuest — Learning Path Component
// Winding snake layout for nodes (Duolingo Style)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson } from '@/lib/types';
import PathNode from './PathNode';

interface LearningPathProps {
  lessons: Lesson[];
  completedLessons: string[];
  loading?: boolean;
}

export default function LearningPath({ lessons, completedLessons, loading }: LearningPathProps) {
  // --- Active Unit Initialization ---
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);

  // --- NEW LOGIC: Group into Units ---
  const units: { title: string, subtitle: string, subject: string, lessons: Lesson[], startIndex: number }[] = [];
  let currentGroup: Lesson[] = [];
  let currentSubject = '';
  let unitCount = 1;
  let currentStartIndex = 0;

  lessons.forEach((lesson, i) => {
    if (lesson.subject !== currentSubject) {
      if (currentGroup.length > 0) {
        units.push({
          title: `ภารกิจหลัก: หน่วยที่ ${unitCount}`,
          subtitle: currentSubject === 'ความรู้ทั่วไป' ? 'อุ่นเครื่องสมอง 💡' : currentSubject === 'สังคมศึกษา' ? 'เอาตัวรอดในสังคม 🛡️' : 'ปริศนาประวัติศาสตร์ 🏺',
          subject: currentSubject,
          lessons: currentGroup,
          startIndex: currentStartIndex
        });
        unitCount++;
      }
      currentSubject = lesson.subject;
      currentGroup = [];
      currentStartIndex = i;
    }
    currentGroup.push(lesson);
  });

  if (currentGroup.length > 0) {
    units.push({
      title: `ภารกิจหลัก: หน่วยที่ ${unitCount}`,
      subtitle: currentSubject === 'ความรู้ทั่วไป' ? 'อุ่นเครื่องสมอง 💡' : currentSubject === 'สังคมศึกษา' ? 'เอาตัวรอดในสังคม 🛡️' : 'ปริศนาประวัติศาสตร์ 🏺',
      subject: currentSubject,
      lessons: currentGroup,
      startIndex: currentStartIndex
    });
  }

  useEffect(() => {
    if (units.length > 0 && lessons.length > 0) {
      const firstIncompleteGlobal = lessons.findIndex(l => !completedLessons.includes(l.id));
      const targetGlobal = firstIncompleteGlobal === -1 ? lessons.length - 1 : firstIncompleteGlobal;
      
      const activeUIndex = units.findIndex(u => 
        targetGlobal >= u.startIndex && 
        targetGlobal < u.startIndex + u.lessons.length
      );
      
      setCurrentUnitIndex(activeUIndex === -1 ? 0 : activeUIndex);
    }
  }, [lessons, completedLessons]); // React requires deps to mostly match what's used inside that comes from outside. units.length is stable relative to lessons.

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-20 h-20 rounded-full bg-white/50 animate-pulse shadow-inner" />
        ))}
      </div>
    );
  }

  const getStatus = (lesson: Lesson, globalIndex: number) => {
    if (completedLessons.includes(lesson.id)) return 'completed';
    const firstIncompleteIndex = lessons.findIndex(l => !completedLessons.includes(l.id));
    
    if (firstIncompleteIndex === -1 && globalIndex === 0) return 'active';
    if (globalIndex === firstIncompleteIndex) return 'active';
    if (globalIndex > firstIncompleteIndex && firstIncompleteIndex !== -1) return 'locked';
    return 'locked';
  };

  const getOffset = (index: number) => {
    return { x: 0 };
  };

  const activeUnit = units[currentUnitIndex] || null;

  if (!activeUnit) return null;

  // --- Progress calculating for ONLY THIS UNIT ---
  const firstIncompleteInUnit = activeUnit.lessons.findIndex(l => !completedLessons.includes(l.id));
  const progressPercent = firstIncompleteInUnit === -1 
    ? 100 
    : (firstIncompleteInUnit / (activeUnit.lessons.length - 1)) * 100;
  
  const isNextUnitLocked = currentUnitIndex === units.length - 1 || firstIncompleteInUnit !== -1;

  return (
    <div className="relative flex flex-col items-center py-10 pb-48 overflow-x-hidden min-h-screen">
      {/* --- Unit Header (Dinamic) --- */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeUnit.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full px-5 mb-16 relative z-10"
        >
          <div className="unit-header relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-mali)' }}>
                {activeUnit.title}
              </h2>
              <p className="text-white/90 font-bold text-sm" style={{ fontFamily: 'var(--font-prompt)' }}>
                {activeUnit.subtitle}
              </p>
            </div>
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative flex flex-col gap-24 items-center w-full px-10">
        <div className="path-line-container">
          <div className="path-line-bg" />
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${progressPercent}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="path-line-active" 
          />
        </div>

        {/* Render Lessons for ACTIVE UNIT */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`nodes-${currentUnitIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-24 items-center w-full"
          >
            {activeUnit.lessons.map((lesson, index) => {
              const globalIndex = activeUnit.startIndex + index;
              const status = getStatus(lesson, globalIndex);
              const position = getOffset(index);
              const isBoss = index === activeUnit.lessons.length - 1;
              
              return (
                <PathNode
                  key={lesson.id}
                  lesson={lesson}
                  status={status}
                  position={position}
                  isBoss={isBoss}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Ending Trophy / Next Unit Trigger */}
        <div className="mt-8 flex flex-col items-center relative z-10 w-full max-w-sm px-4">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl shadow-xl border-4 border-slate-200 z-10"
          >
            🏆
          </motion.div>
          <div className="mt-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-white/50 mb-12">
            <p className="font-black text-sm uppercase text-slate-500" style={{ fontFamily: 'var(--font-prompt)' }}>
              จบด่าน: {activeUnit.title}
            </p>
          </div>

          {/* Unit Navigators */}
          <div className="flex justify-between w-full mt-4 gap-4">
            <button
              onClick={() => setCurrentUnitIndex(Math.max(0, currentUnitIndex - 1))}
              disabled={currentUnitIndex === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                currentUnitIndex === 0 
                  ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed' 
                  : 'bg-white text-slate-700 shadow-md active:scale-95'
              }`}
              style={{ fontFamily: 'var(--font-mali)' }}
            >
              ⬅️ ย้อนกลับ
            </button>
            <button
              onClick={() => !isNextUnitLocked && setCurrentUnitIndex(Math.min(units.length - 1, currentUnitIndex + 1))}
              disabled={isNextUnitLocked}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                isNextUnitLocked 
                  ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed' 
                  : 'bg-white text-slate-700 shadow-md active:scale-95 hover:bg-slate-50'
              }`}
              style={{ fontFamily: 'var(--font-mali)' }}
            >
              {firstIncompleteInUnit !== -1 && currentUnitIndex !== units.length - 1 ? '🔒 ล็อกอยู่' : 'ถัดไป ➡️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
