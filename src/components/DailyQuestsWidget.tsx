'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Target, CheckCircle2, Coins, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyQuestsWidget() {
  const { userProfile, claimQuestReward } = useAuth();

  if (!userProfile || !userProfile.dailyQuests || userProfile.dailyQuests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 p-5 rounded-3xl hand-drawn-border relative overflow-hidden mt-6 mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4 border-b border-indigo-100 pb-3">
        <div className="bg-indigo-100 p-2 rounded-xl">
          <Target className="text-indigo-500" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-indigo-900" style={{ fontFamily: 'var(--font-prompt)' }}>
            ภารกิจประจำวัน
          </h2>
          <p className="text-xs text-indigo-500/80 font-bold tracking-wider">DAILY QUESTS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
        {userProfile.dailyQuests.map((quest) => {
          const progressPercent = Math.min(100, (quest.progress / quest.goal) * 100);
          
          return (
            <motion.div 
              key={quest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
                quest.claimed 
                  ? 'bg-slate-50 border-slate-200 opacity-60 grayscale-[0.5]' 
                  : quest.completed 
                    ? 'bg-amber-50 border-amber-300' 
                    : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <h3 className={`font-bold text-sm leading-snug ${quest.completed ? 'text-amber-700' : 'text-slate-700'}`} style={{ fontFamily: 'var(--font-prompt)' }}>
                    {quest.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    <Coins size={10} /> +{quest.rewardCoins} COINS
                  </div>
                </div>
                
                {quest.claimed ? (
                   <div className="bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
                     <CheckCircle2 size={10} /> DONE
                   </div>
                ) : quest.completed ? (
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => claimQuestReward(quest.id)}
                     className="bg-amber-400 text-white shadow-sm text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-amber-500 transition-colors"
                   >
                     <Gift size={12} /> COLLECT
                   </motion.button>
                ) : (
                   <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                     {quest.progress}/{quest.goal}
                   </div>
                )}
              </div>

              {/* Progress Bar */}
              {!quest.claimed && (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-full rounded-full ${quest.completed ? 'bg-amber-400' : 'bg-indigo-400'}`}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
