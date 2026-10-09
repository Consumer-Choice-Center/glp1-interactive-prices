"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PriceHistoryPanels, { priceEventLabel } from "./price-history-panels";
import PriceSignal from "./price-signal";

import {
  getStorySeries,
  PRICE_OBSERVED_ON,
  pricePoints,
  recordEvents,
  type PricePoint,
} from "../data/glp1-prices";

import "./policy-story.css";
import { productDoseColor } from "./dose-colors";
import type { CSSProperties, ReactNode } from "react";

const stats = [

  { label: "EARLY CASH CUTS · FEB–MAR 2025", value: "9.1–23.2%", tone: "coral", copy: "Zepbound’s 2.5 and 5 mg vial prices fell 12.5% and 9.1%; Wegovy fell 23.2%, before the May MFN executive order." },

  { label: "FURTHER CUTS · NOV–DEC 2025", value: "14 days", tone: "gold", copy: "Following the November agreements, Wegovy fell another 30.1%; Zepbound’s 2.5 and 5 mg vial prices fell 14.3% and 20.0%. The two price actions were 14 days apart: November 17 for Wegovy and December 1 for Zepbound." },

  { label: "THESE THREE SERIES HELD", value: "0%", tone: "blue", copy: "No additional reduction recorded for Wegovy injection and Zepbound 2.5 and 5 mg vial regular self-pay prices from December 1, 2025 to October 5, 2026. Higher-dose vials are excluded." },

];

type AnalysisView = "prices" | "cuts" | "indexed" | "sequence";

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
    })
    .filter((point, index, points) => index === 0 || point.usd !== points[index - 1].usd);
}

export function PriceAnalysis() {
  const [activeView, setActiveView] = useState<AnalysisView>("prices");
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
  const endTime = Date.parse(`${PRICE_OBSERVED_ON}T00:00:00Z`);
  const x = (date: string) => inset.left + ((Date.parse(`${date}T00:00:00Z`) - startTime) / (endTime - startTime)) * (chartWidth - inset.left - inset.right);
  const y = (indexValue: number) => inset.top + ((105 - indexValue) / 60) * (chartHeight - inset.top - inset.bottom);
  const indexedPath = (item: AnalysisSeries) => {
    if (!item.points.length) return "";
    const base = item.points[0].usd;
    let path = `M ${x(item.points[0].date)} ${y(100)}`;
    item.points.slice(1).forEach((point) => {
      path += ` H ${x(point.date)} V ${y((point.usd / base) * 100)}`;
    });
    return `${path} H ${x(PRICE_OBSERVED_ON)}`;
  };

  const comparisonLabel = (point: PricePoint) => {
    if (point.dateLabel) return "Prior offer · date unverified";
    const previous = pricePoints.filter(candidate =>
      candidate.product === point.product && candidate.form === point.form &&
      candidate.dose === point.dose && candidate.priceBasis === point.priceBasis &&
      candidate.status !== "announced" && candidate.displayMode !== "marker" && candidate.date < point.date
    ).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (point.status === "announced") return "Announced offer";
    if (!previous) return point.status === "observed" ? "Observed snapshot" : "Launch / first record";
    const change = (point.usd - previous.usd) / previous.usd * 100;
    if (point.status === "observed" && change !== 0) return `Observed ${Math.abs(change).toFixed(1)}% ${change < 0 ? "lower" : "higher"}; change date unverified`;
    return change === 0 ? "Unchanged" : `${Math.abs(change).toFixed(1)}% ${change < 0 ? "decrease" : "increase"}`;
  };
  const manufacturerSequence = pricePoints
    .filter(point => !point.dateLabel)
    .filter((point, index, all) => all.findIndex(candidate => candidate.id === point.id) === index)
    .map(point => ({ id: point.id, lane: ["Zepbound", "Foundayo"].includes(point.product) ? "Lilly direct cash" : "Novo direct cash", change: comparisonLabel(point), date: point.date, title: `${point.product} · ${point.dose} ${point.form.toLowerCase()}: $${point.usd}`, note: `${point.event}. ${point.channel}; ${point.priceBasis} price. ${point.eligibility}. ${point.note ?? ""}`, sourceUrl: point.sourceUrl, color: productDoseColor(point.product === "Zepbound" ? "zepbound" : point.product === "Foundayo" ? "foundayo" : point.product === "Wegovy pill" ? "oral-wegovy" : "wegovy", point.dose.replace(/ mg$/, ""), "#b9c6cf") }));
  const policySequence = recordEvents
    .filter(event => ["government", "policy", "future"].includes(event.type) && event.date >= "2024-08-01")
    .map(event => ({ id: `${event.date}|${event.sourceId}`, lane: "Government and policy", change: event.type === "future" ? "Future-effective announcement" : "No transaction price", date: event.date, title: event.title, note: `${event.note} ${event.caution}`, sourceUrl: event.date === "2025-05-12" ? "https://www.whitehouse.gov/presidential-actions/2025/05/delivering-most-favored-nation-prescription-drug-pricing-to-american-patients/" : event.date === "2025-11-06" ? "https://www.whitehouse.gov/fact-sheets/2025/11/fact-sheet-president-donald-j-trump-announces-major-developments-in-bringing-most-favored-nation-pricing-to-american-patients/" : null, color: "#c38bff" }));
  const sequenceItems = [...manufacturerSequence, ...policySequence].sort((a, b) => a.date.localeCompare(b.date));
  const selectedSequence = sequenceItems.find(item => item.id === selectedSequenceId && item.date.startsWith(sequenceYear)) ?? sequenceItems.find(item => item.date.startsWith(sequenceYear));

  const viewCopy: Record<Exclude<AnalysisView, "prices">, { title: string; text: string }> = {
    cuts: { title: "Initial and subsequent reductions", text: "Segments split at each series’ first reduction, not at a policy date. Both segments use the original price as their denominator; their percentage-point contributions add to the total decline." },
    indexed: { title: "Different starting prices. Comparable declines.", text: "Each series begins at 100, so the steps show the cumulative percentage change without pretending that different doses are the same product." },
    sequence: { title: "Manufacturer offers and policy milestones.", text: "Select an event to distinguish price changes, launches, observed snapshots, and policy announcements. Coverage includes both manufacturers’ recorded products and price bases." },
  };

  return (
    <section className="chapter price-analysis" id="price-analysis">
      <header className="price-analysis-header">
        <span className="eyebrow">What the cuts show</span>
        <h2>Read the price record.<br /><span>Then test the claim.</span></h2>
        <p>The February and March 2025 manufacturer cash-price reductions preceded the May MFN executive order. Further reductions followed the November Lilly/Novo agreements. Timing alone cannot establish how much competition or policy contributed.</p>
      </header>

      <div className="analysis-view-tabs" role="tablist" aria-label="Price analysis views">
        {([["prices", "Dated prices"], ["cuts", "Cut decomposition"], ["indexed", "Indexed price paths"], ["sequence", "Event sequence"]] as [AnalysisView, string][]).map(([view, label]) => (
          <button type="button" role="tab" aria-selected={activeView === view} className={activeView === view ? "active" : ""} key={view} onClick={() => setActiveView(view)}>{label}</button>
        ))}
      </div>

      <div className={`analysis-shell${activeView === "sequence" ? " analysis-shell-sequence" : activeView === "indexed" ? " analysis-shell-indexed" : " analysis-shell-cuts"}`}>
        {activeView !== "prices" && <div className="analysis-heading">
          <div><span>{activeView === "cuts" ? "PERCENTAGE-POINT CONTRIBUTIONS" : activeView === "indexed" ? "FIRST PRICE = 100" : "DATED ACTIONS"}</span><h3>{viewCopy[activeView].title}</h3></div>
          <p>{viewCopy[activeView].text}</p>
        </div>}

        {activeView === "prices" && <PriceHistoryPanels/>}

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
            {activeCut && <aside className="analysis-detail-card"><span>SELECTED SERIES</span><h4>{activeCut.label}</h4><div className="price-sequence"><b>${activeCut.start.usd}</b><i>→</i><b>${activeCut.middle.usd}</b><i>→</i><b>${activeCut.end.usd}</b></div><p><strong>Initial reduction ({priceEventLabel(activeCut.start)} → {activeCut.middle.date}):</strong> −{activeCut.early.toFixed(1)} percentage points from the starting price.</p><p><strong>Subsequent reduction ({activeCut.middle.date} → {activeCut.end.date}):</strong> −{activeCut.later.toFixed(1)} additional percentage points.</p></aside>}
          </div>
        )}

        {activeView === "indexed" && (
          <div className="indexed-analysis">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Indexed manufacturer cash prices">
              {[50, 60, 70, 80, 90, 100].map((tick) => <g key={tick}><line x1={inset.left} x2={chartWidth - inset.right} y1={y(tick)} y2={y(tick)} className="analysis-grid-line" /><text x={inset.left - 14} y={y(tick) + 4} textAnchor="end" className="analysis-axis-label">{tick}</text></g>)}
              <line x1={x("2025-11-06")} x2={x("2025-11-06")} y1={inset.top} y2={chartHeight - inset.bottom} className="analysis-policy-line" />
              <text x={x("2025-11-06")} y="68" textAnchor="middle" className="analysis-policy-label">NOV 6, 2025 · LILLY / NOVO MFN AGREEMENTS</text>
              {series.map((item) => <g key={item.key}><path d={indexedPath(item)} fill="none" stroke={item.color} className="analysis-index-line" />{item.points[0]?.dateLabel && item.points[1] && <path d={`M ${x(item.points[0].date)} ${y(100)} H ${x(item.points[1].date)}`} fill="none" stroke="#f7f1e8" strokeWidth="4" strokeDasharray="5 4"/>}{item.points.map((point) => { const indexed = (point.usd / item.points[0].usd) * 100; return <g key={point.id} role="button" tabIndex={0} className="analysis-index-point" onMouseEnter={() => setSelectedIndexedPoint(point)} onFocus={() => setSelectedIndexedPoint(point)} onClick={() => setSelectedIndexedPoint(point)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedIndexedPoint(point); } }}><circle cx={x(point.date)} cy={y(indexed)} r="8" fill="#080b12" stroke={item.color} /><title>{item.label}: ${point.usd} ({indexed.toFixed(1)})</title></g>; })}</g>)}
              {[{ date: "2024-08-01", label: "Aug ’24" }, { date: "2025-03-01", label: "Mar ’25" }, { date: "2025-11-01", label: "Nov ’25" }, { date: "2026-06-01", label: "Jun ’26" }, { date: "2026-10-01", label: "Oct ’26" }].map((tick) => <text key={tick.date} x={x(tick.date)} y={chartHeight - 17} textAnchor="middle" className="analysis-axis-label">{tick.label}</text>)}
            </svg>
            <div className="analysis-line-legend">{series.map((item) => <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>)}</div>
            <p className="history-method">Baseline = 100. Wegovy’s dashed predecessor baseline has an unverified start date and a different retail channel. Percentage-point contributions in Cut decomposition use this initial-price denominator; summary percentages use the previous offer.</p><p className="indexed-readout">{selectedIndexedPoint ? <><strong>{selectedIndexedPoint.product} · {selectedIndexedPoint.dose}</strong> {priceEventLabel(selectedIndexedPoint)}: ${selectedIndexedPoint.usd} · {selectedIndexedPoint.event}</> : "Hover or focus a point to read the underlying price event."}</p>
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
                <span className="sequence-event-reduction">{item.change}</span>
              </button>)}
            </div>
            {selectedSequence && <aside className="sequence-readout" style={{ "--event-color": selectedSequence.color } as CSSProperties}><span>{selectedSequence.lane} · {selectedSequence.date}</span><h4>{selectedSequence.title}</h4><p>{selectedSequence.note}</p>{selectedSequence.sourceUrl && <a href={selectedSequence.sourceUrl} target="_blank" rel="noreferrer">Event source ↗</a>}</aside>}
          </div>
        )}
      </div>

      <div className="analysis-conclusion"><strong>What the data supports</strong><p>The records establish that selected cash-price reductions preceded the May MFN executive order and that further reductions followed the November agreements. They do not isolate competition’s contribution, policy’s contribution, or why a particular price later remained unchanged.</p></div>
    </section>
  );
}

const timeline = [

  { label: "2024", title: "Direct-to-consumer pressure begins", note: "Lilly launched Zepbound’s 2.5 and 5 mg single-dose vials on August 27, 2024, at $399 and $549 per 28-day supply. These were new cash-pay options, not cuts from an identical earlier vial. Wegovy’s predecessor $650 savings offer is documented, but its start date is unverified." },

  { label: "2025", title: "Direct cash channels bypass middlemen", note: "Direct cash channels and the companies’ direct-to-patient platforms bypassed traditional insurers and pharmacy benefit managers (PBMs), making it easier to offer lower prices directly to patients. Zepbound and Wegovy cut prices before the May 2025 MFN executive order.\n\nFollowing the November 6 manufacturer agreements, further cuts occurred on November 17 and December 1—two price actions 14 days apart.\n\nPolicy entered a market where cash prices were already falling; the timing alone does not establish what caused later reductions or periods without recorded changes." },

  { label: "2026", title: "Selected prices held; other offers changed", note: "Wegovy injection and Zepbound 2.5 and 5 mg vial regular prices were unchanged at the October 5 observation relative to December 1, 2025. This does not cover all products or strengths.\n\nHigher-dose Zepbound vial regular prices were lower at the current observation: 7.5 mg $599 → $499; 12.5 mg $849 → $699; 15 mg $1,049 → $699. The exact change dates are not established in this record. New products and promotional offers are separate comparisons." },

];

const phaseCards = [

  {

    tag: "Phase 1",

    title: "What the record establishes",

    copy: "The selected cash offers fell before the May 2025 MFN executive order. Further reductions followed the November Lilly/Novo agreements. Regular offers, conditional offers, and new-product launches are distinct events.",

  },

  {

    tag: "Phase 2",

    title: "What timing cannot establish",

    copy: "These descriptive histories do not isolate competition, supply changes, or policy effects. An unchanged selected price does not prove that government stopped reductions, and it does not establish a market-wide price freeze.",

  },

];

export default function PolicyStory({ productUniverse, approvedMarket, priceEvidence }: { productUniverse?: ReactNode; approvedMarket?: ReactNode; priceEvidence?: ReactNode }) {
  const [expandedChart, setExpandedChart] = useState<"zepbound" | "wegovy" | null>(null);
  const chartDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!expandedChart) return;
    chartDialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expandedChart]);

  const [activeTimeline, setActiveTimeline] = useState(0);

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

          <div className="hero-research-intro" id="story">
            <p>Political pressure for mandatory drug price cuts and reference pricing keeps mounting in the US - We observe market and competitive dynamics in the field of anti-obesity medicines and created this dashboard based on our research. It shows that market forces, and not government policies were responsible for bringing AOMs prices down. Direct2Consumer approaches have been a driving factor as well. Enjoy scrolling and clicking through this interactive journey!</p>
            <div className="hero-research-actions"><a href="#universe">Product Universe →</a><button className="read-oped-button" type="button" onClick={scrollToOped}>Read the op-ed ↓</button></div>
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

            Selected series: Wegovy injection and Zepbound 2.5 and 5 mg vials. Percentages compare each cut with the previous offer. New products and temporary or conditional offers are excluded; the third box does not describe higher-dose vials.

          </p>

        </section>




        <section className="chapter timeline-section">

          <div className="timeline-wrap">
            <div className="timeline-grid">
              <div className="timeline-heading">

            <span className="eyebrow">Timeline</span>

            <h2>Market pressure was already moving.</h2>

              </div>
              <div className="timeline-milestone">
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

          </div>

        </section>

        {priceEvidence}

        {productUniverse}

        <article className="chapter oped" id="oped">

          <div className="oped-grid">

            <header className="oped-header">

              <p className="kicker coral">Op-ed</p>

              <h2>The Rapid Evolution of Affordable GLP-1s</h2>

              <p className="oped-dek">An argument for competition and direct purchasing, by David Clement and Araceli Vargas. The op-ed presents the authors’ interpretation; the accompanying price record does not independently establish causation.</p>

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

        {approvedMarket}

        <section className="chapter oped-charts" aria-labelledby="oped-charts-heading">
          <div className="oped-charts-content">
            <span className="eyebrow">Price channels</span>
            <h2 id="oped-charts-heading">Zepbound and Wegovy</h2>
            <p className="price-channels-description">See which Zepbound and Wegovy prices changed over time. Prices differ depending on where patients buy the drug and which offers they qualify for.</p>
              <div className="oped-chart-list">
              <figure>
                <button className="oped-chart-open" type="button" onClick={() => setExpandedChart("zepbound")} aria-label="Open Zepbound price channel chart at full size">
                  <Image unoptimized width={2718} height={1504} src="/charts/chart1_zepbound_channels.png" alt="Zepbound price history across pricing channels" loading="lazy" />
                </button>
                <figcaption>Zepbound’s direct-pay vial prices fell in two steps, while the pen list price stayed largely unchanged. Some lower prices depended on offer eligibility. Select the chart to view it at full size.</figcaption>
              </figure>
              <figure>
                <button className="oped-chart-open" type="button" onClick={() => setExpandedChart("wegovy")} aria-label="Open Wegovy price channel chart at full size">
                  <Image unoptimized width={2626} height={1504} src="/charts/chart2_wegovy_channels.png" alt="Wegovy price history across pricing channels" loading="lazy" />
                </button>
                <figcaption>Wegovy’s injection cash price fell in two steps, from $650 to $499, then to $349, while its list price held at about $1,349. The announced 2027 list-price cut is shown separately. Select the chart to view it at full size.</figcaption>
              </figure>
              </div>
          </div>
        </section>


        <PriceSignal/>

      </main>
      <dialog ref={chartDialog} className="oped-chart-dialog" onClose={() => setExpandedChart(null)} onClick={event => { if (event.target === event.currentTarget) chartDialog.current?.close(); }} aria-label={`${expandedChart === "zepbound" ? "Zepbound" : "Wegovy"} price channel chart`}>
        <div className="oped-chart-dialog-heading">
          <strong>{expandedChart === "zepbound" ? "Zepbound" : "Wegovy"} price channels</strong>
          <button type="button" autoFocus onClick={() => chartDialog.current?.close()} aria-label="Close chart and return to op-ed">×</button>
        </div>
        {expandedChart && <Image unoptimized width={expandedChart === "zepbound" ? 2718 : 2626} height={1504} src={`/charts/${expandedChart === "zepbound" ? "chart1_zepbound_channels" : "chart2_wegovy_channels"}.png`} alt={`${expandedChart === "zepbound" ? "Zepbound" : "Wegovy"} price history across pricing channels`} />}
      </dialog>


    </div>

  );

}

export function PolicyCaveat() {
  return <div className="policy-story-page">
<section className="chapter caveat">

          <div className="caveat-panel">

            <span className="eyebrow">Caveat</span>

            <h2>

              A price record.<span> Not a causal verdict.</span>

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
  </div>;
}
