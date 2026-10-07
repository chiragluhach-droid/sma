"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { progress } from "@/lib/progress";
import { BEATS, finishIndex, invLerp, smooth } from "@/lib/math";
import { ANCHOR_POINTS, anchors, type AnchorId } from "@/lib/anchors";
import { Wheel, applyFinish, makeFinishMats } from "./Wheel";

type Key = { p: number; wheel: [number, number, number]; yaw: number; cam: [number, number, number]; look: [number, number, number]; fov: number };

/** Desktop choreography (studio progress → wheel pose + camera). Text lives on the left. */
const KEYS: Key[] = [
  { p: 0.0, wheel: [1.55, 0, 0], yaw: -0.62, cam: [0, 0.35, 7.4], look: [0.25, -0.1, 0], fov: 30 },
  { p: 0.13, wheel: [1.45, 0, 0], yaw: -0.5, cam: [0, 0.3, 7.2], look: [0.25, -0.1, 0], fov: 30 },
  { p: 0.26, wheel: [1.05, 0, 0], yaw: -0.26, cam: [1.55, 0.45, 3.7], look: [0.75, 0.02, 0], fov: 34 },
  { p: 0.36, wheel: [1.0, 0, 0], yaw: -0.18, cam: [1.3, 0.3, 4.1], look: [0.75, 0, 0], fov: 34 },
  { p: 0.42, wheel: [1.35, 0, 0], yaw: -0.32, cam: [0, 0.2, 6.6], look: [0.15, 0, 0], fov: 30 },
  { p: 0.86, wheel: [1.35, 0, 0], yaw: -0.44, cam: [0, 0.25, 6.6], look: [0.15, 0, 0], fov: 30 },
  { p: 1.0, wheel: [6.2, 0, 0], yaw: -0.3, cam: [0, 0.25, 6.6], look: [0.15, 0, 0], fov: 30 },
];

/** Monotone cubic — smooth but never overshoots a key (no camera dips). */
function mono(y0: number, y1: number, y2: number, y3: number, t: number) {
  const d0 = y1 - y0, d1 = y2 - y1, d2 = y3 - y2;
  let m1 = d0 * d1 <= 0 ? 0 : (d0 + d1) / 2;
  let m2 = d1 * d2 <= 0 ? 0 : (d1 + d2) / 2;
  if (d1 === 0) m1 = m2 = 0;
  else {
    const a = m1 / d1, b = m2 / d1, s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      m1 = tau * a * d1;
      m2 = tau * b * d1;
    }
  }
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * y1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * y2 + (t3 - t2) * m2;
}

const flat = (k: Key) => [...k.wheel, k.yaw, ...k.cam, ...k.look, k.fov];
function sample(p: number, out: number[]) {
  const K = KEYS;
  if (p <= K[0].p) return flat(K[0]).forEach((v, i) => (out[i] = v));
  if (p >= K[K.length - 1].p) return flat(K[K.length - 1]).forEach((v, i) => (out[i] = v));
  let i = 0;
  while (p > K[i + 1].p) i++;
  const k0 = flat(K[Math.max(0, i - 1)]), k1 = flat(K[i]), k2 = flat(K[i + 1]), k3 = flat(K[Math.min(K.length - 1, i + 2)]);
  const raw = (p - K[i].p) / (K[i + 1].p - K[i].p);
  const t = raw * 0.35 + smooth(raw) * 0.65;
  for (let a = 0; a < k1.length; a++) out[a] = mono(k0[a], k1[a], k2[a], k3[a], t);
}

/**
 * mode "scroll": desktop — the wheel is choreographed by scroll (hero → close-up → finishes → exit).
 * mode "hero":   phones — no scroll animation; the wheel rolls in and keeps rolling, time-based.
 */
function Rig({ reduced, mode }: { reduced: boolean; mode: "scroll" | "hero" }) {
  const { camera, size } = useThree();
  const outer = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Group>(null!);
  const sweep = useRef<THREE.Group>(null!);
  const mats = useMemo(makeFinishMats, []);
  const v = useMemo(() => ({ s: new Array(11).fill(0), look: new THREE.Vector3(), tmp: new THREE.Vector3(), t0: 0, idle: 0, last: 0 }), []);

  useFrame((_, dt) => {
    const p = mode === "hero" ? 0 : progress.get();
    const cam = camera as THREE.PerspectiveCamera;
    sample(p, v.s);
    let [wx, wy, wz, yaw, cx, cy, cz, lx, ly, lz, fov] = v.s;

    // portrait: wheel centred under the copy, camera pulled back
    const aspect = size.width / size.height;
    if (aspect < 1) {
      const exitT = invLerp(BEATS.exit[0], BEATS.exit[1], p);
      wx = exitT * 4.5;
      wy = -0.95;
      cx *= 0.3;
      cz *= 1.55;
      lx = 0;
      ly = -0.5;
    }

    if (mode === "hero") {
      // phones: wheel sits in the lower part of the screen, under the copy and buttons
      if (aspect < 1) {
        wy = -2.65;
        cx = 0;
        cz = 15;
        lx = 0;
        ly = -0.5;
        yaw = -0.4;
      }
      // roll in from the right (rotation matches the distance travelled), then keep rolling smoothly
      v.t0 += dt;
      const rest = aspect < 1 ? 0 : 1.45;
      const x0 = rest + 6;
      const e = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, v.t0 / 2.6), 3);
      wx = x0 + (rest - x0) * e;
      if (!reduced) v.idle += dt * 0.85 * e;
      spin.current.rotation.z = (x0 - wx) / 1.4 + v.idle;
    } else {
      // slow idle spin (alive even when not scrolling) + spin driven by scroll; rolling out at the end
      if (!reduced) v.idle += dt * 0.22 * (1 - smooth(invLerp(0.15, 0.3, p)) * 0.8);
      const roll = (wx - 1.35) / 1.4; // roll distance / tyre radius during the exit
      spin.current.rotation.z = -(v.idle + p * 7 + Math.max(0, roll));
    }

    outer.current.position.set(wx, wy, wz);
    outer.current.rotation.y = yaw;
    shadow.current.position.set(wx, wy, wz);

    applyFinish(mats, finishIndex(p));

    // a softbox strip sweeps across the metal as you scroll — light travelling over the spokes
    sweep.current.position.x = mode === "hero" ? Math.sin(v.t0 * 0.35) * 4.5 : Math.sin(p * Math.PI * 3.2) * 4.5;

    cam.position.set(cx, cy, cz);
    cam.lookAt(v.look.set(lx, ly, lz));
    if (Math.abs(cam.fov - fov) > 1e-3) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    // close-up labels: project wheel-local points (non-spinning frame) after the camera has moved
    const [c0, c1] = BEATS.closeup;
    if (mode === "scroll" && p > c0 - 0.03 && p < c1 + 0.03) {
      cam.updateMatrixWorld();
      outer.current.updateMatrixWorld();
      (Object.keys(ANCHOR_POINTS) as AnchorId[]).forEach((id) => {
        const pt = ANCHOR_POINTS[id];
        v.tmp.set(pt[0], pt[1], pt[2]).applyMatrix4(outer.current.matrixWorld).project(cam);
        const a = anchors.data[id];
        a.x = (v.tmp.x * 0.5 + 0.5) * size.width;
        a.y = (-v.tmp.y * 0.5 + 0.5) * size.height;
        a.hidden = v.tmp.z > 1 || Math.abs(v.tmp.x) > 1 || Math.abs(v.tmp.y) > 1;
      });
      anchors.emit();
    }
  });

  const shadowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(0,0,0,0.85)");
    grd.addColorStop(0.45, "rgba(0,0,0,0.35)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <>
      {/* daylight studio: warm paper surroundings, a big window on the left, soft fills */}
      <Environment resolution={256} frames={reduced ? 1 : Infinity} background={false}>
        <color attach="background" args={["#e9e3d8"]} />
        {/* window light (key) */}
        <Lightformer form="rect" intensity={4.2} color="#fff4e2" position={[-6, 2.5, 3]} rotation-y={Math.PI / 2} scale={[3, 6, 1]} />
        {/* overhead skylight */}
        <Lightformer form="rect" intensity={1.6} color="#fffaf2" position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
        {/* bounce card on the right */}
        <Lightformer form="rect" intensity={0.9} color="#f2e6d6" position={[6, 0.5, 2]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
        {/* the room behind the camera (what polished faces reflect) */}
        <Lightformer form="rect" intensity={0.7} color="#f6efe4" position={[0, 0.5, 9]} rotation-y={Math.PI} scale={[16, 7, 1]} />
        {/* moving strip: daylight glinting across the spokes as you scroll */}
        <group ref={sweep} position={[0, 0, 5]}>
          <Lightformer form="rect" intensity={2.6} color="#fff8ee" scale={[0.7, 6, 1]} />
        </group>
      </Environment>

      <group ref={outer}>
        <Wheel mats={mats} spinRef={spin} />
      </group>

      {/* real soft shadow on the paper floor (the canvas is transparent — the floor is the page) */}
      <group ref={shadow}>
        <ContactShadows position={[0, -1.4, 0]} scale={7} far={3} blur={2.6} opacity={0.55} resolution={512} color="#3a2c1e" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.399, 0]} renderOrder={1}>
          <planeGeometry args={[3.4, 1.1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.5} color="#3a2c1e" />
        </mesh>
      </group>
      <hemisphereLight args={["#fff6ea", "#cbbfae", 0.7]} />
      <directionalLight position={[-5, 4, 4]} intensity={1.4} color="#fff1dc" />
    </>
  );
}

/** Only render continuously while the studio is on screen. */
function FrameGate({ active }: { active: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    setFrameloop(active ? "always" : "never");
    if (active) invalidate();
  }, [active, setFrameloop, invalidate]);
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    gl.compile(scene, camera);
    let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(onReady)));
    return () => cancelAnimationFrame(raf);
  }, [gl, scene, camera, onReady]);
  return null;
}

export default function Studio({
  mode,
  active,
  quality,
  reduced,
  onReady,
}: {
  mode: "scroll" | "hero";
  active: boolean;
  quality: "high" | "low";
  reduced: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={quality === "high" ? [1, 2] : [1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping; // natural colour, no filmic crush
        gl.toneMappingExposure = 1.0;
        gl.setClearColor(0x000000, 0);
      }}
      camera={{ fov: 30, near: 0.1, far: 100, position: [0, 0.35, 7.4] }}
    >
      <FrameGate active={active} />
      <Rig reduced={reduced} mode={mode} />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
