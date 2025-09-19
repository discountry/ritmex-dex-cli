import { useEffect, useMemo } from "react";
import { EDGEX_VISIBLE_REFRESH_MS, VISIBLE_MIN_REFRESH_MS } from "../utils/constants";
import type { EdgexMetaContract } from "../types/edgex";
import type { TableRow } from "../types/table";

interface VisibleRefreshArgs {
  contracts: EdgexMetaContract[];
  visibleRows: TableRow[];
  refreshContracts: (contracts: EdgexMetaContract[]) => Promise<void>;
  fetchTimestampsRef: React.MutableRefObject<Record<string, number>>;
}

export const useVisibleEdgexRefresh = ({
  contracts,
  visibleRows,
  refreshContracts,
  fetchTimestampsRef,
}: VisibleRefreshArgs) => {
  const contractMap = useMemo(() => {
    const map = new Map<string, EdgexMetaContract>();
    contracts.forEach((contract) => map.set(contract.contractId, contract));
    return map;
  }, [contracts]);

  const visibleContracts = useMemo(() => {
    const ids = new Set<string>();
    visibleRows.forEach((row) => {
      if (row.contractId) {
        ids.add(row.contractId);
      }
    });

    return Array.from(ids)
      .map((id) => contractMap.get(id))
      .filter((contract): contract is EdgexMetaContract => Boolean(contract));
  }, [contractMap, visibleRows]);

  useEffect(() => {
    if (!visibleContracts.length) return;

    const now = Date.now();
    const pending = visibleContracts.filter((contract) => {
      const last = fetchTimestampsRef.current[contract.contractId] ?? 0;
      return now - last > VISIBLE_MIN_REFRESH_MS;
    });

    if (!pending.length) return;
    void refreshContracts(pending);
  }, [visibleContracts, fetchTimestampsRef, refreshContracts]);

  useEffect(() => {
    if (!visibleContracts.length) return;

    let cancelled = false;

    const interval = setInterval(() => {
      if (cancelled) return;
      const now = Date.now();
      const pending = visibleContracts.filter((contract) => {
        const last = fetchTimestampsRef.current[contract.contractId] ?? 0;
        return now - last >= EDGEX_VISIBLE_REFRESH_MS;
      });

      if (!pending.length) return;
      void refreshContracts(pending);
    }, EDGEX_VISIBLE_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [visibleContracts, fetchTimestampsRef, refreshContracts]);
};
