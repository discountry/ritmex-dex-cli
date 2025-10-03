export type HyperliquidVenue =
  | "BinPerp"
  | "HlPerp"
  | "BybitPerp"
  | string;

export interface HyperliquidPredictedFundingPoint {
  fundingRate: string; // decimal string, e.g. "-0.00019328"
  nextFundingTime: number; // epoch ms
  fundingIntervalHours: number; // e.g. 1, 4
}

// [symbol, [[venue, point], ...]]
export type HyperliquidPredictedFundingsTuple = [
  string,
  [HyperliquidVenue, HyperliquidPredictedFundingPoint][]
];

export interface HyperliquidPredictedFundingsResponse extends Array<HyperliquidPredictedFundingsTuple> {}


