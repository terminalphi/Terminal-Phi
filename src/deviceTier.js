// Lightweight device-capability tiers used to scale animation cost so the
// site stays smooth on low-end hardware (without removing any animation).

export function getDeviceTier() {
  if (typeof window === 'undefined') return 'high';
  const mql = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);

  const reduced = mql('(prefers-reduced-motion: reduce)');
  const coarse = mql('(pointer: coarse)'); // phones / tablets
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;

  if (reduced || cores <= 2 || mem <= 2) return 'low';
  if (coarse || cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

// Per-tier settings for the WebGL Threads background.
// Fewer shader lines + capped DPR + capped FPS dramatically cut GPU cost.
export const THREADS_SETTINGS = {
  high: { lineCount: 30, dprCap: 1.75, maxFps: 60 },
  mid: { lineCount: 30, dprCap: 1.25, maxFps: 40 },
  low: { lineCount: 30, dprCap: 1, maxFps: 30 },
};

// FPS cap for the lighter 2D canvas / rAF loops (events orbs, activity dots).
export const CANVAS_FPS = { high: 0, mid: 40, low: 30 };
