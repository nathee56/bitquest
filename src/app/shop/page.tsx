'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Coins, Heart, ArrowLeft, Star, Crown, Ghost, Gift } from 'lucide-react';

// === Gacha Database with Rarity ===
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
const RARITY_COLORS: Record<Rarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};
const RARITY_LABELS: Record<Rarity, string> = {
  common: '⬜ Common',
  rare: '🟦 Rare',
  epic: '🟪 Epic',
  legendary: '🟨 Legendary',
};

const GACHA_ITEMS = [
  // Mascot Skins
  { id: 'ghost', name: 'วิญญาณน้อย', type: 'mascot', rate: 18, icon: '👻', rarity: 'common' as Rarity },
  { id: 'ninja', name: 'ชุดนินจา', type: 'mascot', rate: 14, icon: '🥷', rarity: 'rare' as Rarity },
  { id: 'king', name: 'มงกุฎราชา', type: 'mascot', rate: 8, icon: '👑', rarity: 'epic' as Rarity },
  { id: 'wizard', name: 'จอมเวทย์', type: 'mascot', rate: 5, icon: '🧙', rarity: 'legendary' as Rarity },
  // Profile Frames
  { id: 'gold_frame', name: 'กรอบสีทอง', type: 'frame', rate: 8, icon: '🖼️', rarity: 'epic' as Rarity },
  { id: 'neon_frame', name: 'กรอบนีออน', type: 'frame', rate: 5, icon: '💫', rarity: 'legendary' as Rarity },
  // Hats
  { id: 'party_hat', name: 'หมวกปาร์ตี้', type: 'hat', rate: 15, icon: '🎉', rarity: 'common' as Rarity },
  { id: 'ninja_band', name: 'ผ้าคาดนินจา', type: 'hat', rate: 8, icon: '🥷', rarity: 'rare' as Rarity },
  { id: 'crown', name: 'มงกุฎทอง', type: 'hat', rate: 4, icon: '👑', rarity: 'legendary' as Rarity },
  { id: 'wizard_hat', name: 'หมวกพ่อมด', type: 'hat', rate: 5, icon: '🧙', rarity: 'epic' as Rarity },
  // Accessories
  { id: 'glasses', name: 'แว่นตากลม', type: 'accessory', rate: 12, icon: '👓', rarity: 'common' as Rarity },
  { id: 'bow_tie', name: 'โบว์ไทด์', type: 'accessory', rate: 10, icon: '🎀', rarity: 'rare' as Rarity },
  { id: 'scarf', name: 'ผ้าพันคอ', type: 'accessory', rate: 6, icon: '🧣', rarity: 'rare' as Rarity },
  { id: 'cool_shades', name: 'แว่นกันแดด', type: 'accessory', rate: 4, icon: '😎', rarity: 'epic' as Rarity },
];

const GACHA_COST = 50;

export default function ShopPage() {
  const router = useRouter();
  const { userProfile, spendCoins, unlockItem } = useAuth();
  
  const [isPulling, setIsPulling] = useState(false);
  const [pulledItem, setPulledItem] = useState<{ id: string, name: string, type: string, icon: string, rarity: Rarity } | null>(null);

  const handlePullGacha = async () => {
    if (!userProfile) return;
    if (userProfile.coins < GACHA_COST) {
      alert('เหรียญไม่พอนะ! ไปเรียนเพื่อสะสมเหรียญเพิ่มกันเถอะ');
      return;
    }

    setIsPulling(true);
    setPulledItem(null);

    const success = await spendCoins(GACHA_COST);
    if (!success) {
      setIsPulling(false);
      return;
    }

    // Logic for Gacha Roll based on rates
    const rand = Math.random() * 100;
    let sum = 0;
    let selected = GACHA_ITEMS[0];
    for (let item of GACHA_ITEMS) {
      sum += item.rate;
      if (rand <= sum) {
        selected = item;
        break;
      }
    }

    // Unlock item
    await unlockItem(selected.type as 'mascot' | 'frame' | 'hat' | 'accessory', selected.id);

    // Simulate animation delay
    setTimeout(() => {
      setPulledItem(selected);
      setIsPulling(false);
    }, 2000); // 2 seconds animation
  };

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition">
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-mali)' }}>ร้านค้า & กาชา</h1>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full border-2 border-yellow-200">
          <Coins size={18} className="text-yellow-600" />
          <span className="font-bold text-yellow-700">{userProfile.coins}</span>
        </div>
      </header>

      <main className="p-5 flex flex-col items-center">
        <div className="text-center mb-8 mt-4">
          <h2 className="text-2xl font-black text-slate-800 mb-2" style={{ fontFamily: 'var(--font-mali)' }}>
            สุ่มกาชาปอง 🎁
          </h2>
          <p className="text-slate-500 text-sm">ใช้ 50 เหรียญ เพื่อสุ่มรับสกิน, หมวก, แว่น หรือกรอบโปรไฟล์!</p>
        </div>

        {/* Gacha Machine / Box Animation */}
        <div className="relative w-full max-w-sm aspect-square bg-slate-100 rounded-3xl mb-8 flex items-center justify-center overflow-hidden border-4 border-slate-200 shadow-inner">
          <AnimatePresence>
            {!pulledItem && !isPulling && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-9xl float-animation cursor-pointer"
                onClick={handlePullGacha}
              >
                📦
              </motion.div>
            )}

            {isPulling && (
              <motion.div
                key="pulling"
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, -10, 10, 0], 
                  scale: [1, 1.1, 1] 
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-9xl"
              >
                ✨📦✨
              </motion.div>
            )}

            {pulledItem && !isPulling && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.1, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="flex flex-col items-center justify-center p-6 bg-white/90 rounded-2xl shadow-xl border-2"
                style={{ borderColor: RARITY_COLORS[pulledItem.rarity] }}
              >
                <div className="text-7xl mb-4">{pulledItem.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{pulledItem.name}</h3>
                <p className="text-xs font-bold px-3 py-1 rounded-full border uppercase mb-1"
                  style={{ color: RARITY_COLORS[pulledItem.rarity], backgroundColor: RARITY_COLORS[pulledItem.rarity] + '15', borderColor: RARITY_COLORS[pulledItem.rarity] + '40' }}>
                  {RARITY_LABELS[pulledItem.rarity]}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  {pulledItem.type === 'mascot' ? 'Mascot Skin' : pulledItem.type === 'frame' ? 'Profile Frame' : pulledItem.type === 'hat' ? 'Hat' : 'Accessory'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={pulledItem ? () => setPulledItem(null) : handlePullGacha}
          disabled={isPulling || userProfile.coins < GACHA_COST}
          className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition ${
            isPulling || userProfile.coins < GACHA_COST 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-200/50'
          }`}
          style={{ fontFamily: 'var(--font-mali)' }}
        >
          {pulledItem ? (
            'สุ่มอีกครั้ง (50 เหรียญ)'
          ) : isPulling ? (
            'กำลังสุ่ม...'
          ) : (
            <>
              จ่าย 50 <Coins size={20} /> เพื่อสุ่ม!
            </>
          )}
        </motion.button>
      </main>
    </div>
  );
}
