// ============================================
// BitQuest — Haptic Feedback Utility
// Vibrate on supported mobile devices
// ============================================

/**
 * Light tap feedback (button press)
 */
export function hapticLight() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

/**
 * Medium feedback (quiz answer selected)
 */
export function hapticMedium() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(25);
  }
}

/**
 * Success feedback (correct answer — double pulse)
 */
export function hapticSuccess() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([30, 50, 30]);
  }
}

/**
 * Error feedback (wrong answer — single long pulse)
 */
export function hapticError() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(80);
  }
}

/**
 * Level Up feedback (triple celebration pulse)
 */
export function hapticLevelUp() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([40, 60, 40, 60, 80]);
  }
}
