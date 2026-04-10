// ============================================
// BitQuest — Smart Feed Dashboard
// Unlocked for Guest Mode (Try Before Login)
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/lib/types';
import { defaultLessons } from '@/data/defaultLessons';
import Image from 'next/image';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import LearningPath from '@/components/LearningPath';
import BottomNav from '@/components/BottomNav';
import Mascot from '@/components/Mascot';
import VisitorCounter from '@/components/VisitorCounter';
import DailyQuestsWidget from '@/components/DailyQuestsWidget';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { playPop } from '@/lib/soundEffects';
import { hapticLight } from '@/lib/haptics';
import { Swords } from 'lucide-react';

export default function HomePage() {
  const { 
    userProfile, 
    userProgress, 
    firebaseUser,
    loading: authLoading, 
    showDailyNotice, 
    setDailyNotice,
    signInWithGoogle
  } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const router = useRouter();
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showFirstLessonLoginPrompt, setShowFirstLessonLoginPrompt] = useState(false);

  // Trigger login prompt after completing first lesson
  useEffect(() => {
    if (!authLoading && !firebaseUser && userProgress?.completedLessons?.length === 1) {
      if (!localStorage.getItem('has_seen_first_lesson_login')) {
        const timer = setTimeout(() => {
          setShowFirstLessonLoginPrompt(true);
          localStorage.setItem('has_seen_first_lesson_login', 'true');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, firebaseUser, userProgress]);

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
          // Fallback to default mock data if DB is empty
          setLessons(defaultLessons);
        } else {
          const fetchedLessons: Lesson[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Lesson[];
          setLessons(fetchedLessons);
        }
      } catch (error) {
        // Fallback to mock data if not connected properly (Guest Mode)
        console.warn('Using offline default lessons (Firebase connection failed or not established).');
        setLessons(defaultLessons);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, []);

  const isNewGuest = !firebaseUser && (!userProgress || userProgress.completedLessons.length === 0);

  if (isNewGuest) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-[100dvh] flex flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg, #fff8f0 0%, #f5f7e8 30%, #ede9fe 70%, #fef3c7 100%)' }}
      >
        {/* Shared Background Map */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ 
            backgroundImage: "url('/bg-map.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* --- MOBILE (LEGACY) WELCOME PAGE --- */}
        <div className="md:hidden relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="mb-12"
           >
              <Image src="/logo.png" alt="Logo" width={180} height={90} className="mx-auto" />
              <div className="mt-4 px-4 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full inline-block">GUEST MODE</div>
           </motion.div>

           <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="space-y-4 mb-16"
           >
              <h1 className="text-5xl font-black" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-burnt-orange)' }}>
                ยินดีต้อนรับ!
              </h1>
              <p className="text-slate-600 text-lg font-medium" style={{ fontFamily: 'var(--font-prompt)' }}>
                เริ่มการสำรวจโลกความรู้แบบ <span className="font-bold text-indigo-500">Gamified</span> ได้เลย นักสำรวจ!
              </p>
           </motion.div>

           <motion.div 
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="w-full space-y-4"
           >
             <button
               onClick={() => { playPop(); hapticLight(); router.push('/lesson/unit1-l1-alarm'); }}
               className="w-full py-5 rounded-[32px] bg-orange-500 text-white font-black text-xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
               style={{ fontFamily: 'var(--font-mali)' }}
             >
               🚀 เข้าสู่การผจญภัย
             </button>
             <button
               onClick={() => router.push('/login')}
               className="w-full py-4 text-slate-400 font-bold text-sm"
               style={{ fontFamily: 'var(--font-prompt)' }}
             >
               ฉันมีบัญชีผู้ใช้อยู่แล้ว
             </button>
           </motion.div>
        </div>

        {/* --- PC & TABLET (REDESIGN) WELCOME PAGE --- */}
        <div className="hidden md:flex relative z-10 flex-1 flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 gap-12 lg:gap-20">
          {/* Left Side: Modern Hero */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex-1 text-left space-y-8"
          >
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                LEVEL UP YOUR KNOWLEDGE ✨
              </div>
              <h1
                className="text-6xl lg:text-8xl font-black mb-4 tracking-tight leading-none"
                style={{
                  fontFamily: 'var(--font-mali)',
                  background: 'linear-gradient(135deg, #e8734a, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BitQuest
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-lg" style={{ fontFamily: 'var(--font-prompt)' }}>
                เปลี่ยนการเรียนรู้ประวัติศาสตร์และภาษาอังกฤษ <br />
                ให้สนุกเหมือน <span className="text-orange-500 font-bold">เล่นเกม RPG!</span>
              </p>
            </div>

            <div className="flex gap-4">
               {['EXP System', 'Daily Quests', 'Boss Fights'].map((tag, i) => (
                 <span key={i} className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 text-[10px] font-black uppercase text-slate-400">
                   {tag}
                 </span>
               ))}
            </div>

            <div className="flex flex-row gap-4 max-w-md">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(232, 115, 74, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playPop(); hapticLight(); router.push('/lesson/unit1-l1-alarm'); }}
                className="flex-1 py-5 rounded-3xl text-white font-black text-xl shadow-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ff9a76, #e8734a)',
                  fontFamily: 'var(--font-mali)',
                }}
              >
                🚀 เริ่มเลย! (ฟรี)
              </motion.button>
              
              <button
                onClick={() => { playPop(); router.push('/login'); }}
                className="flex-1 py-5 rounded-3xl bg-white/80 border-2 border-slate-100 text-slate-700 font-bold text-lg hover:bg-white transition-all shadow-sm"
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                มีบัญชีแล้ว
              </button>
            </div>
          </motion.div>

          {/* Right Side: Visual Preview */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex-1 w-full max-w-md relative"
          >
            <div className="relative aspect-square">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse" />
               <motion.div 
                 animate={{ y: [0, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                 className="relative z-10 glass-card p-6 rounded-[40px] shadow-2xl overflow-hidden"
               >
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">🐥</div>
                    <div>
                      <div className="w-24 h-3 bg-slate-100 rounded-full mb-2" />
                      <div className="w-16 h-2 bg-slate-50 rounded-full" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="h-40 bg-slate-50 rounded-3xl" />
                    <div className="flex gap-2">
                      <div className="flex-1 h-3 rounded-full bg-orange-400" />
                      <div className="flex-1 h-3 rounded-full bg-slate-100" />
                    </div>
                 </div>
               </motion.div>
               <div className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-4xl animate-bounce">⚔️</div>
               <div className="absolute -bottom-5 -left-10 w-20 h-20 bg-amber-400 rounded-full shadow-lg flex items-center justify-center text-3xl rotate-12">🪙</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // === Authenticated Dashboard ===
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen relative md:pl-0" // md:pl-64 is handled by root layout
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
      {/* Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ 
          backgroundImage: "url('/bg-map.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto pb-20">
        <Header
          displayName={userProfile?.displayName || 'นักสำรวจ'}
          streakCount={userProfile?.streakCount || 0}
        />

        {/* --- Bento Dashboard Widgets --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 md:px-8 mt-6">
          
          {/* Boss Battle Banner (Compact on Mobile, Large on Desktop) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/boss')}
            className="lg:col-span-7 rounded-[32px] md:rounded-[40px] overflow-hidden cursor-pointer relative shadow-xl hand-drawn-border group"
            style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              minHeight: '140px'
            }}
          >
             <div className="absolute inset-0 bg-white/10 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'1\' fill=\'%23ffffff\'/%3E%3C/svg%3E")' }} />
             <div className="relative p-6 md:p-10 flex flex-row items-center justify-between h-full z-10 gap-4 md:gap-8">
                <div className="text-left flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black mb-2 backdrop-blur-md">
                    🔥 BOSS EVENT
                  </div>
                  <h2 className="text-xl md:text-5xl font-black text-white mb-1 md:mb-3 tracking-wide leading-tight" style={{ fontFamily: 'var(--font-mali)' }}>
                    บอสแห่งความมืด <br className="md:hidden" /> กำลังมา! 👾
                  </h2>
                  <p className="text-indigo-100 text-[10px] md:text-lg font-bold tracking-wider opacity-80 uppercase">Time Attack Mode</p>
                </div>
                <div className="w-20 h-20 md:w-40 md:h-40 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-4xl md:text-7xl shadow-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                  👾
                </div>
             </div>
          </motion.div>

          {/* Daily Quests Widget (Hidden on Mobile) */}
          <div className="hidden md:block lg:col-span-5">
            <DailyQuestsWidget />
          </div>
          
        </div>

        {/* Stats Section Overlay for Desktop */}
         <div className="hidden lg:block px-8 mt-12 mb-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
               <h3 className="text-xl font-black text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>🗺️ เส้นทางการสำรวจของคุณ</h3>
               <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                    <p className="text-lg font-bold">{(userProgress?.completedLessons || []).length} Quests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total EXP</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-exp-gold)' }}>{userProfile?.currentEXP || 0}</p>
                  </div>
               </div>
            </div>
         </div>
      
        {/* Learning Path */}
        <div className="md:px-8">
          <LearningPath
            lessons={lessons}
            completedLessons={userProgress?.completedLessons || []}
            loading={loadingLessons}
          />
        </div>
        
        {/* Visitor Counter */}
        <div className="px-8 mt-12">
          <VisitorCounter />
        </div>
      </div>

      <BottomNav />
      <Mascot />

      {/* Floating Daily Quests FAB (Mobile Only) */}
      <motion.button
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowDailyModal(true)}
        className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-orange-50 flex items-center justify-center text-3xl z-50"
      >
        🎯
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
          {userProfile?.dailyQuests?.filter(q => q.completed && !q.claimed).length || 0}
        </div>
      </motion.button>

      {/* Daily Quests Modal (Mobile Only) */}
      <AnimatePresence>
        {showDailyModal && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDailyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-6 pb-12 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" onClick={() => setShowDailyModal(false)} />
              <DailyQuestsWidget />
              <button
                onClick={() => setShowDailyModal(false)}
                className="w-full py-4 mt-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                ปิดหน้าต่างนี้
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Daily Reward Notification */}
      <AnimatePresence>
        {showDailyNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="glass-card w-full max-w-sm p-8 text-center relative overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.98)', borderRadius: '32px' }}
            >
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}>
                รางวัลล็อกอินรายวัน!
              </h3>
              <p className="text-sm mb-6" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}>
                วันนี้คุณได้รับโบนัสพลังงานเพื่อเริ่มการสำรวจ
              </p>

              <div 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl mb-8"
                style={{ backgroundColor: 'rgba(232, 115, 74, 0.1)' }}
              >
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-burnt-orange)' }}>
                  +50 EXP ✨
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDailyNotice(false)}
                className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
                  fontFamily: 'var(--font-prompt)',
                }}
              >
                รับทราบ! ลุยเลย 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* First Lesson Completed Login Prompt */}
      <AnimatePresence>
        {showFirstLessonLoginPrompt && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowFirstLessonLoginPrompt(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-sm p-8 text-center relative overflow-hidden z-10"
              style={{ background: 'rgba(255, 255, 255, 0.98)', borderRadius: '32px' }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-black mb-2" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}>
                สุดยอด! ผ่านด่านแรกแล้ว
              </h3>
              <p className="text-sm mb-6" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}>
                ล็อกอินด้วย Google ตอนนี้เพื่อบันทึกความคืบหน้าให้ปลอดภัย และปลดล็อคการตีดันเจี้ยนบอส!
              </p>

              <button
                onClick={async () => {
                   setShowFirstLessonLoginPrompt(false);
                   await signInWithGoogle();
                }}
                className="w-full py-4 rounded-2xl bg-white text-slate-700 font-bold text-base shadow-sm border border-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all mb-4 hover:bg-slate-50"
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                ล็อกอินด้วย Google
              </button>

              <button
                onClick={() => setShowFirstLessonLoginPrompt(false)}
                className="text-slate-400 font-bold text-sm tracking-wide"
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                ข้ามไปก่อน
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
