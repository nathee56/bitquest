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
      className="min-h-screen flex flex-col md:flex-row relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
      {/* Decorative background blobs (Shared) */}
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
      </div>

      {/* --- LEFT PANEL: PC Visuals --- */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 bg-white relative overflow-hidden">
        {/* Shimmering Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#e8734a 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-indigo-50/50" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: 'spring' }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="inline-block relative mb-8"
          >
            <div className="absolute inset-0 bg-orange-200/40 blur-3xl rounded-full" />
            <img src="/logo.png" alt="BitQuest Logo" className="w-64 h-64 object-contain relative z-10" />
          </motion.div>
          
          <h2 className="text-6xl font-black mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-mali)', color: '#1e293b' }}>
            BitQuest
          </h2>
          <p className="text-xl font-medium text-slate-500 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-prompt)' }}>
            พร้อมที่จะเลเวลอัพ <br /> ความรู้ประวัติศาสตร์ของคุณหรือยัง? ⚔️
          </p>
        </motion.div>

        {/* Floating Game Icons */}
        <div className="absolute inset-0 pointer-events-none">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-[20%] left-[20%] text-6xl">⚔️</motion.div>
           <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-[20%] right-[15%] text-6xl">🪙</motion.div>
           <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-[15%] right-[25%] text-4xl">✨</motion.div>
        </div>
      </div>

      {/* --- RIGHT PANEL / MOBILE VIEW: Form --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile Header (Hidden on PC) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden text-center mb-10 w-full"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-block mb-3 relative"
            >
              <div className="absolute inset-0 bg-white blur-xl rounded-full opacity-50" />
              <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto object-contain relative z-10" />
            </motion.div>
            <h1 className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-mali)', color: '#1e293b' }}>BitQuest</h1>
            <p className="text-sm font-bold text-slate-500" style={{ fontFamily: 'var(--font-prompt)' }}>เรียนรู้ได้สนุก ทุกที่ ทุกเวลา 🐥</p>
          </motion.div>

          <div className="glass-card p-2 md:p-8 md:bg-white/80 md:backdrop-blur-2xl md:border-2 md:border-white md:shadow-2xl md:rounded-[40px] border-none bg-transparent shadow-none">
            <div className="text-center mb-8 hidden md:block">
               <h3 className="text-2xl font-black text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>ยินดีต้อนรับกลับมา!</h3>
               <p className="text-sm text-slate-500 font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>เข้าสู่โลกแห่งการผจญภัยด้านความรู้</p>
            </div>

            {/* Google Sign In Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={handleGoogleSignIn}
                className="btn-3d btn-3d-white w-full py-4 text-sm font-bold gap-3"
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </motion.div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">or use email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Display Name</label>
                    <input
                      type="text"
                      placeholder="เช่น นักรบแห่งแสง"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                />
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d btn-3d-primary w-full py-4 text-white text-lg mt-2"
                style={{ fontFamily: 'var(--font-mali)' }}
              >
                {isSubmitting ? 'กำลังโหลด...' : (isSignUp ? '✨ สร้างบัญชี' : '⚡ เข้าสู่ระบบ')}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-8 text-center bg-slate-50 rounded-2xl p-4">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-xs font-bold text-slate-500"
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                {isSignUp ? (
                  <>มีบัญชีอยู่แล้ว? <span className="text-blue-600 underline underline-offset-4">เข้าสู่ระบบ</span></>
                ) : (
                  <>ยังไม่มีบัญชี? <span className="text-blue-600 underline underline-offset-4">สมัครสมาชิกฟรี</span></>
                )}
              </button>
            </div>
          </div>

          {/* Guest Start Notice */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              style={{ fontFamily: 'var(--font-prompt)' }}
            >
              ← กลับไปหน้าหลัก (Guest Mode)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pb-8 w-full absolute bottom-0 md:static"
      >
        <p className="text-xs" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
          BitQuest © 2026 — Level Up Your Knowledge 🎮
        </p>
      </motion.div>
    </div>
  );
}
