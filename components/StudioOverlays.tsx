"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useScrub, linesIn, linesOut, fadeIn, fadeOut } from "@/lib/useScrub";
import { progress } from "@/lib/progress";
import { anchors, type AnchorId } from "@/lib/anchors";
import { BEATS, finishIndex } from "@/lib/math";
import { company, finishes } from "@/lib/content";
import { telLink, waLink } from "@/lib/links";
import { PhoneIcon, WhatsAppIcon } from "./Icons";
import Lines from "./Lines";

/* ---------------- hero ---------------- */

export function StudioHero({ ready }: { ready: boolean }) {
  const ref = useScrub((tl, q) => {
    tl.fromTo(q(".hero__title .li"), { yPercent: 0, opacity: 1 }, { yPercent: -110, opacity: 0, duration: 0.05, stagger: 0.01, ease: "power2.in", immediateRender: false }, 0.07);
    fadeOut(tl, [...q(".hero__kicker"), ...q(".hero__sub"), ...q(".hero__cta")], 0.05, 0.05, -14);
    fadeOut(tl, [...q(".cue"), ...q(".hero__meta")], 0.01, 0.03, 0);
  });
  useEffect(() => {
    if (!ready || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero__title .lj", { yPercent: 115, duration: 1.3, stagger: 0.1, ease: "expo.out", delay: 0.2 });
      gsap.from([".hero__kicker", ".hero__sub", ".hero__cta"], { opacity: 0, y: 16, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.6 });
    }, ref);
    return () => ctx.revert();
  }, [ready, ref]);
  return (
    <div ref={ref} className="scene" style={{ inset: 0 }}>
      <div className="scene hero">
        <div className="hero__kicker mono">Alloy wheels · Bikes &amp; Cars</div>
        <h1 className="display hero__title">
          <Lines lines={["Built to", "*roll.*"]} />
        </h1>
        <p className="hero__sub">
          Alloy wheels for bikes and cars — the right size, the right fit and the finish you want. From Kulena, Palwal.
        </p>
        <div className="hero__cta">
          <a className="btn btn--wa" href={waLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            WhatsApp us
          </a>
          <a className="btn btn--ghost" href={telLink()}>
            <PhoneIcon />
            {company.phone}
          </a>
        </div>
      </div>
      <div className="hero__meta mono">
        {company.name} · {company.address.join(", ")}
      </div>
      <div className="cue mono">
        Scroll
        <i />
      </div>
    </div>
  );
}

/* ---------------- close-up ---------------- */

const LABELS: { id: AnchorId; text: string; w: number; left?: boolean }[] = [
  { id: "lip", text: "Machined lip", w: 70 },
  { id: "face", text: "Concave spoke face", w: 150 },
  { id: "cap", text: "Centre cap", w: 110 },
  { id: "caliper", text: "Brake clearance", w: 90 },
];

export function StudioCloseup() {
  const [a, b] = BEATS.closeup;
  const ref = useScrub((tl, q) => {
    fadeIn(tl, q(".idx"), a, 0.02);
    linesIn(tl, q("h2 .li"), a + 0.01, 0.035, 0.012);
    fadeIn(tl, q(".chapter p"), a + 0.03, 0.025);
    q(".callout").forEach((el, i) => {
      const at = a + 0.06 + i * 0.012;
      tl.fromTo(el.querySelector(".callout__stem"), { scaleX: 0 }, { scaleX: 1, duration: 0.02, immediateRender: true }, at);
      tl.fromTo(el.querySelector(".callout__dot"), { scale: 0 }, { scale: 1, duration: 0.012, immediateRender: true }, at);
      tl.fromTo(el.querySelector(".callout__label"), { autoAlpha: 0, x: 8 }, { autoAlpha: 1, x: 0, duration: 0.02, immediateRender: true }, at + 0.01);
    });
    linesOut(tl, q("h2 .li"), b - 0.03, 0.025);
    fadeOut(tl, [...q(".idx"), ...q(".chapter p"), ...q(".callout")], b - 0.03, 0.025, 0);
  });
  const els = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(
    () =>
      anchors.subscribe((d) => {
        LABELS.forEach((l, i) => {
          const el = els.current[i];
          if (!el) return;
          const pt = d[l.id];
          el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
          el.classList.toggle("is-off", pt.hidden);
        });
      }),
    [],
  );
  return (
    <div ref={ref} className="scene" style={{ inset: 0 }}>
      <div className="scene chapter">
        <div className="idx mono">
          <b>02</b>
          <i />
          Up close
        </div>
        <h2 className="display">
          <Lines lines={["Every spoke", "*counts.*"]} />
        </h2>
        <p>Size, offset, bolt pattern and finish — the details that make a wheel fit right and look right.</p>
      </div>
      {LABELS.map((l, i) => (
        <div
          key={l.id}
          className={`callout${l.left ? " callout--left" : ""}`}
          ref={(el) => void (els.current[i] = el)}
          style={{ ["--w" as string]: `${l.w}px` }}
        >
          <span className="callout__stem" />
          <span className="callout__dot" />
          <span className="callout__label mono">{l.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- finishes ---------------- */

export function StudioFinishes() {
  const [a, b] = BEATS.finishes;
  const ref = useScrub((tl, q) => {
    fadeIn(tl, q(".idx"), a, 0.02);
    tl.fromTo(q("li"), { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.03, stagger: 0.008, immediateRender: true }, a + 0.005);
    fadeIn(tl, q(".finishes__note"), a + 0.03, 0.02);
    fadeOut(tl, [...q(".idx"), ...q("li"), ...q(".finishes__note")], b + 0.005, 0.03, -10);
  });
  const list = useRef<HTMLOListElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  useEffect(
    () =>
      progress.subscribe((p) => {
        const i = Math.round(finishIndex(p));
        list.current?.querySelectorAll("li").forEach((li, k) => li.classList.toggle("on", k === i));
        if (note.current && note.current.dataset.i !== String(i)) {
          note.current.dataset.i = String(i);
          note.current.textContent = finishes[i].note;
        }
      }),
    [],
  );
  return (
    <div ref={ref} className="scene" style={{ inset: 0 }}>
      <div className="scene finishes">
        <div className="idx mono">
          <b>03</b>
          <i />
          Choose your finish
        </div>
        <ol ref={list}>
          {finishes.map((f, i) => (
            <li key={f.id}>
              <small>0{i + 1}</small>
              {f.name}
            </li>
          ))}
        </ol>
        <p className="finishes__note" ref={note}>
          {finishes[0].note}
        </p>
      </div>
    </div>
  );
}

/* ---------------- progress bar ---------------- */

export function StudioBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      progress.subscribe((p) => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--p", p.toFixed(4));
        const cur = p < BEATS.closeup[0] - 0.02 ? 0 : p < BEATS.finishes[0] - 0.01 ? 1 : 2;
        el.querySelectorAll("span").forEach((s, i) => s.classList.toggle("on", i === cur));
      }),
    [],
  );
  return (
    <div className="studio__bar mono" ref={ref}>
      <span>01 Wheel</span>
      <span>02 Up close</span>
      <span>03 Finishes</span>
      <i />
    </div>
  );
}
