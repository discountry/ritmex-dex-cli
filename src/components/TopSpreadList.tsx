import React from "react";
import Table from "ink-table";
import type { SpreadEntry } from "../types/table";
import { formatRateValue, formatUsd } from "../utils/format";

interface TopSpreadListProps {
  entries: SpreadEntry[];
}

export const TopSpreadList: React.FC<TopSpreadListProps> = ({ entries }) => (
  <Table
    data={entries.map((entry) => ({
      Symbol: entry.symbol,
      "Sell Exchange": entry.high.exchange,
      "Sell Rate": formatRateValue(entry.high.rate),
      "Buy Exchange": entry.low.exchange,
      "Buy Rate": formatRateValue(entry.low.rate),
      Spread: formatRateValue(entry.diff),
      "Estimate 24H profit%": formatRateValue(entry.estimated24hProfit),
      "Estimate 24H profit": formatUsd(entry.estimated24hProfitAmount),
    }))}
    columns={["Symbol", "Sell Exchange", "Sell Rate", "Buy Exchange", "Buy Rate", "Spread", "Estimate 24H profit%", "Estimate 24H profit"]}
  />
);
