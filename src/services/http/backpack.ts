import type { BackpackFundingEntry, BackpackMarkPriceResponse } from "../../types/backpack";
import { normaliseSymbol, parseNumber } from "../../utils/format";

const BACKPACK_MARK_PRICES_URL = "https://api.backpack.exchange/api/v1/markPrices";
const JSON_HEADERS = { Accept: "application/json", "Content-Type": "application/json" };

export async function fetchBackpackFundingRates(): Promise<BackpackFundingEntry[]> {
  const response = await fetch(BACKPACK_MARK_PRICES_URL, { headers: JSON_HEADERS });
  if (!response.ok) {
    throw new Error(`Backpack markPrices request failed: ${response.status}`);
  }

  const payload = (await response.json()) as BackpackMarkPriceResponse;
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => {
      const rawRate = parseNumber(item.fundingRate ?? undefined);
      if (rawRate === null || !Number.isFinite(rawRate)) return null;
      // Backpack example shows hourly rate, we need 8h rate => multiply by 8
      const eightHourRate = rawRate * 8;
      // Backpack symbols are like AAVE_USDC_PERP. We want base symbol (e.g., AAVE)
      const symbol = item.symbol.replace(/_USDC_PERP$/i, "").toUpperCase();
      return { symbol, rate: eightHourRate } as BackpackFundingEntry;
    })
    .filter((v): v is BackpackFundingEntry => v !== null);
}


