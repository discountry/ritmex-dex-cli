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
  const [sortState, setSortState] = useState<SortState>({ key: "arb", direction: "desc" });
  const [selectedHeaderIndex, setSelectedHeaderIndex] = useState<number>(headers.length - 1);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => compareRows(a, b, sortState.key, sortState.direction));
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
