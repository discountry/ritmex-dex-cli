import { useMemo, useState } from "react";
import type { LighterHistoryRow, LighterHistorySortKey } from "../types/lighter-history";

export interface HistoryHeaderConfig {
  key: LighterHistorySortKey;
  label: string;
  shortcut: string;
}

export interface HistorySortState {
  key: LighterHistorySortKey;
  direction: "asc" | "desc";
}

export interface HistorySortingResult {
  sortedRows: LighterHistoryRow[];
  sortState: HistorySortState;
  selectedHeaderIndex: number;
  selectPrevious: () => void;
  selectNext: () => void;
  toggleSort: (index: number) => void;
}

const compare = (a: LighterHistoryRow, b: LighterHistoryRow, key: LighterHistorySortKey, direction: "asc" | "desc") => {
  const factor = direction === "asc" ? 1 : -1;
  const aValue = a[key];
  const bValue = b[key];

  if (aValue === null || aValue === undefined) return 1;
  if (bValue === null || bValue === undefined) return -1;

  if (typeof aValue === "number" && typeof bValue === "number") {
    if (aValue === bValue) return 0;
    return aValue > bValue ? factor : -factor;
  }

  const aStr = String(aValue).toUpperCase();
  const bStr = String(bValue).toUpperCase();
  if (aStr === bStr) return 0;
  return aStr > bStr ? factor : -factor;
};

export const useLighterHistorySorting = (
  rows: LighterHistoryRow[],
  headers: HistoryHeaderConfig[]
): HistorySortingResult => {
  const initialIndex = headers.findIndex((header) => header.key === "averageRate");
  const fallbackIndex = headers.length ? 0 : -1;
  const initialKey = (headers[initialIndex]?.key ?? headers[fallbackIndex]?.key ?? "averageRate") as LighterHistorySortKey;

  const [sortState, setSortState] = useState<HistorySortState>({ key: initialKey, direction: "desc" });
  const [selectedHeaderIndex, setSelectedHeaderIndex] = useState<number>(initialIndex >= 0 ? initialIndex : fallbackIndex);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => compare(a, b, sortState.key, sortState.direction)),
    [rows, sortState]
  );

  const selectPrevious = () => {
    setSelectedHeaderIndex((index) => (index <= 0 ? headers.length - 1 : index - 1));
  };

  const selectNext = () => {
    setSelectedHeaderIndex((index) => (index === headers.length - 1 ? 0 : index + 1));
  };

  const toggleSort = (index: number) => {
    const header = headers[index];
    if (!header) return;

    setSelectedHeaderIndex(index);
    setSortState((prev) => {
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
