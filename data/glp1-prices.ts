export type PriceStatus = "available" | "announced" | "observed";

export type PriceBasis = "regular" | "introductory" | "conditional" | "temporary";

export type PriceDisplayMode = "series" | "marker";



export type PricePoint = {

  id: string;

  date: string;

  product: string;

  form: string;

  dose: string;

  usd: number;

  periodDays: number;

  unit: string;

  channel: string;

  eligibility: string;

  priceBasis: PriceBasis;

  event: string;

  status: PriceStatus;

  sourceUrl: string;

  note?: string;

  dateLabel?: string;

  effectiveUntil?: string;

  seriesKey?: string;

  displayMode?: PriceDisplayMode;

};



export type ChartPoint = {

  id: string;

  label: string;

  value: number;

  basis: PriceBasis;

  status: PriceStatus;

  event: string;

  date: string;

  product: string;

  form: string;

  dose: string;

  periodDays: number;

  channel: string;

  eligibility: string;

  sourceUrl: string;

  seriesKey?: string;

  displayMode?: PriceDisplayMode;

  announcement: boolean;

  note?: string;

  dateLabel?: string;

  effectiveUntil?: string;

};



export type ChartSeries = {

  key: string;

  basis: PriceBasis;

  label: string;

  showLine: boolean;

  points: ChartPoint[];

};



const source = {

  lilly2024: "https://investor.lilly.com/news-releases/news-release-details/lilly-releases-zepboundr-tirzepatide-single-dose-vials-expanding",

  lillyFeb2025: "https://investor.lilly.com/news-releases/news-release-details/lilly-launches-additional-zepbound-vial-doses-and-offers-new",

  lillyJun2025: "https://investor.lilly.com/node/52471",

  lillyDec2025: "https://investor.lilly.com/news-releases/news-release-details/lilly-lowers-price-zepboundr-tirzepatide-single-dose-vials",

  lillyKwikPen: "https://investor.lilly.com/node/53951/pdf",

  lillyCurrent: "https://www.lilly.com/lillydirect/zepbound",

  foundayoApproval: "https://investor.lilly.com/news-releases/news-release-details/fda-approves-lillys-foundayotm-orforglipron-only-glp-1-pill",

  foundayoCurrent: "https://foundayo.lilly.com/hcp/savings-coverage",

  novoMar2025: "https://www.prnewswire.com/news-releases/novo-nordisk-introduces-novocare-pharmacy-lowering-cost-of-all-doses-of-fda-approved-wegovy-semaglutide-to-499-per-month-and-offering-easy-home-delivery-for-cash-paying-patients-302392874.html",

  novoJun2025: "https://www.prnewswire.com/news-releases/novo-nordisk-continues-efforts-to-support-patient-access-to-authentic-fda-approved-wegovy-and-prioritize-patient-safety-302492419.html",

  goodrxAug2025: "https://investors.goodrx.com/news-releases/news-release-details/goodrx-announces-collaboration-novo-nordisk-expand-access",

  novoNov2025: "https://www.prnewswire.com/news-releases/novo-nordisk-launches-introductory-self-pay-offer-for-wegovy-and-ozempic-for-199-per-month-302617100.html",

  novoPill: "https://www.novonordisk.com/news-and-media/news-and-ir-materials/news-details.html?id=916475",

  novoCurrent: "https://www.novocare.com/patient/medicines/wegovy.html",

  novoHD: "https://www.prnewswire.com/news-releases/novo-nordisks-wegovy-hd-available-now-nationwide-302735677.html",

};



const rows: PricePoint[] = [];



type AddPrice = Omit<PricePoint, "id" | "dose" | "unit" | "periodDays" | "status" | "seriesKey" | "displayMode"> & {

  doses: string[];

  days: number;

  status?: PriceStatus;

  seriesKey?: string;

  displayMode?: PriceDisplayMode;

  effectiveUntil?: string;

};

function add({ date, product, form, doses, usd, days, channel, eligibility, priceBasis, event, status = "available", sourceUrl, note, seriesKey, displayMode, effectiveUntil, dateLabel }: AddPrice) {

  for (const dose of doses) {

    const resolvedSeriesKey = seriesKey ?? [product, form, dose, priceBasis].join("|");

    const resolvedDisplayMode = displayMode ?? (status === "announced" || priceBasis === "introductory" || priceBasis === "temporary" ? "marker" : "series");

    rows.push({

      id: [date, product, form, dose, channel, priceBasis, usd, status].join("|"),

      date, product, form, dose, usd, periodDays: days, unit: `USD / ${days} days`,

      channel, eligibility, priceBasis, event, status, sourceUrl,

      ...(note ? { note } : {}),
      ...(dateLabel ? { dateLabel } : {}),

      ...(effectiveUntil ? { effectiveUntil } : {}),

      seriesKey: resolvedSeriesKey,

      displayMode: resolvedDisplayMode,

    });

  }

}



const Z = "LillyDirect";

const N = "NovoCare Pharmacy / savings offer";

const regular = "Self-pay with valid on-label prescription";

const journey = "Self-pay; first purchase, then refill within 45 days of prior delivery";

export const PRICE_OBSERVED_ON = "2026-10-05";
const observedOn = PRICE_OBSERVED_ON;

const wegovyDoses = ["0.25 mg", "0.5 mg", "1 mg", "1.7 mg", "2.4 mg"];

const zHigh = ["7.5 mg", "10 mg", "12.5 mg", "15 mg"];



// Zepbound single-dose vials: four injections per 28-day supply.

add({ date: "2024-08-27", product: "Zepbound", form: "Vial", doses: ["2.5 mg"], usd: 399, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Launch", sourceUrl: source.lilly2024 });

add({ date: "2024-08-27", product: "Zepbound", form: "Vial", doses: ["5 mg"], usd: 549, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Launch", sourceUrl: source.lilly2024 });

for (const [dose, usd] of [["2.5 mg", 349], ["5 mg", 499]] as const) add({ date: "2025-02-25", product: "Zepbound", form: "Vial", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Price change", sourceUrl: source.lillyFeb2025 });

for (const [dose, usd] of [["7.5 mg", 599], ["10 mg", 699]] as const) add({ date: "2025-02-25", product: "Zepbound", form: "Vial", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Dose launch", sourceUrl: source.lillyFeb2025 });

add({ date: "2025-02-25", product: "Zepbound", form: "Vial", doses: ["7.5 mg", "10 mg"], usd: 499, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Dose launch", sourceUrl: source.lillyFeb2025 });

for (const [dose, usd] of [["12.5 mg", 849], ["15 mg", 1049]] as const) add({ date: "2025-06-16", product: "Zepbound", form: "Vial", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Dose launch announced", status: "announced", sourceUrl: source.lillyJun2025 });

add({ date: "2025-06-16", product: "Zepbound", form: "Vial", doses: ["12.5 mg", "15 mg"], usd: 499, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Dose launch announced", status: "announced", sourceUrl: source.lillyJun2025 });

for (const [dose, usd] of [["2.5 mg", 299], ["5 mg", 399]] as const) add({ date: "2025-12-01", product: "Zepbound", form: "Vial", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Price change", sourceUrl: source.lillyDec2025 });

// Regular higher-dose prices explicitly confirmed in the December release.
for (const [dose, usd] of [["7.5 mg", 599], ["10 mg", 699], ["12.5 mg", 849], ["15 mg", 1049]] as const) add({ date: "2025-12-01", product: "Zepbound", form: "Vial", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Regular price confirmed", sourceUrl: source.lillyDec2025 });

add({ date: "2025-12-01", product: "Zepbound", form: "Vial", doses: zHigh, usd: 449, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Price change", sourceUrl: source.lillyDec2025 });

for (const [dose, usd] of [["2.5 mg", 299], ["5 mg", 399]] as const) add({ date: "2026-02-23", product: "Zepbound", form: "KwikPen", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Device launch", sourceUrl: source.lillyKwikPen });

add({ date: "2026-02-23", product: "Zepbound", form: "KwikPen", doses: zHigh, usd: 449, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Device launch", sourceUrl: source.lillyKwikPen });

for (const form of ["Vial", "KwikPen"]) {

  for (const [dose, usd] of [["2.5 mg", 299], ["5 mg", 399], ["7.5 mg", 499], ["10 mg", 699], ["12.5 mg", 699], ["15 mg", 699]] as const) add({ date: observedOn, product: "Zepbound", form, doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.lillyCurrent });

  add({ date: observedOn, product: "Zepbound", form, doses: zHigh, usd: 449, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Current observation", status: "observed", sourceUrl: source.lillyCurrent });

}



// Wegovy injection: one box of four weekly pens per 28-day supply.

add({ date: "2024-09-01", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 650, days: 28, channel: "Wegovy retail savings offer", eligibility: "Eligible cash-paying patient under the predecessor savings offer", priceBasis: "regular", event: "Prior self-pay offer", sourceUrl: "https://www.prnewswire.com/news-releases/novo-nordisk-expands-wegovy-499-per-month-offering-to-additional-cash-paying-patients-via-the-wegovy-savings-offer-302408528.html", dateLabel: "Before March 2025 · start date unverified", note: "The March 24 manufacturer release confirms the predecessor $650 retail savings offer. September 1 is a schematic plotting anchor, not an observed start date. The March 5 $499 NovoCare Pharmacy launch used a different channel; retail savings changed March 24." });

add({ date: "2025-03-05", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 499, days: 28, channel: "NovoCare Pharmacy", eligibility: "Eligible self-pay; uninsured or plan excludes obesity drugs", priceBasis: "regular", event: "Channel launch", sourceUrl: source.novoMar2025 });

add({ date: "2025-05-22", product: "Wegovy", form: "Pen", doses: ["All doses"], usd: 199, days: 28, channel: N, eligibility: "Eligible new self-pay patient; offer through 2025-06-30", priceBasis: "introductory", event: "Product-level introductory offer", sourceUrl: source.novoJun2025, note: "June manufacturer release identifies May 22 as first redemption date. Product-level promotion; not a dose-specific regular price.", displayMode: "marker" });

add({ date: "2025-07-01", product: "Wegovy", form: "Pen", doses: ["All doses"], usd: 299, days: 28, channel: N, eligibility: "Eligible new self-pay patient; one fill through 2025-07-31", priceBasis: "introductory", event: "Product-level introductory offer", sourceUrl: source.novoJun2025, note: "Product-level promotion; not a dose-specific regular price.", displayMode: "marker" });

add({ date: "2025-08-18", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 499, days: 28, channel: "GoodRx", eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Channel expansion", sourceUrl: source.goodrxAug2025, seriesKey: "wegovy-goodrx-channel-expansion", displayMode: "marker", note: "Channel expansion, not a separate price change." });

add({ date: "2025-11-17", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 349, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Price change", sourceUrl: source.novoNov2025 });

add({ date: "2025-11-17", product: "Wegovy", form: "Pen", doses: ["0.25 mg", "0.5 mg"], usd: 199, days: 28, channel: N, eligibility: "New eligible self-pay patient; first two monthly fills", priceBasis: "introductory", event: "Temporary offer", sourceUrl: source.novoNov2025 });

for (const [doses, usd, priceBasis] of [[ ["1.5 mg"], 149, "regular" ], [["4 mg"], 149, "temporary"], [["9 mg", "25 mg"], 299, "regular"]] as [string[], number, PriceBasis][]) add({ date: "2026-01-05", product: "Wegovy pill", form: "Tablet", doses, usd, days: 30, channel: N, eligibility: "Eligible self-pay patient", priceBasis, event: "Launch", sourceUrl: source.novoPill });

add({ date: "2026-04-07", product: "Wegovy HD", form: "Pen", doses: ["7.2 mg"], usd: 399, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Dose launch", sourceUrl: source.novoHD });


add({ date: observedOn, product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 349, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });

add({ date: observedOn, product: "Wegovy", form: "Pen", doses: ["0.25 mg", "0.5 mg"], usd: 199, days: 28, channel: N, eligibility: "New eligible self-pay patient; first two monthly fills", priceBasis: "introductory", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });

add({ date: observedOn, product: "Wegovy HD", form: "Pen", doses: ["7.2 mg"], usd: 399, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });

for (const [dose, usd] of [["1.5 mg", 149], ["4 mg", 199], ["9 mg", 299], ["25 mg", 299]] as const) add({ date: observedOn, product: "Wegovy pill", form: "Tablet", doses: [dose], usd, days: 30, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent, ...(dose === "4 mg" ? { note: "Earlier $149 offer expired August 31; verify first $199 sale date before charting a September 1 change." } : {}) });



// Foundayo launch pricing is announced, not treated as a verified dated sale.

add({ date: "2026-04-01", product: "Foundayo", form: "Tablet", doses: ["0.8 mg"], usd: 149, days: 30, channel: Z, eligibility: regular, priceBasis: "regular", event: "FDA approval and price announced", status: "announced", sourceUrl: source.foundayoApproval });

for (const [dose, usd] of [["0.8 mg", 149], ["2.5 mg", 199], ["5.5 mg", 299], ["9 mg", 299], ["14.5 mg", 349], ["17.2 mg", 349]] as const) add({ date: observedOn, product: "Foundayo", form: "Tablet", doses: [dose], usd, days: 30, channel: Z, eligibility: regular, priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.foundayoCurrent });

for (const [dose, usd] of [["2.5 mg", 149], ["5.5 mg", 199]] as const) add({ date: observedOn, product: "Foundayo", form: "Tablet", doses: [dose], usd, days: 30, channel: Z, eligibility: "Eligible self-pay; temporary offer through 2026-12-31", priceBasis: "temporary", event: "Current observation", status: "observed", sourceUrl: source.foundayoCurrent });

add({ date: observedOn, product: "Foundayo", form: "Tablet", doses: ["14.5 mg", "17.2 mg"], usd: 299, days: 30, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Current purchase offer observed", status: "observed", sourceUrl: source.foundayoCurrent, seriesKey: "foundayo-journey", note: "Observation date; not a dated price change." });



export const pricePoints = rows;

export const regularStoryPoints = rows.filter((point) => point.status === "available" && point.priceBasis === "regular");

export const offerPoints = rows.filter((point) => point.status === "available" && ["introductory", "conditional", "temporary"].includes(point.priceBasis));

export const currentPrices = rows.filter((point) => point.status === "observed");

export const policyEvents = [{

  date: "2025-11-06",

  title: "U.S. administration announces Lilly and Novo Nordisk agreements",

  description: "Announced $350 for Ozempic/Wegovy, a $346 combined average for Zepbound/orforglipron, and $150 initial doses for future oral products.",

  sourceUrl: "https://www.whitehouse.gov/fact-sheets/2025/11/fact-sheet-president-donald-j-trump-announces-major-developments-in-bringing-most-favored-nation-pricing-to-american-patients/",

}];

export type RecordEvent = {
  date: string;
  title: string;
  type: "competition" | "distribution" | "supply" | "policy" | "government" | "product" | "future";
  channel: string;
  treatment: string;
  sourceId: string;
  publicData: string;
  caution: string;
  note: string;
};

// Context for the policy-story event rail. These markers do not alter a price
// series and should not be interpreted as proof that an event caused a cut.
export const recordEvents: RecordEvent[] = [
  { date: "2023-11-08", title: "Zepbound approval and lower launch WAC", type: "competition", channel: "List-price competition", treatment: "Pre-series context", sourceId: "S10", publicData: "Announcement and FDA approval", caution: "Launch WAC is not a DTC cash price.", note: "Zepbound entered below Wegovy’s contemporaneous list price." },
  { date: "2024-01-04", title: "LillyDirect launch", type: "distribution", channel: "Direct access", treatment: "Pre-series context", sourceId: "S11", publicData: "Manufacturer announcement", caution: "Channel launch does not necessarily change WAC.", note: "Digital pathway and third-party pharmacy delivery." },
  { date: "2024-08-27", title: "Zepbound vials launch", type: "product", channel: "DTC self-pay", treatment: "Price event", sourceId: "S1", publicData: "Yes", caution: "A new option rather than a cut from an identical prior vial.", note: "First plotted Zepbound vial values." },
  { date: "2024-10-02", title: "FDA resolves tirzepatide shortage", type: "supply", channel: "Compounding transition", treatment: "Event marker", sourceId: "S12", publicData: "FDA decision", caution: "Shortage litigation and transition dates complicate timing.", note: "Use exact FDA dates in causal work." },
  { date: "2025-02-21", title: "FDA resolves semaglutide injection shortage", type: "supply", channel: "Compounding transition", treatment: "Event marker", sourceId: "S13", publicData: "FDA announcement", caution: "Occurs close to manufacturer price changes.", note: "Potential supply and compounding channel." },
  { date: "2025-02-25", title: "Lilly cuts vial prices", type: "competition", channel: "DTC self-pay", treatment: "Price event", sourceId: "S2", publicData: "Yes", caution: "Observed change does not identify a single cause.", note: "Captured in the month-end February series." },
  { date: "2025-03-05", title: "NovoCare Pharmacy launches at $499", type: "distribution", channel: "DTC self-pay", treatment: "Price event", sourceId: "S5", publicData: "Yes", caution: "Channel differs from the predecessor savings offer.", note: "Retail savings offer expanded March 24." },
  { date: "2025-05-12", title: "Most-Favored-Nation executive action", type: "policy", channel: "Policy pressure", treatment: "Event marker", sourceId: "S14", publicData: "Yes", caution: "Broad policy announcement; implementation differs by program.", note: "The order also directs HHS to facilitate manufacturer direct-to-consumer purchasing programs. Later changes cannot be attributed solely to market forces." },
  { date: "2025-06-16", title: "Lilly expands Zepbound vials across all approved doses", type: "product", channel: "DTC self-pay", treatment: "Higher-dose availability marker", sourceId: "S19", publicData: "Yes", caution: "No 2.5 mg or 5 mg price change.", note: "Adds 12.5 mg and 15 mg vials; the release keeps 2.5 mg at $349 and 5 mg at $499." },
  { date: "2025-11-06", title: "Federal agreements with manufacturers", type: "government", channel: "Public and direct pricing", treatment: "Event marker", sourceId: "S15", publicData: "Official and issuer materials", caution: "Overlaps with later manufacturer cash-price cuts.", note: "Separate the agreement date from subsequent price-effective dates." },
  { date: "2025-11-17", title: "Novo lowers standard self-pay to $349", type: "competition", channel: "DTC self-pay", treatment: "Price event", sourceId: "S6", publicData: "Yes", caution: "Release explicitly connects the offer to the recent U.S. agreement.", note: "$199 starter promotion is separate." },
  { date: "2025-12-01", title: "Lilly lowers vial prices", type: "competition", channel: "DTC self-pay", treatment: "Price event", sourceId: "S3", publicData: "Yes", caution: "Late-2025 policy environment is mixed.", note: "Captured in the December series." },
  { date: "2026-01-05", title: "Wegovy pill broadly available", type: "product", channel: "DTC self-pay", treatment: "Separate series", sourceId: "S7", publicData: "Yes", caution: "Tablet and injection are not dose-equivalent.", note: "Do not splice tablet prices into the injection line." },
  { date: "2026-02-24", title: "Novo announces January 2027 WAC reduction", type: "future", channel: "WAC", treatment: "Event marker only", sourceId: "S8", publicData: "Yes", caution: "Announcement is not a current price change.", note: "Direct self-pay prices explicitly unaffected." },
  { date: "2026-07-01", title: "Medicare GLP-1 Bridge begins", type: "government", channel: "Subsidized beneficiary copay", treatment: "Separate policy outcome", sourceId: "S9", publicData: "Program documents available; claims dataset not identified", caution: "$50 is not the underlying drug price.", note: "Operates outside ordinary Part D payment flow; extended through Dec. 31, 2027." },
];



export function formatPrice(point: PricePoint) {

  return `$${point.usd} / ${point.periodDays === 28 ? "4 weeks" : `${point.periodDays} days`}`;

}





// Chart events supplied separately from current dose-button pricing.

export const foundayoChartPoints: PricePoint[] = [

  {

    "id": "foundayo-chart-0",

    "date": "2026-04-01",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "All doses",

    "usd": 149,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Approval and price announcement \u00b7 starting at $149",

    "status": "announced",

    "sourceUrl": "https://investor.lilly.com/news-releases/news-release-details/fda-approves-lillys-foundayotm-orforglipron-only-glp-1-pill"

  },

  {

    "id": "foundayo-chart-1",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "0.8 mg",

    "usd": 149,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-2",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "2.5 mg",

    "usd": 199,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-3",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "5.5 mg",

    "usd": 299,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-4",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "9 mg",

    "usd": 299,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-5",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "14.5 mg",

    "usd": 349,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-6",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "14.5 mg",

    "usd": 299,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Offer eligibility applies",

    "priceBasis": "conditional",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-7",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "17.2 mg",

    "usd": 349,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Self-pay",

    "priceBasis": "regular",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-8",

    "date": "2026-04-06",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "17.2 mg",

    "usd": 299,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Offer eligibility applies",

    "priceBasis": "conditional",

    "event": "Commercial availability",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-9",

    "date": "2026-09-01",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "2.5 mg",

    "usd": 149,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Offer eligibility applies",

    "priceBasis": "temporary",

    "event": "Temporary price reduction",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  },

  {

    "id": "foundayo-chart-10",

    "date": "2026-09-01",

    "product": "Foundayo",

    "form": "Tablet",

    "dose": "5.5 mg",

    "usd": 199,

    "periodDays": 30,

    "unit": "USD / 30 days",

    "channel": "LillyDirect",

    "eligibility": "Offer eligibility applies",

    "priceBasis": "temporary",

    "event": "Temporary price reduction",

    "status": "available",

    "sourceUrl": "https://foundayo.lilly.com/hcp/savings-coverage"

  }

];



export function getFoundayoChartPoints(dose: string) {

  return foundayoChartPoints.filter(point => point.dose === `${dose} mg` || point.dose === "All doses");

}



const basisLabel: Record<PriceBasis, string> = {

  regular: "Regular self-pay",

  conditional: "Conditional offer",

  introductory: "Introductory offer",

  temporary: "Temporary offer",

};



function normalizedDose(dose: string) {

  return dose.endsWith("mg") ? dose : `${dose} mg`;

}



function chronological(a: PricePoint, b: PricePoint) {

  return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);

}



function toChartPoint(point: PricePoint): ChartPoint {

  return {

    id: point.id,

    label: point.dateLabel ?? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "2-digit", timeZone: "UTC" }).format(new Date(`${point.date}T00:00:00Z`)),

    value: point.usd,

    basis: point.priceBasis,

    status: point.status,

    event: point.event,

    date: point.date,

    product: point.product,

    form: point.form,

    dose: point.dose,

    periodDays: point.periodDays,

    channel: point.channel,

    eligibility: point.eligibility,

    sourceUrl: point.sourceUrl,

    seriesKey: point.seriesKey,

    displayMode: point.displayMode,

    announcement: point.status === "announced",
    ...(point.dateLabel ? { dateLabel: point.dateLabel } : {}),

    ...(point.note ? { note: point.note } : {}),

    ...(point.effectiveUntil ? { effectiveUntil: point.effectiveUntil } : {}),

  };

}



function buildChartSeries(points: PricePoint[]): ChartSeries[] {

  const groups = new Map<string, PricePoint[]>();

  for (const point of points.slice().sort(chronological)) {

    const key = point.seriesKey || [point.product, point.form, point.dose, point.priceBasis].join("|");

    const existing = groups.get(key) ?? [];

    existing.push(point);

    groups.set(key, existing);

  }



  return [...groups.entries()].map(([key, grouped]) => ({

    key,

    basis: grouped[0].priceBasis,

    label: basisLabel[grouped[0].priceBasis] ?? "Price series",

    showLine: grouped.filter((point) => point.displayMode === "series" && point.status !== "announced").length > 1,

    points: grouped.map(toChartPoint),

  }));

}



export function getExplorePrice(product: string, dose: string, form: string) {

  const normalized = normalizedDose(dose);

  const matches = rows.filter((point) => point.product === product && point.form === form && point.dose === normalized).sort(chronological);

  const productOfferAnnotations = rows.filter((point) => point.product === product && point.form === form && point.dose === "All doses" && point.priceBasis === "introductory").sort(chronological);

  const history = matches.filter((point) => point.status === "available" && point.priceBasis === "regular");

  const current = matches.filter((point) => point.status === "observed" && point.priceBasis === "regular").sort((a, b) => chronological(b, a))[0];

  const offers = matches.filter((point) => point.status === "observed" && point.priceBasis !== "regular");

  const latest = current ?? history.at(-1);

  if (!latest) return undefined;



  const chartEvents = product === "Foundayo"

    ? getFoundayoChartPoints(dose).map((point) => ({

        ...point,

        seriesKey: point.status === "announced"

          ? "foundayo-launch-announcement"

          : point.priceBasis === "conditional"

            ? "foundayo-journey"

            : [point.product, point.form, point.dose, point.priceBasis].join("|"),

        displayMode: point.status === "announced" || point.priceBasis === "temporary" ? "marker" as const : "series" as const,

      }))

    : [];

  const chartSeries = buildChartSeries([...matches, ...chartEvents]);



  return {

    headline: `$${latest.usd}`,

    detail: `${latest.eligibility}.${current ? ` Current price observed on ${current.date}; this is not a dated price change.` : ""}${offers.length ? ` Other current offer${offers.length > 1 ? "s" : ""}: ${offers.map((offer) => offer.priceBasis === "conditional" ? `$${offer.usd} (conditional offer)` : `$${offer.usd} (${basisLabel[offer.priceBasis].toLowerCase()}; ${offer.eligibility})`).join("; ")}.` : ""}${productOfferAnnotations.length ? ` Product-level introductory offer history (not dose-specific regular prices): ${productOfferAnnotations.map((offer) => `$${offer.usd} on ${offer.date}`).join("; ")}.` : ""}`,

    chartSeries,

    series: chartSeries.flatMap((group) => group.points),

    source: latest.sourceUrl,

    offerSources: offers.map((offer) => ({ label: `${basisLabel[offer.priceBasis]} ↗`, source: offer.sourceUrl })),

    basis: latest.priceBasis,

    periodDays: latest.periodDays,

    lastObserved: current?.date,

    productOfferAnnotations: productOfferAnnotations.map(toChartPoint),

  };

}



export function getStorySeries(product: string, dose: string, form: string) {

  const normalized = normalizedDose(dose);

  return rows

    .filter((point) => point.product === product && point.form === form && point.dose === normalized && point.status === "available")

    .sort(chronological);

}



export function getCurrentStoryPrice(product: string, dose: string, form: string) {

  const normalized = normalizedDose(dose);

  return rows

    .filter((point) => point.product === product && point.form === form && point.dose === normalized && point.status === "observed" && point.priceBasis === "regular")

    .sort((a, b) => chronological(b, a))[0];

}
