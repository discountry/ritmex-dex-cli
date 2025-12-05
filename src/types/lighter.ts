export interface LighterFundingEntry {
  market_id: number;
  exchange: string;
  symbol: string;
  rate: number;
  type?: string;
}

export interface LighterFundingResponse {
  code: number;
  funding_rates: LighterFundingEntry[];
}
