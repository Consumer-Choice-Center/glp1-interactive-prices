export type PriceStatus = "available" | "announced" | "observed";
export type PriceBasis = "regular" | "introductory" | "conditional" | "temporary";

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

type AddPrice = Omit<PricePoint, "id" | "dose" | "unit" | "periodDays" | "status"> & {
  doses: string[];
  days: number;
  status?: PriceStatus;
};
function add({ date, product, form, doses, usd, days, channel, eligibility, priceBasis, event, status = "available", sourceUrl, note }: AddPrice) {
  for (const dose of doses) {
    rows.push({
      id: [date, product, form, dose, channel, priceBasis, usd, status].join("|"),
      date, product, form, dose, usd, periodDays: days, unit: `USD / ${days} days`,
      channel, eligibility, priceBasis, event, status, sourceUrl,
      ...(note ? { note } : {}),
    });
  }
}

const Z = "LillyDirect";
const N = "NovoCare Pharmacy / savings offer";
const regular = "Self-pay with valid on-label prescription";
const journey = "Self-pay; first purchase, then refill within 45 days of prior delivery";
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
add({ date: "2025-12-01", product: "Zepbound", form: "Vial", doses: zHigh, usd: 449, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Price change", sourceUrl: source.lillyDec2025 });
for (const [dose, usd] of [["2.5 mg", 299], ["5 mg", 399]] as const) add({ date: "2026-02-23", product: "Zepbound", form: "KwikPen", doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Device launch", sourceUrl: source.lillyKwikPen });
add({ date: "2026-02-23", product: "Zepbound", form: "KwikPen", doses: zHigh, usd: 449, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Device launch", sourceUrl: source.lillyKwikPen });
for (const form of ["Vial", "KwikPen"]) {
  for (const [dose, usd] of [["2.5 mg", 299], ["5 mg", 399], ["7.5 mg", 499], ["10 mg", 699], ["12.5 mg", 699], ["15 mg", 699]] as const) add({ date: "2026-09-28", product: "Zepbound", form, doses: [dose], usd, days: 28, channel: Z, eligibility: regular, priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.lillyCurrent });
  add({ date: "2026-09-28", product: "Zepbound", form, doses: zHigh, usd: 449, days: 28, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Current observation", status: "observed", sourceUrl: source.lillyCurrent });
}

// Wegovy injection: one box of four weekly pens per 28-day supply.
add({ date: "2025-03-05", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 499, days: 28, channel: "NovoCare Pharmacy", eligibility: "Eligible self-pay; uninsured or plan excludes obesity drugs", priceBasis: "regular", event: "Channel launch", sourceUrl: source.novoMar2025 });
add({ date: "2025-05-22", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 199, days: 28, channel: N, eligibility: "Eligible new self-pay patient; offer through 2025-06-30", priceBasis: "introductory", event: "Temporary offer", sourceUrl: source.novoJun2025, note: "June manufacturer release identifies May 22 as first redemption date." });
add({ date: "2025-07-01", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 299, days: 28, channel: N, eligibility: "Eligible new self-pay patient; one fill through 2025-07-31", priceBasis: "introductory", event: "Temporary offer", sourceUrl: source.novoJun2025 });
add({ date: "2025-08-18", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 499, days: 28, channel: "GoodRx", eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Channel expansion", sourceUrl: source.goodrxAug2025 });
add({ date: "2025-11-17", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 349, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Price change", sourceUrl: source.novoNov2025 });
add({ date: "2025-11-17", product: "Wegovy", form: "Pen", doses: ["0.25 mg", "0.5 mg"], usd: 199, days: 28, channel: N, eligibility: "New eligible self-pay patient; first two monthly fills", priceBasis: "introductory", event: "Temporary offer", sourceUrl: source.novoNov2025 });
for (const [doses, usd, priceBasis] of [[ ["1.5 mg"], 149, "regular" ], [["4 mg"], 149, "temporary"], [["9 mg", "25 mg"], 299, "regular"]] as [string[], number, PriceBasis][]) add({ date: "2026-01-05", product: "Wegovy pill", form: "Tablet", doses, usd, days: 30, channel: N, eligibility: "Eligible self-pay patient", priceBasis, event: "Launch", sourceUrl: source.novoPill });
add({ date: "2026-04-07", product: "Wegovy HD", form: "Pen", doses: ["7.2 mg"], usd: 399, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Dose launch", sourceUrl: source.novoHD });
add({ date: "2026-09-28", product: "Wegovy pill", form: "Tablet", doses: ["4 mg"], usd: 199, days: 30, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent, note: "Earlier $149 offer expired August 31; verify first $199 sale date before charting a September 1 change." });
add({ date: "2026-09-28", product: "Wegovy", form: "Pen", doses: wegovyDoses, usd: 349, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });
add({ date: "2026-09-28", product: "Wegovy", form: "Pen", doses: ["0.25 mg", "0.5 mg"], usd: 199, days: 28, channel: N, eligibility: "New eligible self-pay patient; first two monthly fills", priceBasis: "introductory", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });
add({ date: "2026-09-28", product: "Wegovy HD", form: "Pen", doses: ["7.2 mg"], usd: 399, days: 28, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });
for (const [dose, usd] of [["1.5 mg", 149], ["4 mg", 199], ["9 mg", 299], ["25 mg", 299]] as const) add({ date: "2026-09-28", product: "Wegovy pill", form: "Tablet", doses: [dose], usd, days: 30, channel: N, eligibility: "Eligible self-pay patient", priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.novoCurrent });

// Foundayo launch pricing is announced, not treated as a verified dated sale.
add({ date: "2026-04-01", product: "Foundayo", form: "Tablet", doses: ["0.8 mg"], usd: 149, days: 30, channel: Z, eligibility: regular, priceBasis: "regular", event: "FDA approval and price announced", status: "announced", sourceUrl: source.foundayoApproval });
for (const [dose, usd] of [["0.8 mg", 149], ["2.5 mg", 199], ["5.5 mg", 299], ["9 mg", 299], ["14.5 mg", 349], ["17.2 mg", 349]] as const) add({ date: "2026-09-28", product: "Foundayo", form: "Tablet", doses: [dose], usd, days: 30, channel: Z, eligibility: regular, priceBasis: "regular", event: "Current observation", status: "observed", sourceUrl: source.foundayoCurrent });
for (const [dose, usd] of [["2.5 mg", 149], ["5.5 mg", 199]] as const) add({ date: "2026-09-28", product: "Foundayo", form: "Tablet", doses: [dose], usd, days: 30, channel: Z, eligibility: "Eligible self-pay; temporary offer through 2026-12-31", priceBasis: "temporary", event: "Current observation", status: "observed", sourceUrl: source.foundayoCurrent });
add({ date: "2026-09-28", product: "Foundayo", form: "Tablet", doses: ["14.5 mg", "17.2 mg"], usd: 299, days: 30, channel: Z, eligibility: journey, priceBasis: "conditional", event: "Current observation", status: "observed", sourceUrl: source.foundayoCurrent });

export const pricePoints = rows;
export const regularStoryPoints = rows.filter((point) => point.status === "available" && point.priceBasis === "regular");
export const offerPoints = rows.filter((point) => point.status === "available" && ["introductory", "conditional", "temporary"].includes(point.priceBasis));
export const currentPrices = rows.filter((point) => point.status === "observed");
export const policyEvents = [{
  date: "2025-11-06",
  title: "US administration announces Lilly and Novo Nordisk agreements",
  description: "Announced $350 for Ozempic/Wegovy, a $346 combined average for Zepbound/orforglipron, and $150 initial doses for future oral products.",
  sourceUrl: "https://www.whitehouse.gov/fact-sheets/2025/11/06/fact-sheet-president-donald-j-trump-announces-major-developments-in-bringing-most-favored-nation-pricing-to-american-patients/",
}];

export function formatPrice(point: PricePoint) {
  return `$${point.usd} / ${point.periodDays === 28 ? "4 weeks" : `${point.periodDays} days`}`;
}

export function getExplorePrice(product: string, dose: string, form: string) {
  const normalizedDose = `${dose} mg`;
  const matches = rows.filter((point) => point.product === product && point.form === form && point.dose === normalizedDose);
  const history = matches.filter((point) => point.status === "available" && point.priceBasis === "regular").sort((a, b) => a.date.localeCompare(b.date));
  const current = matches.filter((point) => point.status === "observed" && point.priceBasis === "regular").sort((a, b) => b.date.localeCompare(a.date))[0];
  const offers = matches.filter((point) => point.status === "observed" && point.priceBasis !== "regular");
  const latest = current ?? history.at(-1);
  if (!latest) return undefined;
  return {
    headline: `$${latest.usd}`,
    detail: `${latest.eligibility}${current ? ` Current snapshot observed ${current.date}; this is not a dated price change.` : ""}${offers.length ? ` Current other offer${offers.length > 1 ? "s" : ""}: ${offers.map((offer) => `$${offer.usd} (${offer.priceBasis}; ${offer.eligibility})`).join("; ")}.` : ""}`,
    series: history.map((point) => ({ label: new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${point.date}T00:00:00Z`)), value: point.usd })),
    source: latest.sourceUrl,
    offerSources: offers.map((offer) => ({ label: `${offer.priceBasis} offer ↗`, source: offer.sourceUrl })),
    basis: latest.priceBasis,
    periodDays: latest.periodDays,
  };
}

export function getStorySeries(product: string, dose: string, form: string) {
  const normalizedDose = `${dose} mg`;
  return rows
    .filter((point) => point.product === product && point.form === form && point.dose === normalizedDose && point.status === "available" && point.priceBasis === "regular")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCurrentStoryPrice(product: string, dose: string, form: string) {
  const normalizedDose = `${dose} mg`;
  return rows.find((point) => point.product === product && point.form === form && point.dose === normalizedDose && point.status === "observed" && point.priceBasis === "regular");
}
