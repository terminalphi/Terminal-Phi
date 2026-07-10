/* ═══════════════════════════════════════════════════════════════
   themeColors.js
   Reads the current --accent-r/g/b CSS custom properties and
   returns them in formats that canvas / WebGL / inline-styles need.
   ═══════════════════════════════════════════════════════════════ */

/**
 * @returns {{ r: number, g: number, b: number }}
 * e.g. { r: 212, g: 175, b: 55 }
 */
export function getAccentRGB() {
  const style = getComputedStyle(document.documentElement);
  return {
    r: parseInt(style.getPropertyValue('--accent-r')) || 212,
    g: parseInt(style.getPropertyValue('--accent-g')) || 175,
    b: parseInt(style.getPropertyValue('--accent-b')) || 55,
  };
}

/** Hex string – e.g. "#d4af37" */
export function getAccentHex() {
  const { r, g, b } = getAccentRGB();
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/** `rgba(r, g, b, a)` string for canvas gradients */
export function accentRGBA(a = 1) {
  const { r, g, b } = getAccentRGB();
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Lighter tint – mixes toward white
 * @param {number} amt 0-1, how much white
 * @param {number} alpha 0-1, opacity
 */
export function accentBright(amt = 0.45, alpha = 1) {
  const { r, g, b } = getAccentRGB();
  const mix = (c) => Math.round(c + (255 - c) * amt);
  return `rgba(${mix(r)},${mix(g)},${mix(b)},${alpha})`;
}

/**
 * Normalized [0-1] floats for WebGL uniforms
 * @returns {[number, number, number]}
 */
export function getAccentGL() {
  const { r, g, b } = getAccentRGB();
  return [r / 255, g / 255, b / 255];
}
