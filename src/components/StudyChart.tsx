// ============================================
// BitQuest — Hand-drawn Weekly Study Chart
// ============================================

'use client';

import { motion } from 'framer-motion';

interface StudyData {
  day: string;
  count: number;
}

const exampleData: StudyData[] = [
  { day: 'จ.', count: 3 },
  { day: 'อ.', count: 5 },
  { day: 'พ.', count: 2 },
  { day: 'พฤ.', count: 6 },
  { day: 'ศ.', count: 4 },
  { day: 'ส.', count: 8 },
  { day: 'อา.', count: 4 },
];

export default function StudyChart() {
  const maxCount = Math.max(...exampleData.map(d => d.count));
  
  return (
    <div className="w-full mt-6 mb-4">
      <div className="flex items-end justify-between h-32 gap-2 px-2 relative">
        {/* Draw Graphite Grid Lines */}
        <div className="absolute inset-0 border-b-2 border-slate-300 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-1/2 border-b border-slate-200 border-dashed pointer-events-none" />

        {exampleData.map((d, i) => {
          const barHeight = (d.count / maxCount) * 100;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ delay: i * 0.1, duration: 1, type: 'spring' }}
                className="w-full max-w-[20px] bg-indigo-600/60 rounded-t-sm relative group"
                style={{ 
                  borderRadius: '120px 10px 100px 5px / 5px 100px 10px 120px',
                  boxShadow: '2px 2px 0 rgba(79, 70, 229, 0.2)' 
                }}
              >
                {/* Hand-drawn scribble texture overlay */}
                <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                   <div className="w-full h-[200%] bg-repeat rotate-12" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, #fff 50%)', backgroundSize: '4px 4px' }} />
                </div>
                
                {/* Count tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                   {d.count}
                </div>
              </motion.div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase" style={{ fontFamily: 'var(--font-mali)' }}>{d.day}</span>
            </div>
          );
        })}
      </div>
      
      <p className="text-[11px] text-slate-400 text-center mt-4 italic" style={{ fontFamily: 'var(--font-prompt)' }}>
        "บันทึกความพยายามในสัปดาห์นี้"
      </p>
    </div>
  );
}
