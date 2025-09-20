import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchGrvtFundingPoint, fetchGrvtInstruments } from "../services/http/grvt";
import { FETCH_GAP_MS, LIGHTER_REFRESH_MS } from "../utils/constants";
import { delay } from "../utils/time";
import type { GrvtInstrument } from "../types/grvt";

interface GrvtFundingState {
  instruments: GrvtInstrument[];
  data: Record<string, number>;
  error: string | null;
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
}

const normaliseBase = (instrument: GrvtInstrument) => instrument.base.toUpperCase();

export const useGrvtFunding = (): GrvtFundingState => {
  const [instruments, setInstruments] = useState<GrvtInstrument[]>([]);
  const [data, setData] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchLockRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadInstruments = async () => {
      try {
        const result = await fetchGrvtInstruments();
        if (cancelled) return;
        setInstruments(result);
        setError(null);
      } catch (requestError) {
        if (cancelled) return;
        setError((requestError as Error).message);
      }
    };

    void loadInstruments();

    return () => {
      cancelled = true;
    };
  }, []);

  const instrumentMemo = useMemo(() => instruments, [instruments]);

  const pull = useCallback(async () => {
    if (!instrumentMemo.length || fetchLockRef.current) return;

    fetchLockRef.current = true;
    setIsRefreshing(true);

    const next: Record<string, number> = {};
    let lastError: string | null = null;

    for (let index = 0; index < instrumentMemo.length; index += 1) {
      const instrument = instrumentMemo[index];
      if (!instrument) continue;
      try {
        const fundingPoint = await fetchGrvtFundingPoint(instrument.instrument);
        if (fundingPoint) {
          const value =
            fundingPoint.funding_rate_8_h_avg ?? fundingPoint.funding_rate ?? null;

          if (value !== null && Number.isFinite(Number(value))) {
            // GRVT already returns decimal rates; do not rescale
            next[normaliseBase(instrument)] = Number(value / 100);
          }
        }
      } catch (requestError) {
        lastError = (requestError as Error).message;
      }

      if (index < instrumentMemo.length - 1) {
        await delay(FETCH_GAP_MS);
      }
    }

    setData(next);
    setError(lastError);
    setIsRefreshing(false);
    fetchLockRef.current = false;
  }, [instrumentMemo]);

  useEffect(() => {
    if (!instrumentMemo.length) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await pull();
    };

    void run();
    const interval = setInterval(run, LIGHTER_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [instrumentMemo, pull]);

  return {
    instruments,
    data,
    error,
    isRefreshing,
    refreshAll: pull,
  };
};
