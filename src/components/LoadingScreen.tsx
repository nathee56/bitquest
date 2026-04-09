'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const loadingMessages = [
  "กำลังเตรียมสมุดบันทึก...",
  "น้องจิ้งจอกกำลังวิ่งไปหาความรู้มาให้...",
  "จุดตะเกียงส่องทางสำรวจ...",
  "กางแผนที่ BitQuest...",
  "รวบรวมดวงดาวแห่งปัญญา...",
  "รอสักครู่ กำลังจัดขนให้สวยงาม...",
];

export default function LoadingScreen() {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdfaf5] overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-orange-100/50 animate-ping opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-orange-200/30 animate-pulse opacity-10" />

      <div className="relative">
        {/* Chibi Fox Mascot (Minimal version for loading) */}
        <motion.div
           animate={{ 
             y: [0, -15, 0],
             rotate: [-1, 1, -1]
           }}
           transition={{ 
             duration: 2.5,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="w-32 h-32 relative z-10"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ear R */}
            <path d="M65 30L85 10L75 40L65 30Z" fill="#e8734a" stroke="#4a2c1d" strokeWidth="2" />
            {/* Ear L */}
            <path d="M35 30L15 10L25 40L35 30Z" fill="#e8734a" stroke="#4a2c1d" strokeWidth="2" />
            {/* Head */}
            <path d="M25 45C25 35 35 25 50 25C65 25 75 35 75 45C75 60 50 75 50 75C50 75 25 60 25 45Z" fill="#e8734a" stroke="#4a2c1d" strokeWidth="2" />
            {/* Face White */}
            <path d="M35 55C35 50 40 45 50 45C60 45 65 50 65 55C65 65 50 75 50 75C50 75 35 65 35 55Z" fill="white" />
            {/* Eyes */}
            <circle cx="42" cy="48" r="2.5" fill="#4a2c1d" />
            <circle cx="58" cy="48" r="2.5" fill="#4a2c1d" />
            {/* Nose */}
            <circle cx="50" cy="55" r="1.5" fill="#4a2c1d" />
          </svg>
        </motion.div>
        
        {/* Glow Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-200/50 rounded-full blur-sm -z-10 animate-pulse" />
      </div>

      <div className="mt-12 text-center px-6">
        <motion.p 
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-slate-500 font-bold mb-6 min-h-[1.5rem]"
          style={{ fontFamily: 'var(--font-mali)' }}
        >
          {message}
        </motion.p>
        
        {/* Progress Bar Container */}
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
           <motion.div 
             initial={{ width: "0%" }}
             animate={{ width: ["0%", "40%", "70%", "85%", "95%"] }}
             transition={{ duration: 15, ease: "easeOut" }}
             className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
           />
           {/* Shimmer Effect */}
           <motion.div 
             animate={{ x: [-200, 200] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 bg-white/30 skew-x-12"
           />
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        BitQuest — Let's Explore
      </div>
    </div>
  );
}
