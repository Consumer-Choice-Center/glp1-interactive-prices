"use client";



import { useEffect, useRef, useState } from "react";

import {
  getCurrentStoryPrice,
  getStorySeries,
  policyEvents,
  pricePoints,
  recordEvents,
  type PricePoint,
} from "../data/glp1-prices";

import "./policy-story.css";
import { productDoseColor } from "./dose-colors";
import type { CSSProperties } from "react";



const stats = [

  { label: "EARLY CASH CUTS · FEB–MAR 2025", value: "9.1–23.2%", tone: "coral", copy: "Zepbound’s 2.5 and 5 mg vial prices fell 12.5% and 9.1%; Wegovy fell 23.2%, before the May MFN executive order." },

  { label: "LARGER CUTS · NOV–DEC 2025", value: "14 days", tone: "gold", copy: "Following the November agreements, Wegovy fell another 30.1%; Zepbound’s 2.5 and 5 mg vial prices fell 14.3% and 20.0%. The cuts occurred November 17–December 1." },

  { label: "REGULAR PRICES THEN HELD", value: "0%", tone: "blue", copy: "Further reduction recorded: none for these existing Wegovy injection and Zepbound vial regular self-pay prices since December 1, 2025, through September 28, 2026." },

];



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

type AnalysisView = "cuts" | "indexed" | "sequence";

type AnalysisSeries = {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
  points: PricePoint[];
};

function regularPriceChanges(product: string, dose: string, form: string) {
  const seen = new Set<string>();
  return getStorySeries(product, dose, form)
    .filter((point) => point.priceBasis === "regular" && point.displayMode !== "marker")
    .filter((point) => {
      const key = `${point.date}|${point.usd}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function PriceAnalysis() {
  const [activeView, setActiveView] = useState<AnalysisView>("cuts");
  const [selectedCut, setSelectedCut] = useState("wegovy");
  const [selectedIndexedPoint, setSelectedIndexedPoint] = useState<PricePoint | null>(null);
  const [selectedSequenceId, setSelectedSequenceId] = useState("2024-08-27|Zepbound|399");
  const [sequenceYear, setSequenceYear] = useState("2024");

  const series: AnalysisSeries[] = [
    { key: "wegovy", label: "Wegovy injection", shortLabel: "Wegovy", color: "#b9c6cf", points: regularPriceChanges("Wegovy", "2.4", "Pen") },
    { key: "zepbound-25", label: "Zepbound 2.5 mg vial", shortLabel: "Zepbound 2.5 mg", color: productDoseColor("zepbound", "2.5", "#ffbe78"), points: regularPriceChanges("Zepbound", "2.5", "Vial") },
    { key: "zepbound-5", label: "Zepbound 5 mg vial", shortLabel: "Zepbound 5 mg", color: productDoseColor("zepbound", "5", "#ffbe78"), points: regularPriceChanges("Zepbound", "5", "Vial") },
  ];

  const cutRows = series.flatMap((item) => {
    const [start, middle, end] = item.points;
    if (!start || !middle || !end) return [];
    const early = ((start.usd - middle.usd) / start.usd) * 100;
    const later = ((middle.usd - end.usd) / start.usd) * 100;
    return [{ ...item, start, middle, end, early, later, total: early + later }];
  });
  const activeCut = cutRows.find((item) => item.key === selectedCut) ?? cutRows[0];

  const chartWidth = 920;
  const chartHeight = 430;
  const inset = { left: 92, right: 38, top: 90, bottom: 52 };
  const startTime = Date.parse("2024-08-01T00:00:00Z");
  const endTime = Date.parse("2026-10-31T00:00:00Z");
  const x = (date: string) => inset.left + ((Date.parse(`${date}T00:00:00Z`) - startTime) / (endTime - startTime)) * (chartWidth - inset.left - inset.right);
  const y = (indexValue: number) => inset.top + ((105 - indexValue) / 60) * (chartHeight - inset.top - inset.bottom);
  const indexedPath = (item: AnalysisSeries) => {
    if (!item.points.length) return "";
    const base = item.points[0].usd;
    let path = `M ${x(item.points[0].date)} ${y(100)}`;
    item.points.slice(1).forEach((point) => {
      path += ` H ${x(point.date)} V ${y((point.usd / base) * 100)}`;
    });
    return `${path} H ${x("2026-10-31")}`;
  };

  const reductionFromPrevious = (point: PricePoint) => {
    const previous = pricePoints.filter(candidate =>
      candidate.product === point.product && candidate.form === point.form &&
      candidate.dose === point.dose && candidate.priceBasis === point.priceBasis &&
      candidate.status === "available" && candidate.displayMode !== "marker" && candidate.date < point.date
    ).sort((a, b) => b.date.localeCompare(a.date))[0];
    return previous && previous.usd > point.usd ? ((previous.usd - point.usd) / previous.usd) * 100 : null;
  };

  const novoSequence = pricePoints
    .filter((point) => ["Wegovy", "Wegovy pill", "Wegovy HD"].includes(point.product) && point.status === "available" && point.displayMode !== "marker")
    .filter((point, index, all) => all.findIndex((candidate) => candidate.date === point.date && candidate.product === point.product && candidate.usd === point.usd && candidate.event === point.event) === index)
    .map((point) => ({ id: `${point.date}|${point.product}|${point.usd}`, lane: "Novo direct cash", reduction: reductionFromPrevious(point), date: point.date, title: `${point.product}: $${point.usd}`, note: `${point.event}. ${point.dose}; ${point.priceBasis} price.`, color: point.product === "Wegovy" ? "#b9c6cf" : productDoseColor(point.product === "Wegovy HD" ? "wegovy" : "oral-wegovy", point.dose.replace(/ mg$/, ""), point.product === "Wegovy HD" ? "#c6a3f4" : "#ee99c4") }));
  const lillySequence = series
    .filter((item) => item.key !== "wegovy")
    .flatMap((item) => item.points.map((point) => ({ id: `${point.date}|${point.product}|${point.usd}`, lane: "Lilly direct cash", reduction: reductionFromPrevious(point), date: point.date, title: `${item.shortLabel}: $${point.usd}`, note: `${point.event}. Regular manufacturer-direct price.`, color: item.color })))
    .filter((point, index, all) => all.findIndex((candidate) => candidate.id === point.id) === index);
  const policySequence = recordEvents
    .filter((event) => ["government", "policy", "future"].includes(event.type) && event.date >= "2024-08-01")
    .map((event) => ({ id: `${event.date}|${event.sourceId}`, lane: "Government and policy", reduction: null, date: event.date, title: event.title, note: `${event.note} ${event.caution}`, color: "#c38bff" }));
  const sequenceItems = [...lillySequence, ...novoSequence, ...policySequence].sort((a, b) => a.date.localeCompare(b.date));
  const selectedSequence = sequenceItems.find((item) => item.id === selectedSequenceId && item.date.startsWith(sequenceYear)) ?? sequenceItems.find(item => item.date.startsWith(sequenceYear));


  const viewCopy: Record<AnalysisView, { title: string; text: string }> = {
    cuts: { title: "How much of the decline came before policy?", text: "The first phase ends before the November 2025 federal agreements. The later phase occurred in a mixed competition-and-policy environment." },
    indexed: { title: "Different starting prices. Comparable declines.", text: "Each series begins at 100, so the slope shows the cumulative percentage change without pretending that different doses are the same product." },
    sequence: { title: "Cash prices moved first. Policy entered later.", text: "Select any marker to separate manufacturer price actions from government announcements and future-effective policy." },
  };

  return (
    <section className="chapter price-analysis" id="price-analysis">
      <header className="price-analysis-header">
        <span className="eyebrow">What the cuts show</span>
        <h2>Read the price record.<br /><span>Then test the claim.</span></h2>
        <p>The first manufacturer cash-price cuts preceded the November 2025 federal agreements. Later cuts were larger in some series, but they arrived in a mixed policy environment and cannot be assigned to one cause from timing alone.</p>
      </header>

      <div className="analysis-view-tabs" role="tablist" aria-label="Price analysis views">
        {([["cuts", "Cut decomposition"], ["indexed", "Indexed price paths"], ["sequence", "Event sequence"]] as [AnalysisView, string][]).map(([view, label]) => (
          <button type="button" role="tab" aria-selected={activeView === view} className={activeView === view ? "active" : ""} key={view} onClick={() => setActiveView(view)}>{label}</button>
        ))}
      </div>

      <div className={`analysis-shell${activeView === "sequence" ? " analysis-shell-sequence" : activeView === "indexed" ? " analysis-shell-indexed" : " analysis-shell-cuts"}`}>
        <div className="analysis-heading">
          <div><span>{activeView === "cuts" ? "PERCENT CHANGE" : activeView === "indexed" ? "FIRST PRICE = 100" : "DATED ACTIONS"}</span><h3>{viewCopy[activeView].title}</h3></div>
          <p>{viewCopy[activeView].text}</p>
        </div>

        {activeView === "cuts" && (
          <div className="cut-analysis-grid">
            <div className="cut-bars" aria-label="Price decline decomposition">
              {cutRows.map((row) => (
                <button type="button" key={row.key} className={selectedCut === row.key ? "active" : ""} style={{ "--series-color": row.color } as CSSProperties} onClick={() => setSelectedCut(row.key)}>
                  <span className="cut-label">{row.label}</span>
                  <span className="cut-track"><i className="cut-early" style={{ width: `${(row.early / 55) * 100}%` }}><b>{row.early.toFixed(1)}</b></i><i className="cut-later" style={{ width: `${(row.later / 55) * 100}%` }}><b>{row.later.toFixed(1)}</b></i></span>
                  <strong>−{row.total.toFixed(1)}%</strong>
                </button>
              ))}
              <div className="cut-axis"><span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>40%</span><span>50%</span></div>
            </div>
            {activeCut && <aside className="analysis-detail-card"><span>SELECTED SERIES</span><h4>{activeCut.label}</h4><div className="price-sequence"><b>${activeCut.start.usd}</b><i>→</i><b>${activeCut.middle.usd}</b><i>→</i><b>${activeCut.end.usd}</b></div><p><strong>Early phase ({activeCut.start.date} → {activeCut.middle.date}):</strong> −{activeCut.early.toFixed(1)} percentage points from the starting price.</p><p><strong>Later phase ({activeCut.middle.date} → {activeCut.end.date}):</strong> −{activeCut.later.toFixed(1)} additional percentage points.</p></aside>}
          </div>
        )}

        {activeView === "indexed" && (
          <div className="indexed-analysis">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Indexed manufacturer cash prices">
              {[50, 60, 70, 80, 90, 100].map((tick) => <g key={tick}><line x1={inset.left} x2={chartWidth - inset.right} y1={y(tick)} y2={y(tick)} className="analysis-grid-line" /><text x={inset.left - 14} y={y(tick) + 4} textAnchor="end" className="analysis-axis-label">{tick}</text></g>)}
              <line x1={x("2025-11-06")} x2={x("2025-11-06")} y1={inset.top} y2={chartHeight - inset.bottom} className="analysis-policy-line" />
              <text x={x("2025-11-06")} y="68" textAnchor="middle" className="analysis-policy-label">NOV 6, 2025 · LILLY / NOVO MFN AGREEMENTS</text>
              {series.map((item) => <g key={item.key}><path d={indexedPath(item)} fill="none" stroke={item.color} className="analysis-index-line" />{item.points.map((point) => { const indexed = (point.usd / item.points[0].usd) * 100; return <g key={point.id} role="button" tabIndex={0} className="analysis-index-point" onMouseEnter={() => setSelectedIndexedPoint(point)} onFocus={() => setSelectedIndexedPoint(point)} onClick={() => setSelectedIndexedPoint(point)}><circle cx={x(point.date)} cy={y(indexed)} r="8" fill="#080b12" stroke={item.color} /><title>{item.label}: ${point.usd} ({indexed.toFixed(1)})</title></g>; })}</g>)}
              {[{ date: "2024-08-01", label: "Aug ’24" }, { date: "2025-03-01", label: "Mar ’25" }, { date: "2025-11-01", label: "Nov ’25" }, { date: "2026-06-01", label: "Jun ’26" }, { date: "2026-10-01", label: "Oct ’26" }].map((tick) => <text key={tick.date} x={x(tick.date)} y={chartHeight - 17} textAnchor="middle" className="analysis-axis-label">{tick.label}</text>)}
            </svg>
            <div className="analysis-line-legend">{series.map((item) => <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>)}</div>
            <p className="indexed-readout">{selectedIndexedPoint ? <><strong>{selectedIndexedPoint.product} · {selectedIndexedPoint.dose}</strong> {selectedIndexedPoint.date}: ${selectedIndexedPoint.usd} · {selectedIndexedPoint.event}</> : "Hover or focus a point to read the underlying price event."}</p>
          </div>
        )}

        {activeView === "sequence" && (
          <div className="sequence-analysis">
            <div className="sequence-year-picker">
              <strong>Explore by year</strong>
              <div role="group" aria-label="Explore events by year">
                {[...new Set(sequenceItems.map(item => item.date.slice(0, 4)))].map(year => <button type="button" key={year} aria-pressed={sequenceYear === year} className={sequenceYear === year ? "active" : ""} onClick={() => setSequenceYear(year)}>{year}</button>)}
              </div>
            </div>
            <div className="sequence-event-list" aria-label="Market and policy events in chronological order">
                {sequenceItems.filter(item => item.date.startsWith(sequenceYear)).map(item => <button type="button" key={item.id} style={{ "--event-color": item.color } as CSSProperties} className={selectedSequence?.id === item.id ? "active" : ""} onClick={() => setSelectedSequenceId(item.id)} aria-pressed={selectedSequence?.id === item.id}>
                <time dateTime={item.date}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${item.date}T00:00:00Z`))}</time>
                <span className="sequence-event-category"><i style={{ background: item.color }} />{item.lane}</span>
                <strong>{item.title}</strong>
                <span className="sequence-event-reduction">{item.reduction !== null ? `${item.reduction.toFixed(1)}% decrease` : "Unchanged"}</span>
              </button>)}
            </div>
            {selectedSequence && <aside className="sequence-readout" style={{ "--event-color": selectedSequence.color } as CSSProperties}><span>{selectedSequence.lane} · {selectedSequence.date}</span><h4>{selectedSequence.title}</h4><p>{selectedSequence.note}</p></aside>}
          </div>
        )}
      </div>

      <div className="analysis-conclusion"><strong>What the data supports</strong><p>Competition and direct purchasing produced measurable reductions before federal agreements. The timing of later reductions supports a mixed explanation, not a clean causal claim for either markets or government.</p></div>
    </section>
  );
}

function PriceHistoryChart({ points }: { points: PricePoint[] }) {
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

  const lastDate = Date.parse("2026-10-31T00:00:00Z");

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
          path += ` H ${x(Date.parse("2026-10-05T00:00:00Z"))}`;
          return <path key={basis} d={path} fill="none" stroke={chartColor} strokeWidth="4" strokeDasharray={basis === "regular" ? undefined : "5 4"} />;
        })}

        <g className="policy-timeline-marker"><line x1={x(policyDate)} y1={inset.top} x2={x(policyDate)} y2={height - inset.bottom}/><rect x={x(policyDate) - 48} y="2" width="96" height="19" rx="9"/><text x={x(policyDate)} y="15" textAnchor="middle">MFN · NOV 6 ’25</text></g>

        {points.map((point, index) => <g key={point.id} className="policy-timeline-point" role="button" tabIndex={0} aria-label={`${point.date}: $${point.usd} · ${point.event} · ${point.priceBasis}`} onMouseEnter={() => setHoveredId(point.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(point.id)} onBlur={() => setHoveredId(null)} onClick={() => setPinnedId(pinnedId === point.id ? null : point.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setPinnedId(pinnedId === point.id ? null : point.id); } if (event.key === "Escape") { setPinnedId(null); setHoveredId(null); } }}><circle cx={x(dateTimes[index])} cy={y(point.usd)} r="6" fill={chartColor}><title>{`${point.date}: ${point.status === "announced" ? "Starting at " : ""}$${point.usd} · ${point.event} · ${point.priceBasis}`}</title></circle><text x={x(dateTimes[index])} y={y(point.usd) - 10} textAnchor="middle">${point.usd}</text></g>)}

        {ticks.map((tick) => <text className="policy-timeline-date" key={tick.date} x={x(Date.parse(`${tick.date}T00:00:00Z`))} y={height - 12} textAnchor="middle">{tick.label}</text>)}

        {activePoint && (() => {
          const tipX = Math.max(inset.left, Math.min(x(Date.parse(`${activePoint.date}T00:00:00Z`)) - 100, width - 210));
          const tipY = Math.min(y(activePoint.usd) + 12, height - inset.bottom - 50);
          const date = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${activePoint.date}T00:00:00Z`));
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



const timeline = [

  { label: "2024", title: "Direct-to-consumer pressure begins", note: "Single-dose pricing and affordability programs started reshaping the market before the policy debate matured. Eli Lilly and Novo Nordisk began competing through lower-priced cash-pay offers, giving consumers alternatives to the traditional insurance channel." },

  { label: "2025", title: "Direct cash channels bypass middlemen", note: "Direct cash channels and the companies’ direct-to-patient platforms bypassed traditional insurers and pharmacy benefit managers (PBMs), making it easier to offer lower prices directly to patients. Zepbound and Wegovy cut prices before the May 2025 MFN executive order.\n\nFollowing the November 6 manufacturer agreements, further cuts occurred on November 17 and December 1—a 14-day window.\n\nPolicy entered a market where cash prices were already falling; the timing alone does not establish why subsequent cuts stopped." },

  { label: "2026", title: "Regular prices held", note: "In 2026, no further permanent price cuts were recorded for the existing Wegovy injection and Zepbound vial regular self-pay prices following the late-2025 cuts. These prices remained unchanged from December 1, 2025 through the present day." },

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

    copy: "Manufacturers responded to competition, a branded rivalry between two companies for patient demand, affordability pressure, and channel design before political claims settled in.",

  },

  {

    tag: "Phase 2",

    title: "Washington claimed the win",

    copy: "The public debate anchored to the end result while the earlier commercial shifts were already underway.",

  },

];



export default function PolicyStory({ onExplore }: { onExplore: (productId: "wegovy" | "zepbound") => void }) {
  const [expandedChart, setExpandedChart] = useState<"zepbound" | "wegovy" | null>(null);
  const chartDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!expandedChart) return;
    chartDialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expandedChart]);

  const [selectedFamilyId, setSelectedFamilyId] = useState(productFamilies[0].id);

  const [selectedProduct, setSelectedProduct] = useState<ProductOption>(productFamilies[0].options.at(-1)!);

  const [activeTimeline, setActiveTimeline] = useState(2);

  const history = getStorySeries(selectedProduct.product, selectedProduct.dose, selectedProduct.form).filter((point) => point.displayMode !== "marker");

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

  const scrollToOped = () => {
    document.getElementById("oped")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };



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

              By <strong><a href="https://consumerchoicecenter.org/team/araceli-vargas/" target="_blank" rel="noreferrer">Araceli Vargas</a></strong> · Policy analysis

            </p>

          </div>



          <div className="hero-bottom" id="story">

            <p>

              Competition and direct cash channels changed the incentives before the political narrative caught up.

            </p>

            <a href="#details">See the timeline →</a>

            <button className="read-oped-button" type="button" onClick={scrollToOped}>Read the op-ed ↓</button>

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

                <PriceHistoryChart points={history} />

              </div>



              <div className="chart-note">

                {snapshot ? <>Current observed snapshot: ${snapshot.usd} per {snapshot.periodDays} days ({snapshot.form}, {snapshot.dose}); observed on {snapshot.date}. This snapshot is not treated as a dated price change. <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">Snapshot source ↗</a></> : "No current observed snapshot is included for this product and dose."} {history[0] && <>Historical dots show sourced available regular offers only. <a href={history[history.length - 1].sourceUrl} target="_blank" rel="noreferrer">Latest historical source ↗</a></>}

              </div>

              {selectedOffers.length > 0 && (
                <div className="offer-strip" aria-label="Temporary and conditional offers">
                  <div className="offer-strip-heading"><span>INTRODUCTORY + TEMPORARY OFFERS</span><p>These are offers, not permanent price cuts.</p></div>
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

                {timeline[activeTimeline].note.split("\n\n").map((paragraph, index) => <p key={`${activeTimeline}-${index}`}>{paragraph}</p>)}

                <a href="#oped">Read the full story →</a>

              </article>

            </div>

          </div>

        </section>







        <PriceAnalysis />

        <article className="chapter oped" id="oped">

          <div className="oped-grid">

            <header className="oped-header">

              <p className="kicker coral">Op-ed</p>

              <h2>The Rapid Evolution of Affordable GLP-1s</h2>

              <p className="oped-dek">Competition, transparent cash prices and direct-to-patient channels lowered GLP-1 prices without government price controls.</p>

              <a className="oped-publication" href="https://www.realclearmarkets.com/articles/2026/10/01/the_rapid_evolution_of_affordable_glp-1s_1209087.html" target="_blank" rel="noreferrer">As seen in: RealClearMarkets ↗</a>

              <div className="oped-author-line">

                <span className="oped-author-monogram">DC</span>

                <span className="oped-author-monogram">AV</span>

                <p className="oped-byline"><strong><a href="https://consumerchoicecenter.org/team/david-clement/" target="_blank" rel="noreferrer">David Clement</a> &amp; <a href="https://consumerchoicecenter.org/team/araceli-vargas/" target="_blank" rel="noreferrer">Araceli Vargas</a></strong><span>RealClearMarkets · October 1, 2026</span></p>

              </div>

            </header>



            <div className="oped-body">

              <p className="oped-dropcap">Republicans and Democrats both love to campaign against high prescription drug prices. They just use different words to describe how they’ll subvert markets and fix prices at a level their voters will appreciate. President Donald Trump’s version of this is the <a href="https://www.whitehouse.gov/presidential-actions/2025/05/delivering-most-favored-nation-prescription-drug-pricing-to-american-patients/" target="_blank" rel="noreferrer">Most Favored Nation</a> (MFN) policy, which benchmarks drug prices against the lowest net prices paid in other countries, while Senator Bernie Sanders has <a href="https://www.sanders.senate.gov/press-releases/media-advisory-sanders-to-hold-subcommittee-hearing-on-soaring-cost-of-prescription-drugs/" target="_blank" rel="noreferrer">proposed</a> pegging prices against the median price across five countries.</p>



              <p>That instinct isn’t crazy, at least for brand-name drugs. Americans pay <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11147645/" target="_blank" rel="noreferrer">more</a> than 4.22 times as much as people in other countries for branded medications before rebates. But that statistic hides a bigger one: for the generics that make up roughly 90 percent of prescriptions filled in the U.S., America is the world’s leading bargain hunter, paying just 67 percent of what patients elsewhere pay for the same pills.</p>



              <p>This is conveniently overlooked on the campaign trail, but the subject of American drug prices comes up. People <a href="https://www.salsify.com/blog/why-brand-trust-makes-shoppers-pay-more" target="_blank" rel="noreferrer">trust</a> brand-name products more; whether it’s a prescription medication or an over-the-counter cough syrup, they opt to pay more for it.</p>



              <p>But the major policy question at hand for America is: what can be done to help draw down the prices paid for those brand-name drugs, and are price-setting schemes really the solution? America has run this experiment before.</p>



              <h3>Avoiding the Nixon Experiment</h3>

              <p>In 1971, Richard Nixon <a href="https://www.cato.org/commentary/remembering-nixons-wage-price-controls" target="_blank" rel="noreferrer">froze</a> wages and prices across the entire economy, pharmaceuticals included, to fight inflation. It produced the textbook case against price controls: ranchers stopped shipping cattle, farmers drowned chickens rather than sell at a loss, and shelves emptied as the controls dragged on. Still, Nixon’s move <a href="https://www.taxnotes.com/featured-analysis/tax-history-nixon-shock-tax-cuts-and-public-campaign-financing-checkoff/2023/04/07/7g9nr" target="_blank" rel="noreferrer">polled</a> at 75 percent support with voters, which isn’t surprising. People get frustrated with the economy and look to politicians to channel that frustration.</p>



              <p>Nobel Prize-winning economist Milton Friedman warned the freeze would end in “utter failure and the emergence into the open of the suppressed inflation.” He was right, and after the freeze didn’t improve the economy, Nixon’s aides backtracked. Thirteen years later, Congress tried the opposite approach with the <a href="https://www.fda.gov/drugs/cder-conversations/40th-anniversary-generic-drug-approval-pathway" target="_blank" rel="noreferrer">Hatch-Waxman Act</a> of 1984—which didn’t set a single price for drugs.</p>



              <p>Instead, it made it faster and thus cheaper for generic manufacturers to enter the market once a patent expired, allowing them to compete for the business. Today, generics account for more than 90 percent of prescriptions filled in America, and they’re now among the cheapest in the world.</p>



              <p>The GLP-1 market has been running much like the second scenario, and prices have tumbled fast.</p>



              <h3>The Rapid Evolution of Affordable GLP-1s</h3>

              <p>In 2022, patients without insurance coverage for the now wildly popular weight-loss drugs faced costs <a href="https://www.iqvia.com/locations/united-states/blogs/2025/10/non-traditional-channels-the-compounded-glp-1-market" target="_blank" rel="noreferrer">exceeding</a> $1,000 a month, a price that put them out of reach for most people who wanted them. Then, in <a href="https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management" target="_blank" rel="noreferrer">November</a> of 2023, the FDA approved Eli Lilly’s Zepbound, giving Novo Nordisk’s Wegovy its first real branded rival. A few months later, Lilly <a href="https://investor.lilly.com/news-releases/news-release-details/lilly-launches-end-end-digital-healthcare-experience-through" target="_blank" rel="noreferrer">launched</a> LillyDirect, a platform that sold the drug straight to patients for a cash price, with no insurer or pharmacy benefit manager in between. Twelve months after that, Lilly and Novo were <a href="https://investor.lilly.com/news-releases/news-release-details/lilly-launches-additional-zepbound-vial-doses-and-offers-new" target="_blank" rel="noreferrer">actively</a> repricing against each other in public—prices fell anywhere from 12 to 23 percent.</p>



              <p>A “race to the bottom” isn’t always bad.</p>

              <p>Mark Cuban ran a version of this on generics through his Cost Plus Drugs <a href="https://www.prnewswire.com/news-releases/mark-cuban-cost-plus-drug-companys-online-pharmacy-launches-with-lowest-prices-on-100-lifesaving-prescriptions-301463491.html" target="_blank" rel="noreferrer">online pharmacy</a>, which cuts out the PBM markup entirely. Sell direct, publish the price, let the competitor’s number sit right next to yours, and consumers choose what works best for them.</p>



              <h3>A Remarkable Model to Follow</h3>

              <p>All of the progress we’ve seen in GLP-1 pricing has occurred in the “cash channel” because, in the insured market, confidential rebates lower a health plan’s costs after a prescription is filled, while a patient’s deductible or percentage-based payment might remain tied to the pre-rebate price. Direct buying bypasses the opaque insurance-and-rebate channel and PBMs.</p>



              <p>Margins on individual doses shrank, but revenue grew anyway because volume expanded once the price started to look affordable to the median consumer. That’s the outcome MFN advocates insist can’t happen without a mandate: lower prices and preserved R&amp;D funding, reached without a single regulator in the room. Squeezing profits at the expense of future research is the strongest argument against price-setting schemes, and GLP-1 pricing has shown how to get around it.</p>



              <p>Government price-setting is engineered to poll well, as in Nixon’s case. It’s a promise a candidate can make in one sentence on a debate stage to show they are fighters. But what actually lowered GLP-1 prices was patience and process—rival entry, a direct-to-patient sales channel, and two competitors who could each see exactly what the other was charging.</p>



              <p>If Washington wants more of what just happened with Zepbound and Wegovy, the fix isn’t a new scheme linked to foreign price controls. Simply tear down the rebate system that hides prices from patients in the first place, and then get out of the way.</p>



              <p className="oped-author-bio"><em>By <a href="https://consumerchoicecenter.org/team/david-clement/" target="_blank" rel="noreferrer">David Clement</a> and <a href="https://consumerchoicecenter.org/team/araceli-vargas/" target="_blank" rel="noreferrer">Araceli Vargas</a>, the Policy Director and Policy &amp; Data Analytics Fellow at the Consumer Choice Center.</em></p>

            </div>

          </div>

        </article>

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

        <section className="chapter oped-charts" aria-labelledby="oped-charts-heading">
          <div className="oped-charts-content">
            <span className="eyebrow">Price channels</span>
            <h2 id="oped-charts-heading">Zepbound and Wegovy</h2>
            <div className="oped-chart-list">
              <figure>
                <button className="oped-chart-open" type="button" onClick={() => setExpandedChart("zepbound")} aria-label="Open Zepbound price channel chart at full size">
                  <img src="/charts/chart1_zepbound_channels.png" alt="Zepbound price history across pricing channels" loading="lazy" />
                </button>
                <figcaption>Zepbound price channels · Select the chart to view it at full size.</figcaption>
              </figure>
              <figure>
                <button className="oped-chart-open" type="button" onClick={() => setExpandedChart("wegovy")} aria-label="Open Wegovy price channel chart at full size">
                  <img src="/charts/chart2_wegovy_channels.png" alt="Wegovy price history across pricing channels" loading="lazy" />
                </button>
                <figcaption>Wegovy price channels · Select the chart to view it at full size.</figcaption>
              </figure>
            </div>
          </div>
        </section>



        <section className="chapter mechanism" id="full-story">

          <div className="dashboard-wrap">

            <div className="dashboard-intro">

              <span className="eyebrow">Mechanism</span>

              <h2>What changed incentives?</h2>

              <p>The op-ed identifies the mechanism. Continue into the Product Universe to examine the products and their documented price histories.</p>

              <div className="product-tabs" aria-label="Explore products in the Product Universe">

                <button type="button" onClick={() => onExplore("wegovy")}>

                  <span style={{ background: "#68d2ff" }} />

                  Explore Wegovy →

                </button>

                <button type="button" onClick={() => onExplore("zepbound")}>

                  <span style={{ background: "#ffb054" }} />

                  Explore Zepbound →

                </button>

              </div>

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

      </main>
      <dialog ref={chartDialog} className="oped-chart-dialog" onClose={() => setExpandedChart(null)} onClick={event => { if (event.target === event.currentTarget) chartDialog.current?.close(); }} aria-label={`${expandedChart === "zepbound" ? "Zepbound" : "Wegovy"} price channel chart`}>
        <div className="oped-chart-dialog-heading">
          <strong>{expandedChart === "zepbound" ? "Zepbound" : "Wegovy"} price channels</strong>
          <button type="button" autoFocus onClick={() => chartDialog.current?.close()} aria-label="Close chart and return to op-ed">×</button>
        </div>
        {expandedChart && <img src={`/charts/${expandedChart === "zepbound" ? "chart1_zepbound_channels" : "chart2_wegovy_channels"}.png`} alt={`${expandedChart === "zepbound" ? "Zepbound" : "Wegovy"} price history across pricing channels`} />}
      </dialog>

    </div>

  );

}
