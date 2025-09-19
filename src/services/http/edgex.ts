import type { EdgexFundingPoint, EdgexFundingResponse, EdgexMetaContract, EdgexMetaResponse } from "../../types/edgex";

const EDGEX_METADATA_URL = "https://pro.edgex.exchange/api/v1/public/meta/getMetaData";
const EDGEX_FUNDING_URL = "https://pro.edgex.exchange/api/v1/public/funding/getLatestFundingRate";
const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function fetchEdgexMetadata(): Promise<EdgexMetaContract[]> {
  const response = await fetch(EDGEX_METADATA_URL, { headers: DEFAULT_HEADERS });

  if (!response.ok) {
    throw new Error(`Metadata request failed: ${response.status}`);
  }

  const payload = (await response.json()) as EdgexMetaResponse;
  const contracts = payload?.data?.contractList;

  if (!Array.isArray(contracts)) {
    throw new Error("Metadata response missing contractList");
  }

  return contracts;
}

export async function fetchEdgexFundingPoint(contractId: string): Promise<EdgexFundingPoint | null> {
  const url = `${EDGEX_FUNDING_URL}?contractId=${contractId}`;
  const response = await fetch(url, { headers: DEFAULT_HEADERS });

  if (!response.ok) {
    throw new Error(`Funding request failed for ${contractId}: ${response.status}`);
  }

  const payload = (await response.json()) as EdgexFundingResponse;
  return payload.data?.[0] ?? null;
}
