export interface TableRow {
  contractId?: string;
  symbol: string;
  contractName: string;
  fundingRateIntervalMin: number | null;
  fundingInterestRate: number | null;
  lighterFunding?: number;
  edgexFunding?: number;
  arb?: number;
}

export interface FundingSnapshot {
  rows: TableRow[];
  lastUpdated: string;
}

export type SortKey = keyof Pick<TableRow, "symbol" | "lighterFunding" | "edgexFunding" | "arb">;
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export type DisplayRow = Record<SortKey, string>;
