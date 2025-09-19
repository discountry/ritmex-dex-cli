import { useEffect, useRef, useState } from "react";
import { fetchEdgexMetadata } from "../services/http/edgex";
import { METADATA_REFRESH_MS } from "../utils/constants";
import type { EdgexMetaContract } from "../types/edgex";

interface MetadataState {
  contracts: EdgexMetaContract[];
  error: string | null;
  isLoading: boolean;
}

const initialState: MetadataState = {
  contracts: [],
  error: null,
  isLoading: true,
};

export const useMetadata = (): MetadataState => {
  const [state, setState] = useState<MetadataState>(initialState);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const pull = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const allContracts = await fetchEdgexMetadata();
        if (cancelled) return;

        const eligible = allContracts.filter(
          (contract) => contract.enableTrade && contract.enableDisplay && contract.enableOpenPosition
        );

        setState({ contracts: eligible, error: null, isLoading: false });
      } catch (error) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: (error as Error).message,
          isLoading: false,
        }));
      } finally {
        inFlightRef.current = false;
      }
    };

    void pull();
    const interval = setInterval(pull, METADATA_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
};
