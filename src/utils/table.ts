import type { EdgexFundingEntry } from "../types/edgex";
import type { LighterFundingEntry } from "../types/lighter";
import type { DisplayRow, SortKey, TableRow } from "../types/table";
import type { AsterFundingEntry } from "../types/aster";
import type { BackpackFundingEntry } from "../types/backpack";
import { formatArbValue, formatRateValue, normaliseSymbol } from "./format";

export const buildTableRows = (
  edgexFundingById: Record<string, EdgexFundingEntry | undefined>,
  lighterRates: LighterFundingEntry[],
  grvtFundingBySymbol: Record<string, number>,
  asterRates: AsterFundingEntry[],
  backpackRates: BackpackFundingEntry[] = [],
  binanceRates: Array<{ symbol: string; rate: number }> = []
): TableRow[] => {
  const lighterMap = new Map<string, number>();
  const binanceMap = new Map<string, number>();
  const asterMap = new Map<string, number>();
  const hyperliquidMap = new Map<string, number>();
  const backpackMap = new Map<string, number>();

  lighterRates.forEach((entry) => {
    const symbolKey = entry.symbol.toUpperCase();
    if (entry.exchange === "lighter") {
      lighterMap.set(symbolKey, entry.rate);
    }
    if (entry.exchange === "hyperliquid") {
      hyperliquidMap.set(symbolKey, entry.rate);
    }
  });

  // Use direct Binance rates instead of from Lighter
  binanceRates.forEach((entry) => {
    const symbolKey = normaliseSymbol(entry.symbol);
    binanceMap.set(symbolKey, entry.rate);
  });
  

  asterRates.forEach((entry) => {
    const symbolKey = entry.symbol.toUpperCase();
    asterMap.set(symbolKey, entry.rate);
  });

  backpackRates.forEach((entry) => {
    const symbolKey = entry.symbol.toUpperCase();
    backpackMap.set(symbolKey, entry.rate);
  });

  return Object.values(edgexFundingById)
    .filter((entry): entry is EdgexFundingEntry => Boolean(entry))
    .reduce<TableRow[]>((accumulator, entry) => {
      const symbol = normaliseSymbol(entry.contractName);
      const lighterFunding = lighterMap.get(symbol);
      const edgexFunding = entry.fundingRate;
      const hyperliquidFunding = hyperliquidMap.get(symbol);
      const grvtFunding = grvtFundingBySymbol[symbol];
      const asterFunding = asterMap.get(symbol);
      const backpackFunding = backpackMap.get(symbol);
      const binanceFunding = binanceMap.get(symbol);

      const availableRates = [
        lighterFunding,
        hyperliquidFunding,
        edgexFunding,
        grvtFunding,
        asterFunding,
        binanceFunding,
        backpackFunding,
      ].filter(
        (value) => value !== undefined
      );

      if (availableRates.length < 2) {
        return accumulator;
      }

      const row: TableRow = {
        contractId: entry.contractId,
        symbol,
        contractName: entry.contractName,
        fundingRateIntervalMin: null,
        fundingInterestRate: null,
      };

      if (lighterFunding !== undefined) {
        row.lighterFunding = lighterFunding;
      }

      if (binanceFunding !== undefined) {
        row.binanceFunding = binanceFunding;
      }

      if (hyperliquidFunding !== undefined) {
        row.hyperliquidFunding = hyperliquidFunding;
      }

      if (edgexFunding !== undefined) {
        row.edgexFunding = edgexFunding;
      }

      if (grvtFunding !== undefined) {
        row.grvtFunding = grvtFunding;
      }

      if (asterFunding !== undefined) {
        row.asterFunding = asterFunding;
      }

      if (backpackFunding !== undefined) {
        row.backpackFunding = backpackFunding;
      }

      if (lighterFunding !== undefined && edgexFunding !== undefined) {
        row.lighterEdgexArb = lighterFunding - edgexFunding;
      }

      if (lighterFunding !== undefined && grvtFunding !== undefined) {
        row.lighterGrvtArb = lighterFunding - grvtFunding;
      }

      if (edgexFunding !== undefined && grvtFunding !== undefined) {
        row.edgexGrvtArb = edgexFunding - grvtFunding;
      }

      if (binanceFunding !== undefined && edgexFunding !== undefined) {
        row.binanceEdgexArb = binanceFunding - edgexFunding;
      }

      if (binanceFunding !== undefined && grvtFunding !== undefined) {
        row.binanceGrvtArb = binanceFunding - grvtFunding;
      }

      if (lighterFunding !== undefined && asterFunding !== undefined) {
        row.lighterAsterArb = lighterFunding - asterFunding;
      }

      if (edgexFunding !== undefined && asterFunding !== undefined) {
        row.edgexAsterArb = edgexFunding - asterFunding;
      }

      if (grvtFunding !== undefined && asterFunding !== undefined) {
        row.grvtAsterArb = grvtFunding - asterFunding;
      }

      if (binanceFunding !== undefined && asterFunding !== undefined) {
        row.binanceAsterArb = binanceFunding - asterFunding;
      }

      if (binanceFunding !== undefined && lighterFunding !== undefined) {
        row.binanceLighterArb = binanceFunding - lighterFunding;
      }

      accumulator.push(row);

      return accumulator;
    }, []);
};

export const buildDisplayRow = (row: TableRow, columns: SortKey[]): DisplayRow => {
  return columns.reduce((accumulator, column) => {
    switch (column) {
      case "symbol":
        accumulator[column] = row.symbol;
        break;
      case "lighterFunding":
        accumulator[column] = formatRateValue(row.lighterFunding);
        break;
      case "binanceFunding":
        accumulator[column] = formatRateValue(row.binanceFunding);
        break;
      case "hyperliquidFunding":
        accumulator[column] = formatRateValue(row.hyperliquidFunding);
        break;
      case "edgexFunding":
        accumulator[column] = formatRateValue(row.edgexFunding);
        break;
      case "grvtFunding":
        accumulator[column] = formatRateValue(row.grvtFunding);
        break;
      case "backpackFunding":
        accumulator[column] = formatRateValue(row.backpackFunding);
        break;
    case "asterFunding":
      accumulator[column] = formatRateValue(row.asterFunding);
      break;
      case "lighterEdgexArb":
        accumulator[column] = formatArbValue(row.lighterEdgexArb);
        break;
      case "lighterGrvtArb":
        accumulator[column] = formatArbValue(row.lighterGrvtArb);
        break;
      case "edgexGrvtArb":
        accumulator[column] = formatArbValue(row.edgexGrvtArb);
        break;
      case "binanceEdgexArb":
        accumulator[column] = formatArbValue(row.binanceEdgexArb);
        break;
      case "binanceGrvtArb":
        accumulator[column] = formatArbValue(row.binanceGrvtArb);
        break;
    case "lighterAsterArb":
      accumulator[column] = formatArbValue(row.lighterAsterArb);
      break;
    case "edgexAsterArb":
      accumulator[column] = formatArbValue(row.edgexAsterArb);
      break;
    case "grvtAsterArb":
      accumulator[column] = formatArbValue(row.grvtAsterArb);
      break;
      case "binanceAsterArb":
        accumulator[column] = formatArbValue(row.binanceAsterArb);
        break;
      case "binanceLighterArb":
        accumulator[column] = formatArbValue(row.binanceLighterArb);
        break;
      default: {
        const exhaustiveCheck: never = column;
        throw new Error(`Unhandled column key: ${exhaustiveCheck}`);
      }
    }
    return accumulator;
  }, {} as DisplayRow);
};

export const buildColumnLabels = (
  columns: Array<{ key: SortKey; label: string; shortcut: string }>,
  activeKey: SortKey,
  direction: "asc" | "desc"
): Partial<Record<SortKey, string>> => {
  return columns.reduce<Partial<Record<SortKey, string>>>((accumulator, column) => {
    const arrow = column.key === activeKey ? (direction === "asc" ? " ↑" : " ↓") : "";
    accumulator[column.key] = `[${column.shortcut}] ${column.label}${arrow}`;
    return accumulator;
  }, {});
};
