/** 3D → screen anchors for the close-up labels, projected right after the camera moves. */
export type Anchor = { x: number; y: number; hidden: boolean };

/** Points in wheel-local space (wheel axis = +Z, rim radius ≈ 1). */
export const ANCHOR_POINTS = {
  lip: [0.7, 0.7, 0.36],
  face: [0.34, 0.4, 0.3],
  cap: [0, 0, 0.3],
  caliper: [0.62, -0.26, 0.06],
} as const;

export type AnchorId = keyof typeof ANCHOR_POINTS;
type Listener = (a: Record<AnchorId, Anchor>) => void;
const listeners = new Set<Listener>();

export const anchors = {
  data: {
    lip: { x: 0, y: 0, hidden: true },
    face: { x: 0, y: 0, hidden: true },
    cap: { x: 0, y: 0, hidden: true },
    caliper: { x: 0, y: 0, hidden: true },
  } as Record<AnchorId, Anchor>,
  emit() {
    listeners.forEach((l) => l(this.data));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
