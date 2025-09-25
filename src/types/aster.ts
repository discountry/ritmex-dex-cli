export interface AsterPremiumIndexEntry {
  symbol: string; // e.g. INJUSDT, BTCUSD
  markPrice?: string;
  indexPrice?: string;
  estimatedSettlePrice?: string;
  lastFundingRate?: string; // decimal string, e.g. "0.00010000" (8h)
  interestRate?: string;
  nextFundingTime?: number; // ms epoch
  time?: number; // ms epoch
}

export type AsterPremiumIndexResponse = AsterPremiumIndexEntry[];

export interface AsterFundingInfoEntry {
  symbol: string;
  interestRate?: string;
  time?: number; // ms epoch
  fundingIntervalHours: number; // e.g. 8 by default, can vary per symbol
  fundingFeeCap?: number | null;
  fundingFeeFloor?: number | null;
}

export type AsterFundingInfoResponse = AsterFundingInfoEntry[];

export interface AsterFundingEntry {
  symbol: string; // Base symbol or pair as returned by API
  rate: number; // decimal (e.g. 0.0001 for 0.01%)
}


