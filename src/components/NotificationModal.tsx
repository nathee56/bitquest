'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gamepad2, ShieldCheck, Zap } from 'lucide-react';
import { playPop } from '@/lib/soundEffects';
import { hapticLight } from '@/lib/haptics';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const handleClose = () => {
    playPop();
    hapticLight();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white text-center">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
              <div className="mx-auto w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-wide" style={{ fontFamily: 'var(--font-mali)' }}>อัปเดตใหม่!</h2>
              <p className="opacity-90 text-sm mt-1 font-medium bg-white/20 inline-block px-3 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-prompt)' }}>
                Version 0.2.0
              </p>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto" style={{ fontFamily: 'var(--font-prompt)' }}>
              <div className="space-y-6">
                
                {/* Item 1 */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Gamepad2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'var(--font-mali)' }}>ระบบเติมคำแบบใหม่</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      ไม่ต้องพิมพ์เองอีกต่อไป! สามารถกดเลือกช้อยส์คำตอบให้ลอยเข้าช่องว่างได้เลย ง่ายและเร็วขึ้นเยอะ!
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'var(--font-mali)' }}>ปรับสมดุลความยาก</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      ปรับเนื้อหาของบทเรียนทั้ง 21 บทให้เล่นง่ายขึ้น เกมจับคู่เหลือแค่ 3 คู่ ลดความปวดหัวลงไปเยอะ!
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'var(--font-mali)' }}>ระบบรวมข้อมูลไอดี</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      เล่นโหมด Guest ไว้ย้ายมาผูกบัญชี Google ข้อมูลไม่หาย! คะแนนกับด่านที่ปลดล็อคจะรวมกันอัตโนมัติ
                    </p>
                  </div>
                </div>

              </div>
              
              {/* Confirm Button */}
              <button
                onClick={handleClose}
                className="w-full mt-8 py-3.5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                style={{ fontFamily: 'var(--font-mali)' }}
              >
                รับทราบ ลุยต่อ! 🚀
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
