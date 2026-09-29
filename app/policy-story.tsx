"use client";

import { useState } from "react";
import { getCurrentStoryPrice, getStorySeries, policyEvents, type PricePoint } from "../data/glp1-prices";
import "./policy-story.css";

const stats = [
  { label: "Zepbound vial price cuts", value: "$50", tone: "coral", copy: "Per strength: 2.5 mg ($399 → $349) and 5 mg ($549 → $499), announced Feb 25, 2025." },
  { label: "Wegovy injection · 2.4 mg", value: "$499", tone: "gold", copy: "Direct self-pay offer launched Mar 5, 2025 · 28-day supply." },
  { label: "Foundayo · 0.8 mg", value: "$149", tone: "blue", copy: "Observed self-pay snapshot Sep 28, 2026 · 30-day supply." },
];

const products = [
  { name: "Wegovy · 2.4 mg", product: "Wegovy", form: "Pen", dose: "2.4", color: "#68d2ff" },
  { name: "Zepbound · 2.5 mg vial", product: "Zepbound", form: "Vial", dose: "2.5", color: "#ffb054" },
  { name: "Wegovy pill · 1.5 mg", product: "Wegovy pill", form: "Tablet", dose: "1.5", color: "#ff7657" },
  { name: "Foundayo · 0.8 mg", product: "Foundayo", form: "Tablet", dose: "0.8", color: "#c6a3f4" },
  { name: "Wegovy HD · 7.2 mg", product: "Wegovy HD", form: "Pen", dose: "7.2", color: "#7bd8c5" },
];

function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  if (points.length === 0) {
    return <p className="chart-empty">No dated, available regular-price changes are included for this product and dose. See the current snapshot and source.</p>;
  }

  const width = 600;
  const height = 250;
  const inset = { left: 54, right: 20, top: 28, bottom: 42 };
  const values = points.map((point) => point.usd);
  const min = Math.max(0, Math.floor(Math.min(...values) / 100) * 100 - 100);
  const max = Math.ceil(Math.max(...values) / 100) * 100 + 100;
  const dateTimes = points.map((point) => Date.parse(`${point.date}T00:00:00Z`));
  const firstDate = Date.parse("2024-08-01T00:00:00Z");
  const lastDate = Date.parse("2026-09-28T00:00:00Z");
  const x = (time: number) => inset.left + ((time - firstDate) / (lastDate - firstDate)) * (width - inset.left - inset.right);
  const y = (value: number) => height - inset.bottom - ((value - min) / Math.max(1, max - min)) * (height - inset.top - inset.bottom);
  const coords = points.map((point, index) => `${x(dateTimes[index])},${y(point.usd)}`).join(" ");
  const policyDate = Date.parse(`${policyEvents[0].date}T00:00:00Z`);
  const ticks = [
    { date: "2024-08-27", label: "Aug ’24" },
    { date: "2025-11-06", label: "Nov ’25" },
    { date: "2026-09-28", label: "Sep ’26" },
  ];

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Dated regular self-pay price history">
        {[0, 1, 2, 3, 4].map((row) => { const value = max - ((max - min) * row) / 4; return <g key={row} className="policy-chart-grid"><line x1={inset.left} y1={y(value)} x2={width - inset.right} y2={y(value)} /><text x={inset.left - 9} y={y(value) + 4} textAnchor="end">${Math.round(value)}</text></g>; })}
        <polyline points={coords} fill="none" stroke={products.find((product) => product.product === points[0].product)?.color ?? "#68d2ff"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <g className="policy-timeline-marker"><line x1={x(policyDate)} y1={inset.top} x2={x(policyDate)} y2={height - inset.bottom}/><rect x={x(policyDate) - 48} y="2" width="96" height="19" rx="9"/><text x={x(policyDate)} y="15" textAnchor="middle">MFN · NOV 6 ’25</text></g>
        {points.map((point, index) => <g key={point.id} className="policy-timeline-point"><circle cx={x(dateTimes[index])} cy={y(point.usd)} r="6" fill={products.find((product) => product.product === point.product)?.color ?? "#68d2ff"}><title>{`${point.date}: $${point.usd} · ${point.event}`}</title></circle><text x={x(dateTimes[index])} y={y(point.usd) - 10} textAnchor="middle">${point.usd}</text></g>)}
        {ticks.map((tick) => <text className="policy-timeline-date" key={tick.date} x={x(Date.parse(`${tick.date}T00:00:00Z`))} y={height - 12} textAnchor="middle">{tick.label}</text>)}
      </svg>
      <div className="chart-points" aria-label="Dated chart values">
        {points.map((point) => <span key={point.id}>{new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${point.date}T00:00:00Z`))}: <strong>${point.usd}</strong></span>)}
      </div>
    </>
  );
}

const timeline = [
  { label: "2024", title: "Direct-to-consumer pressure begins", note: "Single-dose pricing and affordability programs started reshaping the market before the policy debate matured." },
  { label: "2025", title: "Cash channels compress the price floor", note: "Manufacturers moved faster in self-pay channels than lawmakers did in speech and legislation." },
  { label: "2026", title: "The market moved first", note: "The rapid price movement reflected competition and channel design, not a dramatic policy reversal." },
];

const mechanisms = [
  { number: "01", title: "Competition changed the pricing signal", text: "Price cuts came as direct channels sharpened competition and reduced friction for patients who were paying out of pocket." },
  { number: "02", title: "Cash offers created a new baseline", text: "Self-pay programs forced the market to react quickly, setting price reference points before policy narratives caught up." },
  { number: "03", title: "Policy followed the market", text: "Washington often described the end state after the market had already shifted beneath it." },
];

const phaseCards = [
  {
    tag: "Phase 1",
    title: "The market moved",
    copy: "Manufacturers responded to patient demand, affordability pressure, and channel design before political claims settled in.",
  },
  {
    tag: "Phase 2",
    title: "Washington claimed the win",
    copy: "The public debate anchored to the end result while the earlier commercial shifts were already underway.",
  },
];

export default function PolicyStory() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [activeTimeline, setActiveTimeline] = useState(2);
  const history = getStorySeries(selectedProduct.product, selectedProduct.dose, selectedProduct.form);
  const snapshot = getCurrentStoryPrice(selectedProduct.product, selectedProduct.dose, selectedProduct.form);

  return (
    <div className="policy-story-page">
      <a href="#main-content" className="skip-link">
        Skip to story
      </a>

      <main id="main-content" className="story">
        <section className="chapter hero">
          <div className="hero-copy">
            <span className="kicker coral">Consumer Choice Center</span>
            <h1>
              The market set the <span>price cuts.</span>
            </h1>
            <p className="byline">
              By <strong>Araceli Vargas</strong> · Policy analysis
            </p>
          </div>

          <div className="hero-bottom" id="story">
            <p>
              Competition and direct cash channels changed the incentives before the political narrative caught up.
            </p>
            <a href="#details">See the timeline →</a>
          </div>
        </section>

        <section className="chapter numbers" id="details">
          <div className="stat-cloud">
            {stats.map((stat) => (
              <article key={stat.label} className={`stat-card ${stat.tone}-card`}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.copy}</p>
              </article>
            ))}
          </div>

          <p className="section-caption">
            This story focuses on how direct consumer pricing and competition moved ahead of policy claims.
          </p>
        </section>

        <section className="chapter dashboard">
          <div className="dashboard-wrap">
            <div className="dashboard-intro">
              <span className="eyebrow">The signal</span>
              <h2>Price pressure arrived before the headlines.</h2>
              <p>
                The data suggests a practical market story: fewer friction points, stronger cash incentives, and more direct competition narrowed the gap faster than the rhetoric suggested.
              </p>

              <div className="product-tabs" aria-label="Products covered">
                {products.map((product) => (
                  <button key={product.name} type="button" className={selectedProduct.name === product.name ? "active" : ""} aria-pressed={selectedProduct.name === product.name} onClick={() => setSelectedProduct(product)}>
                    <span style={{ background: product.color }} />
                    {product.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-shell" aria-label="Price comparison chart">
              <div className="chart-topline">
                <div>
                  <span className="eyebrow">{selectedProduct.product} · {selectedProduct.dose} mg</span>
                  <h3>Dated regular-price history</h3>
                </div>
                <strong>{snapshot ? `$${snapshot.usd}` : "—"}</strong>
              </div>

              <div className="price-chart">
                <PriceHistoryChart points={history} />
              </div>

              <div className="chart-note">
                {snapshot ? <>Current observed snapshot: ${snapshot.usd} per {snapshot.periodDays} days ({snapshot.form}, {snapshot.dose}); observed on {snapshot.date}. This snapshot is not treated as a dated price change. <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">Snapshot source ↗</a></> : "No current observed snapshot is included for this product and dose."} {history[0] && <>Historical dots show sourced available regular offers only. <a href={history[history.length - 1].sourceUrl} target="_blank" rel="noreferrer">Latest historical source ↗</a></>}
              </div>
              {policyEvents.map((event) => (
                <div className="policy-event-note" key={event.date}>
                  <span>POLICY ANNOUNCEMENT · {event.date}</span>
                  <p>{event.title}. {event.description}</p>
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer">Announcement source ↗</a>
                  <small>Policy announcement, not a transaction price or verified offer.</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="chapter timeline-section">
          <div className="timeline-wrap">
            <span className="eyebrow">Timeline</span>
            <h2>Market pressure was already moving.</h2>

            <div className="timeline-grid">
              <div className="timeline-rail" aria-label="Key timeline milestones">
                {timeline.map((entry, index) => (
                  <button key={entry.label} type="button" className={index === activeTimeline ? "active" : ""} aria-pressed={index === activeTimeline} onClick={() => setActiveTimeline(index)}>
                    <span className="timeline-dot" />
                    {entry.label}
                  </button>
                ))}
              </div>

              <article className="event-card">
                <span>Market milestone</span>
                <p>{timeline[activeTimeline].label}</p>
                <h3>{timeline[activeTimeline].title}</h3>
                <div className="event-rule" />
                <p>{timeline[activeTimeline].note}</p>
                <a href="#full-story">Read the full story →</a>
              </article>
            </div>
          </div>
        </section>

        <section className="chapter mechanism" id="full-story">
          <div className="dashboard-wrap">
            <div className="dashboard-intro">
              <span className="eyebrow">Mechanism</span>
              <h2>What changed the incentives?</h2>
            </div>

            <ul className="mechanism-list">
              {mechanisms.map((item) => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="chapter caveat">
          <div className="caveat-panel">
            <span className="eyebrow">Caveat</span>
            <h2>
              Not a single story.<span> A market response.</span>
            </h2>

            <div className="phase-grid">
              {phaseCards.map((card) => (
                <article key={card.tag}>
                  <span>{card.tag}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
