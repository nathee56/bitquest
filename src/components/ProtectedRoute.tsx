// ============================================
// BitQuest — Protected Route Component
// Redirects to /login if user is not authenticated
// ============================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  // Loading state — cute spinner
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: 'var(--color-lime-cream)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
            boxShadow: '0 4px 24px rgba(232, 115, 74, 0.3)',
          }}
        >
          <span className="text-2xl">⚡</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium"
          style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}
        >
          กำลังโหลด...
        </motion.p>
      </div>
    );
  }

  // Not authenticated — show nothing (redirect will fire)
  if (!firebaseUser) {
    return null;
  }

  // Authenticated — render children
  return <>{children}</>;
}
