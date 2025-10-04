import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLighterFundingRates } from "../services/http/lighter";
import { fetchHyperliquidPredictedFundings, mapHlPerpToEntries } from "../services/http/hyperliquid";
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
      const [rates, hlPredicted] = await Promise.all([
        fetchLighterFundingRates(),
        fetchHyperliquidPredictedFundings().catch(() => []),
      ]);

      const hlEntries = mapHlPerpToEntries(hlPredicted).map((e) => ({
        market_id: -1,
        exchange: "hyperliquid",
        symbol: e.symbol,
        rate: e.rate,
      })) as LighterFundingEntry[];

      const normalized = [...rates, ...hlEntries].map((entry) => {
        if (entry.exchange === "hyperliquid") {
          // Hyperliquid funds hourly; normalize to 8h equivalent
          const eightHourRate = typeof entry.rate === "number" ? entry.rate * 8 : entry.rate;
          return { ...entry, rate: eightHourRate } as typeof entry;
        }

        return entry;
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
