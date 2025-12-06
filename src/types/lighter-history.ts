export interface LighterMarket {
  marketId: number;
  symbol: string;
  currentRate: number | null;
}

export interface LighterFundingPoint {
  timestamp: number;
  value: string;
  rate: string;
  direction: string;
}

export interface LighterFundingHistoryResponse {
  code: number;
  message?: string;
  resolution: string;
  fundings: LighterFundingPoint[];
}

export interface LighterHistoryRow {
  marketId: number;
  symbol: string;
  currentRate: number | null;
  averageRate: number | null;
  series: number[];
  sevenDayRate: number | null;
  sevenDayProfit: number | null;
  annualizedRate: number | null;
}

export type LighterHistorySortKey =
  | "symbol"
  | "currentRate"
  | "averageRate"
  | "sevenDayRate"
  | "sevenDayProfit"
  | "annualizedRate";

export interface LighterHistorySnapshot {
  rows: LighterHistoryRow[];
  lastUpdated: string;
}
