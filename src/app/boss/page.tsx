'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Heart, Coins, Swords, Timer, Zap, ShieldAlert } from 'lucide-react';
import { defaultLessons } from '@/data/defaultLessons';

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-4 font-black tracking-widest uppercase text-sm" style={{ fontFamily: 'var(--font-prompt)' }}>
          <div className="flex items-center gap-1 text-rose-500">
             <Heart size={16} className="fill-rose-500" /> {userProfile.hearts}
          </div>
          <div className="flex items-center gap-1 text-amber-400">
             <Coins size={16} className="fill-amber-400" /> {userProfile.coins}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col pt-8">
        
        {/* Boss Arena */}
        <div className="relative h-64 mb-8 flex items-center justify-center">
          {/* Boss HP Bar */}
           <div className="absolute top-0 left-4 right-4 bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700">
             <motion.div 
               animate={{ width: `${bossHP}%` }}
               className="h-full bg-gradient-to-r from-red-500 to-rose-400"
               transition={{ type: 'spring', stiffness: 50 }}
             />
           </div>
           <div className="absolute top-6 left-0 right-0 text-center text-xs font-bold text-rose-300 uppercase tracking-[0.2em]">
             Shadow Slime Boss • {bossHP} HP
           </div>

           {/* Glitch Slime SVG */}
           <motion.div 
             animate={
               bossAnimation === 'idle' ? { y: [0, -10, 0], scale: [1, 1.02, 1] } :
               bossAnimation === 'hit' ? { x: [-10, 10, -10, 10, 0], filter: 'brightness(2)' } :
               { scale: [1, 1.5, 1], y: [0, -50, 0] } // attack
             }
             transition={bossAnimation === 'idle' ? { repeat: Infinity, duration: 2 } : { duration: 0.4 }}
             className="w-48 h-48 drop-shadow-2xl"
           >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Slime Body */}
                <path d="M50 85 C10 85 15 50 15 45 C15 20 35 15 50 15 C65 15 85 20 85 45 C85 50 90 85 50 85 Z" fill="#6d28d9" opacity="0.9" />
                <path d="M50 80 C20 80 25 50 25 45 C25 25 40 20 50 20 C60 20 75 25 75 45 C75 50 80 80 50 80 Z" fill="#4c1d95" />
                {/* Evil Eyes */}
                <path d="M30 45 L45 50 L35 40 Z" fill="#f43f5e" />
                <path d="M70 45 L55 50 L65 40 Z" fill="#f43f5e" />
                {/* Glitch Specs */}
                <rect x="20" y="30" width="5" height="2" fill="#34d399" />
                <rect x="70" y="60" width="8" height="3" fill="#3b82f6" />
                <rect x="40" y="25" width="4" height="2" fill="#fbbf24" />
              </svg>
           </motion.div>
        </div>

        {/* Game States */}
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div 
               key="intro"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
               className="bg-slate-800 rounded-3xl p-8 text-center border border-slate-700 shadow-xl"
            >
               <ShieldAlert className="mx-auto text-rose-500 mb-4" size={48} />
               <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                 คำเตือน: บอสปรากฏตัว!
               </h1>
               <p className="text-slate-400 mb-6 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mali)' }}>
                 ตอบคำถามให้ถูกต้องภายใน 10 วินาที เพื่อโจมตีบอส.<br/>หากตอบผิดหรือหมดเวลา คุณจะเสีย <span className="text-rose-400">1 หัวใจ</span>!
               </p>
               <button 
                 onClick={handleStart}
                 className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black py-4 rounded-2xl transition-transform active:scale-95 shadow-lg shadow-rose-500/20"
                 style={{ fontFamily: 'var(--font-prompt)' }}
               >
                 เข้าสู่การต่อสู้ (Battle Start)
               </button>
            </motion.div>
          )}

          {gameState === 'playing' && questions.length > 0 && (
             <motion.div 
               key="playing"
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="flex-1 flex flex-col"
             >
               {/* Question Card */}
               <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl mb-4 relative overflow-hidden">
                 {/* Timer Bar */}
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-700">
                    <motion.div 
                      className={`h-full ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                      animate={{ width: `${(timeLeft / 10) * 100}%` }}
                      transition={{ ease: "linear", duration: 1 }}
                    />
                 </div>
                 
                 <div className="flex justify-between items-center mb-4 mt-2">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{questions[currentIdx].subject}</div>
                   <div className={`flex items-center gap-1 font-black ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                     <Timer size={16} /> {timeLeft}s
                   </div>
                 </div>

                 <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed" style={{ fontFamily: 'var(--font-mali)' }}>
                   {questions[currentIdx].question}
                 </h2>
               </div>

               {/* Options */}
               <div className="grid grid-cols-1 gap-3">
                 {questions[currentIdx].options.map((opt: string, i: number) => {
                   let btnStyle = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700";
                   
                   if (selectedOption !== null && i === questions[currentIdx].correctIndex) {
                     btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                   } else if (selectedOption === i && i !== questions[currentIdx].correctIndex) {
                     btnStyle = "bg-rose-500/20 border-rose-500 text-rose-400";
                   }

                   return (
                     <button
                       key={i}
                       disabled={selectedOption !== null}
                       onClick={() => handleAnswer(i)}
                       className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ${btnStyle}`}
                       style={{ fontFamily: 'var(--font-prompt)' }}
                     >
                       {opt}
                     </button>
                   );
                 })}
               </div>
             </motion.div>
          )}

          {gameState === 'win' && (
            <motion.div 
               key="win"
               initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
               className="bg-slate-800 rounded-3xl p-8 text-center border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
               <div className="text-6xl mb-6">🏆</div>
               <h1 className="text-3xl font-black text-emerald-400 mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                 ปราบสไลม์สำเร็จ!
               </h1>
               <p className="text-slate-400 mb-8 font-bold">รับรางวัลภารกิจ</p>
               
               <div className="flex justify-center gap-6 mb-8">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                     <Coins className="text-amber-400" size={32} />
                   </div>
                   <div className="font-black text-amber-400">+100</div>
                 </div>
                 <div className="text-center">
                   <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                     <Zap className="text-blue-400" size={32} />
                   </div>
                   <div className="font-black text-blue-400">+50 EXP</div>
                 </div>
               </div>

               <button 
                 onClick={() => router.push('/')}
                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl transition-transform active:scale-95 shadow-lg"
                 style={{ fontFamily: 'var(--font-prompt)' }}
               >
                 กลับสู่แคมป์
               </button>
            </motion.div>
          )}

          {gameState === 'lose' && (
            <motion.div 
               key="lose"
               initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
               className="bg-slate-800 rounded-3xl p-8 text-center border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
            >
               <div className="text-6xl mb-6">💀</div>
               <h1 className="text-3xl font-black text-rose-400 mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                 ภารกิจล้มเหลว
               </h1>
               <p className="text-slate-400 mb-8 font-bold">คุณหมดสภาพการต่อสู้ (หัวใจหมด)</p>

               <button 
                 onClick={() => router.push('/')}
                 className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-4 rounded-2xl transition-transform active:scale-95 shadow-lg"
                 style={{ fontFamily: 'var(--font-prompt)' }}
               >
                 ถอยทัพ
               </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
