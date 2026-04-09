// ============================================
// BitQuest — Admin Data Uploader
// Create lessons and inject directly into Firestore
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lesson, LessonContent, SubjectType } from '@/lib/types';

// === Subject options ===
const SUBJECTS: { value: SubjectType; label: string; emoji: string }[] = [
  { value: 'ประวัติศาสตร์', label: 'ประวัติศาสตร์', emoji: '🏛️' },
  { value: 'สังคมศึกษา', label: 'สังคมศึกษา', emoji: '⚖️' },
  { value: 'ภาษาอังกฤษ', label: 'ภาษาอังกฤษ', emoji: '🇬🇧' },
];

// === Empty content block factory ===
function createEmptyBlock(type: LessonContent['type']): LessonContent {
  switch (type) {
    case 'summary':
      return { type: 'summary', text: '' };
    case 'image':
      return { type: 'image', imageUrl: '' };
    case 'quiz':
      return { type: 'quiz', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
  }
}

export default function AdminPage() {
  // === Form State ===
  const [subject, setSubject] = useState<SubjectType>('ประวัติศาสตร์');
  const [title, setTitle] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('3 นาที');
  const [contentBlocks, setContentBlocks] = useState<LessonContent[]>([
    createEmptyBlock('summary'),
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // === Existing Lessons ===
  const [existingLessons, setExistingLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  // === Fetch existing lessons ===
  const fetchLessons = useCallback(async () => {
    setLoadingLessons(true);
    try {
      const q = query(collection(db, 'lessons'));
      const snapshot = await getDocs(q);
      const lessons: Lesson[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lesson[];
      setExistingLessons(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // === Add content block ===
  const addBlock = (type: LessonContent['type']) => {
    setContentBlocks([...contentBlocks, createEmptyBlock(type)]);
  };

  // === Remove content block ===
  const removeBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  // === Update content block ===
  const updateBlock = (index: number, updates: Partial<LessonContent>) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setContentBlocks(newBlocks);
  };

  // === Update quiz option ===
  const updateQuizOption = (blockIndex: number, optionIndex: number, value: string) => {
    const newBlocks = [...contentBlocks];
    const options = [...(newBlocks[blockIndex].options || ['', '', '', ''])];
    options[optionIndex] = value;
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], options };
    setContentBlocks(newBlocks);
  };

  // === Save to Firestore ===
  const handleSave = async () => {
    // Validate
    if (!title.trim()) {
      setSaveMessage({ type: 'error', text: 'กรุณาใส่ชื่อบทเรียน' });
      return;
    }

    if (contentBlocks.length === 0) {
      setSaveMessage({ type: 'error', text: 'กรุณาเพิ่มเนื้อหาอย่างน้อย 1 บล็อก' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Clean content blocks — remove empty fields
      const cleanedBlocks = contentBlocks.map((block) => {
        const cleaned: Record<string, unknown> = { type: block.type };
        if (block.type === 'summary' && block.text) cleaned.text = block.text;
        if (block.type === 'image' && block.imageUrl) cleaned.imageUrl = block.imageUrl;
        if (block.type === 'quiz') {
          cleaned.question = block.question || '';
          cleaned.options = block.options || [];
          cleaned.correctIndex = block.correctIndex || 0;
          cleaned.explanation = block.explanation || '';
        }
        return cleaned;
      });

      await addDoc(collection(db, 'lessons'), {
        subject,
        title: title.trim(),
        estimatedTime,
        content: cleanedBlocks,
      });

      setSaveMessage({ type: 'success', text: '✅ บันทึกบทเรียนสำเร็จ!' });

      // Reset form
      setTitle('');
      setContentBlocks([createEmptyBlock('summary')]);

      // Refresh list
      await fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setSaveMessage({ type: 'error', text: '❌ เกิดข้อผิดพลาด กรุณาลองใหม่' });
    } finally {
      setIsSaving(false);
    }
  };

  // === Delete lesson ===
  const handleDelete = async (lessonId: string) => {
    if (!confirm('ต้องการลบบทเรียนนี้จริงหรือ?')) return;

    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      await fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  return (
    <div
      className="min-h-screen pb-12"
      style={{ backgroundColor: 'var(--color-lime-cream)' }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
                boxShadow: '0 2px 12px rgba(232, 115, 74, 0.3)',
              }}
            >
              <span className="text-lg">🔧</span>
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}
              >
                Admin Panel
              </h1>
              <p className="text-xs" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
                สร้างบทเรียนและเพิ่มลง Firestore
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Lesson Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 glass-card p-5 mb-6"
      >
        <h2
          className="text-base font-bold mb-4"
          style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}
        >
          📝 สร้างบทเรียนใหม่
        </h2>

        {/* Subject Dropdown */}
        <label className="block mb-3">
          <span className="text-xs font-medium mb-1 block" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}>
            วิชา
          </span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as SubjectType)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              fontFamily: 'var(--font-prompt)',
              backgroundColor: 'var(--color-lime-cream)',
              border: '1px solid rgba(0,0,0,0.06)',
              color: 'var(--color-text-primary)',
            }}
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* Title */}
        <label className="block mb-3">
          <span className="text-xs font-medium mb-1 block" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}>
            ชื่อบทเรียน
          </span>
          <input
            type="text"
            placeholder="เช่น สุโขทัย: อาณาจักรแห่งแรกของไทย"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              fontFamily: 'var(--font-prompt)',
              backgroundColor: 'var(--color-lime-cream)',
              border: '1px solid rgba(0,0,0,0.06)',
              color: 'var(--color-text-primary)',
            }}
          />
        </label>

        {/* Estimated Time */}
        <label className="block mb-5">
          <span className="text-xs font-medium mb-1 block" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}>
            เวลาโดยประมาณ
          </span>
          <input
            type="text"
            placeholder="เช่น 3 นาที"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              fontFamily: 'var(--font-prompt)',
              backgroundColor: 'var(--color-lime-cream)',
              border: '1px solid rgba(0,0,0,0.06)',
              color: 'var(--color-text-primary)',
            }}
          />
        </label>

        {/* Content Blocks */}
        <div className="mb-4">
          <span className="text-xs font-medium mb-2 block" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-secondary)' }}>
            เนื้อหา ({contentBlocks.length} บล็อก)
          </span>

          {contentBlocks.map((block, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-4 rounded-xl relative"
              style={{
                backgroundColor: 'var(--color-lime-cream)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {/* Block header */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    backgroundColor:
                      block.type === 'summary' ? 'rgba(167, 139, 250, 0.15)' :
                      block.type === 'image' ? 'rgba(96, 165, 250, 0.15)' :
                      'rgba(255, 154, 118, 0.15)',
                    color:
                      block.type === 'summary' ? '#8b5cf6' :
                      block.type === 'image' ? '#3b82f6' :
                      '#e8734a',
                  }}
                >
                  {block.type === 'summary' ? '📄 Summary' : block.type === 'image' ? '🖼️ Image' : '🧠 Quiz'}
                </span>
                <button
                  onClick={() => removeBlock(index)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    color: 'var(--color-quiz-incorrect)',
                    backgroundColor: 'var(--color-quiz-incorrect-bg)',
                  }}
                >
                  ลบ ✕
                </button>
              </div>

              {/* Summary block */}
              {block.type === 'summary' && (
                <textarea
                  placeholder="เนื้อหาสรุป..."
                  value={block.text || ''}
                  onChange={(e) => updateBlock(index, { text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.04)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              )}

              {/* Image block */}
              {block.type === 'image' && (
                <input
                  type="text"
                  placeholder="URL รูปภาพ (เช่น https://...)"
                  value={block.imageUrl || ''}
                  onChange={(e) => updateBlock(index, { imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    fontFamily: 'var(--font-prompt)',
                    backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.04)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              )}

              {/* Quiz block */}
              {block.type === 'quiz' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="คำถาม"
                    value={block.question || ''}
                    onChange={(e) => updateBlock(index, { question: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      fontFamily: 'var(--font-prompt)',
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.04)',
                      color: 'var(--color-text-primary)',
                    }}
                  />

                  {(block.options || ['', '', '', '']).map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateBlock(index, { correctIndex: optIdx })}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                        style={{
                          backgroundColor: block.correctIndex === optIdx ? 'var(--color-quiz-correct)' : 'var(--color-lime-cream-dark)',
                          color: block.correctIndex === optIdx ? 'white' : 'var(--color-text-secondary)',
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </button>
                      <input
                        type="text"
                        placeholder={`ตัวเลือก ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) => updateQuizOption(index, optIdx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          fontFamily: 'var(--font-prompt)',
                          backgroundColor: 'white',
                          border: '1px solid rgba(0,0,0,0.04)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>
                  ))}

                  <textarea
                    placeholder="คำอธิบาย (แสดงหลังตอบ)"
                    value={block.explanation || ''}
                    onChange={(e) => updateBlock(index, { explanation: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{
                      fontFamily: 'var(--font-prompt)',
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.04)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Block Buttons */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['summary', 'image', 'quiz'] as const).map((type) => (
            <motion.button
              key={type}
              whileTap={{ scale: 0.95 }}
              onClick={() => addBlock(type)}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                fontFamily: 'var(--font-prompt)',
                backgroundColor: 'rgba(255, 254, 249, 0.9)',
                border: '1px dashed rgba(0,0,0,0.15)',
                color: 'var(--color-text-secondary)',
              }}
            >
              + {type === 'summary' ? '📄 Summary' : type === 'image' ? '🖼️ Image' : '🧠 Quiz'}
            </motion.button>
          ))}
        </div>

        {/* Save Message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{
                fontFamily: 'var(--font-prompt)',
                backgroundColor: saveMessage.type === 'success' ? 'var(--color-quiz-correct-bg)' : 'var(--color-quiz-incorrect-bg)',
                color: saveMessage.type === 'success' ? 'var(--color-quiz-correct)' : 'var(--color-quiz-incorrect)',
              }}
            >
              {saveMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-2xl text-white text-sm font-semibold"
          style={{
            fontFamily: 'var(--font-prompt)',
            background: isSaving
              ? 'var(--color-lime-cream-deeper)'
              : 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
            boxShadow: isSaving ? 'none' : '0 4px 16px rgba(232, 115, 74, 0.35)',
          }}
        >
          {isSaving ? '⏳ กำลังบันทึก...' : '💾 Save to Database'}
        </motion.button>
      </motion.div>

      {/* Existing Lessons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5"
      >
        <h2
          className="text-base font-bold mb-3"
          style={{ fontFamily: 'var(--font-mali)', color: 'var(--color-text-primary)' }}
        >
          📚 บทเรียนในระบบ ({existingLessons.length})
        </h2>

        {loadingLessons ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-8 h-8 rounded-full mx-auto mb-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-peach), var(--color-burnt-orange))',
              }}
            />
            <p className="text-xs" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
              กำลังโหลด...
            </p>
          </div>
        ) : existingLessons.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
              ยังไม่มีบทเรียนในระบบ
            </p>
            <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
              สร้างบทเรียนแรกด้านบนเลย!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {existingLessons.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1"
                    style={{
                      fontFamily: 'var(--font-prompt)',
                      backgroundColor:
                        lesson.subject === 'ประวัติศาสตร์' ? 'rgba(167, 139, 250, 0.15)' :
                        lesson.subject === 'ภาษาอังกฤษ' ? 'rgba(96, 165, 250, 0.15)' :
                        'rgba(251, 191, 36, 0.15)',
                      color:
                        lesson.subject === 'ประวัติศาสตร์' ? '#8b5cf6' :
                        lesson.subject === 'ภาษาอังกฤษ' ? '#3b82f6' :
                        '#d97706',
                    }}
                  >
                    {lesson.subject}
                  </span>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-primary)' }}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'var(--font-prompt)', color: 'var(--color-text-muted)' }}>
                    {lesson.content?.length || 0} บล็อก · {lesson.estimatedTime}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(lesson.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-quiz-incorrect-bg)',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-quiz-incorrect)' }}>✕</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
