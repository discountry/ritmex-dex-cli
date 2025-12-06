import React, { useMemo } from "react";
import { render, Box, Text } from "ink";
import { Header } from "./src/components/Header";
import { LighterHistoryTable } from "./src/components/LighterHistoryTable";
import { useLighterFundingHistory } from "./src/hooks/useLighterFundingHistory";
import { useLighterHistorySorting, type HistoryHeaderConfig } from "./src/hooks/useLighterHistorySorting";
import { useKeyboardNavigation } from "./src/hooks/useKeyboardNavigation";
import { LIGHTER_HISTORY_DISPLAY_LIMIT } from "./src/utils/constants";

const HEADERS: HistoryHeaderConfig[] = [
  { key: "symbol", label: "Symbol", shortcut: "1" },
  { key: "currentRate", label: "Current", shortcut: "2" },
  { key: "averageRate", label: "7d Avg", shortcut: "3" },
  { key: "sevenDayRate", label: "7d Rate", shortcut: "4" },
  { key: "sevenDayProfit", label: "7d Profit", shortcut: "5" },
  { key: "annualizedRate", label: "Est APR", shortcut: "6" },
];

const DEFAULT_PRINCIPAL = 1000;

const parsePrincipalFromArgv = (): number => {
  const argv = process.argv.slice(2);
  const idx = argv.findIndex((arg) => arg === "--capital" || arg === "-c" || arg === "--principal");
  if (idx === -1) return DEFAULT_PRINCIPAL;
  const next = argv[idx + 1];
  if (!next) return DEFAULT_PRINCIPAL;
  const value = Number(next.replace(/[$,]/g, ""));
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_PRINCIPAL;
  return value;
};

const PRINCIPAL_USD = parsePrincipalFromArgv();

const App: React.FC = () => {
  const history = useLighterFundingHistory(PRINCIPAL_USD);
  const sorting = useLighterHistorySorting(history.rows, HEADERS);
  const visibleRows = useMemo(
    () => sorting.sortedRows.slice(0, LIGHTER_HISTORY_DISPLAY_LIMIT),
    [sorting.sortedRows]
  );

  useKeyboardNavigation({
    headers: HEADERS,
    selectedHeaderIndex: sorting.selectedHeaderIndex,
    selectNext: sorting.selectNext,
    selectPrevious: sorting.selectPrevious,
    toggleSort: sorting.toggleSort,
  });

  const statusMessage = useMemo(() => {
    if (history.isRefreshing && !history.rows.length) {
      return "Fetching Lighter markets and funding history (respecting rate limits)…";
    }

    if (history.isRefreshing) {
      return "Refreshing Lighter funding history…";
    }

    if (!history.rows.length) {
      return "No Lighter funding history loaded yet.";
    }

    return "";
  }, [history.isRefreshing, history.rows.length]);

  return (
    <Box flexDirection="column">
      <Header
        title="Lighter 7d Funding History"
        instructions={`Use ← → or press 1-6 to choose a column, Enter to toggle sort. Capital: $${PRINCIPAL_USD} (2x notional for neutral carry)`}
        lastUpdated={history.lastUpdated}
        fundingError={history.error}
      />

      <LighterHistoryTable
        rows={visibleRows}
        headers={HEADERS}
        sortState={sorting.sortState}
        selectedHeaderIndex={sorting.selectedHeaderIndex}
      />

      {statusMessage && <Text color="yellow">{statusMessage}</Text>}
    </Box>
  );
};

render(<App />);
