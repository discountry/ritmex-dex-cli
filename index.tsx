import React, { useMemo } from "react";
import { render, Box, Text } from "ink";
import { Header } from "./src/components/Header";
import { FundingTable } from "./src/components/FundingTable";
import { TopSpreadList } from "./src/components/TopSpreadList";
import { useLighterFunding } from "./src/hooks/useLighterFunding";
import { useEdgexFunding } from "./src/hooks/useEdgexFunding";
import { useGrvtFunding } from "./src/hooks/useGrvtFunding";
import { useAsterFunding } from "./src/hooks/useAsterFunding";
import { useFundingRows } from "./src/hooks/useFundingRows";
import { useBackpackFunding } from "./src/hooks/useBackpackFunding";
import { useTableSorting, type HeaderConfig } from "./src/hooks/useTableSorting";
import { useKeyboardNavigation } from "./src/hooks/useKeyboardNavigation";
import { useSnapshotPersistence } from "./src/hooks/useSnapshotPersistence";
import { buildColumnLabels, buildDisplayRow } from "./src/utils/table";
import { calculateTopSpreads } from "./src/utils/spread";
import { loadSnapshotSync } from "./src/utils/snapshot";
import { DISPLAY_LIMIT } from "./src/utils/constants";
import { loadConfigSync, type ExchangeKey } from "./src/utils/config";
import type { DisplayRow, SortKey } from "./src/types/table";

const SNAPSHOT = loadSnapshotSync();
const INITIAL_ROWS = SNAPSHOT?.rows ?? [];
const INITIAL_LAST_UPDATED = SNAPSHOT?.lastUpdated ? new Date(SNAPSHOT.lastUpdated) : null;

const CONFIG = loadConfigSync();

const buildHeaders = (enabled: ExchangeKey[]): HeaderConfig[] => {
  const headers: HeaderConfig[] = [{ key: "symbol", label: "Symbol", shortcut: "1" }];

  const fundingCols: Array<{ key: SortKey; label: string }> = [];
  if (enabled.includes("lighter")) fundingCols.push({ key: "lighterFunding", label: "Lighter" });
  if (enabled.includes("binance")) fundingCols.push({ key: "binanceFunding", label: "Binance" });
  if (enabled.includes("hyperliquid")) fundingCols.push({ key: "hyperliquidFunding", label: "Hyperliquid" });
  if (enabled.includes("edgex")) fundingCols.push({ key: "edgexFunding", label: "Edgex" });
  if (enabled.includes("grvt")) fundingCols.push({ key: "grvtFunding", label: "GRVT" });
  if (enabled.includes("aster")) fundingCols.push({ key: "asterFunding", label: "Aster" });
  if (enabled.includes("backpack")) fundingCols.push({ key: "backpackFunding", label: "Backpack" });

  let shortcutCode = 50; // '2'
  fundingCols.forEach((col) => {
    headers.push({ key: col.key, label: col.label, shortcut: String.fromCharCode(shortcutCode) });
    shortcutCode += 1;
  });

  // Remove arbitrage/difference columns per request; show only per-exchange funding columns
  return headers;
};

const HEADERS: HeaderConfig[] = buildHeaders(CONFIG.enabledExchanges);

const DISPLAY_COLUMNS = HEADERS.map((header) => header.key) as SortKey[];

const parseCapitalFromArgv = (): number => {
  const argv = process.argv.slice(2);
  const idx = argv.findIndex((a) => a === "--capital" || a === "-c");
  if (idx === -1) return 0;
  const next = argv[idx + 1];
  if (!next) return 0;
  const value = Number(next.replace(/[$,]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const CAPITAL_USD = parseCapitalFromArgv();

const App: React.FC = () => {
  const lighter = useLighterFunding();
  const edgex = useEdgexFunding();
  const grvt = useGrvtFunding();
  const aster = useAsterFunding();
  const backpack = useBackpackFunding();

  const { rows, lastUpdated, status: rowStatus } = useFundingRows({
    edgexFunding: edgex.data,
    lighterRates: lighter.rates,
    grvtFunding: grvt.data,
    asterRates: aster.rates,
    backpackRates: backpack.rates,
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
  const fundingError = edgex.error ?? lighter.error ?? grvt.error ?? aster.error ?? backpack.error ?? null;
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

    if (aster.isRefreshing) {
      return "Refreshing Aster funding data...";
    }

    if (backpack.isRefreshing) {
      return "Refreshing Backpack funding data...";
    }

    if (rowStatus === "empty") {
      return "No overlapping contracts found.";
    }

    return "";
  }, [edgex.isConnecting, edgex.isConnected, hasEdgexData, lighter.isRefreshing, grvt.isRefreshing, aster.isRefreshing, backpack.isRefreshing, rowStatus]);

  const topSpreads = useMemo(
    () => calculateTopSpreads(sorting.sortedRows, 10, CAPITAL_USD),
    [sorting.sortedRows]
  );

  return (
    <Box flexDirection="column">
      <Header
        title="Ritmex Funding Monitor"
        instructions={`Use ← → or press 1-0/- to choose a column, Enter to toggle sort.${CAPITAL_USD ? ` Capital: $${CAPITAL_USD}` : ""}`}
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
