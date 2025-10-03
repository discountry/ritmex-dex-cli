export interface BackpackMarkPriceEntry {
  fundingRate?: string | number;
  indexPrice?: string | number;
  markPrice?: string | number;
  nextFundingTimestamp?: number;
  symbol: string; // e.g. AAVE_USDC_PERP
}

export type BackpackMarkPriceResponse = BackpackMarkPriceEntry[];

export interface BackpackFundingEntry {
  symbol: string; // normalized, e.g. AAVE
  rate: number; // eight-hour funding rate in decimals (e.g. 0.001 == 0.1%)
}


