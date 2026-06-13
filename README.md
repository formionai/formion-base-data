<div align="center">

<img src="https://raw.githubusercontent.com/formionai/formion-base-data/main/assets/banner.png" alt="formion-base-data" width="100%" />

</div>

# formion-base-data

**Lightweight, key-free TypeScript client for live Base (Coinbase L2) DEX flow.**

Wraps GeckoTerminal's public API (no API key) and returns normalised pool rows — volume, liquidity, price change, and buy/sell pressure — across **Uniswap, BaseSwap, SushiSwap, PancakeSwap** and more on Base.

Open-source data layer behind Formion's free, no-login **DEX Flow** page (Base view): https://app.formion.ai/scan/dex-flow?chain=base

By [Formion](https://formion.ai). MIT. Sibling of [`formion-solana-data`](https://github.com/formionai/formion-solana-data).

## Install

```bash
npm i formion-base-data
# or just copy src/index.ts — zero dependencies, native fetch (Node >= 18)
```

## Usage

```ts
import { getBaseFlow } from "formion-base-data";

// Trending Base pools (what's active right now)
const trending = await getBaseFlow();

// Top pools for a specific DEX, sorted by 24h volume
const uni = await getBaseFlow("uniswap-v3-base");

for (const p of uni) {
  console.log(p.pool, p.vol24, p.liq, `${p.buyPressure.toFixed(0)}% buys`);
}
```

Try it:

```bash
npm run example
```

## API

### `getBaseFlow(dex?, opts?) => Promise<BasePool[]>`
- `dex`: `"all"` (default, trending pools) or one of `BASE_DEXES`.
- `opts.timeoutMs` (default 9000), `opts.fetchImpl` (custom fetch).

### `BASE_DEXES`
`uniswap-v3-base`, `uniswap-v2-base`, `baseswap`, `sushiswap-v3-base`, `pancakeswap-v3-base`, `dackieswap-v3-base`, `aerodrome-base`.

### `BasePool`
`pool`, `poolAddress`, `dex`, `base`, `quote`, `priceUsd`, `vol24`, `vol1h`, `liq`, `chg24`, `chg1h`, `buys24`, `sells24`, `buyers24`, `sellers24`, `buyPressure` (0–100), `fdv`, `geckoUrl`.

## Notes
- Read-only public data via GeckoTerminal (~30 req/min). Cache on your side for production.
- No API key, no wallet, no tracking — a public good for the Base ecosystem.

## License
MIT © Formion
