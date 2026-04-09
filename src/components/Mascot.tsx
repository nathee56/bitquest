// ============================================
// BitQuest — น้องบิท (Bit-chan) Full Avatar System
// SVG Chibi Fox with Paper Doll layers,
// Dynamic Emotions, and Interactive Speech Bubbles
// ============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

// === Emotion Types ===
type MascotEmotion = 'happy' | 'idle' | 'sad' | 'sleep' | 'excited' | 'surprised';

// === Speech Bubble Messages (context-aware) ===
const idleMessages = [
  'สู้ๆ นะ! เธอทำได้! 💪',
  'วันนี้เรียนดีมาก! 🎯',
  'ความรู้คือพลัง! ⚡',
  'บิทเชียร์ให้นะ! ❤️',
  'หมั่นทบทวนด้วยนะ~ 📖',
  'เก่งมาก ลุยต่อเลย! 🌟',
  'อีกนิดเดียวก็ครบด่านแล้ว! 🏁',
  'พักสายตาบ้างนะ 👀',
  'วันนี้เข้าเรียนแล้วหรือยัง? 📚',
];

const lowHeartMessages = [
  'ระวังหัวใจหมดนะ! 💔',
  'คิดดีๆ ก่อนตอบนะ~ 🤔',
  'หัวใจเหลือน้อยแล้ว! 😰',
];

const tapMessages = [
  'อุ๊ย! จิ้มทำไม~ 🙈',
  'เฮ้! บิทตกใจหมด! 😳',
  'หึหึ จั๊กจี้~ 😆',
  'อย่ามายุ่ง กำลังนั่งน่ารักอยู่! 😤',
  'แหม~ อยากเล่นกับบิทเหรอ 🦊',
  'ว้าว! มีอะไรให้ช่วยมั้ย? 🌟',
];

const sleepMessages = [
  'zzZ... zzZ... 💤',
  '(กำลังฝันว่าได้เรียนรู้...) 💭',
];

// === SVG Fox Body Component ===
function FoxBody({ emotion, style }: { emotion: MascotEmotion; style?: string }) {
  const bodyColor = style === 'ninja' ? '#2d2d2d' : style === 'king' ? '#8b5e3c' : style === 'ghost' ? '#e8e0f0' : style === 'wizard' ? '#5b3a8c' : '#e8734a';
  const bellyColor = style === 'ninja' ? '#444' : style === 'ghost' ? '#f5f0fa' : style === 'wizard' ? '#7c5cad' : '#fff5ee';
  const earInner = style === 'ninja' ? '#555' : style === 'ghost' ? '#d8d0e8' : style === 'wizard' ? '#7c5cad' : '#ff9a76';
  
  return (
    <svg viewBox="0 0 120 140" width="120" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* ===== EARS ===== */}
      {/* Left Ear */}
      <path d="M25 50 L15 15 L45 40 Z" fill={bodyColor} />
      <path d="M27 48 L19 22 L42 42 Z" fill={earInner} opacity="0.6" />
      {/* Right Ear */}
      <path d="M95 50 L105 15 L75 40 Z" fill={bodyColor} />
      <path d="M93 48 L101 22 L78 42 Z" fill={earInner} opacity="0.6" />

      {/* ===== HEAD ===== */}
      <ellipse cx="60" cy="58" rx="38" ry="35" fill={bodyColor} />
      
      {/* Face white patch */}
      <ellipse cx="60" cy="65" rx="24" ry="22" fill={bellyColor} />
      
      {/* ===== EYES ===== */}
      {emotion === 'sleep' ? (
        <>
          {/* Sleeping eyes — closed lines */}
          <path d="M40 55 Q45 60 50 55" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M70 55 Q75 60 80 55" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : emotion === 'sad' ? (
        <>
          {/* Sad eyes — droopy */}
          <ellipse cx="45" cy="54" rx="5" ry="6" fill="#333" />
          <ellipse cx="75" cy="54" rx="5" ry="6" fill="#333" />
          <ellipse cx="46" cy="52" rx="2" ry="2.5" fill="white" opacity="0.8" />
          <ellipse cx="76" cy="52" rx="2" ry="2.5" fill="white" opacity="0.8" />
          {/* Sad eyebrows */}
          <path d="M37 46 Q42 43 50 46" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M70 46 Q78 43 83 46" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Tear */}
          <motion.ellipse 
            cx="52" cy="62" rx="2" ry="3" fill="#60a5fa" opacity="0.7"
            animate={{ cy: [62, 68, 62], opacity: [0.7, 0, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </>
      ) : emotion === 'excited' || emotion === 'happy' ? (
        <>
          {/* Happy eyes — ^_^ shape */}
          <path d="M38 56 Q45 48 52 56" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M68 56 Q75 48 82 56" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Sparkles near eyes */}
          {emotion === 'excited' && (
            <>
              <motion.text x="28" y="45" fontSize="8" animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>✨</motion.text>
              <motion.text x="82" y="45" fontSize="8" animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>✨</motion.text>
            </>
          )}
        </>
      ) : emotion === 'surprised' ? (
        <>
          {/* Surprised eyes — big round */}
          <circle cx="45" cy="54" r="7" fill="#333" />
          <circle cx="75" cy="54" r="7" fill="#333" />
          <circle cx="47" cy="52" r="3" fill="white" opacity="0.9" />
          <circle cx="77" cy="52" r="3" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          {/* Default idle eyes */}
          <ellipse cx="45" cy="54" rx="5" ry="5.5" fill="#333" />
          <ellipse cx="75" cy="54" rx="5" ry="5.5" fill="#333" />
          <ellipse cx="47" cy="52" rx="2" ry="2.5" fill="white" opacity="0.8" />
          <ellipse cx="77" cy="52" rx="2" ry="2.5" fill="white" opacity="0.8" />
          {/* Blink animation overlay */}
          <motion.rect
            x="38" y="48" width="16" height="13" rx="3" fill={bodyColor}
            animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            style={{ transformOrigin: '46px 54px' }}
          />
          <motion.rect
            x="68" y="48" width="16" height="13" rx="3" fill={bodyColor}
            animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            style={{ transformOrigin: '76px 54px' }}
          />
        </>
      )}

      {/* ===== NOSE ===== */}
      <ellipse cx="60" cy="64" rx="3.5" ry="2.5" fill="#333" />

      {/* ===== MOUTH ===== */}
      {emotion === 'happy' || emotion === 'excited' ? (
        <path d="M52 70 Q60 78 68 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : emotion === 'sad' ? (
        <path d="M52 74 Q60 68 68 74" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : emotion === 'surprised' ? (
        <ellipse cx="60" cy="73" rx="5" ry="4" fill="#333" />
      ) : emotion === 'sleep' ? (
        <path d="M55 70 Q60 73 65 70" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M54 70 Q60 74 66 70" stroke="#333" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}

      {/* ===== CHEEK BLUSH ===== */}
      <ellipse cx="32" cy="64" rx="6" ry="4" fill="#ffb3a0" opacity="0.5" />
      <ellipse cx="88" cy="64" rx="6" ry="4" fill="#ffb3a0" opacity="0.5" />

      {/* ===== BODY ===== */}
      <ellipse cx="60" cy="105" rx="28" ry="25" fill={bodyColor} />
      {/* Belly */}
      <ellipse cx="60" cy="108" rx="18" ry="16" fill={bellyColor} />

      {/* ===== ARMS ===== */}
      {emotion === 'happy' || emotion === 'excited' ? (
        <>
          {/* Arms raised / waving */}
          <motion.path 
            d="M32 100 Q18 82 22 75" stroke={bodyColor} strokeWidth="10" fill="none" strokeLinecap="round"
            animate={emotion === 'excited' ? { d: ['M32 100 Q18 82 22 75', 'M32 100 Q18 82 16 70', 'M32 100 Q18 82 22 75'] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
          <motion.path 
            d="M88 100 Q102 82 98 75" stroke={bodyColor} strokeWidth="10" fill="none" strokeLinecap="round"
            animate={emotion === 'excited' ? { d: ['M88 100 Q102 82 98 75', 'M88 100 Q102 82 104 70', 'M88 100 Q102 82 98 75'] } : {}}
            transition={{ repeat: Infinity, duration: 0.5, delay: 0.25 }}
          />
        </>
      ) : (
        <>
          {/* Arms down / resting */}
          <path d="M32 100 Q22 108 26 118" stroke={bodyColor} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M88 100 Q98 108 94 118" stroke={bodyColor} strokeWidth="10" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ===== TAIL ===== */}
      <motion.path
        d="M88 115 Q110 105 115 90 Q118 80 110 85"
        stroke={bodyColor} strokeWidth="8" fill="none" strokeLinecap="round"
        animate={{ d: [
          'M88 115 Q110 105 115 90 Q118 80 110 85',
          'M88 115 Q112 100 118 88 Q122 78 114 82',
          'M88 115 Q110 105 115 90 Q118 80 110 85',
        ]}}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
      {/* Tail white tip */}
      <motion.circle
        cx="112" cy="84" r="5" fill={bellyColor}
        animate={{ cx: [112, 116, 112], cy: [84, 81, 84] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />

      {/* ===== FEET ===== */}
      <ellipse cx="46" cy="128" rx="12" ry="6" fill={bodyColor} />
      <ellipse cx="74" cy="128" rx="12" ry="6" fill={bodyColor} />
      
      {/* Sleep ZZZ */}
      {emotion === 'sleep' && (
        <>
          <motion.text x="80" y="35" fontSize="12" fontWeight="bold" fill="#a78bfa"
            animate={{ y: [35, 25, 35], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >z</motion.text>
          <motion.text x="90" y="25" fontSize="16" fontWeight="bold" fill="#a78bfa"
            animate={{ y: [25, 12, 25], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          >Z</motion.text>
          <motion.text x="100" y="15" fontSize="20" fontWeight="bold" fill="#a78bfa"
            animate={{ y: [15, 0, 15], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          >Z</motion.text>
        </>
      )}
    </svg>
  );
}

// === Hat Overlay Layer ===
function HatLayer({ hat }: { hat?: string }) {
  if (!hat || hat === 'none') return null;

  return (
    <svg viewBox="0 0 120 140" width="120" height="140" className="absolute top-0 left-0" xmlns="http://www.w3.org/2000/svg">
      {hat === 'wizard_hat' && (
        <>
          {/* Wizard Hat */}
          <path d="M28 42 L60 -5 L92 42 Z" fill="#5b3a8c" />
          <path d="M28 42 L60 -5 L92 42 Z" fill="url(#wizGrad)" />
          <ellipse cx="60" cy="42" rx="38" ry="8" fill="#4a2e73" />
          <circle cx="60" cy="3" r="5" fill="#fbbf24" />
          {/* Stars on hat */}
          <text x="45" y="28" fontSize="8" fill="#fbbf24">⭐</text>
          <text x="65" y="20" fontSize="6" fill="#fbbf24">✨</text>
          <defs>
            <linearGradient id="wizGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cad" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </>
      )}
      {hat === 'crown' && (
        <>
          {/* Royal Crown */}
          <path d="M30 45 L30 28 L42 38 L52 22 L60 35 L68 22 L78 38 L90 28 L90 45 Z" fill="#fbbf24" />
          <path d="M30 45 L30 28 L42 38 L52 22 L60 35 L68 22 L78 38 L90 28 L90 45 Z" stroke="#e8a800" strokeWidth="1.5" fill="none" />
          <rect x="30" y="42" width="60" height="8" rx="2" fill="#e8a800" />
          {/* Gems */}
          <circle cx="45" cy="45" r="3" fill="#ef4444" />
          <circle cx="60" cy="45" r="3" fill="#3b82f6" />
          <circle cx="75" cy="45" r="3" fill="#22c55e" />
          {/* Crown tips sparkle */}
          <circle cx="52" cy="22" r="2" fill="#fff" opacity="0.9" />
          <circle cx="60" cy="35" r="1.5" fill="#fff" opacity="0.7" />
          <circle cx="68" cy="22" r="2" fill="#fff" opacity="0.9" />
        </>
      )}
      {hat === 'ninja_band' && (
        <>
          {/* Ninja Headband */}
          <rect x="22" y="40" width="76" height="10" rx="3" fill="#2d2d2d" />
          <rect x="22" y="43" width="76" height="4" rx="1" fill="#ef4444" />
          {/* Trailing cloth */}
          <motion.path
            d="M92 45 Q105 42 110 50 Q115 55 108 55"
            stroke="#2d2d2d" strokeWidth="5" fill="none" strokeLinecap="round"
            animate={{ d: [
              'M92 45 Q105 42 110 50 Q115 55 108 55',
              'M92 45 Q105 40 112 52 Q118 58 110 56',
              'M92 45 Q105 42 110 50 Q115 55 108 55',
            ]}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {/* Metal plate */}
          <rect x="50" y="40" width="20" height="10" rx="2" fill="#94a3b8" />
          <text x="55" y="49" fontSize="7" fontWeight="bold" fill="#333">忍</text>
        </>
      )}
      {hat === 'party_hat' && (
        <>
          {/* Party Hat */}
          <path d="M38 44 L60 5 L82 44 Z" fill="#a78bfa" />
          <ellipse cx="60" cy="44" rx="24" ry="6" fill="#8b5cf6" />
          <circle cx="60" cy="5" r="4" fill="#fbbf24" />
          {/* Stripes */}
          <path d="M46 35 L54 18" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
          <path d="M74 35 L66 18" stroke="#60a5fa" strokeWidth="2" opacity="0.5" />
          <path d="M50 38 L57 22" stroke="#f87171" strokeWidth="2" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

// === Accessory Overlay Layer ===
function AccessoryLayer({ accessory }: { accessory?: string }) {
  if (!accessory || accessory === 'none') return null;

  return (
    <svg viewBox="0 0 120 140" width="120" height="140" className="absolute top-0 left-0" xmlns="http://www.w3.org/2000/svg">
      {accessory === 'glasses' && (
        <>
          {/* Round Glasses */}
          <circle cx="45" cy="54" r="10" stroke="#333" strokeWidth="2.5" fill="none" />
          <circle cx="75" cy="54" r="10" stroke="#333" strokeWidth="2.5" fill="none" />
          <line x1="55" y1="54" x2="65" y2="54" stroke="#333" strokeWidth="2" />
          {/* Glare */}
          <ellipse cx="41" cy="50" rx="3" ry="2" fill="white" opacity="0.3" />
          <ellipse cx="71" cy="50" rx="3" ry="2" fill="white" opacity="0.3" />
        </>
      )}
      {accessory === 'cool_shades' && (
        <>
          {/* Sunglasses */}
          <rect x="33" y="48" width="18" height="12" rx="3" fill="#1a1a2e" />
          <rect x="69" y="48" width="18" height="12" rx="3" fill="#1a1a2e" />
          <line x1="51" y1="54" x2="69" y2="54" stroke="#1a1a2e" strokeWidth="2.5" />
          <line x1="33" y1="52" x2="24" y2="50" stroke="#1a1a2e" strokeWidth="2" />
          <line x1="87" y1="52" x2="96" y2="50" stroke="#1a1a2e" strokeWidth="2" />
          {/* Lens reflection */}
          <rect x="35" y="49" width="6" height="3" rx="1" fill="white" opacity="0.2" />
          <rect x="71" y="49" width="6" height="3" rx="1" fill="white" opacity="0.2" />
        </>
      )}
      {accessory === 'bow_tie' && (
        <>
          {/* Bow Tie */}
          <path d="M48 88 L38 80 L38 96 Z" fill="#ef4444" />
          <path d="M72 88 L82 80 L82 96 Z" fill="#ef4444" />
          <circle cx="60" cy="88" r="4" fill="#b91c1c" />
          <ellipse cx="50" cy="88" rx="10" ry="8" fill="#ef4444" />
          <ellipse cx="70" cy="88" rx="10" ry="8" fill="#ef4444" />
          <circle cx="60" cy="88" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
        </>
      )}
      {accessory === 'scarf' && (
        <>
          {/* Scarf wrapping around neck */}
          <path d="M32 82 Q60 92 88 82 Q92 82 90 88 Q60 100 30 88 Q28 82 32 82 Z" fill="#22c55e" />
          <motion.path
            d="M50 92 Q52 105 48 118"
            stroke="#22c55e" strokeWidth="12" fill="none" strokeLinecap="round"
            animate={{ d: [
              'M50 92 Q52 105 48 118',
              'M50 92 Q54 105 50 118',
              'M50 92 Q52 105 48 118',
            ]}}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          {/* Stripe pattern */}
          <path d="M35 84 Q60 94 85 84" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M34 87 Q60 97 86 87" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

// === Main Mascot Avatar Component ===
export default function Mascot() {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  
  const [emotion, setEmotion] = useState<MascotEmotion>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  // Don't show on lesson pages (they have their own UI)
  const isLessonPage = pathname?.startsWith('/lesson/');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // === Idle Sleep Timer ===
  // If no interaction for 60 seconds, mascot falls asleep
  const resetIdleTimer = useCallback(() => {
    if (isSleeping) {
      setIsSleeping(false);
      setEmotion('idle');
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsSleeping(true);
      setEmotion('sleep');
      // Show sleep message
      setCurrentMessage(sleepMessages[Math.floor(Math.random() * sleepMessages.length)]);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4000);
    }, 60000); // 60 seconds idle = sleep
  }, [isSleeping]);

  // Listen for user activity to reset idle timer
  useEffect(() => {
    if (!isMounted) return;
    
    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isMounted, resetIdleTimer]);

  // === Context-Aware Messages ===
  const getContextMessage = useCallback(() => {
    if (userProfile && userProfile.hearts <= 2 && userProfile.hearts > 0) {
      return lowHeartMessages[Math.floor(Math.random() * lowHeartMessages.length)];
    }
    return idleMessages[Math.floor(Math.random() * idleMessages.length)];
  }, [userProfile]);

  // === Periodic Auto-Wave ===
  useEffect(() => {
    if (!isMounted || isLessonPage) return;

    // Appear entrance after 4 seconds
    const entranceTimer = setTimeout(() => {
      setIsVisible(true);
      setEmotion('happy');
      setCurrentMessage('สวัสดี! บิทพร้อมเชียร์แล้ว! 🦊');
      setShowBubble(true);
      setTimeout(() => {
        setShowBubble(false);
        setEmotion('idle');
      }, 4000);
    }, 4000);

    // Show periodic message every 40s
    const interval = setInterval(() => {
      if (isSleeping) return;
      setCurrentMessage(getContextMessage());
      setShowBubble(true);
      setEmotion('happy');
      setTimeout(() => {
        setShowBubble(false);
        setEmotion('idle');
      }, 5000);
    }, 40000);

    return () => {
      clearTimeout(entranceTimer);
      clearInterval(interval);
    };
  }, [isMounted, isLessonPage, isSleeping, getContextMessage]);

  // === Tap Interaction ===
  const handleTap = useCallback(() => {
    resetIdleTimer();

    // Surprised reaction
    setEmotion('surprised');
    controls.start({
      rotate: [0, -8, 8, -5, 5, 0],
      y: [0, -15, 0],
      transition: { duration: 0.5 }
    });

    // Show tap message
    setCurrentMessage(tapMessages[Math.floor(Math.random() * tapMessages.length)]);
    setShowBubble(true);

    // Return to happy then idle
    setTimeout(() => {
      setEmotion('happy');
    }, 500);
    setTimeout(() => {
      setShowBubble(false);
      setEmotion('idle');
    }, 3500);
  }, [controls, resetIdleTimer]);

  // === Listen for Global Emotion Events (from quiz answers etc.) ===
  useEffect(() => {
    const handleCorrect = () => {
      setEmotion('excited');
      setCurrentMessage('ถูกต้อง! เก่งมากก! 🎉');
      setShowBubble(true);
      controls.start({
        y: [0, -20, 0, -10, 0],
        transition: { duration: 0.8 }
      });
      setTimeout(() => { setShowBubble(false); setEmotion('idle'); }, 3000);
    };

    const handleWrong = () => {
      setEmotion('sad');
      setCurrentMessage('ไม่เป็นไร ลองใหม่นะ... 😢');
      setShowBubble(true);
      setTimeout(() => { setShowBubble(false); setEmotion('idle'); }, 3000);
    };

    window.addEventListener('mascot:correct', handleCorrect);
    window.addEventListener('mascot:wrong', handleWrong);
    return () => {
      window.removeEventListener('mascot:correct', handleCorrect);
      window.removeEventListener('mascot:wrong', handleWrong);
    };
  }, [controls]);

  if (!isMounted || isLessonPage) return null;

  const equippedStyle = userProfile?.equippedMascotStyle || 'default';
  const equippedHat = userProfile?.equippedHat || 'none';
  const equippedAccessory = userProfile?.equippedAccessory || 'none';

  return (
    <div className="fixed bottom-24 right-3 z-[45] flex flex-col items-end gap-1 md:bottom-8 md:right-6">
      {/* === Speech Bubble === */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="pointer-events-none mr-2"
          >
            <div
              className="relative px-4 py-3 rounded-2xl rounded-br-sm shadow-xl max-w-[200px]"
              style={{
                background: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(16px)',
                border: '2px solid rgba(232, 115, 74, 0.15)',
                fontFamily: 'var(--font-prompt)',
              }}
            >
              <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                {currentMessage}
              </p>
              {/* Bubble tail */}
              <div
                className="absolute -bottom-2 right-4 w-0 h-0"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '8px solid rgba(255, 255, 255, 0.97)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Avatar Character (SVG Layers) === */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <motion.button
              animate={controls}
              onClick={handleTap}
              className="relative cursor-pointer focus:outline-none"
              style={{ width: 80, height: 95 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              {/* Glow effect behind character */}
              <div
                className="absolute -inset-2 rounded-full opacity-30 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(232, 115, 74, 0.4) 0%, transparent 70%)',
                }}
              />

              {/* Character container with breathing animation */}
              <motion.div
                className="relative"
                style={{ width: 80, height: 95, transform: 'scale(0.67)', transformOrigin: 'bottom right' }}
                animate={
                  emotion === 'sleep'
                    ? { y: [0, 2, 0], scale: [1, 1.02, 1] }
                    : emotion === 'idle'
                    ? { y: [0, -3, 0] }
                    : {}
                }
                transition={{
                  repeat: Infinity,
                  duration: emotion === 'sleep' ? 3 : 2.5,
                  ease: 'easeInOut',
                }}
              >
                {/* Base Fox Body */}
                <FoxBody emotion={emotion} style={equippedStyle} />

                {/* Paper Doll Layer: Hat */}
                <HatLayer hat={equippedHat} />

                {/* Paper Doll Layer: Accessory */}
                <AccessoryLayer accessory={equippedAccessory} />
              </motion.div>

              {/* Shadow */}
              <motion.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: 40,
                  height: 8,
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
                }}
                animate={
                  emotion === 'idle'
                    ? { scaleX: [1, 0.9, 1], opacity: [0.15, 0.1, 0.15] }
                    : emotion === 'excited'
                    ? { scaleX: [1, 0.7, 1], opacity: [0.15, 0.05, 0.15] }
                    : {}
                }
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
