import type { BinanceFundingInfoEntry, BinanceFundingInfoResponse, BinancePremiumIndexEntry, BinancePremiumIndexResponse } from "../../types/binance";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function fetchBinanceFundingInfo(): Promise<Map<string, number>> {
  const BINANCE_FUNDING_INFO_URL = "https://fapi.binance.com/fapi/v1/fundingInfo";
  const response = await fetch(BINANCE_FUNDING_INFO_URL, { headers: DEFAULT_HEADERS });
  
  if (!response.ok) {
    throw new Error(`Binance fundingInfo request failed: ${response.status}`);
  }
  
  const payload = (await response.json()) as BinanceFundingInfoResponse;
  const intervalMap = new Map<string, number>();
  
  if (Array.isArray(payload)) {
    payload.forEach((entry) => {
      if (!entry?.symbol || typeof entry.fundingIntervalHours !== "number") return;
      intervalMap.set(entry.symbol.toUpperCase(), entry.fundingIntervalHours);
    });
  }
  
  return intervalMap;
}

export async function fetchBinancePremiumIndex(): Promise<BinancePremiumIndexEntry[]> {
  const BINANCE_PREMIUM_INDEX_URL = "https://fapi.binance.com/fapi/v1/premiumIndex";
  const response = await fetch(BINANCE_PREMIUM_INDEX_URL, { headers: DEFAULT_HEADERS });
  
  if (!response.ok) {
    throw new Error(`Binance premiumIndex request failed: ${response.status}`);
  }
  
  const payload = (await response.json()) as BinancePremiumIndexResponse;
  return Array.isArray(payload) ? payload : [];
}
