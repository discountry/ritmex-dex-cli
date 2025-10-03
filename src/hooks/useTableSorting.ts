import { useMemo, useState } from "react";
import type { SortKey, SortState, TableRow } from "../types/table";

export interface HeaderConfig {
  key: SortKey;
  label: string;
  shortcut: string;
}

export interface TableSortingResult {
  sortedRows: TableRow[];
  sortState: SortState;
  selectedHeaderIndex: number;
  selectPrevious: () => void;
  selectNext: () => void;
  toggleSort: (index: number) => void;
}

const ARB_KEYS: SortKey[] = [
  "lighterEdgexArb",
  "lighterGrvtArb",
  "edgexGrvtArb",
  "lighterAsterArb",
  "edgexAsterArb",
  "grvtAsterArb",
  "binanceEdgexArb",
  "binanceGrvtArb",
  "binanceAsterArb",
  "binanceLighterArb",
];

// Funding rate columns that should always sort by absolute value in descending order
const RATE_KEYS: SortKey[] = [
  "lighterFunding",
  "binanceFunding",
  "hyperliquidFunding",
  "edgexFunding",
  "grvtFunding",
  "asterFunding",
  "backpackFunding",
];

const compareRows = (a: TableRow, b: TableRow, key: SortKey, direction: "asc" | "desc") => {
  const factor = direction === "asc" ? 1 : -1;
  const aValue = a[key];
  const bValue = b[key];

  if (aValue === undefined || aValue === null) return 1;
  if (bValue === undefined || bValue === null) return -1;

  if (typeof aValue === "number" && typeof bValue === "number") {
    if (aValue === bValue) return 0;
    return aValue > bValue ? factor : -factor;
  }

  const aStr = String(aValue).toUpperCase();
  const bStr = String(bValue).toUpperCase();

  if (aStr === bStr) return 0;
  return aStr > bStr ? factor : -factor;
};

export const useTableSorting = (rows: TableRow[], headers: HeaderConfig[]): TableSortingResult => {
  // Prefer lighter funding by default if present, otherwise fall back to first ARB key, then last column
  const lighterIndex = headers.findIndex((header) => header.key === ("lighterFunding" as SortKey));
  const arbIndex = headers.findIndex((header) => ARB_KEYS.includes(header.key));
  const fallbackIndex = headers.length ? headers.length - 1 : 0;
  const initialIndex = lighterIndex >= 0 ? lighterIndex : arbIndex >= 0 ? arbIndex : fallbackIndex;
  const initialKey = (headers[initialIndex]?.key ?? "symbol") as SortKey;
  const [sortState, setSortState] = useState<SortState>({ key: initialKey, direction: "desc" });
  const [selectedHeaderIndex, setSelectedHeaderIndex] = useState<number>(initialIndex);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => compareRows(a, b, sortState.key, sortState.direction));

    // For arbitrage and funding rate columns, force absolute value sorting (desc)
    if (ARB_KEYS.includes(sortState.key) || RATE_KEYS.includes(sortState.key)) {
      sorted.sort((a, b) => {
        const aValue = typeof a[sortState.key] === "number" ? (a[sortState.key] as number) : 0;
        const bValue = typeof b[sortState.key] === "number" ? (b[sortState.key] as number) : 0;
        return Math.abs(bValue) - Math.abs(aValue);
      });
    }

    return sorted;
  }, [rows, sortState]);

  const selectPrevious = () => {
    setSelectedHeaderIndex((index) => (index === 0 ? headers.length - 1 : index - 1));
  };

  const selectNext = () => {
    setSelectedHeaderIndex((index) => (index === headers.length - 1 ? 0 : index + 1));
  };

  const toggleSort = (index: number) => {
    const header = headers[index];
    if (!header) return;

    setSelectedHeaderIndex(index);
    setSortState((prev) => {
      // For arbitrage and funding rate columns, always lock to absolute value descending
      if (ARB_KEYS.includes(header.key) || RATE_KEYS.includes(header.key)) {
        return { key: header.key, direction: "desc" };
      }

      if (prev.key === header.key) {
        return { key: prev.key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }

      return { key: header.key, direction: "desc" };
    });
  };

  return {
    sortedRows,
    sortState,
    selectedHeaderIndex,
    selectPrevious,
    selectNext,
    toggleSort,
  };
};
