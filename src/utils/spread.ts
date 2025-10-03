import type { SpreadEntry, TableRow } from "../types/table";
import { loadConfigSync } from "./config";

const EXCHANGE_LABELS = {
  lighter: "Lighter",
  binance: "Binance",
  hyperliquid: "Hyperliquid",
  edgex: "Edgex",
  grvt: "GRVT",
  aster: "Aster",
} as const;

type ExchangeKey = keyof typeof EXCHANGE_LABELS;

interface RateEntry {
  key: keyof TableRow;
  exchange: ExchangeKey;
  value?: number;
}

export const calculateTopSpreads = (rows: TableRow[], limit: number, capitalUsd: number = 0): SpreadEntry[] => {
  const entries: SpreadEntry[] = [];
  const { enabledExchanges } = loadConfigSync();

  rows.forEach((row) => {
    const rateEntries: RateEntry[] = [];
    if (enabledExchanges.includes("lighter")) rateEntries.push({ key: "lighterFunding", exchange: "lighter", value: row.lighterFunding });
    if (enabledExchanges.includes("binance")) rateEntries.push({ key: "binanceFunding", exchange: "binance", value: row.binanceFunding });
    if (enabledExchanges.includes("hyperliquid")) rateEntries.push({ key: "hyperliquidFunding", exchange: "hyperliquid", value: row.hyperliquidFunding });
    if (enabledExchanges.includes("edgex")) rateEntries.push({ key: "edgexFunding", exchange: "edgex", value: row.edgexFunding });
    if (enabledExchanges.includes("grvt")) rateEntries.push({ key: "grvtFunding", exchange: "grvt", value: row.grvtFunding });
    if (enabledExchanges.includes("aster")) rateEntries.push({ key: "asterFunding", exchange: "aster", value: row.asterFunding });

    const available = rateEntries.filter((entry) => entry.value !== undefined) as Array<RateEntry & { value: number }>;
    if (available.length < 2) return;

    // Generate all profitable pairs for this symbol (higher funding as seller, lower as buyer)
    for (let i = 0; i < available.length - 1; i += 1) {
      for (let j = i + 1; j < available.length; j += 1) {
        const a = available[i]!;
        const b = available[j]!;

        const high: typeof a = a.value >= b.value ? a : b;
        const low: typeof a = a.value >= b.value ? b : a;
        const diff = high.value - low.value;
        if (diff <= 0) continue;

        const estimated24hProfit = diff * 3;
        const estimated24hProfitAmount = capitalUsd > 0 ? capitalUsd * (estimated24hProfit) : undefined;

        entries.push({
          symbol: row.symbol,
          diff,
          high: { exchange: EXCHANGE_LABELS[high.exchange], rate: high.value },
          low: { exchange: EXCHANGE_LABELS[low.exchange], rate: low.value },
          estimated24hProfit,
          estimated24hProfitAmount,
        });
      }
    }
  });

  return entries
    .sort((a, b) => b.diff - a.diff)
    .slice(0, limit);
};
