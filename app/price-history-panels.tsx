"use client";

import { useState } from "react";
import { getCurrentStoryPrice, getStorySeries, PRICE_OBSERVED_ON, type PricePoint } from "../data/glp1-prices";
import { productDoseColor } from "./dose-colors";

export const selectedPriceSeries = [
  { key: "wegovy", product: "Wegovy", dose: "2.4", form: "Pen", label: "Wegovy injection · 2.4 mg", color: "#617985" },
  { key: "zepbound-25", product: "Zepbound", dose: "2.5", form: "Vial", label: "Zepbound · 2.5 mg vial", color: productDoseColor("zepbound", "2.5", "#ffbe78") },
  { key: "zepbound-5", product: "Zepbound", dose: "5", form: "Vial", label: "Zepbound · 5 mg vial", color: productDoseColor("zepbound", "5", "#ffbe78") },
];

export function priceEventLabel(point: PricePoint) {
  return point.dateLabel ?? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${point.date}T00:00:00Z`));
}

export default function PriceHistoryPanels() {
  const [brand, setBrand] = useState<"wegovy" | "zepbound">("wegovy");
  const [zepboundDose, setZepboundDose] = useState("2.5");
  const [selected, setSelected] = useState<PricePoint | null>(null);
  const width = 920, height = 300;
  const start = Date.parse("2024-08-01"), end = Date.parse(PRICE_OBSERVED_ON);
  const x = (date: string) => 110 + (Date.parse(date) - start) / (end - start) * 740;
  const y = (usd: number) => 210 - usd / 700 * 150;
  const activeKey = brand === "wegovy" ? "wegovy" : `zepbound-${zepboundDose === "2.5" ? "25" : "5"}`;
  const chooseBrand = (next: "wegovy" | "zepbound") => { setBrand(next); setSelected(null); };
  return <div className="price-history-panels">
    <div className="history-product-tabs" role="tablist" aria-label="Choose a product price history">
      {(["wegovy", "zepbound"] as const).map(product => <button key={product} id={`history-tab-${product}`} type="button" role="tab" aria-selected={brand === product} aria-controls="history-active-panel" tabIndex={brand === product ? 0 : -1} onClick={() => chooseBrand(product)} onKeyDown={event => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const next = event.key === "Home" ? "wegovy" : event.key === "End" ? "zepbound" : brand === "wegovy" ? "zepbound" : "wegovy";
          chooseBrand(next);
          document.getElementById(`history-tab-${next}`)?.focus();
        }
      }}>{product === "wegovy" ? "Wegovy" : "Zepbound"}</button>)}
    </div>
    {brand === "zepbound" && <div className="history-dose-picker" role="group" aria-label="Choose Zepbound vial strength">{["2.5", "5"].map(dose => <button key={dose} type="button" aria-pressed={zepboundDose === dose} onClick={() => { setZepboundDose(dose); setSelected(null); }}>{dose} mg vial</button>)}</div>}
    <div className="history-policy-key"><span>12 MAY 2025 · MFN EXECUTIVE ORDER</span><span>6 NOV 2025 · LILLY / NOVO AGREEMENTS ANNOUNCED</span></div>
    {selectedPriceSeries.filter(series => series.key === activeKey).map(series => {
      const points = getStorySeries(series.product, series.dose, series.form).filter(p => p.priceBasis === "regular" && p.displayMode !== "marker").filter((p, i, all) => i === 0 || p.usd !== all[i - 1].usd);
      const snapshot = getCurrentStoryPrice(series.product, series.dose, series.form);
      const path = points.map((p, i) => `${i ? "H" : "M"} ${x(p.date)} ${i ? `V ${y(p.usd)}` : y(p.usd)}`).join(" ") + (snapshot && points.at(-1)?.usd === snapshot.usd ? ` H ${x(snapshot.date)}` : "");
      return <section key={series.key} id="history-active-panel" role="tabpanel" aria-labelledby={`history-tab-${brand}`} className="history-panel">
        <h4>{series.label}</h4>
        <div className="history-scroll"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${series.label}: dated regular self-pay prices in dollars per 28-day supply`}>
          {[0, 200, 400, 600].map(tick => <g key={tick}><line x1="110" x2="850" y1={y(tick)} y2={y(tick)} className="history-grid"/><text x="88" y={y(tick)+4} textAnchor="end">${tick}</text></g>)}
          <text x="14" y="28" className="history-axis-title">USD / 28 DAYS</text>
          <text x="480" y="289" textAnchor="middle" className="history-axis-title">DATE</text>
          {[{ date: "2025-05-12", label: "MAY 12" }, { date: "2025-11-06", label: "NOV 6" }].map(marker => <g key={marker.date}><line x1={x(marker.date)} x2={x(marker.date)} y1="42" y2="218" className="history-policy"/><text x={x(marker.date)} y="28" textAnchor="middle" className={marker.date === "2025-05-12" ? "history-policy-label-may" : undefined}>{marker.label}</text></g>)}
          <path d={path} fill="none" stroke={series.color} strokeWidth="3"/>
          {points[0]?.dateLabel && points[1] && <path d={`M ${x(points[0].date)} ${y(points[0].usd)} H ${x(points[1].date)}`} stroke="#f7f1e8" strokeWidth="4" strokeDasharray="5 4"/>}
          {points.map((p, i) => <g key={p.id} role="button" tabIndex={0} aria-label={`${priceEventLabel(p)}, $${p.usd}; ${p.event}`} onMouseEnter={() => setSelected(p)} onFocus={() => setSelected(p)} onClick={() => setSelected(p)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(p); } }} className="history-point">
            <circle cx={x(p.date)} cy={y(p.usd)} r="7" fill="#f7f1e8" stroke={series.color} strokeWidth="3"/>
            <text x={x(p.date)} y={y(p.usd)-18} textAnchor="middle" className="history-price" style={series.product === "Wegovy" && (p.usd === 499 || p.usd === 349) ? { transform: "translate(19px, -2px)" } : undefined}>${p.usd}</text>
            {i > 0 && <text x={x(p.date)+12} y={y(p.usd)+25} className="history-cut">−{((points[i-1].usd-p.usd)/points[i-1].usd*100).toFixed(1)}%</text>}
            
          </g>)}
          {[{ date: "2024-08-01", label: "AUG 2024" }, { date: "2025-03-01", label: "MAR 2025" }, { date: "2025-11-01", label: "NOV 2025" }, { date: PRICE_OBSERVED_ON, label: "OCT 5, 2026" }].map(tick => <text key={tick.date} x={x(tick.date)} y="255" textAnchor="middle">{tick.label}</text>)}
        </svg></div>
      </section>;
    })}
    <p className="history-method">USD per 28-day supply. Reductions are percentages of the previous regular offer. Wegovy’s $650 predecessor was a retail savings offer; its start date is unverified, so the dashed baseline is schematic. Lines carry recorded levels between events and end at the October 5, 2026 observation; they do not establish continuous daily availability or causation.</p>
    <div className="history-readout" aria-live="polite">{selected ? <><strong>{selected.product} · {selected.dose} · ${selected.usd}</strong><span>{priceEventLabel(selected)} · {selected.channel} · {selected.event}</span><span>{selected.eligibility}</span><a href={selected.sourceUrl} target="_blank" rel="noreferrer">Manufacturer source ↗</a></> : "Hover, select, or keyboard-focus a price point for its offer and manufacturer source."}</div>
  </div>;
}
