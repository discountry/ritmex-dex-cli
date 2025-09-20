import type { SpreadEntry, TableRow } from "../types/table";

const EXCHANGE_LABELS = {
  lighter: "Lighter",
  edgex: "Edgex",
  grvt: "GRVT",
} as const;

type ExchangeKey = keyof typeof EXCHANGE_LABELS;

interface RateEntry {
  key: keyof TableRow;
  exchange: ExchangeKey;
  value?: number;
}

export const calculateTopSpreads = (rows: TableRow[], limit: number): SpreadEntry[] => {
  const entries: SpreadEntry[] = [];

  rows.forEach((row) => {
    const rateEntries: RateEntry[] = [
      { key: "lighterFunding", exchange: "lighter", value: row.lighterFunding },
      { key: "edgexFunding", exchange: "edgex", value: row.edgexFunding },
      { key: "grvtFunding", exchange: "grvt", value: row.grvtFunding },
    ];

    const available = rateEntries.filter((entry) => entry.value !== undefined) as Array<RateEntry & { value: number }>;
    if (available.length < 2) return;

    const high = available.reduce((max, current) => (current.value > max.value ? current : max));
    const low = available.reduce((min, current) => (current.value < min.value ? current : min));

    const diff = high.value - low.value;
    if (diff <= 0) return;

    entries.push({
      symbol: row.symbol,
      diff,
      high: { exchange: EXCHANGE_LABELS[high.exchange], rate: high.value },
      low: { exchange: EXCHANGE_LABELS[low.exchange], rate: low.value },
    });
  });

  return entries
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, limit);
};
