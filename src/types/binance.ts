export interface BinanceFundingInfoEntry {
  symbol: string;
  adjustedFundingRateCap?: string;
  adjustedFundingRateFloor?: string;
  fundingIntervalHours: number;
  disclaimer?: boolean;
  updateTime?: number;
}

export type BinanceFundingInfoResponse = BinanceFundingInfoEntry[];

export interface BinancePremiumIndexEntry {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  estimatedSettlePrice: string;
  lastFundingRate: string;
  interestRate: string;
  nextFundingTime: number;
  time: number;
}

export type BinancePremiumIndexResponse = BinancePremiumIndexEntry[];

export interface BinanceTicker {
  symbol: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}
