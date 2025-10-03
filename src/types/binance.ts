export interface BinanceFundingInfoEntry {
  symbol: string;
  adjustedFundingRateCap?: string;
  adjustedFundingRateFloor?: string;
  fundingIntervalHours: number;
  disclaimer?: boolean;
  updateTime?: number;
}

export type BinanceFundingInfoResponse = BinanceFundingInfoEntry[];


