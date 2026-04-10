'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Coins, Heart, ArrowLeft, Zap, ShoppingBag, Sparkles, Package, CheckCircle2 } from 'lucide-react';

// === Gacha Database with Rarity ===
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
const RARITY_COLORS: Record<Rarity, string> = { common: '#94a3b8', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
const RARITY_LABELS: Record<Rarity, string> = { common: '⬜ Common', rare: '🟦 Rare', epic: '🟪 Epic', legendary: '🟨 Legendary' };
const RARITY_GLOW: Record<Rarity, string> = { common: '', rare: '0 0 20px rgba(59,130,246,0.3)', epic: '0 0 20px rgba(168,85,247,0.3)', legendary: '0 0 30px rgba(245,158,11,0.5)' };

const GACHA_ITEMS = [
  { id: 'ghost', name: 'วิญญาณน้อย', type: 'mascot', rate: 18, icon: '👻', rarity: 'common' as Rarity },
  { id: 'ninja', name: 'ชุดนินจา', type: 'mascot', rate: 14, icon: '🥷', rarity: 'rare' as Rarity },
  { id: 'king', name: 'มงกุฎราชา', type: 'mascot', rate: 8, icon: '👑', rarity: 'epic' as Rarity },
  { id: 'wizard', name: 'จอมเวทย์', type: 'mascot', rate: 5, icon: '🧙', rarity: 'legendary' as Rarity },
  { id: 'gold_frame', name: 'กรอบสีทอง', type: 'frame', rate: 8, icon: '🖼️', rarity: 'epic' as Rarity },
  { id: 'neon_frame', name: 'กรอบนีออน', type: 'frame', rate: 5, icon: '💫', rarity: 'legendary' as Rarity },
  { id: 'party_hat', name: 'หมวกปาร์ตี้', type: 'hat', rate: 15, icon: '🎉', rarity: 'common' as Rarity },
  { id: 'ninja_band', name: 'ผ้าคาดนินจา', type: 'hat', rate: 8, icon: '🥷', rarity: 'rare' as Rarity },
  { id: 'crown', name: 'มงกุฎทอง', type: 'hat', rate: 4, icon: '👑', rarity: 'legendary' as Rarity },
  { id: 'wizard_hat', name: 'หมวกพ่อมด', type: 'hat', rate: 5, icon: '🧙', rarity: 'epic' as Rarity },
  { id: 'glasses', name: 'แว่นตากลม', type: 'accessory', rate: 12, icon: '👓', rarity: 'common' as Rarity },
  { id: 'bow_tie', name: 'โบว์ไทด์', type: 'accessory', rate: 10, icon: '🎀', rarity: 'rare' as Rarity },
  { id: 'scarf', name: 'ผ้าพันคอ', type: 'accessory', rate: 6, icon: '🧣', rarity: 'rare' as Rarity },
  { id: 'cool_shades', name: 'แว่นกันแดด', type: 'accessory', rate: 4, icon: '😎', rarity: 'epic' as Rarity },
];

const GACHA_COST = 50;
const PREMIUM_GACHA_COST = 100;
const HEART_REFILL_COST = 80;
const EXP_BOOST_COST = 200;
const EXP_BOOST_MINUTES = 10;

type ShopTab = 'gacha' | 'items' | 'collection';

export default function ShopPage() {
  const router = useRouter();
  const { userProfile, spendCoins, unlockItem, activateExpBoost, refillHearts } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ShopTab>('gacha');
  const [isPulling, setIsPulling] = useState(false);
  const [pulledItem, setPulledItem] = useState<{ id: string, name: string, type: string, icon: string, rarity: Rarity } | null>(null);
  const [buyMessage, setBuyMessage] = useState<string | null>(null);

  const rollGacha = (isPremium: boolean) => {
    const items = [...GACHA_ITEMS];
    if (isPremium) {
      // Premium: double legendary rates
      items.forEach(item => {
        if (item.rarity === 'legendary') item.rate *= 2;
      });
    }
    const totalRate = items.reduce((sum, item) => sum + item.rate, 0);
    const rand = Math.random() * totalRate;
    let sum = 0;
    for (const item of items) {
      sum += item.rate;
      if (rand <= sum) return item;
    }
    return items[0];
  };

  const handlePullGacha = async (isPremium = false) => {
    if (!userProfile) return;
    const cost = isPremium ? PREMIUM_GACHA_COST : GACHA_COST;
    if (userProfile.coins < cost) {
      alert('เหรียญไม่พอนะ! ไปเรียนเพื่อสะสมเหรียญเพิ่มกันเถอะ');
      return;
    }

    setIsPulling(true);
    setPulledItem(null);

    const success = await spendCoins(cost);
    if (!success) { setIsPulling(false); return; }

    const selected = rollGacha(isPremium);
    await unlockItem(selected.type as 'mascot' | 'frame' | 'hat' | 'accessory', selected.id);

    setTimeout(() => {
      setPulledItem(selected);
      setIsPulling(false);
    }, 2000);
  };

  const handleBuyHearts = async () => {
    if (!userProfile || userProfile.coins < HEART_REFILL_COST) {
      alert('เหรียญไม่พอครับ!');
      return;
    }
    if (userProfile.hearts >= 5) {
      setBuyMessage('❤️ หัวใจเต็มแล้ว!');
      setTimeout(() => setBuyMessage(null), 2000);
      return;
    }
    const success = await spendCoins(HEART_REFILL_COST);
    if (success) {
      await refillHearts();
      setBuyMessage('❤️ เติมหัวใจเต็มแล้ว!');
      setTimeout(() => setBuyMessage(null), 2000);
    }
  };

  const handleBuyBoost = async () => {
    if (!userProfile || userProfile.coins < EXP_BOOST_COST) {
      alert('เหรียญไม่พอครับ!');
      return;
    }
    // Check if boost is already active
    if (userProfile.expBoostUntil && new Date(userProfile.expBoostUntil) > new Date()) {
      setBuyMessage('⚡ EXP Boost ยังทำงานอยู่!');
      setTimeout(() => setBuyMessage(null), 2000);
      return;
    }
    const success = await spendCoins(EXP_BOOST_COST);
    if (success) {
      await activateExpBoost(EXP_BOOST_MINUTES);
      setBuyMessage('⚡ EXP x2 เปิดใช้งานแล้ว! (10 นาที)');
      setTimeout(() => setBuyMessage(null), 3000);
    }
  };

  if (!userProfile) return null;

  const isBoostActive = userProfile.expBoostUntil && new Date(userProfile.expBoostUntil) > new Date();
  const allUnlocked = [
    ...(userProfile.unlockedMascotStyles || []),
    ...(userProfile.unlockedProfileFrames || []),
    ...(userProfile.unlockedHats || []),
    ...(userProfile.unlockedAccessories || []),
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-800 transition">
            <ArrowLeft size={24} className="text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-mali)' }}>ร้านค้า & กาชา</h1>
        </div>
        <div className="flex items-center gap-3">
          {isBoostActive && (
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/40">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">x2</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/40">
            <Coins size={18} className="text-yellow-400" />
            <span className="font-bold text-yellow-300">{userProfile.coins}</span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {([
          { key: 'gacha' as ShopTab, icon: <Package size={16} />, label: 'กาชา' },
          { key: 'items' as ShopTab, icon: <ShoppingBag size={16} />, label: 'ซื้อตรง' },
          { key: 'collection' as ShopTab, icon: <Sparkles size={16} />, label: 'คอลเล็กชัน' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Buy Message Toast */}
      <AnimatePresence>
        {buyMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl"
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            {buyMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-4">
        {/* ========== GACHA TAB ========== */}
        {activeTab === 'gacha' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-mali)' }}>
                สุ่มกาชาปอง 🎁
              </h2>
              <p className="text-slate-400 text-xs">สุ่มรับสกิน, หมวก, แว่น หรือกรอบโปรไฟล์!</p>
            </div>

            {/* Gacha Machine */}
            <div className="relative w-full max-w-sm mx-auto aspect-square bg-slate-800/50 rounded-3xl mb-6 flex items-center justify-center overflow-hidden border-2 border-slate-700/50 shadow-inner">
              <AnimatePresence mode="wait">
                {!pulledItem && !isPulling && (
                  <motion.div key="idle" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-9xl float-animation cursor-pointer" onClick={() => handlePullGacha(false)}>
                    📦
                  </motion.div>
                )}
                {isPulling && (
                  <motion.div key="pulling" animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }} className="text-9xl">
                    ✨📦✨
                  </motion.div>
                )}
                {pulledItem && !isPulling && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.1, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.6 }} className="flex flex-col items-center justify-center p-6 bg-slate-800/90 rounded-2xl shadow-xl border-2 backdrop-blur-md" style={{ borderColor: RARITY_COLORS[pulledItem.rarity], boxShadow: RARITY_GLOW[pulledItem.rarity] }}>
                    <div className="text-7xl mb-4">{pulledItem.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-1">{pulledItem.name}</h3>
                    <p className="text-xs font-bold px-3 py-1 rounded-full border uppercase mb-1" style={{ color: RARITY_COLORS[pulledItem.rarity], backgroundColor: RARITY_COLORS[pulledItem.rarity] + '15', borderColor: RARITY_COLORS[pulledItem.rarity] + '40' }}>
                      {RARITY_LABELS[pulledItem.rarity]}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      {pulledItem.type === 'mascot' ? 'Mascot Skin' : pulledItem.type === 'frame' ? 'Profile Frame' : pulledItem.type === 'hat' ? 'Hat' : 'Accessory'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gacha Buttons */}
            <div className="max-w-sm mx-auto space-y-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={pulledItem ? () => setPulledItem(null) : () => handlePullGacha(false)} disabled={isPulling || userProfile.coins < GACHA_COST}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition ${isPulling || userProfile.coins < GACHA_COST ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-500/30'}`}
                style={{ fontFamily: 'var(--font-mali)' }}
              >
                {pulledItem ? 'สุ่มอีกครั้ง' : isPulling ? 'กำลังสุ่ม...' : <><Coins size={20} /> สุ่มทั่วไป (50 เหรียญ)</>}
              </motion.button>

              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setPulledItem(null); handlePullGacha(true); }} disabled={isPulling || userProfile.coins < PREMIUM_GACHA_COST}
                className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition ${isPulling || userProfile.coins < PREMIUM_GACHA_COST ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/30 border border-purple-400/30'}`}
                style={{ fontFamily: 'var(--font-mali)' }}
              >
                <Sparkles size={18} /> Lucky Ticket (100 เหรียญ, Legendary x2!)
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ========== DIRECT BUY TAB ========== */}
        {activeTab === 'items' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm mx-auto space-y-4">
            <h2 className="text-lg font-black text-white mb-4" style={{ fontFamily: 'var(--font-mali)' }}>🛍️ ซื้อตรง</h2>

            {/* Heart Refill */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-3xl flex-shrink-0">❤️</div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-prompt)' }}>เติมหัวใจเต็ม</h3>
                <p className="text-xs text-slate-400">เติมหัวใจกลับเป็น 5 ดวงทันที</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400 font-bold"><Coins size={12} /> {HEART_REFILL_COST} เหรียญ</div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleBuyHearts} disabled={userProfile.coins < HEART_REFILL_COST}
                className={`px-4 py-2 rounded-xl font-bold text-sm ${userProfile.coins < HEART_REFILL_COST ? 'bg-slate-700 text-slate-500' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'}`}
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                {userProfile.hearts >= 5 ? 'เต็มแล้ว' : 'ซื้อ'}
              </motion.button>
            </div>

            {/* EXP Boost */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 flex items-center gap-4 relative overflow-hidden">
              {isBoostActive && <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500/30 rounded-full text-[10px] font-bold text-yellow-400 border border-yellow-500/40">ACTIVE</div>}
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-3xl flex-shrink-0">⚡</div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-prompt)' }}>EXP Boost x2</h3>
                <p className="text-xs text-slate-400">ได้ EXP เป็น 2 เท่า นาน {EXP_BOOST_MINUTES} นาที</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400 font-bold"><Coins size={12} /> {EXP_BOOST_COST} เหรียญ</div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleBuyBoost} disabled={userProfile.coins < EXP_BOOST_COST || !!isBoostActive}
                className={`px-4 py-2 rounded-xl font-bold text-sm ${(userProfile.coins < EXP_BOOST_COST || isBoostActive) ? 'bg-slate-700 text-slate-500' : 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/30'}`}
                style={{ fontFamily: 'var(--font-prompt)' }}
              >
                {isBoostActive ? 'กำลังใช้' : 'ซื้อ'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ========== COLLECTION TAB ========== */}
        {activeTab === 'collection' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-mali)' }}>✨ คอลเล็กชัน</h2>
              <span className="text-xs font-bold text-slate-400">{allUnlocked.length - 1}/{GACHA_ITEMS.length} ปลดล็อก</span>
            </div>

            {/* Categories */}
            {(['mascot', 'frame', 'hat', 'accessory'] as const).map(category => {
              const items = GACHA_ITEMS.filter(i => i.type === category);
              const categoryLabel = category === 'mascot' ? '🦊 Mascot Skins' : category === 'frame' ? '🖼️ Profile Frames' : category === 'hat' ? '🎩 Hats' : '✨ Accessories';
              
              return (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">{categoryLabel}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {items.map(item => {
                      const isUnlocked = allUnlocked.includes(item.id);
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          className={`relative rounded-2xl p-4 border-2 text-center transition-all ${
                            isUnlocked 
                              ? 'bg-slate-800/60 border-slate-600/50' 
                              : 'bg-slate-900/60 border-slate-800/50 opacity-50 grayscale'
                          }`}
                          style={isUnlocked ? { boxShadow: RARITY_GLOW[item.rarity] } : {}}
                        >
                          {isUnlocked && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            </div>
                          )}
                          <div className="text-4xl mb-2">{item.icon}</div>
                          <p className="text-xs font-bold text-white truncate" style={{ fontFamily: 'var(--font-prompt)' }}>{item.name}</p>
                          <p className="text-[10px] font-bold mt-1" style={{ color: RARITY_COLORS[item.rarity] }}>
                            {RARITY_LABELS[item.rarity]}
                          </p>
                          {!isUnlocked && (
                            <p className="text-[10px] text-slate-500 mt-1 font-bold">🔒 ยังไม่ปลดล็อก</p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
