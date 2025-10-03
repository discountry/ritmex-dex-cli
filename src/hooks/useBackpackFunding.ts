import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBackpackFundingRates } from "../services/http/backpack";
import type { BackpackFundingEntry } from "../types/backpack";
import { ASTER_REFRESH_MS } from "../utils/constants";

interface BackpackFundingState {
  rates: BackpackFundingEntry[];
  error: string | null;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

const initialState: BackpackFundingState = {
  rates: [],
  error: null,
  isRefreshing: false,
  lastUpdated: null,
};

export const useBackpackFunding = (): BackpackFundingState => {
  const [state, setState] = useState<BackpackFundingState>(initialState);
  const inFlightRef = useRef(false);

  const pull = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      const result = await fetchBackpackFundingRates();
      setState({ rates: result, error: null, isRefreshing: false, lastUpdated: new Date() });
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
    const interval = setInterval(tick, ASTER_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pull]);

  return state;
};


