import type {
  BinanceFundingInfoEntry,
  BinanceFundingInfoResponse,
  BinancePremiumIndexEntry,
  BinancePremiumIndexResponse,
  BinanceTicker,
} from "../../types/binance";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const BINANCE_FUNDING_INFO_URL = "https://fapi.binance.com/fapi/v1/fundingInfo";
const BINANCE_PREMIUM_INDEX_URL = "https://fapi.binance.com/fapi/v1/premiumIndex";
const BINANCE_USDT_TICKERS_URL =
  "https://api.binance.com/api/v3/ticker/24hr?symbolStatus=TRADING&type=MINI";

const isUsdTPair = (symbol: string): boolean => symbol.toUpperCase().endsWith("USDT");

export async function fetchBinanceFundingInfo(): Promise<Map<string, number>> {
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
  const response = await fetch(BINANCE_PREMIUM_INDEX_URL, { headers: DEFAULT_HEADERS });

  if (!response.ok) {
    throw new Error(`Binance premiumIndex request failed: ${response.status}`);
  }

  const payload = (await response.json()) as BinancePremiumIndexResponse;
  return Array.isArray(payload) ? payload : [];
}

export async function fetchBinanceUsdtPairs(): Promise<Set<string>> {
  const response = await fetch(BINANCE_USDT_TICKERS_URL, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Binance USDT lookup failed: ${response.status}`);
  }

  const payload = (await response.json()) as BinanceTicker[];
  if (!Array.isArray(payload)) {
    throw new Error("Binance USDT lookup returned unexpected data");
  }

  return new Set(
    payload
      .filter((ticker) => typeof ticker.symbol === "string" && isUsdTPair(ticker.symbol))
      .map((ticker) => ticker.symbol.toUpperCase())
  );
}
