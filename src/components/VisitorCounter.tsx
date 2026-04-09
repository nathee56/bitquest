'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const incrementVisitor = async () => {
      try {
        if (!db) {
          const localCount = parseInt(localStorage.getItem('v_count') || '0');
          setCount(localCount + 1);
          localStorage.setItem('v_count', String(localCount + 1));
          return;
        }

        const statsRef = doc(db, 'system_stats', 'visitors');
        const snap = await getDoc(statsRef);
        
        let currentCount = 0;
        
        if (!snap.exists()) {
          currentCount = 1;
          await setDoc(statsRef, { count: currentCount });
        } else {
          currentCount = snap.data().count + 1;
          await updateDoc(statsRef, { count: increment(1) });
        }
        
        setCount(currentCount);

      } catch (error) {
        console.warn("Could not sync visitor count via Firebase:", error);
        const localCount = parseInt(localStorage.getItem('v_count') || '0');
        setCount(localCount + 1);
        localStorage.setItem('v_count', String(localCount + 1));
      }
    };
    
    if (!sessionStorage.getItem('visited')) {
      incrementVisitor();
      sessionStorage.setItem('visited', 'true');
    } else {
      const fetchVisitor = async () => {
        if (!db) return;
        try {
           const snap = await getDoc(doc(db, 'system_stats', 'visitors'));
           if (snap.exists()) {
             setCount(snap.data().count);
           }
        } catch { }
      };
      
      const localCount = parseInt(localStorage.getItem('v_count') || '0');
      setCount(localCount);
      fetchVisitor();
    }
  }, []);

  return (
    <div className="flex flex-col items-center pb-8 pt-4">
      <p className="text-sm font-bold text-slate-500 mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
        ผู้เข้าชมเว็บไซต์
      </p>
      <div 
        className="bg-white/80 backdrop-blur-sm px-8 py-3 rounded-2xl border-2 shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
        style={{ borderColor: 'rgba(232, 115, 74, 0.2)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl opacity-80" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🔥</span>
          <AnimatePresence mode="popLayout">
            <motion.span 
              key={count}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black tracking-widest" 
              style={{ 
                fontFamily: 'var(--font-mali)', 
                background: 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-peach))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {count !== null ? count.toLocaleString() : '...'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
