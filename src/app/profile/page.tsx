// ============================================
// BitQuest — The Explorer's Journal (Premium UI Overhaul)
// ============================================

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getExpForNextLevel } from '@/lib/gamification';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { defaultLessons } from '@/data/defaultLessons';
import { playPop } from '@/lib/soundEffects';
import StudyChart from '@/components/StudyChart';
import { useState, useEffect } from 'react';

const badgeInfo: Record<string, { emoji: string; label: string; condition: (stats: any) => boolean }> = {
  'first-quest': { emoji: '🌟', label: 'Quest แรก', condition: (s) => s.completedCount > 0 },
  'streak-3': { emoji: '🔥', label: 'Streak 3 วัน', condition: (s) => s.streakCount >= 3 },
  'history-buff': { emoji: '📜', label: 'สายประวัติศาสตร์', condition: (s) => s.historyCount >= 1 },
  'invincible-sage': { emoji: '🧠', label: 'นักปราชญ์ไร้พ่าย', condition: (s) => s.consecutiveCorrect >= 3 },
  'social-sage': { emoji: '⚖️', label: 'นักสังคม', condition: (s) => s.socialCount >= 2 },
  'english-pro': { emoji: '🇬🇧', label: 'English Pro', condition: (s) => s.englishCount >= 1 },
  'level-5': { emoji: '⚔️', label: 'ถึง Level 5', condition: (s) => s.currentLevel >= 5 },
  'level-10': { emoji: '🏆', label: 'ถึง Level 10', condition: (s) => s.currentLevel >= 10 },
};

export default function ProfilePage() {
  const { userProfile, userProgress, firebaseUser, signOut, resetGuestProgress, equipItem } = useAuth();
  const router = useRouter();

  const currentLevel = userProfile?.currentLevel || 1;
  const currentEXP = userProfile?.currentEXP || 0;
  const streakCount = userProfile?.streakCount || 0;
  const expNeeded = getExpForNextLevel(currentLevel);
  const progress = Math.min((currentEXP / expNeeded) * 100, 100);
  const completedCount = userProgress?.completedLessons?.length || 0;
  const consecutiveCorrect = userProfile?.consecutiveCorrect || 0;

  const completedIds = userProgress?.completedLessons || [];
  const historyCount = defaultLessons.filter(l => completedIds.includes(l.id) && l.subject === 'ประวัติศาสตร์').length;
  const socialCount = defaultLessons.filter(l => completedIds.includes(l.id) && l.subject === 'สังคมศึกษา').length;
  const englishCount = defaultLessons.filter(l => completedIds.includes(l.id) && l.subject === 'ภาษาอังกฤษ').length;

  const currentStats = {
    currentLevel, streakCount, completedCount, consecutiveCorrect,
    historyCount, socialCount, englishCount
  };

  // Mouse tilt for Desktop
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [5, -5]);
  const rotateY = useTransform(x, [0, 1], [-5, 5]);

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width;
    const mouseY = (event.clientY - rect.top) / rect.height;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div className="min-h-screen pb-32 bg-[#e2e8f0]">
      <div 
        className="max-w-6xl mx-auto pt-8 md:pt-16 px-4 notebook-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div 
          style={{ rotateX, rotateY }}
          className="notebook-spread flex flex-col lg:flex-row gap-0 overflow-hidden shadow-2xl rounded-2xl md:rounded-3xl"
        >
          {/* --- LEFT PAGE (Passport & Personal Stats) --- */}
          <div className="notebook-page left-page journal-paper paper-texture p-8 md:p-12">
             {/* Notebook Rings (Visual Detail) */}
             <div className="absolute top-0 bottom-0 right-0 w-8 notebook-rings hidden lg:block" />
             
             {/* Passport Section */}
             <div className="relative mb-12">
                <div className="flex items-start gap-6">
                   {/* Polaroid Photo Style Avatar with Frame */}
                   <div 
                     className="w-32 h-36 bg-white p-2 shadow-lg -rotate-2 relative transition-all duration-300"
                     style={{
                       border: userProfile?.equippedProfileFrame === 'gold_frame' ? '4px solid #fbbf24' :
                               userProfile?.equippedProfileFrame === 'neon_frame' ? '4px solid #3b82f6' : '1px solid #e2e8f0',
                       boxShadow: userProfile?.equippedProfileFrame === 'gold_frame' ? '0 8px 24px rgba(251, 191, 36, 0.4)' :
                                  userProfile?.equippedProfileFrame === 'neon_frame' ? '0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(59, 130, 246, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                     }}
                   >
                      <div className="w-full h-[85%] bg-slate-100 overflow-hidden relative border-2 border-slate-50">
                         {userProfile?.photoURL ? (
                           <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-tr from-indigo-50 to-orange-50">🧑‍🚀</div>
                         )}
                         {/* Optional filter overlay */}
                         <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
                      </div>
                      <div className="mt-1 text-[8px] font-bold text-slate-400 text-center uppercase whitespace-nowrap">
                        {userProfile?.equippedProfileFrame === 'gold_frame' ? '🎫 Premium Pass' : 
                         userProfile?.equippedProfileFrame === 'neon_frame' ? '⚡ Cyber Pass' : 'Expedition #221'}
                      </div>
                      
                      {/* Frame Decorative Badges */}
                      {userProfile?.equippedProfileFrame === 'gold_frame' && (
                        <div className="absolute -top-3 -right-3 text-2xl drop-shadow-md float-animation object-contain">👑</div>
                      )}
                      {userProfile?.equippedProfileFrame === 'neon_frame' && (
                        <div className="absolute -bottom-2 -left-2 text-2xl drop-shadow-md float-animation-delayed object-contain">💫</div>
                      )}
                   </div>

                   <div className="flex-1 pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-sm uppercase">Rank</span>
                        <span className="text-xl font-black text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>Lv.{currentLevel}</span>
                      </div>
                      <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2" style={{ fontFamily: 'var(--font-mali)' }}>
                         {userProfile?.displayName || 'Unknown'}
                      </h1>
                      {/* Signature line */}
                      <div className="h-8 border-b border-slate-300 relative">
                         <span className="absolute bottom-1 left-2 italic text-indigo-800/60 font-serif opacity-70">
                           {userProfile?.displayName?.toLowerCase().replace(/\s/g, '_')}_sign
                         </span>
                         <span className="absolute bottom-[-15px] left-0 text-[8px] uppercase tracking-widest text-slate-400">Signature of Explorer</span>
                      </div>

                      {/* --- Added EXP Progress Bar (Journal Style) --- */}
                      <div className="mt-10 lg:mt-12">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Exp. Progress</span>
                          <span className="text-[11px] font-bold text-indigo-700/60" style={{ fontFamily: 'var(--font-mali)' }}>{currentEXP} / {expNeeded} EXP</span>
                        </div>
                        <div className="h-4 w-full hand-drawn-border bg-white/40 p-0.5 relative overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-indigo-600/30"
                              style={{ 
                                 borderRadius: '120px 10px 100px 5px / 5px 100px 10px 120px',
                                 backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
                                 backgroundSize: '20px 20px'
                              }}
                           />
                        </div>
                        <div className="mt-1 text-[8px] italic text-slate-400" style={{ fontFamily: 'var(--font-prompt)' }}>* เลเวลต่อไปต้องการอีก {expNeeded - currentEXP} EXP</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Progress Journal Entry */}
             <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                   <span className="w-4 h-0.5 bg-slate-300" /> Weekly Observations
                </h3>
                <StudyChart />
             </div>

             {/* Bento Stats (Paper Style) */}
             <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="hand-drawn-border p-4 bg-white/40">
                   <div className="text-[9px] uppercase font-bold text-slate-400">Streak Record</div>
                   <div className="text-2xl font-black text-orange-600" style={{ fontFamily: 'var(--font-mali)' }}>{streakCount} Days</div>
                </div>
                <div className="hand-drawn-border p-4 bg-white/40">
                   <div className="text-[9px] uppercase font-bold text-slate-400">Completed Quests</div>
                   <div className="text-2xl font-black text-indigo-600" style={{ fontFamily: 'var(--font-mali)' }}>{completedCount}</div>
                </div>
             </div>
          </div>

          {/* --- RIGHT PAGE (Stamps & History) --- */}
          <div className="notebook-page right-page journal-paper paper-texture p-8 md:p-12">
             {/* Notebook Rings (Mobile side view) */}
             <div className="absolute top-0 bottom-0 left-0 w-8 notebook-rings hidden lg:block opacity-30" />

             <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>
                Passport Stamps 🏛️
             </h2>

             {/* Stamp Collection ( ऑर्गेनिक เลย์เอาต์ ) */}
             <div className="grid grid-cols-3 md:grid-cols-4 gap-8 mb-16 px-2">
                {Object.entries(badgeInfo).map(([key, badge], i) => {
                  const unlocked = badge.condition(currentStats);
                  return (
                    <motion.div
                      key={key}
                      initial={unlocked ? { scale: 0, rotate: -45 } : {}}
                      animate={unlocked ? { scale: 1, rotate: Math.random() * 20 - 10 } : {}}
                      whileHover={{ scale: 1.1 }}
                      className="relative flex flex-col items-center"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${
                        unlocked ? 'ink-stamp bg-white shadow-inner border-2 border-slate-300' : 'opacity-10 border-2 border-dashed border-slate-400 bg-transparent'
                      }`}>
                         <span className="text-4xl">{badge.emoji}</span>
                         {unlocked && (
                           <svg className="absolute inset-0 w-full h-full -rotate-12 pointer-events-none opacity-20">
                             <circle cx="50%" cy="50%" r="28" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                           </svg>
                         )}
                      </div>
                      <span className={`text-[9px] font-bold uppercase mt-2 text-center tracking-tighter ${unlocked ? 'text-slate-500' : 'text-slate-300'}`}>
                        {badge.label}
                      </span>
                    </motion.div>
                  );
                })}
             </div>

             {/* Recent Activity Log */}
             <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                   <span className="w-4 h-0.5 bg-slate-300" /> Log Entries
                </h3>
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-200 border-dashed">
                        <div className="text-[10px] font-bold text-indigo-400 font-mono">04/09/26</div>
                        <div className="text-[12px] font-medium text-slate-600 italic">
                          "{i === 1 ? 'Successfully finished English Level 1 quest.' : i === 2 ? 'Reached a 3-day learning streak.' : 'Entered the top 10 leaderboard for the first time.'}"
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Inventory / Equipment */}
             <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                   <span className="w-4 h-0.5 bg-slate-300" /> Equipment & Skins
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   {/* Mascot Skins */}
                   <div className="hand-drawn-border p-4 bg-white/40">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">Mascot Skins</div>
                      <div className="flex flex-wrap gap-2">
                         {userProfile?.unlockedMascotStyles?.map(skin => (
                            <button 
                               key={skin}
                               onClick={() => equipItem('mascot', skin)}
                               className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                                 userProfile.equippedMascotStyle === skin 
                                   ? 'bg-indigo-100 border-indigo-400 text-indigo-700' 
                                   : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'
                               }`}
                            >
                               {skin === 'default' ? '🦊 Default' : skin === 'ninja' ? '🥷 Ninja' : skin === 'king' ? '👑 King' : skin === 'ghost' ? '👻 Ghost' : skin === 'wizard' ? '🧙 Wizard' : skin}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Profile Frames */}
                   <div className="hand-drawn-border p-4 bg-white/40">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">Profile Frames</div>
                      <div className="flex flex-wrap gap-2">
                         {userProfile?.unlockedProfileFrames?.map(frame => (
                            <button 
                               key={frame}
                               onClick={() => equipItem('frame', frame)}
                               className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                                 userProfile.equippedProfileFrame === frame 
                                   ? 'bg-amber-100 border-amber-400 text-amber-700' 
                                   : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200'
                               }`}
                            >
                               {frame === 'default' ? '⚪ Default' : frame === 'gold_frame' ? '🖼️ Gold' : frame === 'neon_frame' ? '💫 Neon' : frame}
                            </button>
                         ))}
                      </div>
                   </div>

                    {/* Hats */}
                    <div className="hand-drawn-border p-4 bg-white/40">
                       <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">🎩 Hats</div>
                       <div className="flex flex-wrap gap-2">
                          <button 
                             onClick={() => equipItem('hat' as any, 'none')}
                             className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                               (!userProfile?.equippedHat || userProfile.equippedHat === 'none')
                                 ? 'bg-rose-100 border-rose-400 text-rose-700' 
                                 : 'bg-white border-slate-200 text-slate-500 hover:border-rose-200'
                             }`}
                          >
                             ❌ None
                          </button>
                          {userProfile?.unlockedHats?.map(hat => (
                             <button 
                                key={hat}
                                onClick={() => equipItem('hat' as any, hat)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                                  userProfile.equippedHat === hat 
                                    ? 'bg-rose-100 border-rose-400 text-rose-700' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-rose-200'
                                }`}
                             >
                                {hat === 'wizard_hat' ? '🧙 Wizard' : hat === 'crown' ? '👑 Crown' : hat === 'ninja_band' ? '🥷 Ninja' : hat === 'party_hat' ? '🎉 Party' : hat}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Accessories */}
                    <div className="hand-drawn-border p-4 bg-white/40">
                       <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">✨ Accessories</div>
                       <div className="flex flex-wrap gap-2">
                          <button 
                             onClick={() => equipItem('accessory' as any, 'none')}
                             className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                               (!userProfile?.equippedAccessory || userProfile.equippedAccessory === 'none')
                                 ? 'bg-emerald-100 border-emerald-400 text-emerald-700' 
                                 : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'
                             }`}
                          >
                             ❌ None
                          </button>
                          {userProfile?.unlockedAccessories?.map(acc => (
                             <button 
                                key={acc}
                                onClick={() => equipItem('accessory' as any, acc)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                                  userProfile.equippedAccessory === acc 
                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-700' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'
                                }`}
                             >
                                {acc === 'glasses' ? '👓 Glasses' : acc === 'cool_shades' ? '😎 Shades' : acc === 'bow_tie' ? '🎀 Bow Tie' : acc === 'scarf' ? '🧣 Scarf' : acc}
                             </button>
                          ))}
                       </div>
                    </div>
                </div>
             </div>

             {/* Settings Area (Discrete Journal Style) */}
             <div className="pt-8 mt-auto border-t border-slate-200">
                <div className="flex flex-col gap-3">
                   <button
                      onClick={() => router.push('/about')}
                      className="hand-drawn-border py-4 bg-indigo-50/50 text-indigo-700 text-sm font-black uppercase tracking-widest hover:bg-indigo-100/50 transition-colors flex items-center justify-center gap-2"
                      style={{ fontFamily: 'var(--font-prompt)' }}
                   >
                      🦊 เกี่ยวกับผู้พัฒนา & สนับสนุน
                   </button>

                   {!firebaseUser ? (
                     <button
                        onClick={() => router.push('/login')}
                        className="hand-drawn-border py-4 bg-white text-slate-700 text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                     >
                        🔗 คืนสถานะสมาชิก (Login)
                     </button>
                   ) : (
                     <button
                        onClick={() => { playPop(); signOut(); }}
                        className="text-xs font-bold text-red-400 hover:text-red-500 underline uppercase tracking-widest text-left"
                     >
                        ออกจากสมุดบันทึก (Logout)
                     </button>
                   )}
                   
                   {!firebaseUser && (
                     <button
                        onClick={() => { if(confirm('ต้องการฉีกสมุดหน้านี้แล้วเริ่มใหม่?')) { resetGuestProgress(); router.push('/'); } }}
                        className="text-[10px] font-bold text-slate-300 hover:text-slate-400 uppercase tracking-widest text-left"
                     >
                        ฉีกหน้านี้แล้วเริ่มใหม่ (Reset)
                     </button>
                   )}
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
