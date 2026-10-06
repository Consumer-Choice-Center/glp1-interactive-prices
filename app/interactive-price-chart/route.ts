import chartDocument from "../glp1-price-landscape.html?raw";

export function GET() {
  return new Response(chartDocument, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
