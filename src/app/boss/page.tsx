'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Heart, Coins, Swords, Timer, Zap, ShieldAlert } from 'lucide-react';
import { defaultLessons } from '@/data/defaultLessons';
import { playPop } from '@/lib/soundEffects';

// Extract all quiz questions from lessons for the boss fight pool
const getBossQuestionPool = () => {
  const pool: any[] = [];
  defaultLessons.forEach(lesson => {
    lesson.content.forEach(block => {
      if (block.type === 'quiz' && block.question && block.options && block.correctIndex !== undefined) {
        pool.push({
          question: block.question,
          options: block.options,
          correctIndex: block.correctIndex,
          subject: lesson.subject
        });
      }
    });
  });
  // Shuffle
  return pool.sort(() => Math.random() - 0.5);
};

export default function BossFightPage() {
  const router = useRouter();
  const { userProfile, deductHeart, addEXP, addCoins, updateQuestProgress } = useAuth();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bossHP, setBossHP] = useState(100);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'win' | 'lose'>('intro');
  const [bossAnimation, setBossAnimation] = useState<'idle' | 'hit' | 'attack'>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setQuestions(getBossQuestionPool().slice(0, 5)); // 5 questions to defeat boss (20 HP each)
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && selectedOption === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, selectedOption]);

  const handleTimeout = () => {
    handleAnswer(-1, true); // -1 means timeout
  };

  const handleStart = () => {
    if (!userProfile || userProfile.hearts <= 0) {
      alert("คุณไม่มีหัวใจเหลือเพียงพอ! รอให้หัวใจฟื้นฟูก่อนนะ");
      router.back();
      return;
    }
    setGameState('playing');
    setTimeLeft(10);
  };

  const handleAnswer = async (index: number, isTimeout = false) => {
    if (selectedOption !== null || gameState !== 'playing') return;
    setSelectedOption(index);

    const question = questions[currentIdx];
    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      // Player attacks Boss
      setBossAnimation('hit');
      setTimeout(() => setBossAnimation('idle'), 500);
      
      const newBossHP = Math.max(0, bossHP - 20);
      setBossHP(newBossHP);
      
      if (newBossHP === 0) {
        setTimeout(() => handleWin(), 1000);
      } else {
        setTimeout(nextQuestion, 1500);
      }
    } else {
      // Boss attacks Player
      setBossAnimation('attack');
      setTimeout(() => setBossAnimation('idle'), 500);
      
      await deductHeart();
      
      // Check if user is dead (hearts dropped to 0)
      // Since deductHeart updates state asynchronously, we check mathematically for immediate response
      if ((userProfile?.hearts || 0) <= 1) {
        setTimeout(() => handleLose(), 1000);
      } else {
        setTimeout(nextQuestion, 1500);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(10);
    } else {
      // Out of questions but boss isn't dead? Fetch more seamlessly.
      setQuestions([...questions, ...getBossQuestionPool().slice(0, 5)]);
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(10);
    }
  };

  const handleWin = async () => {
    setGameState('win');
    await updateQuestProgress('play_boss', 1);
    await addCoins(100);
    await addEXP(50);
  };

  const handleLose = async () => {
    setGameState('lose');
    await updateQuestProgress('play_boss', 1);
  };

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(109,40,217,0.2),transparent_70%)]" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <button 
          onClick={() => { playPop(); router.back(); }} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
          style={{ fontFamily: 'var(--font-prompt)' }}
        >
          <ArrowLeft size={20} /> <span className="hidden sm:inline">ถอยทัพ</span>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
           <h1 className="text-xl font-black tracking-tighter text-rose-500" style={{ fontFamily: 'var(--font-mali)' }}>BOSS BATTLE ⚔️</h1>
        </div>

        <div className="flex gap-4 font-black tracking-widest uppercase text-sm" style={{ fontFamily: 'var(--font-prompt)' }}>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-full text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
             <Heart size={16} className="fill-rose-500" /> {userProfile.hearts}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full text-amber-400 border border-amber-500/20">
             <Coins size={16} className="fill-amber-400" /> {userProfile.coins}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-1">
          
          {/* Column 1: Boss Arena */}
          <div className="flex flex-col justify-center items-center py-8 lg:py-0">
            <div className="relative w-full max-w-md lg:max-w-xl aspect-square lg:aspect-video flex items-center justify-center bg-slate-800/50 rounded-[60px] border-2 border-slate-700/50 overflow-hidden shadow-2xl group">
               {/* Arena Floor */}
               <div className="absolute bottom-10 w-2/3 h-20 bg-slate-900/50 rounded-[100%] blur-xl" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(109,40,217,0.1),transparent_60%)]" />

               {/* Boss HP Bar Floating */}
               <div className="absolute top-10 left-10 right-10 z-20">
                 <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-prompt)' }}>Shadow Slime</span>
                    <span className="text-sm font-black text-white">{bossHP} / 100 HP</span>
                 </div>
                 <div className="bg-slate-900/80 h-4 rounded-full p-1 border border-slate-700 shadow-inner overflow-hidden">
                    <motion.div 
                      animate={{ width: `${bossHP}%` }}
                      className="h-full bg-gradient-to-r from-rose-600 to-indigo-500 rounded-full relative"
                      transition={{ type: 'spring', stiffness: 50 }}
                    >
                       <motion.div 
                        animate={{ opacity: [0, 1, 0], x: ['0%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-white/20 w-1/4"
                       />
                    </motion.div>
                 </div>
               </div>

               {/* Boss Visual */}
               <motion.div 
                 animate={
                   bossAnimation === 'idle' ? { y: [0, -15, 0], scale: [1, 1.05, 1], rotate: [-1, 1, -1] } :
                   bossAnimation === 'hit' ? { x: [-15, 15, -15, 15, 0], filter: ['brightness(1)', 'brightness(3)', 'brightness(1)'] } :
                   { scale: [1, 1.3, 1], y: [0, -100, 0] } // attack
                 }
                 transition={bossAnimation === 'idle' ? { repeat: Infinity, duration: 3 } : { duration: 0.4 }}
                 className="relative z-10 w-64 h-64 lg:w-80 lg:h-80 drop-shadow-[0_20px_50px_rgba(109,40,217,0.5)] cursor-pointer"
               >
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <radialGradient id="slimeGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#4c1d95" />
                      </radialGradient>
                    </defs>
                    <path d="M50 85 C10 85 15 50 15 45 C15 20 35 15 50 15 C65 15 85 20 85 45 C85 50 90 85 50 85 Z" fill="url(#slimeGrad)" />
                    <path d="M50 80 C23 80 28 52 28 47 C28 28 41 23 50 23 C59 23 72 28 72 47 C72 52 77 80 50 80 Z" fill="#2e1065" opacity="0.5" />
                    <rect x="32" y="42" width="6" height="8" rx="3" fill="#ffffff" />
                    <rect x="62" y="42" width="6" height="8" rx="3" fill="#ffffff" />
                    <path d="M40 65 Q50 75 60 65" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                  </svg>
               </motion.div>

               {/* Combat Feedback Layout */}
               <AnimatePresence>
                 {selectedOption !== null && (
                   <motion.div 
                    initial={{ opacity: 0, scale: 2, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -100 }}
                    exit={{ opacity: 0 }}
                    className={`absolute z-30 font-black text-4xl italic ${selectedOption === questions[currentIdx].correctIndex ? 'text-amber-400' : 'text-rose-500'}`}
                    style={{ fontFamily: 'var(--font-mali)', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                   >
                     {selectedOption === questions[currentIdx].correctIndex ? 'CRITICAL HIT! 💥' : 'PLAYER DAMAGED! 🩸'}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Column 2: Quiz & Controls */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {gameState === 'intro' && (
                <motion.div 
                   key="intro"
                   initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                   className="bg-slate-800/80 backdrop-blur-md rounded-[40px] p-8 lg:p-12 text-center border border-slate-700 shadow-2xl"
                >
                   <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ShieldAlert className="text-rose-500" size={40} />
                   </div>
                   <h1 className="text-3xl lg:text-4xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                     คำเตือน: บอสปรากฏตัว!
                   </h1>
                   <div className="space-y-4 text-slate-400 mb-10 text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-mali)' }}>
                     <p>ชินจัง Shadow Slime ปรากฏตัวขัดขวางเส้นทางของคุณ!</p>
                     <p className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                        ⚡ ต้องตอบคำถามให้ถูกต้องภายใน <span className="text-rose-400 font-bold">10 วินาที</span><br/>
                        หากพลาด... คุณจะเสีย <span className="text-rose-400 font-bold">1 หัวใจ</span>!
                     </p>
                   </div>
                   <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleStart}
                     className="w-full bg-gradient-to-r from-rose-600 to-purple-700 hover:from-rose-500 hover:to-purple-600 text-white font-black py-6 rounded-3xl transition-all shadow-[0_10px_30px_rgba(225,29,72,0.3)] text-xl"
                     style={{ fontFamily: 'var(--font-prompt)' }}
                   >
                     เริ่มการต่อสู้ ⚔️
                   </motion.button>
                </motion.div>
              )}

              {gameState === 'playing' && questions.length > 0 && (
                 <motion.div 
                   key="playing"
                   initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                   className="flex-1 flex flex-col"
                 >
                   {/* Question Card */}
                   <div className="bg-slate-800/80 backdrop-blur-md p-8 lg:p-10 rounded-[40px] border border-slate-700 shadow-2xl mb-6 relative overflow-hidden">
                     {/* Timer Bar */}
                     <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900">
                        <motion.div 
                          className={`h-full ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                          animate={{ width: `${(timeLeft / 10) * 100}%` }}
                          transition={{ ease: "linear", duration: 1 }}
                        />
                     </div>
                     
                     <div className="flex justify-between items-center mb-6 mt-2">
                       <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">{questions[currentIdx].subject}</span>
                       <div className={`flex items-center gap-2 font-black text-xl ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                         <Timer size={24} /> {timeLeft}s
                       </div>
                     </div>

                     <h2 className="text-xl lg:text-3xl font-bold text-white leading-relaxed" style={{ fontFamily: 'var(--font-prompt)' }}>
                       {questions[currentIdx].question}
                     </h2>
                   </div>

                   {/* Options Grid */}
                   <div className="grid grid-cols-1 gap-4">
                     {questions[currentIdx].options.map((opt: string, i: number) => {
                       let btnStyle = "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500";
                       
                       if (selectedOption !== null && i === questions[currentIdx].correctIndex) {
                         btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]";
                       } else if (selectedOption === i && i !== questions[currentIdx].correctIndex) {
                         btnStyle = "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.1)]";
                       } else if (selectedOption !== null) {
                         btnStyle = "bg-slate-900/40 border-slate-800 text-slate-600 opacity-40";
                       }

                       return (
                         <motion.button
                           key={i}
                           whileHover={selectedOption === null ? { x: 10 } : {}}
                           disabled={selectedOption !== null}
                           onClick={() => { playPop(); handleAnswer(i); }}
                           className={`w-full text-left p-6 lg:p-8 rounded-3xl border-2 font-bold transition-all text-lg lg:text-xl flex items-center gap-4 ${btnStyle}`}
                           style={{ fontFamily: 'var(--font-prompt)' }}
                         >
                           <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-black border border-white/10">{String.fromCharCode(65 + i)}</span>
                           {opt}
                         </motion.button>
                       );
                     })}
                   </div>
                 </motion.div>
              )}

              {gameState === 'win' && (
                <motion.div 
                   key="win"
                   initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                   className="bg-slate-800 p-10 lg:p-16 rounded-[50px] text-center border border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.15)] h-full flex flex-col justify-center"
                >
                   <div className="text-8xl mb-8">🏆</div>
                   <h1 className="text-4xl lg:text-5xl font-black text-emerald-400 mb-4" style={{ fontFamily: 'var(--font-mali)' }}>
                     VICTORY!
                   </h1>
                   <p className="text-slate-400 mb-12 text-lg lg:text-xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
                     ปราบ Shadow Slime สำเร็จ นักสำรวจ!
                   </p>
                   
                   <div className="grid grid-cols-2 gap-6 mb-12">
                     <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                       <Coins className="text-amber-400 mx-auto mb-2" size={40} />
                       <p className="text-xs uppercase text-slate-500 font-black mb-1">Rewards</p>
                       <p className="text-2xl font-black text-amber-400">+100</p>
                     </div>
                     <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                       <Zap className="text-blue-400 mx-auto mb-2" size={40} />
                       <p className="text-xs uppercase text-slate-500 font-black mb-1">Bonus</p>
                       <p className="text-2xl font-black text-blue-400">+50 EXP</p>
                     </div>
                   </div>

                   <button 
                     onClick={() => router.push('/')}
                     className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-3xl transition-transform active:scale-95 shadow-lg text-xl"
                     style={{ fontFamily: 'var(--font-prompt)' }}
                   >
                     กลับสู่หน้าหลัก 🚀
                   </button>
                </motion.div>
              )}

              {gameState === 'lose' && (
                <motion.div 
                   key="lose"
                   initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                   className="bg-slate-800 p-10 lg:p-16 rounded-[50px] text-center border border-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.15)] h-full flex flex-col justify-center"
                >
                   <div className="text-8xl mb-8">💀</div>
                   <h1 className="text-4xl lg:text-5xl font-black text-rose-500 mb-4" style={{ fontFamily: 'var(--font-mali)' }}>
                     DEFEAT
                   </h1>
                   <p className="text-slate-400 mb-12 text-lg lg:text-xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
                     คุณสู้มันไม่ไหว... ถอยไปตั้งหลักก่อนนะ
                   </p>

                   <button 
                     onClick={() => router.push('/')}
                     className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-6 rounded-3xl transition-transform active:scale-95 shadow-lg text-xl"
                     style={{ fontFamily: 'var(--font-prompt)' }}
                   >
                     ถอยทัพ 🔙
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
