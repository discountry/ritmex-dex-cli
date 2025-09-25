import type {
  AsterFundingEntry,
  AsterFundingInfoEntry,
  AsterFundingInfoResponse,
  AsterPremiumIndexEntry,
  AsterPremiumIndexResponse,
} from "../../types/aster";
import { normaliseSymbol } from "../../utils/format";

const ASTER_PREMIUM_INDEX_URL = "https://fapi.asterdex.com/fapi/v1/premiumIndex";
const ASTER_FUNDING_INFO_URL = "https://fapi.asterdex.com/fapi/v1/fundingInfo";
const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function fetchAsterPremiumIndex(): Promise<AsterPremiumIndexEntry[]> {
  const response = await fetch(ASTER_PREMIUM_INDEX_URL, { headers: JSON_HEADERS });
  if (!response.ok) {
    throw new Error(`Aster premiumIndex request failed: ${response.status}`);
  }
  const payload = (await response.json()) as AsterPremiumIndexResponse;
  return Array.isArray(payload) ? payload : [];
}

export async function fetchAsterFundingInfo(): Promise<AsterFundingInfoEntry[]> {
  const response = await fetch(ASTER_FUNDING_INFO_URL, { headers: JSON_HEADERS });
  if (!response.ok) {
    throw new Error(`Aster fundingInfo request failed: ${response.status}`);
  }
  const payload = (await response.json()) as AsterFundingInfoResponse;
  return Array.isArray(payload) ? payload : [];
}

export async function fetchAsterFundingRates(): Promise<AsterFundingEntry[]> {
  const [premiumList, infoList] = await Promise.all([
    fetchAsterPremiumIndex(),
    fetchAsterFundingInfo(),
  ]);

  const intervalMap = new Map<string, number>();
  infoList.forEach((entry) => {
    const key = normaliseSymbol(entry.symbol);
    intervalMap.set(key, entry.fundingIntervalHours);
  });

  return premiumList
    .map((item) => {
      const raw = item.lastFundingRate ?? undefined;
      const value = raw !== undefined ? Number(raw) : NaN;
      if (!Number.isFinite(value)) return null;
      const symbol = normaliseSymbol(item.symbol);
      const hours = intervalMap.get(symbol) ?? 8;
      const eightHourRate = value * (8 / hours);
      return { symbol, rate: eightHourRate } as AsterFundingEntry;
    })
    .filter((v): v is AsterFundingEntry => v !== null);
}


