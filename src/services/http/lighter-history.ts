import { fetchLighterFundingRates } from "./lighter";
import { LIGHTER_EXCLUDED_SYMBOLS } from "../../utils/constants";
import type { LighterFundingHistoryResponse, LighterFundingPoint, LighterMarket } from "../../types/lighter-history";
import type { LighterFundingEntry } from "../../types/lighter";

const LIGHTER_FUNDINGS_URL = "https://mainnet.zklighter.elliot.ai/api/v1/fundings";
const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export interface FundingHistoryParams {
  marketId: number;
  resolution?: "1h" | "1d";
  startTimestamp: number;
  endTimestamp: number;
  countBack?: number;
}

export async function fetchLighterMarkets(): Promise<LighterMarket[]> {
  const entries = await fetchLighterFundingRates();
  return entries
    .filter(
      (entry): entry is LighterFundingEntry =>
        entry.exchange === "lighter" && Number.isFinite(entry.market_id) && typeof entry.symbol === "string"
    )
    .map((entry) => ({
      marketId: entry.market_id,
      symbol: entry.symbol.toUpperCase(),
      currentRate: typeof entry.rate === "number" ? entry.rate : null,
    }))
    .filter((entry) => !LIGHTER_EXCLUDED_SYMBOLS.has(entry.symbol));
}

export async function fetchLighterFundingHistory({
  marketId,
  resolution = "1h",
  startTimestamp,
  endTimestamp,
  countBack = 168,
}: FundingHistoryParams): Promise<LighterFundingPoint[]> {
  const url = new URL(LIGHTER_FUNDINGS_URL);
  url.searchParams.set("market_id", String(marketId));
  url.searchParams.set("resolution", resolution);
  url.searchParams.set("start_timestamp", String(Math.floor(startTimestamp)));
  url.searchParams.set("end_timestamp", String(Math.floor(endTimestamp)));
  url.searchParams.set("count_back", String(countBack));

  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Lighter funding history failed for ${marketId}: ${response.status}`);
  }

  const payload = (await response.json()) as LighterFundingHistoryResponse;
  return Array.isArray(payload.fundings) ? payload.fundings : [];
}
