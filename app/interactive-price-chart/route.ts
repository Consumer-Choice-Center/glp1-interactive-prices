import chartDocument from "../glp1-price-landscape.html?raw";
import { pricePoints, foundayoChartPoints, PRICE_OBSERVED_ON } from "../../data/glp1-prices";

export function GET() {
  const match = chartDocument.match(/(<script id="price-data" type="application\/json">)([\s\S]*?)(<\/script>)/);
  if (!match) throw new Error("Price landscape data container missing");
  const data = JSON.parse(match[2]);
  data.asOf = PRICE_OBSERVED_ON;
  const originalAggregate = data.points.filter((point: { product: string; dose: string }) => point.product === "Foundayo" && point.dose === "All doses");
  data.points = [...pricePoints, ...foundayoChartPoints.filter(point => point.status === "available")]
    .filter((point, index, all) => all.findIndex(candidate => candidate.id === point.id) === index)
    .map(point => ({ ...point, form: point.form.toLowerCase(), kind: point.status === "observed" ? "snapshot" : point.status, label: point.event }));
  // Preserve the product-level starting-price annotation, distinct from dose prices.
  data.points.push(...originalAggregate.map((point: { date: string; kind: string }) => ({ ...point, date: point.kind === "snapshot" ? PRICE_OBSERVED_ON : point.date })));
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  const document = chartDocument.replace(match[0], `${match[1]}${payload}${match[3]}`);
  return new Response(document, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
