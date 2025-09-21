import { useCallback, useEffect, useRef, useState } from "react";
import { parseNumber } from "../utils/format";
import type { EdgexFundingEntry, EdgexQuoteEventMessage, EdgexWsMessage } from "../types/edgex";

const EDGEX_WS_ENDPOINT = "wss://quote.edgex.exchange/api/v1/public/ws";
const EDGEX_TICKER_CHANNEL = "ticker.all.1s";
const MIN_NOTIONAL = 10_000;
const RECONNECT_DELAY_MS = 5_000;

export interface EdgexFundingState {
  data: Record<string, EdgexFundingEntry>;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate: number | null;
}

const DECODER = new TextDecoder();

const parseEventData = (eventData: unknown): EdgexWsMessage | null => {
  if (!eventData) return null;
  try {
    if (typeof eventData === "string") {
      return JSON.parse(eventData) as EdgexWsMessage;
    }

    if (eventData instanceof ArrayBuffer) {
      const text = DECODER.decode(eventData);
      return JSON.parse(text) as EdgexWsMessage;
    }

    return JSON.parse(String(eventData)) as EdgexWsMessage;
  } catch (error) {
    console.error("Failed to parse edgeX websocket payload", error);
    return null;
  }
};

export const useEdgexFunding = (): EdgexFundingState => {
  const [data, setData] = useState<Record<string, EdgexFundingEntry>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const clearReconnectTimer = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const handleMessage = useCallback(
    (message: EdgexWsMessage | null) => {
      if (!message) return;

      if (message.type === "ping") {
        const time = (message.time ?? String(Date.now())) as string;
        socketRef.current?.send(JSON.stringify({ type: "pong", time }));
        return;
      }

      if (message.type === "error") {
        const details =
          typeof message.content === "string"
            ? message.content
            : typeof message.content === "object" && message.content !== null
            ? JSON.stringify(message.content)
            : "edgeX websocket returned an error";
        setError(details);
        return;
      }

      if (message.type !== "quote-event") {
        return;
      }

      const quoteMessage = message as EdgexQuoteEventMessage;
      if (quoteMessage.channel !== EDGEX_TICKER_CHANNEL) {
        return;
      }

      const content = quoteMessage.content;
      if (!content || !Array.isArray(content.data)) {
        return;
      }

      const dataType = typeof content.dataType === "string" ? content.dataType.toLowerCase() : "";
      const isSnapshot = dataType === "snapshot";
      const entries = content.data;

      if (!entries.length && !isSnapshot) {
        return;
      }

      const updates: Record<string, EdgexFundingEntry> = {};
      const removals = new Set<string>();

      entries.forEach((entry) => {
        if (!entry?.contractId || !entry.contractName) return;

        const openInterest = parseNumber(entry.openInterest ?? undefined);
        const fundingRate = parseNumber(entry.fundingRate ?? undefined);
        const lastPrice = parseNumber(entry.lastPrice ?? undefined);

        const notional =
          openInterest !== null && lastPrice !== null ? openInterest * lastPrice : Number.NaN;

        if (
          openInterest === null ||
          lastPrice === null ||
          !Number.isFinite(openInterest) ||
          !Number.isFinite(lastPrice) ||
          !Number.isFinite(notional) ||
          notional < MIN_NOTIONAL
        ) {
          removals.add(entry.contractId);
          return;
        }

        if (fundingRate === null || !Number.isFinite(fundingRate)) {
          removals.add(entry.contractId);
          return;
        }

        const eightHourRate = fundingRate * 2;

        updates[entry.contractId] = {
          contractId: entry.contractId,
          contractName: entry.contractName,
          openInterest,
          fundingRate: eightHourRate,
          fundingRateTime: entry.fundingTime,
        };
      });

      const hasChanges = isSnapshot || Object.keys(updates).length > 0 || removals.size > 0;
      if (!hasChanges) {
        return;
      }

      if (isSnapshot) {
        setData(() => updates);
      } else {
        setData((previous) => {
          const next = { ...previous };
          removals.forEach((id) => {
            delete next[id];
          });
          return { ...next, ...updates };
        });
      }

      setLastUpdate(Date.now());
      setError(null);
    },
    []
  );

  const disposeSocket = useCallback(() => {
    clearReconnectTimer();
    const socket = socketRef.current;
    if (socket) {
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }
    socketRef.current = null;
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return;
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectRef.current();
    }, RECONNECT_DELAY_MS);
  }, []);

  const connect = useCallback(() => {
    connectRef.current = connect;
    if (typeof WebSocket === "undefined") {
      setError("WebSocket is not supported in this environment");
      setIsConnected(false);
      setIsConnecting(false);
      return;
    }

    disposeSocket();
    clearReconnectTimer();

    try {
      setIsConnecting(true);
      setIsConnected(false);
      const socket = new WebSocket(`${EDGEX_WS_ENDPOINT}?timestamp=${Date.now()}`);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        setError(null);
        socket.send(JSON.stringify({ type: "subscribe", channel: EDGEX_TICKER_CHANNEL }));
      };

      socket.onmessage = (event) => {
        const parsed = parseEventData(event.data);
        handleMessage(parsed);
      };

      socket.onerror = () => {
        setError("edgeX websocket connection failed");
      };

      socket.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        scheduleReconnect();
      };
    } catch (connectionError) {
      console.error("Failed to establish edgeX websocket", connectionError);
      setError("Failed to establish edgeX websocket connection");
      setIsConnected(false);
      setIsConnecting(false);
      scheduleReconnect();
    }
  }, [disposeSocket, handleMessage, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      clearReconnectTimer();
      disposeSocket();
    };
  }, [connect, disposeSocket]);

  return {
    data,
    error,
    isConnected,
    isConnecting,
    lastUpdate,
  };
};
