"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural alloy wheel (axis = +Z, facing the camera; rim radius ≈ 1, tyre ≈ 1.39).
 * The face is one extruded shape whose window cut-outs leave the spokes, then dished to be concave,
 * so the bevels read as machined chamfers. ExtrudeGeometry material groups: 0 = face caps, 1 = walls —
 * which is exactly what a diamond-cut finish needs (bright face, dark pockets).
 */

export type FinishMats = {
  face: THREE.MeshPhysicalMaterial;
  walls: THREE.MeshPhysicalMaterial;
  lip: THREE.MeshPhysicalMaterial;
};

export type Design = { spokes: number; twin: boolean };

const R_FACE = 0.9;
const R_HUB = 0.3;

/* ---------------- textures ---------------- */

let lathe: THREE.CanvasTexture | null = null;
/** Concentric lathe marks for machined surfaces (used as a bump/roughness map). */
export function latheTexture() {
  if (lathe) return lathe;
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, s, s);
  for (let r = 2; r < s * 0.72; r += 1.6) {
    const v = 110 + Math.random() * 60;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 0.8;
    g.beginPath();
    g.arc(s / 2, s / 2, r, 0, Math.PI * 2);
    g.stroke();
  }
  lathe = new THREE.CanvasTexture(c);
  lathe.anisotropy = 8;
  return lathe;
}

let capTex: THREE.CanvasTexture | null = null;
function centreCapTexture() {
  if (capTex) return capTex;
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(s * 0.4, s * 0.35, 10, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "#2b2f36");
  grd.addColorStop(1, "#0c0d10");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#c9ced6";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 8, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#eef1f5";
  g.font = '800 70px "Helvetica Neue", Arial, sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("SMA", s / 2, s / 2 + 3);
  g.fillStyle = "#c8693e";
  g.fillRect(s / 2 - 34, s / 2 + 40, 68, 6);
  capTex = new THREE.CanvasTexture(c);
  capTex.colorSpace = THREE.SRGBColorSpace;
  return capTex;
}

let treadTex: THREE.CanvasTexture | null = null;
function treadTexture() {
  if (treadTex) return treadTex;
  const w = 1024, h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#191a1c";
  g.fillRect(0, 0, w, h);
  // tread blocks only across the crown of the profile (middle of v)
  for (let x = 0; x < w; x += 16) {
    g.fillStyle = "#0b0b0c";
    g.fillRect(x, h * 0.38, 5, h * 0.24);
    g.fillRect(x + 8, h * 0.44, 3, h * 0.12);
  }
  g.fillStyle = "#0b0b0c";
  g.fillRect(0, h * 0.47, w, 3);
  g.fillRect(0, h * 0.53, w, 3);
  treadTex = new THREE.CanvasTexture(c);
  treadTex.colorSpace = THREE.SRGBColorSpace;
  treadTex.wrapS = THREE.RepeatWrapping;
  treadTex.repeat.set(6, 1);
  return treadTex;
}

/* ---------------- geometry ---------------- */

function spokeAngles(d: Design) {
  const out: number[] = [];
  const step = (Math.PI * 2) / d.spokes;
  for (let i = 0; i < d.spokes; i++) {
    const a = Math.PI / 2 + i * step;
    if (d.twin) out.push(a - 0.09, a + 0.09);
    else out.push(a);
  }
  return out;
}

/** Face disc with spoke windows cut out, extruded with chamfers, then dished (concave). */
export function faceGeometry(d: Design) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, R_FACE, 0, Math.PI * 2, false);

  const angles = spokeAngles(d);
  const rIn = R_HUB + 0.02;
  const rOut = R_FACE - 0.085;
  // spoke widths in metres at hub / rim — slimmer for twin spokes
  const wIn = d.twin ? 0.075 : 0.16;
  const wOut = d.twin ? 0.06 : 0.11;
  const n = angles.length;
  for (let i = 0; i < n; i++) {
    const a0 = angles[i];
    let a1 = angles[(i + 1) % n];
    if (a1 <= a0) a1 += Math.PI * 2;
    const gapTight = d.twin && i % 2 === 0; // the slot inside a twin pair
    const sIn0 = a0 + wIn / 2 / rIn, sIn1 = a1 - wIn / 2 / rIn;
    const sOut0 = a0 + wOut / 2 / rOut, sOut1 = a1 - wOut / 2 / rOut;
    const inner = gapTight ? rIn + 0.18 : rIn; // twin pairs join near the hub
    if (sOut1 - sOut0 < 0.02) continue;
    const hole = new THREE.Path();
    const P = (r: number, a: number) => new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
    // corner rounding, never more than ~30% of the slot width (twin slots are narrow)
    const c = Math.min(0.045, (sOut1 - sOut0) * rOut * 0.3);
    const p0 = P(inner, gapTight ? (a0 + a1) / 2 - 0.0001 : sIn0);
    hole.moveTo(p0.x, p0.y);
    const q1 = P(rOut - c, sOut0);
    hole.lineTo(q1.x, q1.y);
    const q2 = P(rOut, sOut0 + c / rOut);
    const k1 = P(rOut, sOut0);
    hole.quadraticCurveTo(k1.x, k1.y, q2.x, q2.y);
    hole.absarc(0, 0, rOut, sOut0 + c / rOut, sOut1 - c / rOut, false);
    const k2 = P(rOut, sOut1);
    const q3 = P(rOut - c, sOut1);
    hole.quadraticCurveTo(k2.x, k2.y, q3.x, q3.y);
    const p1 = P(inner, gapTight ? (a0 + a1) / 2 + 0.0001 : sIn1);
    hole.lineTo(p1.x, p1.y);
    if (!gapTight) {
      hole.absarc(0, 0, inner, sIn1, sIn0, true);
    }
    hole.closePath();
    shape.holes.push(hole);
  }
  // lug holes + centre bore
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 5 + Math.PI / 5;
    const h = new THREE.Path();
    h.absarc(Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0.035, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }

  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.028,
    bevelSegments: 4,
    curveSegments: 72,
  });
  // dish: hub sits deeper than the rim edge (concave face)
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const r = Math.hypot(x, y) / R_FACE;
    pos.setZ(i, pos.getZ(i) - 0.22 * Math.pow(Math.max(0, 1 - r), 1.35));
  }
  g.computeVertexNormals();
  // cap UVs → centred 0..1 so the lathe-mark texture is concentric with the hub
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (2 * R_FACE) + 0.5, uv.getY(i) / (2 * R_FACE) + 0.5);
  return g;
}

function rimGeometry() {
  // (radius, axial) profile: back flange → barrel → front lip
  const pts = [
    [0.86, -0.4], [0.99, -0.4], [1.01, -0.36], [0.92, -0.32], [0.86, -0.24], [0.855, 0.12],
    [0.88, 0.22], [0.95, 0.27], [1.0, 0.3], [1.035, 0.335], [1.03, 0.37], [0.99, 0.385],
    [0.93, 0.37], [0.905, 0.33],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 128);
  g.rotateX(Math.PI / 2);
  return g;
}

function tyreGeometry() {
  const pts = [
    [1.0, -0.37], [1.07, -0.42], [1.2, -0.44], [1.31, -0.41], [1.37, -0.32], [1.395, -0.16],
    [1.4, 0], [1.395, 0.16], [1.37, 0.32], [1.31, 0.41], [1.2, 0.44], [1.07, 0.42], [1.0, 0.37],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 128);
  g.rotateX(Math.PI / 2);
  return g;
}

/* ---------------- component ---------------- */

export const Wheel = forwardRef<
  THREE.Group,
  { mats: FinishMats; design?: Design; brake?: boolean; spinRef?: React.Ref<THREE.Group> }
>(function Wheel({ mats, design = { spokes: 5, twin: true }, brake = true, spinRef }, ref) {
    const geos = useMemo(
      () => ({
        face: faceGeometry(design),
        rim: rimGeometry(),
        tyre: tyreGeometry(),
      }),
      [design],
    );
    const fixed = useMemo(
      () => ({
        rubber: new THREE.MeshStandardMaterial({ map: treadTexture(), color: "#ffffff", roughness: 0.88, metalness: 0 }),
        cap: new THREE.MeshPhysicalMaterial({ map: centreCapTexture(), roughness: 0.3, metalness: 0.4, clearcoat: 1 }),
        lug: new THREE.MeshStandardMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.25 }),
        disc: new THREE.MeshStandardMaterial({ color: "#7d8187", metalness: 0.9, roughness: 0.42 }),
        hat: new THREE.MeshStandardMaterial({ color: "#3b3e43", metalness: 0.6, roughness: 0.5 }),
        caliper: new THREE.MeshPhysicalMaterial({ color: "#a9512b", roughness: 0.42, metalness: 0.15, clearcoat: 0.6 }),
        dark: new THREE.MeshStandardMaterial({ color: "#0d0e10", roughness: 0.6 }),
      }),
      [],
    );
    const caliperGeo = useMemo(() => {
      const s = new THREE.Shape();
      s.absarc(0, 0, 0.8, 0.22, 1.12, false);
      s.absarc(0, 0, 0.56, 1.12, 0.22, true);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 24 });
      g.translate(0, 0, -0.08);
      return g;
    }, []);

    return (
      <group ref={ref}>
        {/* everything that rotates with the wheel */}
        <group ref={spinRef}>
        <mesh geometry={geos.tyre} material={fixed.rubber} castShadow />
        <mesh geometry={geos.rim} material={mats.lip} castShadow />
        <mesh geometry={geos.face} material={[mats.face, mats.walls]} position={[0, 0, 0.19]} castShadow />
        {/* barrel shadow inside the rim */}
        <mesh material={fixed.dark} position={[0, 0, -0.2]}>
          <circleGeometry args={[0.86, 64]} />
        </mesh>
        {/* hub: lug nuts + centre cap */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = Math.PI / 2 + (i * Math.PI * 2) / 5 + Math.PI / 5;
          return (
            <mesh key={i} material={fixed.lug} position={[Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.034, 0.08, 6]} />
            </mesh>
          );
        })}
        {/* centre cap seated in the concave hub */}
        <mesh material={fixed.cap} position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.105, 0.112, 0.12, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.2205]}>
          <circleGeometry args={[0.104, 48]} />
          <meshPhysicalMaterial map={centreCapTexture()} roughness={0.3} metalness={0.3} clearcoat={1} />
        </mesh>
        {/* valve stem */}
        <mesh material={fixed.lug} position={[0, -0.95, 0.3]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.016, 0.09, 8]} />
        </mesh>
        {brake && (
          <>
            <mesh material={fixed.disc} position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.74, 0.74, 0.05, 72]} />
            </mesh>
            <mesh material={fixed.hat} position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.08, 48]} />
            </mesh>
          </>
        )}
        </group>
        {/* the caliper is bolted to the hub carrier: it does not spin */}
        {brake && <mesh geometry={caliperGeo} material={fixed.caliper} rotation={[0, 0, -1.05]} position={[0, 0, -0.05]} />}
      </group>
    );
});

/* ---------------- finishes ---------------- */

type Look = { color: string; metalness: number; roughness: number; clearcoat: number; bump: number };
type Preset = { face: Look; walls: Look; lip: Look };

const L = (color: string, metalness: number, roughness: number, clearcoat = 0, bump = 0): Look => ({ color, metalness, roughness, clearcoat, bump });

export const PRESETS: Preset[] = [
  // hyper silver
  { face: L("#b4b8bf", 1, 0.3, 0.6), walls: L("#9da2aa", 1, 0.34, 0.6), lip: L("#c4c8ce", 1, 0.22, 0.6) },
  // gloss black
  { face: L("#0a0b0d", 0.25, 0.32, 1), walls: L("#08090a", 0.2, 0.36, 1), lip: L("#0c0d0f", 0.3, 0.28, 1) },
  // diamond cut: machined face + lip over gloss-black pockets
  { face: L("#f1f3f6", 1, 0.2, 0.4, 0.6), walls: L("#08090a", 0.2, 0.34, 1), lip: L("#f1f3f6", 1, 0.18, 0.4, 0.6) },
  // matte bronze
  { face: L("#7c5a37", 0.9, 0.5, 0.1), walls: L("#6c4d2e", 0.9, 0.55, 0.1), lip: L("#80603d", 0.9, 0.46, 0.1) },
];

export function makeFinishMats(): FinishMats {
  const mk = () =>
    new THREE.MeshPhysicalMaterial({ color: "#c9cdd3", metalness: 1, roughness: 0.26, clearcoat: 0.6, bumpMap: latheTexture(), bumpScale: 0 });
  return { face: mk(), walls: mk(), lip: mk() };
}

const cA = new THREE.Color();
const cB = new THREE.Color();
/** Blend materials to a fractional finish index (0..3). */
export function applyFinish(m: FinishMats, f: number) {
  const i = Math.max(0, Math.min(3, Math.floor(f)));
  const j = Math.min(3, i + 1);
  const t = f - i;
  (["face", "walls", "lip"] as const).forEach((k) => {
    const a = PRESETS[i][k];
    const b = PRESETS[j][k];
    const mat = m[k];
    mat.color.copy(cA.set(a.color)).lerp(cB.set(b.color), t);
    mat.metalness = a.metalness + (b.metalness - a.metalness) * t;
    mat.roughness = a.roughness + (b.roughness - a.roughness) * t;
    mat.clearcoat = a.clearcoat + (b.clearcoat - a.clearcoat) * t;
    mat.bumpScale = (a.bump + (b.bump - a.bump) * t) * 0.8;
  });
}
