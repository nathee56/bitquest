'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Heart, Mail, Code, Globe } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-[#e2e8f0] pb-32">
      <div className="max-w-4xl mx-auto pt-8 md:pt-16 px-4">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 transition-colors"
          style={{ fontFamily: 'var(--font-prompt)' }}
        >
          <ArrowLeft size={20} /> ย้อนกลับ
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="notebook-spread journal-paper paper-texture p-8 md:p-12 shadow-2xl rounded-3xl relative overflow-hidden"
        >
          {/* Notebook Decorative Elements */}
          <div className="absolute top-0 bottom-0 left-0 w-8 notebook-rings opacity-30" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-800 mb-8 border-b-4 border-dashed border-slate-200 pb-4" style={{ fontFamily: 'var(--font-mali)' }}>
              เกี่ยวกับบิตเควส (About BitQuest) 🦊📖
            </h1>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-mali)' }}>
                โครงการเรียนรู้ยุคใหม่ 🗺️
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                BitQuest คือแพลตฟอร์มการเรียนรู้ขนาดเล็ก (Microlearning) ที่ออกแบบมาเพื่อทำให้การหาความรู้เป็นเรื่องสนุกเหมือนการเล่นเกม 
                ภายใต้สโลแกน "เรียนรู้ทีละนิด เก่งขึ้นทุกวัน" เราเชื่อว่าการสะสมความรู้ทีละเล็กทีละน้อยจะสร้างความเปลี่ยนแปลงที่ยิ่งใหญ่ได้
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="hand-drawn-border p-4 bg-white/50">
                  <h3 className="font-bold text-slate-700 mb-2">เป้าหมายของเรา</h3>
                  <p className="text-xs text-slate-500">สร้างนิสัยการเรียนรู้ที่ยั่งยืนผ่านระบบ Gamification และเนื้อหาที่ย่อยง่าย</p>
                </div>
                <div className="hand-drawn-border p-4 bg-white/50">
                  <h3 className="font-bold text-slate-700 mb-2">แนวคิดการออกแบบ</h3>
                  <p className="text-xs text-slate-500">ผสมผสานความน่ารัก (Cutie) เข้ากับฟังก์ชันการใช้งานที่ลื่นไหล (Minimal Tech)</p>
                </div>
              </div>
            </section>

            <section className="mb-12 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-orange-600 mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-mali)' }}>
                ผู้พัฒนา (The Explorer) 🧑‍💻
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg rotate-3 shrink-0">
                  {/* Placeholder for Dev Image - use generated mascot or default */}
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-5xl">🦊</div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Nathee (BitQuest Dev)</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Developer ผู้หลงใหลใน Gamification และการออกแบบประสบการณ์ผู้ใช้ (UX/UI) 
                    ผมสร้างโปรเจกต์นี้ขึ้นมาเพื่อแบ่งปันวิธีการเรียนรู้ที่มีประสิทธิภาพและเข้าถึงง่ายสำหรับทุกคน
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Code size={20} /></a>
                    <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors"><Globe size={20} /></a>
                    <a href="#" className="text-slate-400 hover:text-rose-400 transition-colors"><Mail size={20} /></a>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-16 bg-white/60 p-8 rounded-2xl hand-drawn-border border-rose-200" style={{ boxShadow: '0 8px 32px rgba(244, 63, 94, 0.05)' }}>
              <div className="text-center">
                <h2 className="text-2xl font-black text-rose-500 mb-4" style={{ fontFamily: 'var(--font-mali)' }}>
                  สนับสนุนโปรเจกต์ (Support Us) ❤️
                </h2>
                <p className="text-slate-500 text-sm mb-8">
                  หากคุณชื่นชอบการเดินทางใน BitQuest และต้องการสนับสนุนค่ากาแฟและค่าเซิร์ฟเวอร์ในการพัฒนาต่อ 
                  คุณสามารถร่วมสนับสนุนได้ผ่าน PromptPay ด้านล่างนี้ครับ
                </p>
                
                <div className="max-w-[240px] mx-auto bg-white p-4 rounded-xl shadow-lg mb-6 border-2 border-slate-50">
                  {/* Donation QR Code Image */}
                  <img 
                    src="/donate-qr.png" 
                    alt="Donation QR Code" 
                    className="w-full aspect-square object-contain rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/fff/rose?text=QR+Code+Missing';
                    }}
                  />
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan to Support via PromptPay</div>
                </div>

                <div className="flex justify-center gap-2">
                  <div className="bg-slate-100 px-4 py-2 rounded-full text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Heart size={14} className="text-rose-500 fill-rose-500" /> ขอบคุณทุกการสนับสนุนครับ
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Journal Meta */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-300">
             <span>v1.2.0 Stable</span>
             <span>BitQuest Lab © 2026</span>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
