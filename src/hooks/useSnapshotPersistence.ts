import { useEffect, useRef } from "react";
import type { TableRow } from "../types/table";
import { saveSnapshotSync } from "../utils/snapshot";

export const useSnapshotPersistence = (rows: TableRow[], lastUpdated: Date | null) => {
  const latestRowsRef = useRef<TableRow[]>(rows);
  const lastUpdatedRef = useRef<Date | null>(lastUpdated);

  useEffect(() => {
    latestRowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    lastUpdatedRef.current = lastUpdated;
  }, [lastUpdated]);

  useEffect(() => {
    let persisted = false;

    const persistSnapshot = () => {
      if (persisted) return;
      const snapshotRows = latestRowsRef.current;
      if (!snapshotRows.length) return;

      const timestamp = (lastUpdatedRef.current ?? new Date()).toISOString();
      saveSnapshotSync({ rows: snapshotRows, lastUpdated: timestamp });
      persisted = true;
    };

    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
    signals.forEach((signal) => process.on(signal, persistSnapshot));
    process.on("exit", persistSnapshot);

    return () => {
      signals.forEach((signal) => process.off(signal, persistSnapshot));
      process.off("exit", persistSnapshot);
      persistSnapshot();
    };
  }, []);
};
