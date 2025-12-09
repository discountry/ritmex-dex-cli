import type { LighterFundingEntry, LighterFundingResponse } from "../../types/lighter";

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
  const entries = payload.funding_rates ?? [];
  return entries;
}
