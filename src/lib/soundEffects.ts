// ============================================
// BitQuest — Sound Effects Engine (Web Audio API)
// Pure browser synthesis, no external audio files
// ============================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

// === Pop Sound (button click) ===
export function playPop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

// === Success Sound (quiz correct — "tada!") ===
export function playSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);

    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.25);
  });
}

// === Error Sound (quiz wrong — "womp womp") ===
export function playError() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [400, 300]; // descending
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);

    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);

    osc.start(ctx.currentTime + i * 0.2);
    osc.stop(ctx.currentTime + i * 0.2 + 0.3);
  });
}

// === Level Up Sound (epic ascending fanfare) ===
export function playLevelUp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523, 587, 659, 784, 880, 1047]; // C5 to C6 scale
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = i < 4 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);

    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.35);
  });
}

// === Confetti / Celebration Sound (sparkles) ===
export function playConfetti() {
  const ctx = getAudioContext();
  if (!ctx) return;

  for (let i = 0; i < 8; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    const freq = 800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

    gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.2);

    osc.start(ctx.currentTime + i * 0.06);
    osc.stop(ctx.currentTime + i * 0.06 + 0.2);
  }
}
