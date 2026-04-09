// ============================================
// BitQuest — Login Page
// Beautiful, cute login with Google & Email auth
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { firebaseUser, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && firebaseUser) {
      router.push('/');
    }
  }, [firebaseUser, loading, router]);

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
    }
  };

  // Handle Email sign in / sign up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('กรุณาใส่ชื่อที่จะแสดง');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      // Friendly Thai error messages
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('ไม่พบบัญชีนี้ ลองสมัครใหม่สิ! 🤔');
          break;
        case 'auth/wrong-password':
          setError('รหัสผ่านไม่ถูกต้อง ลองอีกครั้งนะ 🔑');
          break;
        case 'auth/email-already-in-use':
          setError('อีเมลนี้มีคนใช้แล้ว ลองเข้าสู่ระบบแทน 📧');
          break;
        case 'auth/weak-password':
          setError('รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร 🔒');
          break;
        case 'auth/invalid-email':
          setError('รูปแบบอีเมลไม่ถูกต้อง 📨');
          break;
        default:
          setError(firebaseError.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-lime-cream)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-12 h-12 rounded-full"
          style={{
            background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(253, 230, 138, 0.5) 0%, transparent 60%)' }}
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute top-1/2 -left-16 w-56 h-56 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.5) 0%, transparent 60%)' }}
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-20 right-0 w-48 h-48 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(255, 154, 118, 0.5) 0%, transparent 60%)' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-10 w-full"
        >
          {/* Logo icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="inline-block mb-3 relative"
          >
            <div className="absolute inset-0 bg-white blur-xl rounded-full opacity-50 shadow-[0_0_40px_rgba(255,180,0,0.4)]" />
            <img
              src="/logo.png"
              alt="BitQuest Logo"
              className="w-32 h-32 mx-auto object-contain drop-shadow-2xl relative z-10"
            />
          </motion.div>

          <h1
            className="text-5xl font-black mb-1"
            style={{ fontFamily: 'var(--font-mali)', color: '#1e293b', textShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            BitQuest
          </h1>
          <p
            className="text-[15px] font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-prompt)', color: '#64748b' }}
          >
            เรียนรู้ทีละนิด เก่งขึ้นทุกวัน ✨
          </p>
        </motion.div>

        {/* Google Sign In Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-[320px] mb-6"
        >
          <button
            onClick={handleGoogleSignIn}
            className="btn-3d btn-3d-white w-full py-4 text-sm font-bold gap-3"
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            {/* Google Icon */}
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            เข้าสู่ระบบด้วยบัญชี Google
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-[320px] flex items-center gap-4 mb-6"
        >
          <div className="flex-1 h-px bg-slate-300 opacity-60" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: 'var(--font-prompt)' }}>
            หรือใช้อีเมล
          </span>
          <div className="flex-1 h-px bg-slate-300 opacity-60" />
        </motion.div>

        {/* Email Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          onSubmit={handleEmailSubmit}
          className="w-full max-w-[320px] bg-white/80 backdrop-blur-xl p-5 rounded-3xl border-2 border-white shadow-xl"
        >
          {/* Display Name (Sign Up only) */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase ml-1" style={{ fontFamily: 'var(--font-prompt)' }}>ชื่อในเกม</div>
                <input
                  type="text"
                  placeholder="เช่น นักรบแห่งแสง"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    color: '#0f172a',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase ml-1" style={{ fontFamily: 'var(--font-prompt)' }}>อีเมล</div>
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              style={{
                fontFamily: 'var(--font-prompt)',
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                color: '#0f172a',
              }}
            />
          </div>

          <div className="mb-6">
            <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase ml-1" style={{ fontFamily: 'var(--font-prompt)' }}>รหัสผ่าน</div>
            <input
              type="password"
              placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              style={{
                fontFamily: 'var(--font-prompt)',
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 px-4 py-3 rounded-2xl text-sm"
                style={{
                  fontFamily: 'var(--font-prompt)',
                  backgroundColor: 'var(--color-quiz-incorrect-bg)',
                  color: 'var(--color-quiz-incorrect)',
                  border: '1px solid rgba(248, 113, 113, 0.2)',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-3d btn-3d-primary w-full py-4 text-base tracking-wide mt-2"
            style={{ fontFamily: 'var(--font-mali)' }}
          >
            {isSubmitting ? 'กำลังโหลด...' : (isSignUp ? '✨ สร้างไอดีนักผจญภัย' : '⚡ เข้าสู่ระบบ')}
          </button>
        </motion.form>

        {/* Toggle Sign In / Sign Up */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-sm"
        >
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-sm font-bold transition-transform active:scale-95"
            style={{ fontFamily: 'var(--font-prompt)', color: '#475569' }}
          >
            {isSignUp ? (
              <>มีบัญชีอยู่แล้ว? <span className="text-blue-600 underline underline-offset-4">เข้าสู่ระบบที่นี่</span></>
            ) : (
              <>เพิ่งมาครั้งแรกหรอ? <span className="text-blue-600 underline underline-offset-4">สมัครสมาชิกฟรีนะ!</span></>
            )}
          </button>
        </motion.div>

        {/* Guest Start Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold px-5 py-2.5 rounded-full transition-all bg-white/50 text-slate-500 hover:bg-white/80 active:scale-95"
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            ← ทดลองเล่นแบบไม่ล็อกอิน (Guest)
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pb-8"
      >
        <p className="text-xs" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
          BitQuest © 2026 — Level Up Your Knowledge 🎮
        </p>
      </motion.div>
    </div>
  );
}
