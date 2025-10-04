import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBinancePremiumIndex, fetchBinanceFundingInfo } from "../services/http/binance";
import { LIGHTER_REFRESH_MS } from "../utils/constants";

interface BinanceFundingEntry {
  symbol: string;
  rate: number;
  intervalHours: number;
}

interface BinanceFundingState {
  rates: BinanceFundingEntry[];
  error: string | null;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

const initialState: BinanceFundingState = {
  rates: [],
  error: null,
  isRefreshing: false,
  lastUpdated: null,
};

export const useBinanceFunding = (): BinanceFundingState => {
  const [state, setState] = useState<BinanceFundingState>(initialState);
  const inFlightRef = useRef(false);

  const pull = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      const [premiumIndexData, fundingInfoData] = await Promise.all([
        fetchBinancePremiumIndex(),
        fetchBinanceFundingInfo(),
      ]);

      // Create funding interval map
      const intervalMap = fundingInfoData;

      // Process premium index data - only include entries where nextFundingTime > 0
      const filteredRates = premiumIndexData
        .filter((entry) => entry.nextFundingTime > 0 && entry.lastFundingRate !== "0.00000000")
        .map((entry) => {
          const fundingRate = parseFloat(entry.lastFundingRate);
          const intervalHours = intervalMap.get(entry.symbol.toUpperCase()) ?? 8;
          
          // Normalize rate to 8-hour equivalent
          const normalizedRate = fundingRate * (8 / intervalHours);
          
          return {
            symbol: entry.symbol,
            rate: normalizedRate,
            intervalHours,
          } as BinanceFundingEntry;
        });

      
      setState({ 
        rates: filteredRates, 
        error: null, 
        isRefreshing: false, 
        lastUpdated: new Date() 
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
