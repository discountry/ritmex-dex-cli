export const LIGHTER_REFRESH_MS = 5 * 60 * 1000; // every 5 minutes
export const FETCH_GAP_MS = 500; // avoid rate limiting between sequential contract requests
export const DISPLAY_LIMIT = 10;
export const ASTER_REFRESH_MS = 5 * 60 * 1000; // every 5 minutes
export const LIGHTER_HISTORY_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
export const LIGHTER_HISTORY_FETCH_GAP_MS = 1200; // stay under 60 req/min
export const LIGHTER_HISTORY_REFRESH_MS = 10 * 60 * 1000; // refresh every 10 minutes
export const LIGHTER_HISTORY_COUNT_BACK = 0; // align with web client: let server return the latest window
export const LIGHTER_HISTORY_CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours
export const LIGHTER_HISTORY_DISPLAY_LIMIT = 15;

export const LIGHTER_EXCLUDED_SYMBOLS = new Set<string>([
  // Stocks
  "COIN",
  "HOOD",
  "NVDA",
  "TSLA",
  "PLTR",
  "GOOGL",
  "META",
  "AAPL",
  "MSFT",
  "AMZN",
  // FX pairs
  "EURUSD",
  "GBPUSD",
  "USDCAD",
  "USDCHF",
  "USDJPY",
  "USDKRW",
  "AUDUSD",
  "NZDUSD",
  // Metals
  "XAU",
  "XAG",
]);
