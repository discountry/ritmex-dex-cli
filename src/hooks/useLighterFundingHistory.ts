import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLighterFundingHistory,
  fetchLighterMarkets,
  type FundingHistoryParams,
} from "../services/http/lighter-history";
import {
  LIGHTER_HISTORY_COUNT_BACK,
  LIGHTER_HISTORY_FETCH_GAP_MS,
  LIGHTER_HISTORY_LOOKBACK_MS,
  LIGHTER_HISTORY_REFRESH_MS,
  LIGHTER_EXCLUDED_SYMBOLS,
} from "../utils/constants";
import { parseNumber } from "../utils/format";
import { delay } from "../utils/time";
import { loadLighterHistorySnapshotSync, saveLighterHistorySnapshot } from "../utils/lighterHistorySnapshot";
import type { LighterFundingPoint, LighterHistoryRow } from "../types/lighter-history";

interface LighterHistoryState {
  rows: LighterHistoryRow[];
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: LighterHistoryState = {
  rows: [],
  isRefreshing: false,
  error: null,
  lastUpdated: null,
};

const INITIAL_SNAPSHOT = loadLighterHistorySnapshotSync();

const signedRate = (point: LighterFundingPoint): number | null => {
  const base = parseNumber(point.rate) ?? parseNumber(point.value);
  if (base === null) return null;
  return point.direction?.toLowerCase() === "short" ? -base : base;
};

const buildSeries = (points: LighterFundingPoint[]): number[] => {
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  return sorted.map(signedRate).filter((value): value is number => value !== null);
};

const average = (values: number[]): number | null => {
  if (!values.length) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};

const total = (values: number[]): number | null => {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0);
};

const addDerivedFields = (
  row: Omit<LighterHistoryRow, "sevenDayRate" | "sevenDayProfit">,
  principalUsd: number
): LighterHistoryRow => {
  const series = row.series ?? [];
  const averageRate = row.averageRate ?? average(series);
  const latestRate = series.length ? series[series.length - 1] : null;
  const currentRate = latestRate ?? row.currentRate ?? null;
  const sevenDayRate = total(series);
  const sevenDayProfit =
    sevenDayRate !== null && principalUsd > 0 ? principalUsd * (sevenDayRate / 100) : null;

  return {
    ...row,
    averageRate,
    currentRate,
    sevenDayRate,
    sevenDayProfit,
  };
};

const dedupeMarkets = (markets: { marketId: number; symbol: string; currentRate: number | null }[]) => {
  const seen = new Set<string>();
  return markets.filter((market) => {
    const key = `${market.marketId}-${market.symbol.toUpperCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const dedupeRows = (rows: LighterHistoryRow[]): LighterHistoryRow[] => {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.marketId}-${row.symbol.toUpperCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const filterExcludedRows = (rows: LighterHistoryRow[]): LighterHistoryRow[] =>
  rows.filter((row) => !LIGHTER_EXCLUDED_SYMBOLS.has(row.symbol.toUpperCase()));

export const useLighterFundingHistory = (principalUsd: number = 1000): LighterHistoryState => {
  const [state, setState] = useState<LighterHistoryState>(() => {
    if (INITIAL_SNAPSHOT) {
      return {
        rows: filterExcludedRows(
          dedupeRows(INITIAL_SNAPSHOT.rows).map((row) =>
            addDerivedFields(
              {
                marketId: row.marketId,
                symbol: row.symbol,
                currentRate: row.currentRate,
                averageRate: row.averageRate,
                series: row.series,
              },
              principalUsd
            )
          )
        ),
        isRefreshing: false,
        error: null,
        lastUpdated: new Date(INITIAL_SNAPSHOT.lastUpdated),
      };
    }

    return initialState;
  });
  const inFlightRef = useRef(false);

  const pull = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setState((prev) => ({ ...prev, isRefreshing: true, error: null }));

    try {
      const markets = dedupeMarkets(await fetchLighterMarkets());
      if (!markets.length) {
        setState((prev) => ({ ...prev, error: "No lighter markets available", isRefreshing: false }));
        inFlightRef.current = false;
        return;
      }

      const now = Date.now();
      const params: Pick<FundingHistoryParams, "startTimestamp" | "endTimestamp" | "countBack"> = {
        startTimestamp: now - LIGHTER_HISTORY_LOOKBACK_MS,
        endTimestamp: now,
        countBack: LIGHTER_HISTORY_COUNT_BACK,
      };

      const rows: LighterHistoryRow[] = [];
      const failures: string[] = [];

      for (const market of markets) {
        try {
          const fundings = await fetchLighterFundingHistory({
            ...params,
            marketId: market.marketId,
            resolution: "1h",
          });

          const series = buildSeries(fundings);
          const averageRate = average(series);

          rows.push(
            addDerivedFields(
              {
                marketId: market.marketId,
                symbol: market.symbol,
                currentRate: market.currentRate,
                averageRate,
                series,
              },
              principalUsd
            )
          );
          setState({
            rows: filterExcludedRows([...rows]),
            error: failures.length ? `Partial data: ${failures.join("; ")}` : null,
            isRefreshing: true,
            lastUpdated: state.lastUpdated,
          });
        } catch (error) {
          failures.push(`${market.symbol}: ${(error as Error).message}`);
        }

        // Respect Lighter's 60 req/minute guidance with a small gap between calls.
        await delay(LIGHTER_HISTORY_FETCH_GAP_MS);
      }

      setState({
        rows: filterExcludedRows(rows),
        error: failures.length ? `Partial data: ${failures.join("; ")}` : null,
        isRefreshing: false,
        lastUpdated: new Date(),
      });
      void saveLighterHistorySnapshot({
        rows: filterExcludedRows(rows),
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: (error as Error).message,
        isRefreshing: false,
      }));
    } finally {
      inFlightRef.current = false;
    }
  }, [principalUsd]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await pull();
    };

    void tick();
    const interval = setInterval(tick, LIGHTER_HISTORY_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pull]);

  return state;
};
