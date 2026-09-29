import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the binding name in your Cloudflare configuration or provide the value in your local environment."
    );
  }

  return drizzle(env.DB, { schema });
}
