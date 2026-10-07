"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { progress, scroller } from "@/lib/progress";
import Nav from "./Nav";
import { StudioBar, StudioCloseup, StudioFinishes, StudioHero } from "./StudioOverlays";
import { About, Categories, Footer, Range, Reasons, Visit, WaFab } from "./Sections";
import { LogoMark } from "./Icons";

// three.js is the heaviest chunk — load it after first paint, client only
const Studio = dynamic(() => import("./three/Studio"), { ssr: false });

export default function SmaPage() {
  const studio = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<"high" | "low" | null>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [phone, setPhone] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // phones: no scroll-driven studio — just the hero with the wheel rolling
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 820px)").matches || window.matchMedia("(pointer: coarse)").matches;
    setQuality(small || (navigator.hardwareConcurrency ?? 8) <= 4 ? "low" : "high");
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // window light drifts across the paper backdrop as you scroll
  useEffect(() => progress.subscribe((p) => light.current?.style.setProperty("--lp", p.toFixed(4))), []);

  // only animate the 3D studio while it is on screen
  useEffect(() => {
    if (!studio.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(studio.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (quality === null) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = reduced ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    const tick = (t: number) => lenis?.raf(t * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    // desktop only: scroll position drives the studio; on phones progress stays at 0 (hero)
    progress.set(0);
    const st = phone
      ? null
      : ScrollTrigger.create({
          trigger: studio.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => progress.set(s.progress),
          onRefresh: (s) => progress.set(s.progress),
        });
    // nav gets a solid backdrop once the studio has scrolled away
    const navST = ScrollTrigger.create({
      trigger: studio.current,
      start: "bottom top+=80",
      onToggle: (s) => nav.current?.classList.toggle("solid", s.isActive),
      onRefresh: (s) => nav.current?.classList.toggle("solid", s.isActive),
      end: "max",
    });
    // the studio height differs between phone and desktop: re-measure every scroll trigger
    // (including section reveals) once this layout is in place
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    scroller.toTarget = (sel) => {
      const el = sel === "#top" ? 0 : document.querySelector<HTMLElement>(sel);
      if (el === null) return;
      if (lenis) lenis.scrollTo(el as HTMLElement | number, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 3) });
      else if (el === 0) window.scrollTo({ top: 0 });
      else el.scrollIntoView();
    };
    return () => {
      cancelAnimationFrame(raf);
      st?.kill();
      navST.kill();
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
      }
      scroller.toTarget = undefined;
    };
  }, [quality, reduced, phone]);

  return (
    <>
      <div className={`preloader${ready ? " done" : ""}`} aria-hidden={ready}>
        <LogoMark />
      </div>
      <Nav ref={nav} />
      <main id="top">
        <section className={`studio${phone ? " studio--hero" : ""}`} id="studio" ref={studio} aria-label="Alloy wheel studio">
          <div className="studio__stage">
            <div className="studio__light" ref={light} aria-hidden />
            <div className="studio__canvas" aria-hidden>
              {quality && <Studio mode={phone ? "hero" : "scroll"} active={active} quality={quality} reduced={reduced} onReady={onReady} />}
            </div>
            <div className="studio__vignette" />
            <StudioHero ready={ready} />
            {!phone && (
              <>
                <StudioCloseup />
                <StudioFinishes />
                <StudioBar />
              </>
            )}
          </div>
        </section>
        <Categories />
        <Range />
        <Reasons />
        <About />
        <Visit />
      </main>
      <Footer />
      <WaFab />
    </>
  );
}
