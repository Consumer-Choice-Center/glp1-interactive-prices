# GLP-1 Universe

A visual explainer app for FDA-approved GLP-1 and dual GIP/GLP-1 medicines in the U.S. market. The project presents product details, dose options, pricing snapshots, and a rotating discovery view for the current GLP-1 landscape.

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

## Notes

- The app is organized around  [app/page.tsx](app/page.tsx) and the visual scene in  [app/universe-scene.tsx](app/universe-scene.tsx).
- Database support is optional and is configured through the Cloudflare environment when needed.
- If you want to add different Cloudflare bindings, do it in the project environment/config and keep app logic independent from the hosting layer.

The portable build runs Vinext directly without needing a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
