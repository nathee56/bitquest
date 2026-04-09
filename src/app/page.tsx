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
    setDailyNotice 
  } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const router = useRouter();

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
        {/* Background Map Image - optimized fixed background */}
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{ 
            backgroundImage: "url('/bg-map.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed', // Can still cause jank on some mobile, but better isolated to a pseudo element
          }}
        />

        {/* === Animated Background === */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Gradient orbs - removed expensive blur filters */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            className="absolute top-[-60px] left-[-40px] w-80 h-80 rounded-full opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(253, 230, 138, 0.4) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            className="absolute bottom-[-40px] right-[-60px] w-96 h-96 rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(255, 154, 118, 0.4) 0%, transparent 70%)' }}
          />

          {/* Floating emoji particles */}
          {['💡', '📖', '⭐', '🏛️', '⚖️', '🧠', '🎯', '🔥'].map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.5, 0],
                y: [0, -120 - Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                repeat: Infinity,
                duration: 10 + Math.random() * 5,
                delay: i * 1.5,
                ease: 'linear',
              }}
              className="absolute text-2xl"
              style={{
                left: `${10 + i * 11}%`,
                bottom: '5%',
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* === Main Content === */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 z-10 py-12">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-md mx-auto w-full"
          >
            {/* Logo area with orbiting icons */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                className="absolute inset-[-20px]"
              >
                {['🏛️', '📖', '⚖️', '💡'].map((e, i) => (
                  <div
                    key={i}
                    className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-lg"
                    style={{
                      top: `${50 + 48 * Math.sin((i * Math.PI * 2) / 4)}%`,
                      left: `${50 + 48 * Math.cos((i * Math.PI * 2) / 4)}%`,
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid rgba(255,255,255,0.8)',
                    }}
                  >
                    {e}
                  </div>
                ))}
              </motion.div>

              {/* Center logo — Rubik's Cube */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="w-40 h-40 flex items-center justify-center relative"
              >
                <img
                  src="/logo.png"
                  alt="BitQuest Logo"
                  className="w-36 h-36 object-contain drop-shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1
                className="text-5xl md:text-6xl font-black mb-2 tracking-tight"
                style={{
                  fontFamily: 'var(--font-mali)',
                  background: 'linear-gradient(135deg, #e8734a, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BitQuest
              </h1>
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-6"
                style={{ color: 'var(--color-burnt-orange)', fontFamily: 'var(--font-prompt)' }}
              >
                Microlearning Gamified Platform
              </p>
            </motion.div>

            {/* Subtitle card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card px-6 py-5 mb-8 mx-2"
              style={{ borderRadius: '24px' }}
            >
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-prompt)' }}
              >
                เปลี่ยนการเรียนรู้ให้สนุกเหมือนเล่นเกม!<br />
                <span style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
                  รับ EXP · อัปเลเวล · สะสมความรู้ใหม่ๆ ทุกวัน
                </span>
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {[
                { icon: '✨', label: 'รับ EXP ทุกบทเรียน', color: '#f59e0b' },
                { icon: '🔥', label: 'ระบบ Streak พลังฟาย', color: '#ef4444' },
                { icon: '🏆', label: 'ปลดล็อกด่านสุดมันส์', color: '#8b5cf6' },
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-md"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                  }}
                >
                  <span className="text-lg">{feat.icon}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-prompt)', color: feat.color }}
                  >
                    {feat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
              className="px-4"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(232, 115, 74, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { playPop(); hapticLight(); router.push('/lesson/unit1-l1-alarm'); }}
                className="w-full py-5 rounded-[20px] text-white font-bold text-xl relative overflow-hidden pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, #ff9a76, #e8734a, #d4623b)',
                  fontFamily: 'var(--font-mali)',
                  boxShadow: '0 8px 32px rgba(232, 115, 74, 0.4), 0 4px 0 #c0522e',
                }}
              >
                {/* Button shimmer */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    width: '40%',
                  }}
                />
                <span className="relative z-10">🚀 เริ่ม Quest ทดลองเล่นเลย!</span>
              </motion.button>
            </motion.div>

            {/* Secondary actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-6 flex flex-col items-center gap-3"
            >
              <button
                onClick={() => { playPop(); router.push('/login'); }}
                className="text-sm font-medium px-6 py-2.5 rounded-full transition-all hover:bg-white/60"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-prompt)',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                มีบัญชีอยู่แล้ว? <span className="font-bold" style={{ color: 'var(--color-burnt-orange)' }}>เข้าสู่ระบบ</span>
              </button>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-prompt)' }}>
                ไม่ต้องสมัครก็เล่นได้เลย · ฟรี 100%
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* === Bottom Stats Preview === */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="w-full px-6 pb-8 z-10"
        >
          <div
            className="max-w-md mx-auto flex items-center justify-around py-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            {[
              { value: '15+', label: 'บทเรียน', icon: '📚' },
              { value: '3', label: 'หน่วยการเรียน', icon: '🗺️' },
              { value: '∞', label: 'ฟรีตลอดชีพ', icon: '💎' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-lg mb-0.5">{stat.icon}</div>
                <p className="text-lg font-black" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </p>
                <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-prompt)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Visitor Counter */}
          <VisitorCounter />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
        className="min-h-screen relative"
        style={{ backgroundColor: 'var(--color-lime-cream)' }}
      >
        {/* Optimized background map layer */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: "url('/bg-map.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Decorative background blobs - removed expensive blur-3xl */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(253, 230, 138, 0.4) 0%, transparent 60%)' }}
          />
          <div
            className="absolute top-1/3 -left-10 w-64 h-64 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 60%)' }}
          />
          <div
            className="absolute bottom-40 right-0 w-80 h-80 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(255, 154, 118, 0.4) 0%, transparent 60%)' }}
          />
        </div>

        {/* Ensure content sits above fixed backgrounds */}
        <div className="relative z-10 pb-20">
          <Header
            displayName={userProfile?.displayName || 'นักสำรวจ'}
            streakCount={userProfile?.streakCount || 0}
          />

          <div className="px-4">
            {/* Boss Fight Banner */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/boss')}
              className="mt-6 rounded-3xl overflow-hidden cursor-pointer relative shadow-lg hand-drawn-border"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
               <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} />
               <div className="relative p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1 tracking-wide flex items-center gap-2" style={{ fontFamily: 'var(--font-mali)' }}>
                      <Swords className="text-white fill-white" size={24} /> สู้บอสรับเหรียญ 🪙
                    </h2>
                    <p className="text-white/80 text-sm font-bold tracking-wider">TIME ATTACK MODE</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-3xl shadow-inner">
                    👾
                  </div>
               </div>
            </motion.div>

            {/* Daily Quests */}
            <DailyQuestsWidget />
          </div>
      
      {/* Learning Path replaces LessonFeed */}
      <LearningPath
        lessons={lessons}
        completedLessons={userProgress?.completedLessons || []}
        loading={loadingLessons}
      />
      
      {/* Visitor Counter */}
      <VisitorCounter />
      </div>

      <BottomNav />
      <Mascot />

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
              {/* Animated Background Element */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-orange-400"
              />

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
                <span className="text-2xl">✨</span>
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-burnt-orange)' }}>
                  +50 EXP
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
    </motion.div>
  );
}
