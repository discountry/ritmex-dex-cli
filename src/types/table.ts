export interface TableRow {
  contractId?: string;
  symbol: string;
  contractName: string;
  fundingRateIntervalMin: number | null;
  fundingInterestRate: number | null;
  lighterFunding?: number;
  edgexFunding?: number;
  grvtFunding?: number;
  asterFunding?: number;
  lighterEdgexArb?: number;
  lighterGrvtArb?: number;
  edgexGrvtArb?: number;
  lighterAsterArb?: number;
  edgexAsterArb?: number;
  grvtAsterArb?: number;
}

export interface FundingSnapshot {
  rows: TableRow[];
  lastUpdated: string;
}

export type SortKey = keyof Pick<
  TableRow,
  | "symbol"
  | "lighterFunding"
  | "edgexFunding"
  | "grvtFunding"
  | "asterFunding"
  | "lighterEdgexArb"
  | "lighterGrvtArb"
  | "edgexGrvtArb"
  | "lighterAsterArb"
  | "edgexAsterArb"
  | "grvtAsterArb"
>;
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export type DisplayRow = Record<SortKey, string>;

export interface SpreadEntry {
  symbol: string;
  diff: number;
  high: {
    exchange: string;
    rate: number;
  };
  low: {
    exchange: string;
    rate: number;
  };
  estimated24hProfit: number;
}
