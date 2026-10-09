"use client";

import { useState } from "react";
import { getCurrentStoryPrice, getStorySeries, policyEvents, pricePoints, PRICE_OBSERVED_ON, type PricePoint } from "../data/glp1-prices";

type ProductOption = {
  name: string;
  product: string;
  form: string;
  dose: string;
  color: string;
};

const productFamilies: { id: string; label: string; color: string; options: ProductOption[] }[] = [
  {
    id: "wegovy-injection",
    label: "Wegovy injection",
    color: "#68d2ff",
    options: ["0.25", "0.5", "1", "1.7", "2.4"].map((dose) => ({ name: `${dose} mg`, product: "Wegovy", form: "Pen", dose, color: "#68d2ff" })),
  },
  {
    id: "wegovy-pill-hd",
    label: "Wegovy pill / HD",
    color: "#c38bff",
    options: [
      ...["1.5", "4", "9", "25"].map((dose) => ({ name: `Pill · ${dose} mg`, product: "Wegovy pill", form: "Tablet", dose, color: "#c38bff" })),
      { name: "HD pen · 7.2 mg", product: "Wegovy HD", form: "Pen", dose: "7.2", color: "#b677f0" },
    ],
  },
  {
    id: "zepbound-vials",
    label: "Zepbound vials",
    color: "#ff7657",
    options: ["2.5", "5", "7.5", "10", "12.5", "15"].map((dose) => ({ name: `${dose} mg`, product: "Zepbound", form: "Vial", dose, color: "#ff7657" })),
  },
  {
    id: "kwikpen",
    label: "KwikPen",
    color: "#ffbd59",
    options: ["2.5", "5", "7.5", "10", "12.5", "15"].map((dose) => ({ name: `${dose} mg`, product: "Zepbound", form: "KwikPen", dose, color: "#ffbd59" })),
  },
];

const products = productFamilies.flatMap((family) => family.options);

function PriceHistoryChart({ points, snapshot }: { points: PricePoint[]; snapshot?: PricePoint }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activePoint = points.find(point => point.id === (hoveredId ?? pinnedId));

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

  const lastDate = Date.parse(`${PRICE_OBSERVED_ON}T00:00:00Z`);

  const x = (time: number) => inset.left + ((time - firstDate) / (lastDate - firstDate)) * (width - inset.left - inset.right);

  const y = (value: number) => height - inset.bottom - ((value - min) / Math.max(1, max - min)) * (height - inset.top - inset.bottom);

  const chartColor = products.find((product) => product.product === points[0].product && product.form === points[0].form)?.color ?? "#68d2ff";

  const policyDate = Date.parse(`${policyEvents[0].date}T00:00:00Z`);

  const ticks = [

    { date: "2024-08-27", label: "Aug ’24" },

    { date: "2025-11-06", label: "Nov ’25" },

    { date: "2026-10-05", label: "Oct ’26" },

  ];



  return (

    <div className="history-chart-interactive">

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Dated regular self-pay price history">

        {[0, 1, 2, 3, 4].map((row) => { const value = max - ((max - min) * row) / 4; return <g key={row} className="policy-chart-grid"><line x1={inset.left} y1={y(value)} x2={width - inset.right} y2={y(value)} /><text x={inset.left - 9} y={y(value) + 4} textAnchor="end">${Math.round(value)}</text></g>; })}

        {["regular", "conditional", "temporary"].map(basis => {
          const seriesPoints = points.filter(point => point.status !== "announced" && point.priceBasis === basis).sort((a, b) => a.date.localeCompare(b.date));
          if (!seriesPoints.length) return null;
          let path = `M ${x(Date.parse(`${seriesPoints[0].date}T00:00:00Z`))} ${y(seriesPoints[0].usd)}`;
          for (const point of seriesPoints.slice(1)) path += ` H ${x(Date.parse(`${point.date}T00:00:00Z`))} V ${y(point.usd)}`;
          const last = seriesPoints[seriesPoints.length - 1];
          if (snapshot?.usd === last.usd) path += ` H ${x(Date.parse(`${snapshot.date}T00:00:00Z`))}`;
          return <path key={basis} d={path} fill="none" stroke={chartColor} strokeWidth="4" strokeDasharray={basis === "regular" ? undefined : "5 4"} />;
        })}

        <g className="policy-timeline-marker"><line x1={x(policyDate)} y1={inset.top} x2={x(policyDate)} y2={height - inset.bottom}/><rect x={x(policyDate) - 48} y="2" width="96" height="19" rx="9"/><text x={x(policyDate)} y="15" textAnchor="middle">MFN · NOV 6 ’25</text></g>

        {points.map((point, index) => <g key={point.id} className="policy-timeline-point" role="button" tabIndex={0} aria-label={`${point.dateLabel ?? point.date}: $${point.usd} · ${point.event} · ${point.priceBasis}`} onMouseEnter={() => setHoveredId(point.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(point.id)} onBlur={() => setHoveredId(null)} onClick={() => setPinnedId(pinnedId === point.id ? null : point.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setPinnedId(pinnedId === point.id ? null : point.id); } if (event.key === "Escape") { setPinnedId(null); setHoveredId(null); } }}><circle cx={x(dateTimes[index])} cy={y(point.usd)} r="6" fill={chartColor}></circle><text x={x(dateTimes[index])} y={y(point.usd) - 10} textAnchor="middle">${point.usd}</text></g>)}

        {ticks.map((tick) => <text className="policy-timeline-date" key={tick.date} x={x(Date.parse(`${tick.date}T00:00:00Z`))} y={height - 12} textAnchor="middle">{tick.label}</text>)}

        {activePoint && (() => {
          const tipX = Math.max(inset.left, Math.min(x(Date.parse(`${activePoint.date}T00:00:00Z`)) - 100, width - 210));
          const tipY = Math.min(y(activePoint.usd) + 12, height - inset.bottom - 50);
          const date = activePoint.dateLabel ? "Prior offer · date unverified" : new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${activePoint.date}T00:00:00Z`));
          return <g className="history-point-tooltip" role="status" transform={`translate(${tipX}, ${tipY})`}>
            <rect width="200" height="46" rx="5" fill="#22264e" stroke="#6f789b" />
            <text x="8" y="17">{date}: ${activePoint.usd}</text>
            <text x="8" y="33">{activePoint.event} · {activePoint.priceBasis}</text>
            <g role="button" tabIndex={0} aria-label="Close price details" onClick={() => { setHoveredId(null); setPinnedId(null); }} onKeyDown={event => { if (["Enter", " ", "Escape"].includes(event.key)) { event.preventDefault(); setHoveredId(null); setPinnedId(null); } }}>
              <rect x="176" y="2" width="22" height="22" fill="transparent" />
              <text x="187" y="17" textAnchor="middle">×</text>
            </g>
          </g>;
        })()}
      </svg>


    </div>

  );

}



export default function PriceSignal() {
  const [selectedFamilyId, setSelectedFamilyId] = useState(productFamilies[0].id);

  const [selectedProduct, setSelectedProduct] = useState<ProductOption>(productFamilies[0].options.at(-1)!);



  const history = getStorySeries(selectedProduct.product, selectedProduct.dose, selectedProduct.form).filter((point) => point.priceBasis === "regular" && point.displayMode !== "marker");

  const snapshot = getCurrentStoryPrice(selectedProduct.product, selectedProduct.dose, selectedProduct.form);

  const selectedOffers = pricePoints
    .filter((point) => point.product === selectedProduct.product && point.form === selectedProduct.form)
    .filter((point) => point.dose === `${selectedProduct.dose} mg` || point.dose === "All doses")
    .filter((point) => point.status === "available" && point.priceBasis !== "regular")
    .filter((point, index, all) => all.findIndex((candidate) => candidate.date === point.date && candidate.usd === point.usd && candidate.priceBasis === point.priceBasis && candidate.eligibility === point.eligibility) === index)
    .sort((a, b) => a.date.localeCompare(b.date));

  const selectedFamily = productFamilies.find((family) => family.id === selectedFamilyId) ?? productFamilies[0];

  const chooseFamily = (family: (typeof productFamilies)[number]) => {
    setSelectedFamilyId(family.id);
    setSelectedProduct(family.options[0]);
  };

  const scrollToOped = () => document.getElementById("oped")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
        <section className="chapter dashboard" id="price-signal">

          <div className="dashboard-wrap">

            <div className="dashboard-intro">

              <span className="eyebrow">The signal</span>

              <h2>Price pressure arrived before the headlines.</h2>

              <p>

                The data suggests a practical market story: fewer friction points, stronger cash incentives, and more direct competition narrowed the gap faster than the rhetoric suggested.

              </p>

              <button className="read-oped-button signal-oped-button" type="button" onClick={scrollToOped}>Read the op-ed ↓</button>



              <div className="product-tabs" aria-label="Product families covered">

                {productFamilies.map((family) => (

                  <button key={family.id} type="button" className={selectedFamily.id === family.id ? "active" : ""} aria-pressed={selectedFamily.id === family.id} onClick={() => chooseFamily(family)}>

                    <span style={{ background: family.color }} />

                    {family.label}

                  </button>

                ))}

              </div>

              <div className="dose-tabs" aria-label={`${selectedFamily.label} doses`}>

                {selectedFamily.options.map((option) => (

                  <button key={`${option.product}-${option.form}-${option.dose}`} type="button" className={selectedProduct.product === option.product && selectedProduct.form === option.form && selectedProduct.dose === option.dose ? "active" : ""} aria-pressed={selectedProduct.product === option.product && selectedProduct.form === option.form && selectedProduct.dose === option.dose} onClick={() => setSelectedProduct(option)}>{option.name}</button>

                ))}

              </div>

            </div>



            <div className="chart-shell" aria-label="Price comparison chart">

              <div className="chart-topline">

                <div>

                  <span className="eyebrow">{selectedFamily.label} · {selectedProduct.name}</span>

                  <h3>Dated regular-price history</h3>

                </div>

                <strong>{snapshot ? `$${snapshot.usd}` : "—"}</strong>

              </div>



              <div className="price-chart">

                <PriceHistoryChart key={`${selectedProduct.product}-${selectedProduct.form}-${selectedProduct.dose}`} points={history} snapshot={snapshot} />

              </div>



              <div className="chart-note">

                {snapshot ? <>Current observed snapshot: ${snapshot.usd} per {snapshot.periodDays} days ({snapshot.form}, {snapshot.dose}); observed on {snapshot.date}. This snapshot is not treated as a dated price change. <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">Snapshot source ↗</a></> : "No current observed snapshot is included for this product and dose."} {history[0] && <>Historical dots show sourced available regular offers only. {history.some(point => point.dateLabel) && <>The $650 predecessor start date is unverified; its plotted baseline is schematic. </>} <a href={history[history.length - 1].sourceUrl} target="_blank" rel="noreferrer">Latest historical source ↗</a></>}

              </div>

              {selectedOffers.length > 0 && (
                <div className="offer-strip" aria-label="Temporary and conditional offers">
                  <div className="offer-strip-heading"><span>{selectedOffers.some(offer => offer.priceBasis === "conditional") ? "CONDITIONAL + TEMPORARY OFFERS" : "INTRODUCTORY + TEMPORARY OFFERS"}</span><p>These are offers, not permanent price cuts.</p></div>
                  <div className="offer-cards">
                    {selectedOffers.map((offer) => (
                      <article key={`${offer.id}-${offer.eligibility}`}>
                        <strong>${offer.usd}</strong>
                        <span>{offer.priceBasis} · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${offer.date}T00:00:00Z`))}</span>
                        <p>{offer.eligibility}</p>
                        {offer.effectiveUntil && <em>Offer recorded through {offer.effectiveUntil}</em>}
                      </article>
                    ))}
                  </div>
                </div>
              )}

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



  );
}
