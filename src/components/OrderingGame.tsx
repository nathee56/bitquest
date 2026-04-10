'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface OrderingGameProps {
  correctOrder: string[];
  onComplete: (allCorrect: boolean) => void;
  explanation?: string;
}

export default function OrderingGame({ correctOrder, onComplete, explanation }: OrderingGameProps) {
  const shuffled = useMemo(() => {
    const items = [...correctOrder];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [correctOrder]);

  const [available, setAvailable] = useState<string[]>(shuffled);
  const [selected, setSelected] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelectItem = (item: string) => {
    if (showResult) return;
    setAvailable(prev => prev.filter(i => i !== item));
    setSelected(prev => [...prev, item]);
    setIsCorrect(null);
  };

  const handleRemoveItem = (index: number) => {
    if (showResult) return;
    const item = selected[index];
    setSelected(prev => prev.filter((_, i) => i !== index));
    setAvailable(prev => [...prev, item]);
    setIsCorrect(null);
  };

  const handleCheck = () => {
    const correct = selected.every((item, i) => item === correctOrder[i]);
    setIsCorrect(correct);
    if (correct) {
      setShowResult(true);
      setTimeout(() => onComplete(true), 800);
    }
  };

  const handleReset = () => {
    setAvailable(shuffled);
    setSelected([]);
    setIsCorrect(null);
  };

  return (
    <div className="w-full">
      <div className="text-sm font-bold text-indigo-600 mb-4 text-center" style={{ fontFamily: 'var(--font-prompt)' }}>
        🔢 เรียงลำดับเหตุการณ์ให้ถูกต้อง
      </div>

      {/* Answer Slots */}
      <div className="mb-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 min-h-[60px]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ลำดับที่เลือก:</p>
        {selected.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-4" style={{ fontFamily: 'var(--font-prompt)' }}>กดเลือกรายการด้านล่างเพื่อเรียงลำดับ</p>
        ) : (
          <div className="space-y-2">
            {selected.map((item, i) => (
              <motion.button
                key={`selected-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRemoveItem(i)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold text-left transition-all border-2 ${
                  isCorrect === true ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                  isCorrect === false ? 'bg-rose-50 border-rose-300 text-rose-700' :
                  'bg-indigo-50 border-indigo-200 text-slate-700'
                }`}
                style={{ fontFamily: 'var(--font-prompt)' }}
                disabled={showResult}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  isCorrect === true ? 'bg-emerald-500 text-white' :
                  isCorrect === false ? 'bg-rose-500 text-white' :
                  'bg-indigo-500 text-white'
                }`}>{i + 1}</span>
                {item}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Available Items */}
      {available.length > 0 && (
        <div className="space-y-2 mb-4">
          {available.map((item, i) => (
            <motion.button
              key={`avail-${i}`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleSelectItem(item)}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-left bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              style={{ fontFamily: 'var(--font-prompt)' }}
            >
              {item}
            </motion.button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {selected.length === correctOrder.length && !showResult && (
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            className="flex-1 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg"
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            ✅ ตรวจคำตอบ
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-200 text-slate-600"
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            🔄
          </motion.button>
        </div>
      )}

      {isCorrect === false && !showResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
          <p className="text-sm font-bold text-rose-600" style={{ fontFamily: 'var(--font-prompt)' }}>ลำดับยังไม่ถูก ลองใหม่นะ! 💪</p>
          <button onClick={handleReset} className="mt-2 text-xs font-bold text-rose-500 underline" style={{ fontFamily: 'var(--font-prompt)' }}>รีเซ็ตลำดับ</button>
        </motion.div>
      )}

      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-200">
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-sm font-bold text-emerald-700" style={{ fontFamily: 'var(--font-prompt)' }}>เรียงลำดับถูกต้อง! เยี่ยมมาก!</p>
          {explanation && <p className="text-xs text-slate-600 mt-2" style={{ fontFamily: 'var(--font-prompt)' }}>{explanation}</p>}
        </motion.div>
      )}
    </div>
  );
}
