/**
 * Example: print the top Base pools by 24h volume and their buy/sell pressure.
 * Run: node --experimental-strip-types src/example.ts
 */
import { getBaseFlow } from "./index.ts";

const usd = (n: number | null) =>
  n == null ? "—" : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;

const rows = await getBaseFlow("all");
console.log(`Trending Base pools (${rows.length}):\n`);
for (const r of rows.slice(0, 15)) {
  const bar = `${"█".repeat(Math.round(r.buyPressure / 10))}${"░".repeat(10 - Math.round(r.buyPressure / 10))}`;
  console.log(
    `${r.pool.padEnd(22)} ${r.dex.padEnd(20)} vol ${usd(r.vol24).padStart(8)} liq ${usd(r.liq).padStart(8)} ` +
      `chg ${(r.chg24 ?? 0).toFixed(1).padStart(6)}%  buy ${bar} ${r.buyPressure.toFixed(0)}%`,
  );
}
