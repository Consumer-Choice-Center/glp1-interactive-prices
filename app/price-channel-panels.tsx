"use client";

import { useState } from "react";
import { pricePoints, PRICE_OBSERVED_ON, type PricePoint } from "../data/glp1-prices";
import { priceEventLabel } from "./price-history-panels";

export default function PriceChannelPanels({ product }: { product: "zepbound" | "wegovy" }) {
  const [selected, setSelected] = useState<PricePoint | null>(null);
  const name = product === "zepbound" ? "Zepbound" : "Wegovy";
  const rows = product === "zepbound"
    ? ["2.5", "5", "7.5", "10", "12.5", "15"].map(dose => ({ dose: `${dose} mg`, basis: "regular", label: `${dose} mg vial · regular` })).concat([{ dose: "7.5 mg", basis: "conditional", label: "7.5 mg vial · conditional Journey offer" }])
    : [{ dose: "2.4 mg", basis: "regular", label: "Injection · regular self-pay" }, { dose: "All doses", basis: "introductory", label: "All-dose introductory promotions · 2025" }, { dose: "0.25 mg", basis: "introductory", label: "0.25 / 0.5 mg · introductory offer" }];
  const start = Date.parse("2024-08-01"), end = Date.parse(PRICE_OBSERVED_ON);
  const x = (date: string) => 85 + (Date.parse(date) - start) / (end-start) * 730;
  const max = product === "zepbound" ? 1100 : 700;
  const y = (usd: number) => 140 - usd/max*90;
  return <div className="channel-panels">
    <h3>{name} · manufacturer self-pay offers</h3>
    <p>Observation cutoff: October 5, 2026. Dashed baselines have uncertain start dates. Unconnected diamonds are snapshots; a lower snapshot does not locate the price-change date.</p>
    {rows.map(row => {
      const points = pricePoints.filter(p => p.product === name && p.form === (product === "zepbound" ? "Vial" : "Pen") && p.dose === row.dose && p.priceBasis === row.basis && p.status !== "announced")
        .filter((p,i,all) => all.findIndex(q => q.id === p.id) === i).sort((a,b) => a.date.localeCompare(b.date));
      const events = points.filter(p => p.status === "available").filter((p,i,all) => i === 0 || p.usd !== all[i-1].usd || p.event === "Regular price confirmed");
      const snapshot = points.findLast(p => p.status === "observed");
      const regular = row.basis === "regular";
      const color = regular ? (product === "zepbound" ? "#ad5817" : "#526d7e") : "#008080";
      const path = events.map((p,i) => `${i ? "H" : "M"} ${x(p.date)} ${i ? `V ${y(p.usd)}` : y(p.usd)}`).join(" ") + (snapshot && events.at(-1)?.usd === snapshot.usd ? ` H ${x(snapshot.date)}` : "");
      return <section className="channel-panel" key={`${row.dose}-${row.basis}`}><h4>{row.label}</h4><div className="history-scroll"><svg viewBox="0 0 860 185" role="img" aria-label={`${name} ${row.label}, USD per 28-day supply`}>
        {[0, max/2, max].map(tick => <g key={tick}><line x1="85" x2="815" y1={y(tick)} y2={y(tick)} className="history-grid"/><text x="72" y={y(tick)+4} textAnchor="end">${tick}</text></g>)}
        {regular && events.length > 0 && <path d={path} fill="none" stroke={color} strokeWidth="3" strokeDasharray={events[0].dateLabel ? "5 4" : undefined}/>}
        {points.filter(p => p.status === "observed" || events.some(event => event.id === p.id)).map(p => <g key={p.id} tabIndex={0} role="button" aria-label={`${priceEventLabel(p)}: $${p.usd}, ${p.priceBasis}, ${p.status}`} onMouseEnter={() => setSelected(p)} onFocus={() => setSelected(p)} onClick={() => setSelected(p)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(p); } }} className="history-point">
          {p.status === "observed" ? <path d={`M ${x(p.date)} ${y(p.usd)-7} l 7 7 l -7 7 l -7 -7 Z`} fill="#f7f1e8" stroke={color} strokeWidth="2"/> : <circle cx={x(p.date)} cy={y(p.usd)} r="6" fill="#f7f1e8" stroke={color} strokeWidth="2"/>}
          <text x={x(p.date)} y={y(p.usd)-15} textAnchor="middle" className="history-price">${p.usd}</text>
        </g>)}
        {[{ date: "2024-08-01", label: "AUG 2024" }, { date: "2025-03-01", label: "MAR 2025" }, { date: "2025-11-01", label: "NOV 2025" }, { date: PRICE_OBSERVED_ON, label: "OCT 5, 2026" }].map(tick => <text key={tick.date} x={x(tick.date)} y="178" textAnchor="middle">{tick.label}</text>)}
      </svg></div></section>;
    })}
    <div className="history-readout" aria-live="polite">{selected ? <><strong>{name} · {selected.dose} · ${selected.usd} / {selected.periodDays} days</strong><span>{priceEventLabel(selected)} · {selected.priceBasis} · {selected.event}</span><span>{selected.eligibility}</span>{selected.note && <span>{selected.note}</span>}<a href={selected.sourceUrl} target="_blank" rel="noreferrer">Manufacturer source ↗</a></> : "Select a point to see its date, eligibility, price basis, and manufacturer source. List prices and government benchmarks are outside these self-pay histories."}</div>
  </div>;
}
