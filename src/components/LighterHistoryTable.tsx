import React from "react";
import { Box, Text } from "ink";
import type { LighterHistoryRow } from "../types/lighter-history";
import type { HistoryHeaderConfig, HistorySortState } from "../hooks/useLighterHistorySorting";
import { formatRateValue, formatUsd } from "../utils/format";
import { downsampleSeries } from "../utils/series";

interface LighterHistoryTableProps {
  rows: LighterHistoryRow[];
  headers: HistoryHeaderConfig[];
  sortState: HistorySortState;
  selectedHeaderIndex: number;
}

const COLUMN_WIDTHS = {
  symbol: 12,
  current: 14,
  average: 14,
  sevenDayRate: 14,
  sevenDayProfit: 16,
};

const INLINE_POINTS = 40;

const formatHeaderLabel = (
  label: string,
  width: number,
  active: boolean,
  descending: boolean,
  alignRight: boolean
) => {
  const suffix = active ? (descending ? " v" : " ^") : "";
  const content = `${label}${suffix}`;
  return alignRight ? content.padStart(width) : content.padEnd(width);
};

const colorForRate = (value: number | null) => {
  if (value === null || value === undefined) return "gray";
  return value >= 0 ? "green" : "red";
};

export const LighterHistoryTable: React.FC<LighterHistoryTableProps> = ({
  rows,
  headers,
  sortState,
  selectedHeaderIndex,
}) => {
  const headerLine = (
    <Box marginBottom={1}>
      {headers.map((header, index) => {
        const isActive = header.key === sortState.key;
        const color = index === selectedHeaderIndex ? "cyan" : isActive ? "green" : "white";
        const alignRight = header.key !== "symbol";
        const width =
          header.key === "symbol"
            ? COLUMN_WIDTHS.symbol
            : header.key === "currentRate"
            ? COLUMN_WIDTHS.current
            : header.key === "averageRate"
            ? COLUMN_WIDTHS.average
            : header.key === "sevenDayRate"
            ? COLUMN_WIDTHS.sevenDayRate
            : COLUMN_WIDTHS.sevenDayProfit;

        return (
          <Text key={header.key} color={color}>
            {formatHeaderLabel(header.label, width, isActive, sortState.direction === "desc", alignRight)}
          </Text>
        );
      })}
      <Text>Trend (7d)</Text>
    </Box>
  );

  return (
    <Box flexDirection="column">
      {headerLine}
      {rows.map((row) => (
        <LighterHistoryRowItem key={`${row.marketId}-${row.symbol}`} row={row} />
      ))}
    </Box>
  );
};

interface RowItemProps {
  row: LighterHistoryRow;
}

const LighterHistoryRowItem: React.FC<RowItemProps> = React.memo(({ row }) => {
  const current = formatRateValue(row.currentRate ?? undefined).padStart(COLUMN_WIDTHS.current);
  const average = formatRateValue(row.averageRate ?? undefined).padStart(COLUMN_WIDTHS.average);
  const sevenDayRate = formatRateValue(row.sevenDayRate ?? undefined).padStart(COLUMN_WIDTHS.sevenDayRate);
  const sevenDayProfit = formatUsd(row.sevenDayProfit ?? undefined).padStart(COLUMN_WIDTHS.sevenDayProfit);
  const symbol = row.symbol.padEnd(COLUMN_WIDTHS.symbol);
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text>{symbol}</Text>
        <Text color={colorForRate(row.currentRate)}>{current}</Text>
        <Text color={colorForRate(row.averageRate)}>{average}</Text>
        <Text color={colorForRate(row.sevenDayRate)}>{sevenDayRate}</Text>
        <Text color="yellow">{sevenDayProfit}</Text>
        {row.series.length ? (
          <Box marginLeft={2}>
            <InlineBarSeries data={row.series} />
          </Box>
        ) : (
          <Box marginLeft={2}>
            <Text color="gray">No history</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}, (prev, next) => {
  return (
    prev.row.marketId === next.row.marketId &&
    prev.row.symbol === next.row.symbol &&
    prev.row.currentRate === next.row.currentRate &&
    prev.row.averageRate === next.row.averageRate &&
    prev.row.sevenDayRate === next.row.sevenDayRate &&
    prev.row.sevenDayProfit === next.row.sevenDayProfit &&
    prev.row.series === next.row.series
  );
});

interface InlineBarSeriesProps {
  data: number[];
}

const InlineBarSeries: React.FC<InlineBarSeriesProps> = ({ data }) => {
  const series = downsampleSeries(data, INLINE_POINTS);
  if (!series.length) {
    return <Text color="gray">No history</Text>;
  }

  const maxAbs = Math.max(...series.map((value) => Math.abs(value)), 0);
  const safeMax = maxAbs > 0 ? maxAbs : 1;

  return (
    <Box>
      {series.map((value, index) => {
        const magnitude = Math.abs(value) / safeMax;
        const char = magnitude > 0.66 ? "█" : magnitude > 0.33 ? "▓" : "▒";
        const color = value > 0 ? "green" : value < 0 ? "red" : "gray";
        return (
          <Text key={`${index}-${char}`} color={color}>
            {char}
          </Text>
        );
      })}
    </Box>
  );
};
