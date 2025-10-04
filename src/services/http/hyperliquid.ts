import type {
  HyperliquidPredictedFundingsResponse,
  HyperliquidPredictedFundingsTuple,
  HyperliquidPredictedFundingPoint,
} from "../../types/hyperliquid";
import { convertHyperliquidSymbol } from "../../utils/format";

const HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info";

export interface HyperliquidRateEntry {
  symbol: string; // uppercase base, e.g. BTC, ETH
  rate: number; // decimal per 8h (normalized by caller)
  venue: string; // e.g., HlPerp
  fundingIntervalHours: number;
}

export async function fetchHyperliquidPredictedFundings(): Promise<HyperliquidPredictedFundingsResponse> {
  const response = await fetch(HYPERLIQUID_INFO_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "predictedFundings" }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid predictedFundings failed: ${response.status}`);
  }

  const payload = (await response.json()) as HyperliquidPredictedFundingsResponse;
  return payload ?? [];
}

export function mapHlPerpToEntries(
  predicted: HyperliquidPredictedFundingsResponse
): HyperliquidRateEntry[] {
  const result: HyperliquidRateEntry[] = [];

  predicted.forEach((tuple: HyperliquidPredictedFundingsTuple) => {
    const [symbol, venues] = tuple;
    // Convert symbol from internal format (kBONK) to standard format (1000BONK)
    const normalizedSymbol = convertHyperliquidSymbol(symbol);
    if (!Array.isArray(venues)) return;

    for (const [venue, point] of venues) {
      if (venue !== "HlPerp") continue;
      const p: HyperliquidPredictedFundingPoint | undefined = point;
      if (!p) continue;

      const raw = Number(p.fundingRate);
      if (!Number.isFinite(raw)) continue;
      result.push({ symbol: normalizedSymbol, rate: raw, venue, fundingIntervalHours: p.fundingIntervalHours });
      break; // one HlPerp per symbol
    }
  });

  return result;
}


