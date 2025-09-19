import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchEdgexFundingPoint } from "../services/http/edgex";
import { delay } from "../utils/time";
import { EDGEX_CYCLE_MS, EDGEX_TOP_REFRESH_MS, FETCH_GAP_MS } from "../utils/constants";
import type { EdgexMetaContract, EnrichedFundingPoint } from "../types/edgex";

export type RefreshScope = "idle" | "full" | "partial";

export interface EdgexFundingState {
  data: Record<string, EnrichedFundingPoint>;
  error: string | null;
  isRefreshing: boolean;
  scope: RefreshScope;
  refreshAll: () => Promise<void>;
  refreshContracts: (contracts: EdgexMetaContract[]) => Promise<void>;
  fetchTimestampsRef: React.MutableRefObject<Record<string, number>>;
}

const getMsUntilNextHour = () => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  if (nextHour <= now) {
    nextHour.setHours(nextHour.getHours() + 1);
  }
  return nextHour.getTime() - now.getTime();
};

export const useEdgexFunding = (contracts: EdgexMetaContract[]): EdgexFundingState => {
  const [data, setData] = useState<Record<string, EnrichedFundingPoint>>({});
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scope, setScope] = useState<RefreshScope>("idle");
  const fetchLockRef = useRef(false);
  const fetchTimestampsRef = useRef<Record<string, number>>({});

  const selectionMemo = useMemo(() => contracts, [contracts]);

  const pull = useCallback(
    async (targetContracts?: EdgexMetaContract[]) => {
      const selection = targetContracts && targetContracts.length ? targetContracts : selectionMemo;
      if (!selection.length || fetchLockRef.current) {
        return;
      }

      const isFullRefresh = selection.length === selectionMemo.length;
      setIsRefreshing(true);
      setScope(isFullRefresh ? "full" : "partial");
      fetchLockRef.current = true;

      const now = Date.now();
      const next: Record<string, EnrichedFundingPoint> = {};
      let lastError: string | null = null;

      for (let index = 0; index < selection.length; index += 1) {
        const contract = selection[index];
        if (!contract) continue;
        try {
          const fundingPoint = await fetchEdgexFundingPoint(contract.contractId);
          if (fundingPoint) {
            const forecast = Number(fundingPoint.forecastFundingRate);
            const fallback = Number(fundingPoint.fundingRate);
            const fourHourRate = Number.isFinite(forecast) ? forecast : Number.isFinite(fallback) ? fallback : null;

            if (fourHourRate !== null) {
              const eightHourRate = fourHourRate * 2;
              next[contract.contractId] = {
                ...contract,
                fundingRate: eightHourRate,
                fundingRateTime: fundingPoint.fundingTime,
              };
              fetchTimestampsRef.current[contract.contractId] = now;
            }
          }
        } catch (requestError) {
          lastError = (requestError as Error).message;
        }

        if (index < selection.length - 1) {
          await delay(FETCH_GAP_MS);
        }
      }

      setData((prev) => ({ ...prev, ...next }));
      setError(lastError);
      setIsRefreshing(false);
      setScope("idle");
      fetchLockRef.current = false;
    },
    [selectionMemo]
  );

  useEffect(() => {
    if (!contracts.length) return;

    let cancelled = false;
    let hourlyTimeout: NodeJS.Timeout | null = null;
    let topInterval: NodeJS.Timeout | null = null;

    const scheduleHourlyCycle = (delayMs: number) => {
      if (hourlyTimeout) {
        clearTimeout(hourlyTimeout);
      }

      hourlyTimeout = setTimeout(async () => {
        if (cancelled) return;
        await pull();
        if (!cancelled) {
          scheduleHourlyCycle(EDGEX_CYCLE_MS);
        }
      }, delayMs);
    };

    void pull();
    scheduleHourlyCycle(getMsUntilNextHour());

    topInterval = setInterval(() => {
      void pull();
    }, EDGEX_TOP_REFRESH_MS);

    return () => {
      cancelled = true;
      if (hourlyTimeout) {
        clearTimeout(hourlyTimeout);
      }
      if (topInterval) {
        clearInterval(topInterval);
      }
    };
  }, [contracts, pull]);

  return {
    data,
    error,
    isRefreshing,
    scope,
    refreshAll: () => pull(),
    refreshContracts: (subset) => pull(subset),
    fetchTimestampsRef,
  };
};
