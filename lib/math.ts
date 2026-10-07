export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const ramp = (p: number, a: number, b: number) => ease(invLerp(a, b, p));

/** Studio beats, in studio-progress units (0..1). */
export const BEATS = {
  hero: [0, 0.14],
  closeup: [0.17, 0.36],
  finishes: [0.38, 0.86],
  exit: [0.88, 1],
} as const;

/** 0..3 continuous finish index across the finishes beat (holds on each finish, quick blend between). */
export function finishIndex(p: number) {
  const [a, b] = BEATS.finishes;
  const t = clamp((p - a) / (b - a)) * 4; // 4 slots
  const slot = Math.min(3, Math.floor(t));
  const frac = t - slot;
  // hold for 70% of each slot, then blend into the next
  const blend = slot < 3 ? smooth(invLerp(0.7, 1, frac)) : 0;
  return slot + blend;
}
