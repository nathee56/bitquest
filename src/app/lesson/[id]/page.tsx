// ============================================
// BitQuest — Story-Style Lesson & Quiz Page
// With Sound FX, Haptics, Confetti, Level Up
// ============================================

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, LessonContent } from '@/lib/types';
import { defaultLessons } from '@/data/defaultLessons';
import { EXP_SUMMARY, EXP_IMAGE, EXP_QUIZ_CORRECT } from '@/lib/gamification';
import { playPop, playSuccess, playError, playLevelUp, playConfetti } from '@/lib/soundEffects';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticLevelUp } from '@/lib/haptics';
import MatchingGame from '@/components/MatchingGame';
import OrderingGame from '@/components/OrderingGame';

// === Confetti Particle (Enhanced) ===
function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#ff9a76', '#a78bfa', '#fbbf24', '#4ade80', '#60a5fa', '#f87171', '#fb923c', '#c084fc'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 400 - 200;
  const rotation = Math.random() * 1080 - 540;
  const size = 4 + Math.random() * 8;
  const shapes = ['rounded-sm', 'rounded-full', 'rounded-none'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const startX = Math.random() * 100; // spread across screen width

  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [0, -150, 600],
        x: [0, x / 2, x],
        opacity: [1, 1, 0],
        rotate: rotation,
        scale: [0.5, 1.3, 0.3],
      }}
      transition={{ duration: 2.5, delay, ease: 'easeOut' }}
      className={`absolute ${shape}`}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        top: '30%',
        left: `${startX}%`,
      }}
    />
  );
}

// === Skeleton Loader ===
function LessonSkeleton() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
      {/* Progress bar skeleton */}
      <div className="flex gap-1.5 px-5 pt-5 pb-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-lime-cream-dark)' }}
          >
            <div className="h-full w-1/3 shimmer-bg rounded-full" />
          </div>
        ))}
      </div>

      {/* Close / Counter skeleton */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div className="w-9 h-9 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
        <div className="w-12 h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 w-full max-w-md mx-auto px-5 flex flex-col justify-center items-center gap-4">
        <div className="glass-card p-6 w-full">
          <div className="w-10 h-10 rounded-full animate-pulse mb-4" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
          <div className="space-y-3">
            <div className="h-4 rounded-full w-full shimmer-bg" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
            <div className="h-4 rounded-full w-5/6 shimmer-bg" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
            <div className="h-4 rounded-full w-4/6 shimmer-bg" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
            <div className="h-4 rounded-full w-3/4 shimmer-bg" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
          </div>
        </div>
      </div>

      {/* Button skeleton */}
      <div className="w-full max-w-md mx-auto px-5 pb-8 pt-4">
        <div className="w-full h-14 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-lime-cream-dark)' }} />
      </div>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const { addEXP, completeLesson, firebaseUser, signInWithGoogle, updateConsecutiveCorrect, userProfile, deductHeart, addCoins, updateQuestProgress } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpTo, setLevelUpTo] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [miniGameCompleted, setMiniGameCompleted] = useState(false);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [fillBlankChecked, setFillBlankChecked] = useState<boolean | null>(null);
  const [expGained, setExpGained] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);

  // Fetch lesson from Firestore
  useEffect(() => {
    const fetchLesson = async () => {
      if (!db) {
        const localMatch = defaultLessons.find(l => l.id === lessonId);
        if (localMatch) setLesson(localMatch);
        setLoadingLesson(false);
        return;
      }
      try {
        const docRef = doc(db, 'lessons', lessonId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLesson({
            id: docSnap.id,
            ...docSnap.data(),
          } as Lesson);
        } else {
          // Fallback to local defaultLessons
          const localMatch = defaultLessons.find(l => l.id === lessonId);
          if (localMatch) setLesson(localMatch);
        }
      } catch (error) {
        // Fallback to local defaultLessons if Firebase fails (Guest Mode)
        const localMatch = defaultLessons.find(l => l.id === lessonId);
        if (localMatch) setLesson(localMatch);
      } finally {
        setLoadingLesson(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleExpGain = async (amount: number) => {
    setExpGained(amount);
    const result = await addEXP(amount);
    if (result.didLevelUp) {
      const milestone = result.newLevel === 2 && !firebaseUser;
      setLevelUpTo(result.newLevel);
      setShowLevelUp(true);
      setShowConfetti(true);
      setIsMilestone(milestone);
      playLevelUp();
      playConfetti();
      hapticLevelUp();

      // Only auto-close if NOT a milestone conversion moment
      if (!milestone) {
        setTimeout(() => {
          setShowConfetti(false);
          setShowLevelUp(false);
        }, 4000);
      }
    }
    setTimeout(() => setExpGained(0), 1200);
  };

  const goNext = useCallback(() => {
    if (!lesson) return;
    const currentContent = lesson.content[currentPage];
    const isLastPage = currentPage === lesson.content.length - 1;

    if (currentContent.type === 'quiz' && selectedAnswer === null) return;

    // Sound + Haptic on navigate
    playPop();
    hapticLight();

    if (isLastPage) {
      completeLesson(lessonId);
      if (addCoins) {
        addCoins(20); // Award 20 coins for completing
      }
      if (updateQuestProgress) {
        updateQuestProgress('complete_lessons', 1);
      }
      // Confetti + celebration on lesson complete
      setShowConfetti(true);
      playConfetti();
      hapticSuccess();
      setTimeout(() => {
        setShowConfetti(false);
        router.push('/');
      }, 1500);
      return;
    }

    // Award EXP for reading summary/image pages
    if (currentContent.type === 'summary') {
      handleExpGain(EXP_SUMMARY);
    } else if (currentContent.type === 'image') {
      handleExpGain(EXP_IMAGE);
    }

    setCurrentPage((p) => p + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(false);
    setMiniGameCompleted(false);
    setFillBlankAnswer('');
    setFillBlankChecked(null);
  }, [lesson, currentPage, selectedAnswer, completeLesson, lessonId, router, addEXP]);

  const goBack = useCallback(() => {
    if (currentPage > 0) {
      playPop();
      hapticLight();
      setCurrentPage((p) => p - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }, [currentPage]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goBack]);

  const handleAnswer = (optionIndex: number) => {
    if (!lesson) return;
    const currentContent = lesson.content[currentPage];
    if (selectedAnswer !== null) return;

    hapticMedium();
    setSelectedAnswer(optionIndex);

    if (currentContent.type === 'quiz') {
      const correct = optionIndex === currentContent.correctIndex;
      setIsCorrect(correct);
      
      // Update consecutive correct count for badges
      if (updateConsecutiveCorrect) {
        updateConsecutiveCorrect(correct);
      }

      if (correct) {
        // Correct answer: sound + haptic + confetti + EXP + Quest
        if (updateQuestProgress) {
          updateQuestProgress('perfect_combo', 1);
        }
        playSuccess();
        hapticSuccess();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        handleExpGain(EXP_QUIZ_CORRECT);
        // Notify Mascot
        window.dispatchEvent(new Event('mascot:correct'));
      } else {
        // Wrong answer: error sound + haptic + deduct heart
        playError();
        hapticError();
        if (deductHeart) {
          deductHeart();
        }
        // Notify Mascot
        window.dispatchEvent(new Event('mascot:wrong'));
      }
      setTimeout(() => setShowExplanation(true), 600);
    }
  };

  // === RENDER ===

  // Loading state — Skeleton
  if (loadingLesson) {
    return <LessonSkeleton />;
  }

  // No Hearts State
  if (userProfile && userProfile.hearts <= 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--color-lime-cream)', fontFamily: 'var(--font-prompt)' }}>
        <div className="text-7xl mb-4 float-animation opacity-90">💔</div>
        <p className="text-xl font-bold mb-2 text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>โธ่! หัวใจหมดแล้ว</p>
        <p className="text-sm mb-8 text-slate-500 text-center">ต้องรอสักพักเพื่อให้หัวใจฟื้นฟูนะ<br/>(ฟื้นฟู 1 ดวงทุกๆ 7 นาที)</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { playPop(); router.push('/'); }}
          className="btn-3d btn-3d-danger py-4 px-8 text-center text-lg shadow-xl"
          style={{ fontFamily: 'var(--font-mali)' }}
        >
          กลับหน้าหลัก
        </motion.button>
      </div>
    );
  }

  // Lesson not found
  if (!lesson) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: 'var(--color-lime-cream)', fontFamily: 'var(--font-prompt)' }}
      >
        <div className="text-5xl mb-4">😥</div>
        <p className="text-base font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          ไม่พบบทเรียน
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          บทเรียนนี้อาจถูกลบหรือไม่มีอยู่ในระบบ
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { playPop(); router.push('/'); }}
          className="px-6 py-3 rounded-2xl text-white text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
            boxShadow: '0 4px 16px rgba(232, 115, 74, 0.35)',
          }}
        >
          กลับหน้าหลัก
        </motion.button>
      </div>
    );
  }

  const totalPages = lesson.content.length;
  const currentContent = lesson.content[currentPage];
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
        {/* Confetti (Enhanced — more particles, wider spread) */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.03} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Popup (Epic Animation) */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            >
              <motion.div
                initial={{ scale: 0, rotateY: -90 }}
                animate={{ 
                  scale: 1,
                  rotateY: 0,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="glass-card p-10 text-center mx-6 relative overflow-hidden"
                style={{ background: 'rgba(255, 254, 249, 0.98)', maxWidth: '360px' }}
              >
                {/* Close Button (X) */}
                <button
                  onClick={() => {
                    setShowLevelUp(false);
                    setShowConfetti(false);
                    setIsMilestone(false);
                    playPop();
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:text-slate-600 active:scale-95 transition-all z-20"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>

                {/* Animated rings */}
                <motion.div
                  animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-[var(--radius-card)] border-4"
                  style={{ borderColor: 'var(--color-level-purple)' }}
                />
                <motion.div
                  animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                  className="absolute inset-0 rounded-[var(--radius-card)] border-4"
                  style={{ borderColor: 'var(--color-exp-gold)' }}
                />

                {/* Star burst */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  className="text-6xl mb-2"
                >
                  ⭐
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2
                    className="text-2xl font-black mb-2"
                    style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-level-purple)' }}
                  >
                    🎊 LEVEL UP! 🎊
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
                  className="my-4"
                >
                  <div
                    className="text-6xl font-black inline-block"
                    style={{
                      fontFamily: 'var(--font-mali)',
                      background: 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-level-purple))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Lv.{levelUpTo}
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm font-medium mb-6 px-4"
                  style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}
                >
                  {isMilestone 
                    ? "ว้าว! คุณเก่งมากจนเลเวล 2 แล้ว! ด่านต่อไปจะเริ่มยากขึ้น... อย่าลืมเซฟความสำเร็จไว้นะ! 🚀"
                    : "คุณเก่งมาก! พร้อมลุยด่านต่อไปแล้ว 🚀"}
                </motion.p>

                {/* --- Frictionless Conversion Injection --- */}
                {!firebaseUser && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="border-t pt-4"
                    style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                  >
                    <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      บันทึกความสำเร็จของคุณเดี๋ยวนี้! 🚀
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await signInWithGoogle();
                        } catch (error) {
                          console.error("Popup login failed", error);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mb-3"
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      }}
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-prompt)' }}>
                        เข้าสู่ระบบด้วย Google
                      </span>
                    </button>
                    
                    <button
                      onClick={() => router.push('/login')}
                      className="text-xs font-medium underline"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      เข้าสู่ระบบด้วยอีเมล
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating EXP */}
        <AnimatePresence>
          {expGained > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -50, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.5 }}
              className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            >
              <div 
                className="px-4 py-2 rounded-full shadow-lg"
                style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))', border: '1px solid rgba(245, 158, 11, 0.3)' }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-exp-gold)' }}
                >
                  +{expGained} EXP ✨
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Progress Bar */}
        <div className="flex px-6 pt-6 pb-2 w-full max-w-lg mx-auto">
          <div className="w-full h-4 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-100 shadow-inner p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.4)',
              }}
            >
              {/* Shine effect on progress bar */}
              <div 
                className="absolute top-0 bottom-0 left-0 w-full opacity-30" 
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', transform: 'skewX(-20deg)', animation: 'flowLight 2s infinite' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Close / Back Header */}
        <div className="flex items-center justify-between px-6 pb-4 w-full max-w-lg mx-auto">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { playPop(); hapticLight(); router.push('/'); }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 bg-white border-b-4 border-slate-200 text-slate-400 hover:text-slate-600"
          >
            <span className="text-xl font-bold">✕</span>
          </motion.button>
          
          <div className="flex items-center justify-center font-black text-slate-400 bg-white px-4 py-1.5 rounded-xl border-b-4 border-slate-100" style={{ fontFamily: 'var(--font-mali)' }}>
            <span className="text-slate-700">{currentPage + 1}</span>
            <span className="opacity-50 mx-1">/</span>
            <span className="opacity-70">{totalPages}</span>
          </div>
        </div>

        {/* Content Area - Presentation Slide centered on Desktop */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-5 lg:px-8 flex flex-col items-center justify-center py-6" onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const halfWidth = rect.width / 2;

          if (currentContent.type !== 'quiz' && currentContent.type !== 'matching' && currentContent.type !== 'ordering' && currentContent.type !== 'fill_blank') {
            if (clickX > halfWidth) goNext();
            else goBack();
          }
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col justify-center"
            >
              {/* Summary Content */}
              {currentContent.type === 'summary' && (
                <div className="flex-1 flex flex-col justify-center items-center pb-10">
                  <div className="bg-white p-8 md:p-16 rounded-[40px] border-b-8 border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] relative max-w-3xl w-full">
                    <motion.div 
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-100 border-4 border-white rounded-[24px] flex items-center justify-center text-4xl shadow-md"
                    >
                      📖
                    </motion.div>
                    <p
                      className="text-xl md:text-3xl leading-relaxed mt-6 font-medium text-slate-700 text-center"
                      style={{ fontFamily: 'var(--font-prompt)', lineHeight: '1.6' }}
                    >
                      {currentContent.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Image Content */}
              {currentContent.type === 'image' && (
                <div className="flex-1 flex flex-col justify-center items-center pb-10">
                  <div className="bg-white p-6 md:p-10 w-full max-w-4xl rounded-[40px] border-b-8 border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] text-center relative overflow-hidden">
                    {currentContent.imageUrl ? (
                      <div className="relative rounded-[32px] overflow-hidden border-4 border-slate-50 shadow-inner">
                        <img
                          src={currentContent.imageUrl}
                          alt="ภาพประกอบบทเรียน"
                          className="w-full max-h-[50vh] object-cover"
                        />
                      </div>
                    ) : (
                      <div className="py-24 bg-slate-50 rounded-[32px] border-4 border-dashed border-slate-200">
                        <div className="text-8xl mb-6 opacity-30">📸</div>
                        <p className="text-lg font-bold text-slate-400" style={{ fontFamily: 'var(--font-prompt)' }}>ภาพความรู้จะแสดงที่นี่</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Content */}
              {currentContent.type === 'quiz' && (
                <div className="flex-1 flex flex-col pt-4 max-w-4xl w-full mx-auto">
                  {/* Question */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 px-2">
                    <motion.div 
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="w-20 h-20 rounded-3xl bg-white border-b-4 border-slate-200 shadow-lg flex items-center justify-center flex-shrink-0 text-5xl"
                    >
                      🤔
                    </motion.div>
                    <div className="bg-white p-8 rounded-3xl md:rounded-bl-none border-b-8 border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-1 relative">
                       <h3
                        className="text-xl md:text-2xl font-bold leading-relaxed text-slate-700 text-center md:text-left"
                        style={{ fontFamily: 'var(--font-prompt)' }}
                      >
                        {currentContent.question}
                      </h3>
                    </div>
                  </div>

                  {/* Options: Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
                    {currentContent.options?.map((option, i) => {
                      let btnClass = "btn-3d btn-3d-white w-full text-left p-5 justify-start h-auto min-h-[80px]";
                      
                      if (selectedAnswer !== null) {
                        if (i === currentContent.correctIndex) {
                          btnClass = "btn-3d btn-3d-success w-full text-left p-5 justify-start border-transparent h-auto min-h-[80px]";
                        } else if (i === selectedAnswer && i !== currentContent.correctIndex) {
                          btnClass = "btn-3d btn-3d-danger w-full text-left p-5 justify-start border-transparent h-auto min-h-[80px]";
                        } else {
                          btnClass = "btn-3d btn-3d-white w-full text-left p-5 justify-start opacity-60 h-auto min-h-[80px]";
                        }
                      }

                      return (
                        <motion.button
                          key={i}
                          whileHover={selectedAnswer === null ? { x: 4 } : {}}
                          onClick={() => handleAnswer(i)}
                          className={btnClass}
                          disabled={selectedAnswer !== null}
                          style={{ fontFamily: 'var(--font-prompt)' }}
                        >
                          <div className="flex items-center gap-5 w-full relative">
                            {/* Option Letter Indicator */}
                            <span
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 border-2 transition-colors ${
                                selectedAnswer !== null && i === currentContent.correctIndex ? 'bg-white/20 border-white text-white' :
                                selectedAnswer === i && !isCorrect ? 'bg-white/20 border-white text-white' :
                                'bg-slate-50 border-slate-100 text-slate-400'
                              }`}
                            >
                              {selectedAnswer !== null && i === currentContent.correctIndex
                                ? '✓'
                                : selectedAnswer === i && !isCorrect
                                ? '✕'
                                : String.fromCharCode(65 + i)}
                            </span>
                            
                            <span 
                              className={`text-lg font-bold leading-snug ${
                                selectedAnswer !== null && (i === currentContent.correctIndex || selectedAnswer === i) ? 'text-white' : 'text-slate-600'
                              }`}
                            >
                              {option}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation Popup */}
                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="glass-card p-6 mt-8 shadow-xl"
                        style={{
                          background: isCorrect ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                          borderLeft: `8px solid ${isCorrect ? 'var(--color-quiz-correct)' : 'var(--color-quiz-incorrect)'}`,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{isCorrect ? '✅' : '💡'}</div>
                          <div>
                            <p className="text-sm font-black mb-1 uppercase tracking-widest" style={{ fontFamily: 'var(--font-prompt)', color: isCorrect ? 'var(--color-quiz-correct)' : 'var(--color-quiz-incorrect)' }}>
                              {isCorrect ? 'ถูกเผงเลย!' : 'มาดูคำอธิบายกัน'}
                            </p>
                            <p className="text-base font-medium text-slate-700" style={{ fontFamily: 'var(--font-prompt)' }}>
                              {currentContent.explanation}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Matching Game Content */}
              {currentContent.type === 'matching' && currentContent.matchPairs && (
                <div className="flex-1 flex flex-col justify-center items-center pb-10 w-full">
                  <div className="bg-white p-6 md:p-10 rounded-[40px] border-b-8 border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] w-full max-w-3xl">
                    <MatchingGame
                      pairs={currentContent.matchPairs}
                      explanation={currentContent.explanation}
                      onComplete={(allCorrect) => {
                        if (allCorrect) {
                          playSuccess();
                          hapticSuccess();
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 2000);
                          handleExpGain(EXP_QUIZ_CORRECT);
                          if (updateQuestProgress) updateQuestProgress('perfect_combo', 1);
                        }
                        setMiniGameCompleted(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Fill in the Blank Content */}
              {currentContent.type === 'fill_blank' && (
                <div className="flex-1 flex flex-col justify-center items-center pb-10 w-full">
                  <div className="bg-white p-6 md:p-10 rounded-[40px] border-b-8 border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] w-full max-w-3xl text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg md:text-xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'var(--font-prompt)' }}>
                      {currentContent.sentence?.split('___').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            fillBlankChecked !== null ? (
                              <span className={`inline-block px-3 py-1 mx-1 rounded-xl font-black border-2 ${fillBlankChecked ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-rose-100 border-rose-300 text-rose-700'}`}>
                                {fillBlankChecked ? fillBlankAnswer : currentContent.blankAnswer}
                              </span>
                            ) : (
                              <span 
                                onClick={() => setFillBlankAnswer('')} 
                                className={`inline-block border-b-4 border-dashed px-3 mx-1 min-w-[80px] text-center cursor-pointer transition-colors ${fillBlankAnswer ? 'border-indigo-500 font-bold text-indigo-600 bg-indigo-50 rounded-lg' : 'border-slate-300'}`}
                              >
                                {fillBlankAnswer || ' '}
                              </span>
                            )
                          )}
                        </span>
                      ))}
                    </p>

                    {fillBlankChecked === null && (
                      <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-lg mx-auto">
                        {/* Options Wrapper */}
                        <div className="flex flex-wrap justify-center gap-3 w-full">
                          {(currentContent.options || [currentContent.blankAnswer || '']).map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setFillBlankAnswer(opt)}
                              className={`px-5 py-3 rounded-2xl border-2 font-bold transition-all active:scale-95 text-lg shadow-[0_4px_12px_rgba(0,0,0,0.03)] ${fillBlankAnswer === opt ? 'bg-indigo-100 border-indigo-500 text-indigo-700 scale-105 shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                              style={{ fontFamily: 'var(--font-prompt)' }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {/* Check Answer Button */}
                        <button
                          onClick={() => {
                            if (!fillBlankAnswer.trim()) return;
                            const correct = fillBlankAnswer.trim().toLowerCase() === (currentContent.blankAnswer || '').toLowerCase();
                            setFillBlankChecked(correct);
                            if (correct) {
                              playSuccess(); hapticSuccess();
                              setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000);
                              handleExpGain(EXP_QUIZ_CORRECT);
                              if (updateQuestProgress) updateQuestProgress('perfect_combo', 1);
                            } else {
                              playError(); hapticError();
                              if (deductHeart) deductHeart();
                            }
                            setMiniGameCompleted(true);
                          }}
                          disabled={!fillBlankAnswer.trim()}
                          className="w-full py-4 bg-indigo-500 text-white font-black text-xl rounded-2xl disabled:opacity-40 disabled:bg-slate-300 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                          style={{ fontFamily: 'var(--font-mali)' }}
                        >
                          ตรวจคำตอบ
                        </button>
                      </div>
                    )}

                    {fillBlankChecked !== null && (
                      <div className={`mt-4 p-4 rounded-2xl ${fillBlankChecked ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                        <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-prompt)', color: fillBlankChecked ? '#16a34a' : '#dc2626' }}>
                          {fillBlankChecked ? '✅ ถูกต้อง!' : `❌ คำตอบที่ถูกคือ "${currentContent.blankAnswer}"`}
                        </p>
                        {currentContent.explanation && (
                          <p className="text-xs text-slate-600 mt-1" style={{ fontFamily: 'var(--font-prompt)' }}>{currentContent.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ordering Game Content */}
              {currentContent.type === 'ordering' && currentContent.correctOrder && (
                <div className="flex-1 flex flex-col justify-center items-center pb-10 w-full">
                  <div className="bg-white p-6 md:p-10 rounded-[40px] border-b-8 border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] w-full max-w-3xl">
                    <OrderingGame
                      correctOrder={currentContent.correctOrder}
                      explanation={currentContent.explanation}
                      onComplete={(allCorrect) => {
                        if (allCorrect) {
                          playSuccess();
                          hapticSuccess();
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 2000);
                          handleExpGain(EXP_QUIZ_CORRECT);
                          if (updateQuestProgress) updateQuestProgress('perfect_combo', 1);
                        }
                        setMiniGameCompleted(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Action Area (Always rendering a placeholder or the true button based on state) */}
        <div className="w-full max-w-4xl mx-auto px-6 py-8 pb-12">
          {((currentContent.type === 'quiz' && selectedAnswer !== null) || 
            (currentContent.type === 'matching' && miniGameCompleted) ||
            (currentContent.type === 'fill_blank' && miniGameCompleted) ||
            (currentContent.type === 'ordering' && miniGameCompleted) ||
            (currentContent.type !== 'quiz' && currentContent.type !== 'matching' && currentContent.type !== 'fill_blank' && currentContent.type !== 'ordering')) ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex justify-center"
            >
              <button
                onClick={goNext}
                className={`btn-3d w-full max-w-md py-5 text-xl font-black uppercase tracking-wider ${
                  isCorrect && currentContent.type === 'quiz' ? 'btn-3d-success' :
                  !isCorrect && currentContent.type === 'quiz' ? 'btn-3d-danger' :
                  'btn-3d-primary'
                }`}
                style={{ fontFamily: 'var(--font-mali)' }}
              >
                {isLastPage 
                  ? '👑 ด่านต่อไป! (เสร็จสิ้น)' 
                  : currentContent.type === 'quiz'
                    ? (isCorrect ? 'ไปต่อเบยยย! ↗' : 'โอเค เข้าใจละ ↗')
                    : 'ถัดไป ↗'
                }
              </button>
            </motion.div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-md py-5 text-center text-base font-bold text-slate-400 bg-white/50 rounded-3xl border-4 border-slate-100 border-dashed" style={{ fontFamily: 'var(--font-prompt)' }}>
                กรุณาเลือกคำตอบ ด้านบน 👆
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
