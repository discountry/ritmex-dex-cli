import type { LighterFundingEntry, LighterFundingResponse } from "../../types/lighter";
import type { BinanceFundingInfoEntry } from "../../types/binance";

const LIGHTER_FUNDING_URL = "https://mainnet.zklighter.elliot.ai/api/v1/funding-rates";
const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function fetchLighterFundingRates(): Promise<LighterFundingEntry[]> {
  const response = await fetch(LIGHTER_FUNDING_URL, { headers: DEFAULT_HEADERS });

  if (!response.ok) {
    throw new Error(`Lighter funding request failed: ${response.status}`);
  }

  const payload = (await response.json()) as LighterFundingResponse;
  // Return all exchanges (e.g., lighter, binance). Filtering will be handled upstream.
  const entries = payload.funding_rates ?? [];
  return entries;
}

const BINANCE_FUNDING_INFO_URL = "https://fapi.binance.com/fapi/v1/fundingInfo";

export async function fetchBinanceFundingInfo(): Promise<Map<string, number>> {
  const response = await fetch(BINANCE_FUNDING_INFO_URL, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Binance fundingInfo request failed: ${response.status}`);
  }
  const payload = (await response.json()) as BinanceFundingInfoEntry[];
  const intervalMap = new Map<string, number>();
  if (Array.isArray(payload)) {
    payload.forEach((entry) => {
      if (!entry?.symbol || typeof entry.fundingIntervalHours !== "number") return;
      intervalMap.set(entry.symbol.toUpperCase(), entry.fundingIntervalHours);
    });
  }
  return intervalMap;
}
