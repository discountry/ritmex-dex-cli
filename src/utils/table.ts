import type { EdgexMetaContract, EnrichedFundingPoint } from "../types/edgex";
import type { LighterFundingEntry } from "../types/lighter";
import type { DisplayRow, SortKey, TableRow } from "../types/table";
import { formatArbValue, formatRateValue, normaliseSymbol, parseNumber } from "./format";

export const buildTableRows = (
  contracts: EdgexMetaContract[],
  edgexFundingById: Record<string, EnrichedFundingPoint | undefined>,
  lighterRates: LighterFundingEntry[],
  grvtFundingBySymbol: Record<string, number>
): TableRow[] => {
  const lighterMap = new Map<string, number>();

  lighterRates.forEach((entry) => {
    const symbolKey = entry.symbol.toUpperCase();
    lighterMap.set(symbolKey, entry.rate);
  });

  return contracts.reduce<TableRow[]>((accumulator, contract) => {
    const symbol = normaliseSymbol(contract.contractName);
    const lighterFunding = lighterMap.get(symbol);
    const edgexFundingPoint = edgexFundingById[contract.contractId];
    const edgexFunding = edgexFundingPoint?.fundingRate;
    const grvtFunding = grvtFundingBySymbol[symbol];

    const availableRates = [lighterFunding, edgexFunding, grvtFunding].filter(
      (value) => value !== undefined
    );

    if (availableRates.length < 2) {
      return accumulator;
    }

    const row: TableRow = {
      contractId: contract.contractId,
      symbol,
      contractName: contract.contractName,
      fundingRateIntervalMin: parseNumber(contract.fundingRateIntervalMin),
      fundingInterestRate: parseNumber(contract.fundingInterestRate),
    };

    if (lighterFunding !== undefined) {
      row.lighterFunding = lighterFunding;
    }

    if (edgexFunding !== undefined) {
      row.edgexFunding = edgexFunding;
    }

    if (grvtFunding !== undefined) {
      row.grvtFunding = grvtFunding;
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
      case "edgexFunding":
        accumulator[column] = formatRateValue(row.edgexFunding);
        break;
      case "grvtFunding":
        accumulator[column] = formatRateValue(row.grvtFunding);
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
