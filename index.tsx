import React, { useMemo } from "react";
import { render, Box, Text } from "ink";
import { Header } from "./src/components/Header";
import { FundingTable } from "./src/components/FundingTable";
import { TopSpreadList } from "./src/components/TopSpreadList";
import { useLighterFunding } from "./src/hooks/useLighterFunding";
import { useEdgexFunding } from "./src/hooks/useEdgexFunding";
import { useGrvtFunding } from "./src/hooks/useGrvtFunding";
import { useFundingRows } from "./src/hooks/useFundingRows";
import { useTableSorting, type HeaderConfig } from "./src/hooks/useTableSorting";
import { useKeyboardNavigation } from "./src/hooks/useKeyboardNavigation";
import { useSnapshotPersistence } from "./src/hooks/useSnapshotPersistence";
import { buildColumnLabels, buildDisplayRow } from "./src/utils/table";
import { calculateTopSpreads } from "./src/utils/spread";
import { loadSnapshotSync } from "./src/utils/snapshot";
import { DISPLAY_LIMIT } from "./src/utils/constants";
import type { DisplayRow, SortKey } from "./src/types/table";

const SNAPSHOT = loadSnapshotSync();
const INITIAL_ROWS = SNAPSHOT?.rows ?? [];
const INITIAL_LAST_UPDATED = SNAPSHOT?.lastUpdated ? new Date(SNAPSHOT.lastUpdated) : null;

const HEADERS: HeaderConfig[] = [
  { key: "symbol", label: "Symbol", shortcut: "1" },
  { key: "lighterFunding", label: "Lighter", shortcut: "2" },
  { key: "edgexFunding", label: "Edgex", shortcut: "3" },
  { key: "grvtFunding", label: "GRVT", shortcut: "4" },
  { key: "lighterEdgexArb", label: "L-E Arb", shortcut: "5" },
  { key: "lighterGrvtArb", label: "L-G Arb", shortcut: "6" },
  { key: "edgexGrvtArb", label: "E-G Arb", shortcut: "7" },
];

const DISPLAY_COLUMNS = HEADERS.map((header) => header.key) as SortKey[];

const App: React.FC = () => {
  const lighter = useLighterFunding();
  const edgex = useEdgexFunding();
  const grvt = useGrvtFunding();

  const { rows, lastUpdated, status: rowStatus } = useFundingRows({
    edgexFunding: edgex.data,
    lighterRates: lighter.rates,
    grvtFunding: grvt.data,
    initialRows: INITIAL_ROWS,
    initialLastUpdated: INITIAL_LAST_UPDATED,
  });

  useSnapshotPersistence(rows, lastUpdated);

  const sorting = useTableSorting(rows, HEADERS);
  const limitedRows = useMemo(
    () => sorting.sortedRows.slice(0, DISPLAY_LIMIT),
    [sorting.sortedRows]
  );

  const tableData: DisplayRow[] = useMemo(
    () => limitedRows.map((row) => buildDisplayRow(row, DISPLAY_COLUMNS)),
    [limitedRows]
  );

  const columnLabels = useMemo(
    () => buildColumnLabels(HEADERS, sorting.sortState.key, sorting.sortState.direction),
    [sorting.sortState.key, sorting.sortState.direction]
  );

  const headerStyles = useMemo(
    () =>
      HEADERS.map((header, index) => ({
        color:
          index === sorting.selectedHeaderIndex
            ? "green"
            : header.key === sorting.sortState.key
            ? "cyan"
            : undefined,
      })),
    [sorting.selectedHeaderIndex, sorting.sortState.key, sorting.sortState.direction]
  );

  useKeyboardNavigation({
    headers: HEADERS,
    selectedHeaderIndex: sorting.selectedHeaderIndex,
    selectNext: sorting.selectNext,
    selectPrevious: sorting.selectPrevious,
    toggleSort: sorting.toggleSort,
  });

  const totalRows = limitedRows.length;
  const fundingError = edgex.error ?? lighter.error ?? grvt.error ?? null;
  const hasEdgexData = Object.keys(edgex.data).length > 0;

  const statusMessage = useMemo(() => {
    if (edgex.isConnecting && !hasEdgexData) {
      return "Connecting to edgeX websocket...";
    }

    if (!edgex.isConnected && !edgex.isConnecting && !hasEdgexData) {
      return "edgeX websocket disconnected. Retrying...";
    }

    if (lighter.isRefreshing) {
      return "Refreshing lighter funding data...";
    }

    if (grvt.isRefreshing) {
      return "Refreshing GRVT funding data...";
    }

    if (rowStatus === "waiting-edgex") {
      return "Waiting for edgeX funding cycle...";
    }

    if (rowStatus === "waiting-lighter") {
      return "Waiting for lighter funding refresh...";
    }

    if (rowStatus === "waiting-grvt") {
      return "Waiting for GRVT funding refresh...";
    }

    if (rowStatus === "empty") {
      return "No overlapping contracts found.";
    }

    return "";
  }, [edgex.isConnecting, edgex.isConnected, hasEdgexData, lighter.isRefreshing, grvt.isRefreshing, rowStatus]);

  const topSpreads = useMemo(
    () => calculateTopSpreads(sorting.sortedRows, 5),
    [sorting.sortedRows]
  );

  return (
    <Box flexDirection="column">
      <Header
        title="Ritmex Funding Monitor"
        instructions="Use ← → or press 1-7 to choose a column, Enter to toggle sort."
        lastUpdated={lastUpdated}
        fundingError={fundingError}
      />

      <FundingTable data={tableData} columns={DISPLAY_COLUMNS} columnLabels={columnLabels} headerStyles={headerStyles} />

      {!totalRows && !statusMessage && <Text color="gray">No data available. Waiting for next refresh…</Text>}

      <TopSpreadList entries={topSpreads} />

      {statusMessage && <Text color="yellow">{statusMessage}</Text>}
    </Box>
  );
};

render(<App />);
