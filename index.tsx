import React, { useMemo } from "react";
import { render, Box, Text } from "ink";
import { Header } from "./src/components/Header";
import { FundingTable } from "./src/components/FundingTable";
import { useMetadata } from "./src/hooks/useMetadata";
import { useLighterFunding } from "./src/hooks/useLighterFunding";
import { useEdgexFunding } from "./src/hooks/useEdgexFunding";
import { useFundingRows } from "./src/hooks/useFundingRows";
import { useTableSorting, type HeaderConfig } from "./src/hooks/useTableSorting";
import { useKeyboardNavigation } from "./src/hooks/useKeyboardNavigation";
import { useVisibleEdgexRefresh } from "./src/hooks/useVisibleEdgexRefresh";
import { useSnapshotPersistence } from "./src/hooks/useSnapshotPersistence";
import { buildColumnLabels, buildDisplayRow } from "./src/utils/table";
import { loadSnapshotSync } from "./src/utils/snapshot";
import { DISPLAY_LIMIT } from "./src/utils/constants";
import type { DisplayRow, SortKey } from "./src/types/table";

const SNAPSHOT = loadSnapshotSync();
const INITIAL_ROWS = SNAPSHOT?.rows ?? [];
const INITIAL_LAST_UPDATED = SNAPSHOT?.lastUpdated ? new Date(SNAPSHOT.lastUpdated) : null;

const HEADERS: HeaderConfig[] = [
  { key: "symbol", label: "Symbol", shortcut: "1" },
  { key: "lighterFunding", label: "Lighter Funding", shortcut: "2" },
  { key: "edgexFunding", label: "Edgex Funding", shortcut: "3" },
  { key: "arb", label: "Arb", shortcut: "4" },
];

const DISPLAY_COLUMNS = HEADERS.map((header) => header.key) as SortKey[];

const App: React.FC = () => {
  const metadata = useMetadata();
  const lighter = useLighterFunding();
  const edgex = useEdgexFunding(metadata.contracts);

  const { rows, lastUpdated, status: rowStatus } = useFundingRows({
    contracts: metadata.contracts,
    edgexFunding: edgex.data,
    lighterRates: lighter.rates,
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

  useVisibleEdgexRefresh({
    contracts: metadata.contracts,
    visibleRows: limitedRows,
    refreshContracts: edgex.refreshContracts,
    fetchTimestampsRef: edgex.fetchTimestampsRef,
  });

  useKeyboardNavigation({
    headers: HEADERS,
    selectedHeaderIndex: sorting.selectedHeaderIndex,
    selectNext: sorting.selectNext,
    selectPrevious: sorting.selectPrevious,
    toggleSort: sorting.toggleSort,
  });

  const totalRows = limitedRows.length;
  const fundingError = edgex.error ?? lighter.error ?? null;

  const hasContracts = metadata.contracts.length > 0;

  const statusMessage = useMemo(() => {
    if (metadata.isLoading && !hasContracts) {
      return "Loading metadata...";
    }

    if (edgex.isRefreshing) {
      return edgex.scope === "full" ? "Refreshing edgeX funding data..." : "Updating visible edgeX contracts...";
    }

    if (lighter.isRefreshing) {
      return "Refreshing lighter funding data...";
    }

    if (rowStatus === "waiting-edgex") {
      return "Waiting for edgeX funding cycle...";
    }

    if (rowStatus === "waiting-lighter") {
      return "Waiting for lighter funding refresh...";
    }

    if (rowStatus === "empty") {
      return "No overlapping contracts found.";
    }

    return "";
  }, [metadata.isLoading, hasContracts, edgex.isRefreshing, edgex.scope, lighter.isRefreshing, rowStatus]);

  return (
    <Box flexDirection="column">
      <Header
        title="Ritmex Funding Monitor"
        instructions="Use ← → or press 1-4 to choose a column, Enter to toggle sort."
        lastUpdated={lastUpdated}
        metadataError={metadata.error}
        fundingError={fundingError}
      />

      <FundingTable data={tableData} columns={DISPLAY_COLUMNS} columnLabels={columnLabels} headerStyles={headerStyles} />

      {!totalRows && !statusMessage && <Text color="gray">No data available. Waiting for next refresh…</Text>}

      {statusMessage && <Text color="yellow">{statusMessage}</Text>}
    </Box>
  );
};

render(<App />);
