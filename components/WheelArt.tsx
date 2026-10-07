import { useId } from "react";

/**
 * Product-style SVG alloy wheel (front view) for cards and panels.
 * kind: classic N-spoke · twin (paired spokes) · mesh (lattice) · y (spokes that fork).
 */
type Finish = "silver" | "black" | "diamond" | "bronze";
type Kind = "classic" | "twin" | "mesh" | "y";

const FIN: Record<Finish, { a: string; b: string; edge: string; lip: [string, string] }> = {
  silver: { a: "#eef0f3", b: "#9aa0a8", edge: "#6b7079", lip: ["#f4f6f8", "#8d939b"] },
  black: { a: "#3a3d44", b: "#0c0d10", edge: "#000", lip: ["#4a4d55", "#0e0f12"] },
  diamond: { a: "#ffffff", b: "#b7bdc5", edge: "#050506", lip: ["#ffffff", "#a9afb7"] },
  bronze: { a: "#b88b5c", b: "#5a3f24", edge: "#2f2113", lip: ["#c39a6d", "#5c4126"] },
};

const P = (r: number, a: number) => `${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`;

function spokePath(a: number, w1: number, w2: number, r1 = 11, r2 = 36.5) {
  // tapered spoke from hub (r1, half-width w1) to rim (r2, half-width w2)
  const d1 = w1 / r1, d2 = w2 / r2;
  return `M ${P(r1, a - d1)} L ${P(r2, a - d2)} A ${r2} ${r2} 0 0 1 ${P(r2, a + d2)} L ${P(r1, a + d1)} Z`;
}

export default function WheelArt({
  spokes = 5,
  kind = "classic",
  finish = "silver",
  className,
}: {
  spokes?: number;
  kind?: Kind;
  finish?: Finish;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const f = FIN[finish];
  const paths: string[] = [];
  const step = (Math.PI * 2) / spokes;
  for (let i = 0; i < spokes; i++) {
    const a = -Math.PI / 2 + i * step;
    if (kind === "classic") paths.push(spokePath(a, 4.2, 3.4));
    else if (kind === "twin") {
      paths.push(spokePath(a - 0.1, 2.1, 1.9, 13));
      paths.push(spokePath(a + 0.1, 2.1, 1.9, 13));
      paths.push(spokePath(a, 3.2, 2.2, 11, 16));
    } else if (kind === "y") {
      paths.push(spokePath(a, 3.8, 3, 11, 22));
      paths.push(spokePath(a - 0.22, 1.9, 2.2, 20.5));
      paths.push(spokePath(a + 0.22, 1.9, 2.2, 20.5));
    } else {
      paths.push(spokePath(a, 1.8, 1.6));
      paths.push(spokePath(a + step / 2 - 0.12, 1.3, 1.3, 18));
      paths.push(spokePath(a + step / 2 + 0.12, 1.3, 1.3, 18));
    }
  }
  const lugs = Array.from({ length: 5 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5 + Math.PI / 5;
    return { x: 50 + Math.cos(a) * 6.6, y: 50 + Math.sin(a) * 6.6 };
  });
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`${spokes}-spoke ${kind} alloy wheel, ${finish} finish`}>
      <defs>
        <radialGradient id={`t${id}`} cx="50%" cy="45%" r="55%">
          <stop offset="0.7" stopColor="#1d1f23" />
          <stop offset="1" stopColor="#060607" />
        </radialGradient>
        <linearGradient id={`m${id}`} x1="0.15" y1="0.05" x2="0.85" y2="0.95">
          <stop offset="0" stopColor={f.a} />
          <stop offset="1" stopColor={f.b} />
        </linearGradient>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={f.lip[0]} />
          <stop offset="0.55" stopColor={f.lip[1]} />
          <stop offset="1" stopColor={f.lip[0]} />
        </linearGradient>
        <radialGradient id={`s${id}`} cx="35%" cy="28%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* tyre */}
      <circle cx="50" cy="50" r="49" fill={`url(#t${id})`} />
      <circle cx="50" cy="50" r="44.5" fill="none" stroke="#2a2c31" strokeWidth="0.6" />
      {/* rim lip + barrel */}
      <circle cx="50" cy="50" r="39.6" fill={`url(#l${id})`} />
      <circle cx="50" cy="50" r="37.2" fill="#0a0b0d" />
      {/* brake disc + caliper behind the spokes */}
      <circle cx="50" cy="50" r="28" fill="#5c6067" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="#3d4046" strokeWidth="5" strokeDasharray="1 2.2" />
      <path d={`M ${P(30, -0.55)} A 30 30 0 0 1 ${P(30, 0.45)} L ${P(21, 0.45)} A 21 21 0 0 0 ${P(21, -0.55)} Z`} fill="#a9512b" />
      {/* spokes */}
      <g fill={`url(#m${id})`} stroke={f.edge} strokeWidth={finish === "diamond" ? 0.9 : 0.4} strokeLinejoin="round">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {/* hub */}
      <circle cx="50" cy="50" r="12" fill={`url(#m${id})`} stroke={f.edge} strokeWidth="0.5" />
      {lugs.map((l, i) => (
        <circle key={i} cx={l.x} cy={l.y} r="1.5" fill="#20232a" stroke="#c9cdd3" strokeWidth="0.4" />
      ))}
      <circle cx="50" cy="50" r="4.6" fill="#0f1115" stroke="#c9cdd3" strokeWidth="0.5" />
      <rect x="47.4" y="51.6" width="5.2" height="0.9" fill="#c8693e" />
      {/* studio sheen */}
      <circle cx="50" cy="50" r="49" fill={`url(#s${id})`} />
    </svg>
  );
}
