export interface EdgexTickerEntry {
  contractId: string;
  contractName: string;
  openInterest?: string;
  fundingRate?: string;
  fundingTime?: string;
  nextFundingTime?: string;
  lastPrice?: string;
}

export interface EdgexQuoteEventMessage {
  type: "quote-event";
  channel: string;
  content: {
    channel: string;
    dataType: string;
    data: EdgexTickerEntry[];
  };
}

export interface EdgexPingMessage {
  type: "ping";
  time: string;
}

export type EdgexWsMessage =
  | EdgexPingMessage
  | EdgexQuoteEventMessage
  | {
      type: "subscribed" | "pong" | "error" | string;
      channel?: string;
      request?: string;
      content?: unknown;
      time?: string;
    };

export interface EdgexFundingEntry {
  contractId: string;
  contractName: string;
  openInterest: number;
  fundingRate: number;
  fundingRateTime?: string;
}
