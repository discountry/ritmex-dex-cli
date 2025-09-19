export interface EdgexMetaContract {
  contractId: string;
  contractName: string;
  enableTrade: boolean;
  enableDisplay: boolean;
  enableOpenPosition: boolean;
  fundingRateIntervalMin: string;
  fundingInterestRate: string;
}

export interface EdgexMetaResponse {
  code: string;
  data: {
    contractList: EdgexMetaContract[];
  };
}

export interface EdgexFundingPoint {
  contractId: string;
  fundingRate: string;
  fundingRateIntervalMin: string;
  fundingTime: string;
}

export interface EdgexFundingResponse {
  code: string;
  data: EdgexFundingPoint[];
}

export interface EnrichedFundingPoint extends EdgexMetaContract {
  fundingRate?: number;
  fundingRateTime?: string;
}
