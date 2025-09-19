import { useEffect, useMemo, useState } from "react";
import type { TableRow } from "../types/table";

interface PaginationOptions {
  rowsPerPage: number;
}

interface PaginationResult {
  viewportOffset: number;
  maxOffset: number;
  visibleRows: TableRow[];
  setOffset: (next: number) => void;
  increment: () => void;
  decrement: () => void;
  pageUp: () => void;
  pageDown: () => void;
}

export const usePagination = (rows: TableRow[], { rowsPerPage }: PaginationOptions): PaginationResult => {
  const [viewportOffset, setViewportOffset] = useState(0);

  const maxOffset = Math.max(rows.length - rowsPerPage, 0);

  useEffect(() => {
    setViewportOffset((offset) => Math.min(offset, maxOffset));
  }, [maxOffset]);

  const visibleRows = useMemo(() => rows.slice(viewportOffset, viewportOffset + rowsPerPage), [
    rows,
    viewportOffset,
    rowsPerPage,
  ]);

  const setOffset = (next: number) => {
    setViewportOffset(Math.max(0, Math.min(maxOffset, next)));
  };

  const increment = () => setOffset(viewportOffset + 1);
  const decrement = () => setOffset(viewportOffset - 1);
  const pageUp = () => setOffset(viewportOffset - rowsPerPage);
  const pageDown = () => setOffset(viewportOffset + rowsPerPage);

  return {
    viewportOffset,
    maxOffset,
    visibleRows,
    setOffset,
    increment,
    decrement,
    pageUp,
    pageDown,
  };
};
