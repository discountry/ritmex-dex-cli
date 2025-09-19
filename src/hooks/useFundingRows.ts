import { useEffect, useState } from "react";
import type { EdgexMetaContract, EnrichedFundingPoint } from "../types/edgex";
import type { LighterFundingEntry } from "../types/lighter";
import type { TableRow } from "../types/table";
import { buildTableRows } from "../utils/table";
import { saveSnapshot } from "../utils/snapshot";

export type RowStatus = "idle" | "waiting-edgex" | "waiting-lighter" | "ready" | "empty";

interface FundingRowsArgs {
  contracts: EdgexMetaContract[];
  edgexFunding: Record<string, EnrichedFundingPoint>;
  lighterRates: LighterFundingEntry[];
  initialRows: TableRow[];
  initialLastUpdated: Date | null;
}

interface FundingRowsState {
  rows: TableRow[];
  lastUpdated: Date | null;
  status: RowStatus;
}

export const useFundingRows = ({
  contracts,
  edgexFunding,
  lighterRates,
  initialRows,
  initialLastUpdated,
}: FundingRowsArgs): FundingRowsState => {
  const [rows, setRows] = useState<TableRow[]>(initialRows);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialLastUpdated);
  const [status, setStatus] = useState<RowStatus>(initialRows.length ? "ready" : "idle");

  useEffect(() => {
    const hasEdgexData = Object.keys(edgexFunding).length > 0;
    const hasLighterData = lighterRates.length > 0;

    if (!hasEdgexData && !hasLighterData) {
      setStatus(initialRows.length ? "ready" : "idle");
      return;
    }

    if (!hasEdgexData) {
      setStatus("waiting-edgex");
      return;
    }

    if (!hasLighterData) {
      setStatus("waiting-lighter");
      return;
    }

    const nextRows = buildTableRows(contracts, edgexFunding, lighterRates);

    if (!nextRows.length) {
      setRows([]);
      setStatus("empty");
      return;
    }

    setRows(nextRows);
    setStatus("ready");

    const timestamp = new Date();
    setLastUpdated(timestamp);
    void saveSnapshot({ rows: nextRows, lastUpdated: timestamp.toISOString() });
  }, [contracts, edgexFunding, lighterRates, initialRows.length]);

  return { rows, lastUpdated, status };
};
