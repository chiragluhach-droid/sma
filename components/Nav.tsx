"use client";

import { forwardRef } from "react";
import { company, nav } from "@/lib/content";
import { scroller } from "@/lib/progress";
import { waLink } from "@/lib/links";
import { LogoMark, WhatsAppIcon } from "./Icons";

const Nav = forwardRef<HTMLElement>(function Nav(_, ref) {
  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scroller.toTarget?.(href);
  };
  return (
    <header className="nav" ref={ref}>
      <a href="#top" className="brand" onClick={go("#top")} aria-label={company.name}>
        <LogoMark className="brand__logo" />
        <span className="brand__text">
          <span className="brand__short">{company.short}</span>
          <span className="brand__name mono">{company.name}</span>
        </span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        {nav.map((n) => (
          <a key={n.href} href={n.href} onClick={go(n.href)}>
            {n.label}
          </a>
        ))}
      </nav>
      <div className="nav__right">
        <a className="btn btn--wa btn--sm" href={waLink()} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon />
          WhatsApp
        </a>
      </div>
    </header>
  );
});

export default Nav;
