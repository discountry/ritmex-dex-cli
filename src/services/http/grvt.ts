import type { GrvtFundingPoint, GrvtFundingResponse, GrvtInstrument, GrvtInstrumentResponse } from "../../types/grvt";

const GRVT_BASE_URL = "https://market-data.grvt.io/full/v1";
const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function fetchGrvtInstruments(): Promise<GrvtInstrument[]> {
  const response = await fetch(`${GRVT_BASE_URL}/instruments`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      kind: ["PERPETUAL"],
      quote: ["USDT"],
      is_active: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`GRVT instruments request failed: ${response.status}`);
  }

  const payload = (await response.json()) as GrvtInstrumentResponse;
  return payload.result ?? [];
}

export async function fetchGrvtFundingPoint(instrument: string): Promise<GrvtFundingPoint | null> {
  const response = await fetch(`${GRVT_BASE_URL}/funding`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      instrument,
      limit: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`GRVT funding request failed for ${instrument}: ${response.status}`);
  }

  const payload = (await response.json()) as GrvtFundingResponse;
  return payload.result?.[0] ?? null;
}
