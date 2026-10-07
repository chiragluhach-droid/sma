"use client";

import { useState } from "react";
import { useReveal } from "@/lib/useReveal";
import { about, categories, company, range, reasons } from "@/lib/content";
import { mailLink, mapEmbed, mapLink, telLink, waLink } from "@/lib/links";
import { PhoneIcon, WhatsAppIcon } from "./Icons";
import WheelArt from "./WheelArt";
import Lines from "./Lines";

/* ---------------- 04 Bikes / Cars ---------------- */

export function Categories() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="section" id="wheels" ref={ref}>
      <div className="section__head">
        <div>
          <div className="idx mono" data-reveal>
            <b>04</b>
            <i />
            Two wheels or four
          </div>
          <h2 className="display" data-reveal="lines">
            <Lines lines={["Bikes.", "*Cars.*"]} />
          </h2>
        </div>
        <p data-reveal>One shop for both. Tell us your vehicle and we&apos;ll help you pick the size, fitment and finish that suit it.</p>
      </div>
      <div className="cats">
        {categories.map((c, i) => (
          <article className="cat" key={c.id} data-reveal>
            <WheelArt className="cat__wheel" spokes={c.id === "bikes" ? 6 : 5} kind={c.id === "bikes" ? "classic" : "twin"} finish={i ? "diamond" : "black"} />
            <div style={{ position: "relative" }}>
              <h3 className="display">{c.title}</h3>
              <p className="cat__line">{c.line}</p>
            </div>
            <div className="cat__sizes">
              <span className="mono" style={{ color: "var(--faint)" }}>
                Sizes
              </span>
              <b>{c.sizes}</b>
              <ul>
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 05 Range ---------------- */

export function Range() {
  const ref = useReveal<HTMLElement>();
  const [filter, setFilter] = useState<"all" | "bikes" | "cars">("all");
  return (
    <section className="section section--paper" id="range" ref={ref}>
      <div className="section__head">
        <div>
          <div className="idx mono" data-reveal>
            <b>05</b>
            <i />
            The range
          </div>
          <h2 className="display" data-reveal="lines">
            <Lines lines={["Pick your", "*style.*"]} />
          </h2>
        </div>
        <p data-reveal>A few of the styles we deal in. Ask on WhatsApp for current stock, sizes and prices for your vehicle.</p>
      </div>
      <div className="filters" role="tablist" aria-label="Filter wheels">
        {(["all", "bikes", "cars"] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "bikes" ? "Bikes" : "Cars"}
          </button>
        ))}
      </div>
      <div className="grid" data-filter={filter}>
        {range.map((w, i) => (
          <article
            className="card"
            key={w.style + w.cat}
            hidden={filter !== "all" && w.cat !== filter}
            data-more={range.filter((x, k) => x.cat === w.cat && k < i).length >= 2 ? "" : undefined}
            data-reveal
          >
            <div className="card__art">
              <WheelArt spokes={w.spokes} kind={w.kind} finish={w.finish} />
            </div>
            <div className="card__row">
              <h3>{w.style}</h3>
              <span className="card__tag mono">{w.cat === "bikes" ? "Bike" : "Car"}</span>
            </div>
            <div className="card__meta">
              <span>{w.size}</span>
              <span style={{ textTransform: "capitalize" }}>{w.finish === "diamond" ? "Diamond cut" : w.finish}</span>
            </div>
            <a
              className="btn btn--ink btn--sm"
              style={{ justifyContent: "center" }}
              href={waLink(`Hi SMA, I'm interested in the ${w.style} alloy wheel (${w.cat === "bikes" ? "bike" : "car"}). Please share sizes and price.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask on WhatsApp
            </a>
          </article>
        ))}
      </div>
      <p className="range__note mono">Sample styles shown — stock changes often, so ask for what&apos;s available today.</p>
    </section>
  );
}

/* ---------------- 06 Why SMA ---------------- */

export function Reasons() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="section" ref={ref}>
      <div className="section__head">
        <div>
          <div className="idx mono" data-reveal>
            <b>06</b>
            <i />
            Why SMA
          </div>
          <h2 className="display" data-reveal="lines">
            <Lines lines={["Straight", "*answers.*"]} />
          </h2>
        </div>
      </div>
      <div className="reasons">
        {reasons.map((r) => (
          <div className="reason" key={r.k} data-reveal>
            <b className="mono">{r.k}</b>
            <h3>{r.title}</h3>
            <p>{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 07 About ---------------- */

export function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="section section--paper" id="about" ref={ref}>
      <div className="about">
        <figure className="about__photo" data-reveal>
          <img src={about.photo.src} alt={about.photo.alt} width={980} height={1306} loading="lazy" decoding="async" />
          <figcaption className="mono">{about.photo.caption}</figcaption>
        </figure>
        <div>
          <div className="idx mono" data-reveal>
            <b>07</b>
            <i />
            {about.kicker}
          </div>
          <h2 className="display" data-reveal="lines">
            <Lines lines={["Run by", "*Leelu Sharma.*"]} />
          </h2>
          <p className="about__lead" data-reveal>
            {about.lead}
          </p>
          <div className="about__body">
            {about.body.map((p) => (
              <p key={p.slice(0, 20)} data-reveal>
                {p}
              </p>
            ))}
          </div>
          <div className="about__cta" data-reveal>
            <a className="btn btn--ink" href={telLink()}>
              <PhoneIcon />
              Call {company.owner.split(" ")[0]}
            </a>
            <a className="btn btn--ghost-ink" href={waLink()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 08 Visit ---------------- */

export function Visit() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="section" id="visit" ref={ref}>
      <div className="visit">
        <div className="visit__media">
          <figure className="visit__photo" style={{ margin: 0 }} data-reveal="wipe">
            <img src="/images/showroom.jpg" alt="Alloy wheels on display in the showroom" width={1600} height={1000} loading="lazy" decoding="async" />
            <span className="mono">Showroom</span>
          </figure>
          <div className="visit__map" data-reveal>
            <iframe title={`Map — ${company.mapQuery}`} src={mapEmbed()} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
        <div className="visit__info">
          <div className="idx mono" data-reveal>
            <b>08</b>
            <i />
            Find us
          </div>
          <h2 className="display" data-reveal="lines">
            <Lines lines={["Visit", "*the shop.*"]} />
          </h2>
          <p className="visit__address" data-reveal>
            {company.name}
            <br />
            <span style={{ color: "var(--dim)" }}>{company.address.join(", ")}</span>
          </p>
          <ul className="contact-list" data-reveal>
            <li>
              <span className="mono">Phone</span>
              <a href={telLink()}>{company.phone}</a>
            </li>
            <li>
              <span className="mono">WhatsApp</span>
              <a href={waLink()} target="_blank" rel="noopener noreferrer">
                {company.phone}
              </a>
            </li>
            <li>
              <span className="mono">Email</span>
              <a href={mailLink()}>{company.email}</a>
            </li>
            <li>
              <span className="mono">Hours</span>
              <em>{company.hours}</em>
            </li>
          </ul>
          <div className="visit__cta" data-reveal>
            <a className="btn btn--wa" href={waLink()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              WhatsApp us
            </a>
            <a className="btn btn--ghost" href={mapLink()} target="_blank" rel="noopener noreferrer">
              Get directions →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot mono">
      <span>
        © {new Date().getFullYear()} {company.name} ({company.short})
      </span>
      <span>{company.address.join(", ")}</span>
    </footer>
  );
}

export function WaFab() {
  return (
    <a className="wa-fab" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <WhatsAppIcon />
    </a>
  );
}
