export interface GrvtInstrument {
  instrument: string;
  instrument_hash: string;
  base: string;
  quote: string;
  kind: string;
  is_active?: boolean;
}

export interface GrvtInstrumentResponse {
  result: GrvtInstrument[];
}

export interface GrvtFundingPoint {
  instrument: string;
  funding_rate?: number;
  funding_rate_8_h_avg?: number;
  funding_time?: string;
}

export interface GrvtFundingResponse {
  result: GrvtFundingPoint[];
}
