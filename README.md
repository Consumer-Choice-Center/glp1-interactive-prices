# GLP-1 Universe

A Consumer Choice Center research project combining an op-ed, sourced manufacturer cash-price histories, policy timelines, and an interactive product universe. Regular prices are distinguished from conditional, introductory, and temporary offers.

## Tech stack

- Next.js
- React
- Vite
- TypeScript
- Tailwind / custom CSS
- Cloudflare local dev tooling

## Local development

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Production build

```bash
npm run build
```

## Validation

```bash
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

The build produces Cloudflare Worker assets and configuration in `dist/`. Deploy the generated `dist/server/wrangler.json` with your hosting account; local development state and environment files are excluded from Git.

## Data and editorial scope

- Price observations and sources live in `data/glp1-prices.ts`; the current observation date is October 5, 2026.
- A current snapshot is not automatically a dated price cut. The analysis compares existing products at the same dose, form, and regular self-pay basis, excluding launches and promotional offers.
- The headline comparison covers Wegovy injection and Zepbound 2.5/5 mg vials only. Higher-dose regular vial prices have lower current observations with unverified change dates.
- The $650 Wegovy predecessor is a retail savings offer with an unverified start date; its plotting anchor is schematic.
- Dates establish the sequence of market and policy actions, not their causal contribution.
- Dated stepped price panels lead the evidence section. The Product Universe and 3D landscape use the shared manufacturer-offer dataset. Chart 1 (Zepbound) and chart 2 (Wegovy) from `charts/` are displayed in the Price channels section with their edited descriptions and full-size viewing. Public copies are served from `public/charts/`. The restored “The signal” section follows these charts, with product/dose selectors, historical prices, offer cards, and a separate policy announcement.

## Notes

- The app is organized around  [app/page.tsx](app/page.tsx) and the visual scene in  [app/universe-scene.tsx](app/universe-scene.tsx).
- Database support is optional and is configured through the Cloudflare environment when needed.
- If you want to add different Cloudflare bindings, do it in the project environment/config and keep app logic independent from the hosting layer.

The portable build runs Vinext directly without needing a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
