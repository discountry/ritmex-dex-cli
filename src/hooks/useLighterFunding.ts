import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLighterFundingRates, fetchBinanceFundingInfo } from "../services/http/lighter";
import { LIGHTER_REFRESH_MS } from "../utils/constants";
import type { LighterFundingEntry } from "../types/lighter";

interface LighterFundingState {
  rates: LighterFundingEntry[];
  error: string | null;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

const initialState: LighterFundingState = {
  rates: [],
  error: null,
  isRefreshing: false,
  lastUpdated: null,
};

export const useLighterFunding = (): LighterFundingState => {
  const [state, setState] = useState<LighterFundingState>(initialState);
  const inFlightRef = useRef(false);

  const pull = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      const [rates, binanceInfo] = await Promise.all([
        fetchLighterFundingRates(),
        fetchBinanceFundingInfo().catch(() => new Map<string, number>()),
      ]);

      const normalized = rates.map((entry) => {
        if (entry.exchange !== "binance") return entry;
        const symbolKey = entry.symbol.toUpperCase();
        const hours = binanceInfo.get(symbolKey) ?? 8;
        const eightHourRate = typeof entry.rate === "number" ? entry.rate * (8 / hours) : entry.rate;
        return { ...entry, rate: eightHourRate } as typeof entry;
      });

      setState({ rates: normalized, error: null, isRefreshing: false, lastUpdated: new Date() });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: (error as Error).message,
        isRefreshing: false,
      }));
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await pull();
    };

    void tick();
    const interval = setInterval(tick, LIGHTER_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pull]);

  return state;
};
