/**
 * Scroll progress (0..1) through the wheel studio. The 3D wheel and the studio
 * typography are pure functions of it. Kept outside React so per-frame updates never re-render.
 */
type Listener = (p: number) => void;

const listeners = new Set<Listener>();
let current = 0;

export const progress = {
  get: () => current,
  set(p: number) {
    if (p === current) return;
    current = p;
    listeners.forEach((l) => l(p));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    l(current);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Smooth-scroll helper (set by the page once Lenis is running). */
export const scroller: { toTarget?: (selector: string) => void } = {};
