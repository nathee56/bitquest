'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface MatchingGameProps {
  pairs: { term: string; definition: string }[];
  onComplete: (allCorrect: boolean) => void;
  explanation?: string;
}

export default function MatchingGame({ pairs, onComplete, explanation }: MatchingGameProps) {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Shuffle definitions
  const shuffledDefs = useMemo(() => {
    const defs = pairs.map((p, i) => ({ text: p.definition, originalIndex: i }));
    for (let i = defs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [defs[i], defs[j]] = [defs[j], defs[i]];
    }
    return defs;
  }, [pairs]);

  const handleTermClick = (index: number) => {
    if (matchedPairs.includes(index) || showResult) return;
    setSelectedTerm(index);
    setWrongPair(null);
  };

  const handleDefClick = (defIndex: number) => {
    if (selectedTerm === null || showResult) return;
    const def = shuffledDefs[defIndex];

    if (def.originalIndex === selectedTerm) {
      // Correct match!
      const newMatched = [...matchedPairs, selectedTerm];
      setMatchedPairs(newMatched);
      setSelectedTerm(null);

      if (newMatched.length === pairs.length) {
        setShowResult(true);
        setTimeout(() => onComplete(true), 800);
      }
    } else {
      // Wrong match
      setWrongPair(defIndex);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTerm(null);
      }, 600);
    }
  };

  return (
    <div className="w-full">
      <div className="text-sm font-bold text-indigo-600 mb-4 text-center" style={{ fontFamily: 'var(--font-prompt)' }}>
        🔀 จับคู่คำศัพท์ให้ถูกต้อง ({matchedPairs.length}/{pairs.length})
      </div>

      <div className="flex gap-3">
        {/* Terms Column */}
        <div className="flex-1 space-y-2">
          {pairs.map((pair, i) => (
            <motion.button
              key={`term-${i}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTermClick(i)}
              className={`w-full py-3 px-3 rounded-xl text-sm font-bold text-left transition-all border-2 ${
                matchedPairs.includes(i)
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-60'
                  : selectedTerm === i
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-700 shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
              }`}
              style={{ fontFamily: 'var(--font-prompt)' }}
              disabled={matchedPairs.includes(i)}
            >
              {matchedPairs.includes(i) ? '✅ ' : ''}{pair.term}
            </motion.button>
          ))}
        </div>

        {/* Definitions Column */}
        <div className="flex-1 space-y-2">
          {shuffledDefs.map((def, i) => (
            <motion.button
              key={`def-${i}`}
              whileTap={{ scale: 0.95 }}
              animate={wrongPair === i ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
              onClick={() => handleDefClick(i)}
              className={`w-full py-3 px-3 rounded-xl text-sm font-bold text-left transition-all border-2 ${
                matchedPairs.includes(def.originalIndex)
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-60'
                  : wrongPair === i
                    ? 'bg-rose-100 border-rose-400 text-rose-700'
                    : 'bg-orange-50 border-orange-200 text-slate-700 hover:border-orange-300'
              }`}
              style={{ fontFamily: 'var(--font-prompt)' }}
              disabled={matchedPairs.includes(def.originalIndex)}
            >
              {matchedPairs.includes(def.originalIndex) ? '✅ ' : ''}{def.text}
            </motion.button>
          ))}
        </div>
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-200"
        >
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-sm font-bold text-emerald-700" style={{ fontFamily: 'var(--font-prompt)' }}>
            จับคู่ถูกหมดเลย! เก่งมาก!
          </p>
          {explanation && (
            <p className="text-xs text-slate-600 mt-2" style={{ fontFamily: 'var(--font-prompt)' }}>{explanation}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
