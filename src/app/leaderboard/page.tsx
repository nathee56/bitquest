'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import Image from 'next/image';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  currentLevel: number;
  currentEXP: number;
}

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        if (!db) return;
        const q = query(
          collection(db, 'users'),
          orderBy('currentLevel', 'desc'),
          orderBy('currentEXP', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as LeaderboardUser[];
        setTopUsers(users);
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const PodiumItem = ({ user, rank, delay }: { user: LeaderboardUser, rank: number, delay: number }) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    // Height and colors based on rank
    const height = isFirst ? 'h-44' : isSecond ? 'h-36' : 'h-28';
    const podiumColor = isFirst ? 'bg-amber-400' : isSecond ? 'bg-slate-300' : 'bg-orange-400';
    const shadowColor = isFirst ? 'border-amber-600' : isSecond ? 'border-slate-500' : 'border-orange-600';
    const crown = isFirst ? '👑' : isSecond ? '🥈' : '🥉';

    return (
      <div className="flex flex-col items-center justify-end w-24">
         <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay, type: 'spring', stiffness: 100 }}
          className="flex flex-col items-center mb-2"
        >
          <div className="relative mb-2">
             <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center">
               <span className="text-3xl">🧑‍🚀</span>
             </div>
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">{crown}</div>
          </div>
          <span className="text-[11px] font-black text-center truncate w-20 leading-tight" style={{ fontFamily: 'var(--font-mali)' }}>{user.displayName}</span>
          <span className="text-[10px] font-bold text-slate-500">Lv.{user.currentLevel}</span>
        </motion.div>

        <motion.div
          initial={{ height: 0 }}
          animate={{ height: isFirst ? 140 : isSecond ? 100 : 70 }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className={`w-full rounded-t-2xl border-b-0 border-x-4 border-t-4 ${podiumColor} ${shadowColor} shadow-lg relative flex flex-col items-center pt-2`}
        >
          <span className="text-2xl font-black text-white/50">{rank}</span>
          {isFirst && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-xl">
               <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-1/2 h-full bg-white/20 skew-x-12"
               />
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-lime-cream)' }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-6 bg-white/50 backdrop-blur-xl border-b border-slate-100 rounded-b-[40px] shadow-sm text-center">
         <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-burnt-orange)' }}>
           World Rankings 🏆
         </h1>
         <p className="text-sm font-medium text-slate-400" style={{ fontFamily: 'var(--font-prompt)' }}>
           ทำภารกิจเพื่อเลื่อนอันดับขึ้นสู่จุดสูงสุด!
         </p>
      </div>

      <div className="max-w-md mx-auto px-5">
        
        {/* The Podium */}
        {!loading && topUsers.length >= 1 ? (
          <div className="flex items-end justify-center gap-2 mt-12 mb-10 h-64 border-b-2 border-slate-200">
            {/* 2nd Place */}
            {topUsers[1] && <PodiumItem user={topUsers[1]} rank={2} delay={0.4} />}
            {/* 1st Place */}
            {topUsers[0] && <PodiumItem user={topUsers[0]} rank={1} delay={0.2} />}
            {/* 3rd Place */}
            {topUsers[2] && <PodiumItem user={topUsers[2]} rank={3} delay={0.6} />}
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full"
            />
          </div>
        ) : null}

        {/* The List (4th - 10th) */}
        <div className="space-y-3">
          {!loading ? topUsers.slice(3).map((user, idx) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx + 0.8 }}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm"
              style={{ fontFamily: 'var(--font-prompt)' }}
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-sm font-black text-slate-300">#{idx + 4}</span>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-xl">🧑‍🎓</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">{user.displayName}</h4>
                  <p className="text-[11px] font-bold text-slate-400">เลเวล {user.currentLevel}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-amber-500">{user.currentEXP} EXP</span>
              </div>
            </motion.div>
          )) : null}
        </div>

        {topUsers.length === 0 && !loading && (
          <div className="text-center mt-20 p-10 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>ยังไม่มีข้อมูลอันดับในขณะนี้...</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
