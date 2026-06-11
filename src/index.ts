/**
 * formion-base-data — key-free Base (Coinbase L2) DEX flow client.
 *
 * Wraps GeckoTerminal's public API (no API key, ~30 req/min) and returns
 * normalised pool rows: volume, liquidity, price change and buy/sell pressure
 * across Uniswap, BaseSwap, SushiSwap, PancakeSwap and more on Base.
 *
 * Powers the free public "DEX Flow" page (Base view) at
 * https://app.formion.ai/scan/dex-flow?chain=base
 *
 * Usage:
 *   import { getBaseFlow } from "formion-base-data";
 *   const rows = await getBaseFlow();                  // trending Base pools
 *   const uni  = await getBaseFlow("uniswap-v3-base");  // top Uniswap V3 pools by 24h vol
 */

const GT = "https://api.geckoterminal.com/api/v2";

/** DEX ids GeckoTerminal exposes for Base that this client supports as filters. */
export const BASE_DEXES = [
  "uniswap-v3-base",
  "uniswap-v2-base",
  "baseswap",
  "sushiswap-v3-base",
  "pancakeswap-v3-base",
  "dackieswap-v3-base",
  "aerodrome-base",
] as const;
export type BaseDex = (typeof BASE_DEXES)[number] | "all";

export type BasePool = {
  pool: string; // "BASE / QUOTE"
  poolAddress: string;
  dex: string;
  base: string;
  quote: string;
  priceUsd: number | null;
  vol24: number | null; // 24h volume (USD)
  vol1h: number | null;
  liq: number | null; // reserve / liquidity (USD)
  chg24: number | null; // 24h price change (%)
  chg1h: number | null;
  buys24: number;
  sells24: number;
  buyers24: number;
  sellers24: number;
  /** buy share of 24h transactions, 0..100 — simple flow/pressure proxy. */
  buyPressure: number;
  fdv: number | null;
  geckoUrl: string;
};

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function mapPool(p: any): BasePool {
  const a = p?.attributes ?? {};
  const name: string = a.name ?? "";
  const [base, quote] = name.split("/").map((s: string) => s.trim());
  const tx = a.transactions?.h24 ?? {};
  const buys = Number(tx.buys ?? 0);
  const sells = Number(tx.sells ?? 0);
  const flow = buys + sells;
  return {
    pool: name,
    poolAddress: a.address ?? "",
    dex: p?.relationships?.dex?.data?.id ?? "",
    base: base || name,
    quote: quote || "",
    priceUsd: num(a.base_token_price_usd),
    vol24: num(a.volume_usd?.h24),
    vol1h: num(a.volume_usd?.h1),
    liq: num(a.reserve_in_usd),
    chg24: num(a.price_change_percentage?.h24),
    chg1h: num(a.price_change_percentage?.h1),
    buys24: buys,
    sells24: sells,
    buyers24: Number(tx.buyers ?? 0),
    sellers24: Number(tx.sellers ?? 0),
    buyPressure: flow > 0 ? (buys / flow) * 100 : 50,
    fdv: num(a.fdv_usd),
    geckoUrl: a.address ? `https://www.geckoterminal.com/base/pools/${a.address}` : "",
  };
}

export type GetBaseFlowOptions = {
  /** ms timeout for the upstream request (default 9000). */
  timeoutMs?: number;
  /** optional custom fetch (e.g. for Node < 18 or testing). */
  fetchImpl?: typeof fetch;
};

/**
 * Fetch live Base pool flow.
 * @param dex "all" (trending pools) or a specific DEX id (top pools by 24h volume).
 */
export async function getBaseFlow(
  dex: BaseDex = "all",
  opts: GetBaseFlowOptions = {},
): Promise<BasePool[]> {
  const f = opts.fetchImpl ?? fetch;
  const url =
    dex === "all"
      ? `${GT}/networks/base/trending_pools?page=1`
      : `${GT}/networks/base/dexes/${dex}/pools?page=1&sort=h24_volume_usd_desc`;

  const res = await f(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 9000),
  });
  if (!res.ok) throw new Error(`GeckoTerminal HTTP ${res.status}`);
  const json = await res.json();
  return (json?.data ?? []).map(mapPool).filter((p: BasePool) => p.poolAddress);
}
