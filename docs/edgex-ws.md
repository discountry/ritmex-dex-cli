# Websocket API

### WebSocket API Documentation

This document outlines the WebSocket API for both private (user account) and public (market data) information.

### (Private WebSocket) User Account Information WebSocket Interface

#### Description

* **01.** Private WebSocket connections do not require subscriptions; data is automatically pushed after a successful connection. This includes both trading messages and custom messages.
* **02.** Trading messages are identified with the type `type-event`. Other message types will be defined separately.
* **03.** The `event` field within the body of a trading message can be one of the following: `Snapshot`, `ACCOUNT_UPDATE`, `DEPOSIT_UPDATE`, `WITHDRAW_UPDATE`, `TRANSFER_IN_UPDATE`, `TRANSFER_OUT_UPDATE`, `ORDER_UPDATE`, `FORCE_WITHDRAW_UPDATE`, `FORCE_TRADE_UPDATE`, `FUNDING_SETTLEMENT`, `ORDER_FILL_FEE_INCOME`, `START_LIQUIDATING`, `FINISH_LIQUIDATING`, or `UNRECOGNIZED`.
* **04.** Ping-Pong Mechanism:
  * **Server Ping (Heartbeat):**
    * After a successful WebSocket connection, the server sends a Ping message at a fixed interval. The message body looks like: `{"type":"ping","time":"1693208170000"}`. The `time` field is the server's timestamp when the Ping was sent.
    * The client must respond with a Pong message upon receipt, with a body like: `{"type":"pong","time":"1693208170000"}`.
    * If the server doesn't receive a Pong response after 5 consecutive Pings, the server will terminate the connection.
  * **Client Ping (Latency Measurement):**
    * After a successful WebSocket connection, the client can also initiate a Ping message with a body like: `{"type":"ping","time":"1693208170000"}`. The `time` field is the client's timestamp when the Ping was sent.
    * The server will immediately respond with a Pong message, with a body like: `{"type":"pong","time":"1693208170000"}`. The `time` field in the Pong will match the `time` field in the client's Ping.
* **05.** Authentication:
  * **Web:**
    * Browsers don't allow custom headers during WebSocket connections, so special handling is required.
    * Use the same authentication logic as HTTP. Create a JSON string using the `X-edgeX-Api-Signature`, `X-edgeX-Api-Timestamp` key-value pairs, for example: `{"X-edgeX-Api-Signature": "00e6b34cf9c3c0ca407cc2fe149fad836206c97201f236137c0e89fd079760470672b5257fa372710b5863d1ec6e0215e5bd6b2c3a319eda88886250a100524706ea3dd81a7fc864893c8c6f674e4a4510c369f939bdc0259a0980dfde882c2d", "X-edgeX-Api-Timestamp": "1705720068228"}`.
    * Base64 encode this JSON string.
    * During the WebSocket request, pass the base64 encoded value in the `SEC_WEBSOCKET_PROTOCOL` header.
  * **App/API:**
    * App/API WebSocket connections can use [custom](https://edgex-1.gitbook.io/edgeX-documentation/authentication#private-api) headers. Therefore, Apps/API can continue using the same authentication logic as HTTP, or they can use the Web authentication method described above.
    * WebSocket is a GET request and there is no need to sign the request body.

#### URL: `/api/v1/private/ws`

**Payload**

```json
{
  // The type for trading messages is "trade-event". Custom messages have their own defined type. "error" indicates an error message sent by the server.
  "type": "trade-event",
  // The body of a trading message has the structure below. The message structure for custom messages will be defined separately by the user.
  "content": {
    // The event that triggered the data update
    "event": "ACCOUNT_UPDATE",
    // Data update version
    "version": "1000",
    // Data
    "data": {
      // Account information
      "account": [
      ],
      // Collateral information
      "collateral": [
      ],
      // Collateral transaction details
      "collateralTransaction": [
      ],
      // Position information
      "position": [
      ],
      // Position transaction details
      "positionTransaction": [
      ],
       // Deposit records
      "deposit": [
      ],
      // Withdrawal records
      "withdraw": [
      ],
      // Transfer in records
      "transferIn": [
      ],
      // Transfer out records
      "transferOut": [
      ],
      // Order information
      "order": [
      ],
      // Trade details
      "orderFillTransaction": [
      ]
    }
  }
}
```

### (Public WebSocket) Market Data WebSocket Interface

#### URL: `/api/v1/public/ws`

#### Description

* **01.** When subscribing or unsubscribing, the server will validate the channel. For invalid channels, the server will respond with an error message, for example: `{"type":"error","content":{"code":"INVALID_CONTRACT_ID""msg":"invalid contractId:100000001"}}`
* **02.** The message structure for subscribing and unsubscribing is: `{"type": "subscribe", "channel": "ticker.10000001"}`.
* **03.** Ping-Pong Mechanism:
  * **Server Ping (Heartbeat):**
    * After a successful WebSocket connection, the server sends a Ping message at a fixed interval. The message body looks like: `{"type":"ping","time":"1693208170000"}`. The `time` field is the server's timestamp when the Ping was sent.
    * The client must respond with a Pong message upon receipt, with a body like: `{"type":"pong","time":"1693208170000"}`.
    * If the server doesn't receive a Pong response after 5 consecutive Pings, the server will terminate the connection.
  * **Client Ping (Latency Measurement):**
    * After a successful WebSocket connection, the client can also initiate a Ping message with a body like: `{"type":"ping","time":"1693208170000"}`. The `time` field is the client's timestamp when the Ping was sent.
    * The server will immediately respond with a Pong message, with a body like: `{"type":"pong","time":"1693208170000"}`. The `time` field in the Pong will match the `time` field in the client's Ping.

#### Subscription Metadata

**Request**

```json
{
  "type": "subscribe",
  "channel": "metadata"
}
```

**Response**

```json
{
  "type": "subscribed",
  "channel": "metadata"
}
```

**Payload**

```json
{
  // error
  "type":  "quote-event",
  "channel": "metadata",
  "content": {
    // snapshot quote-event 
    "dataType": "Snapshot", 
    // 
    "channel": "metadata",
    "data": [
      {
        // Coin information
        "coin": [
        ],
        // Contract information
        "contract": [
        ]
      }
    ]
  }
}
```

#### Subscribe to 24-Hour Market Ticker

**Channel Explanation**

| Channel             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| ticker.{contractId} | Subscribe to the ticker of contract `contractId`         |
| ticker.all          | Subscribe to the ticker of all contracts                 |
| ticker.all.1s       | Subscribe to the ticker of all contracts (periodic push) |

**Request**

```json
{
  "type": "subscribe",
  "channel": "ticker.10000001"
}
```

**Response**

```json
{
  "type": "subscribed",
  "channel": "ticker.10000001"
}
```

**Payload**

```json
{
  "type": "payload",
  "channel": "ticker.10000001",
  "content": {
    "dataType": "Snapshot",
    "channel": "ticker.10000001",
    "data": [
      {
        "contractId": "string",
        "priceChange": "string",
        "priceChangePercent": "string",
        "trades": "string",
        "size": "string",
        "value": "string",
        "high": "string",
        "low": "string",
        "open": "string",
        "close": "string",
        "highTime": "string",
        "lowTime": "string",
        "startTime": "string",
        "endTime": "string",
        "lastPrice": "string"
      }
    ]
  }
}
```

#### Subscribe to K-Line Data

**Channel Explanation**

| Channel                                   | Description                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| kline.{priceType}.{contractId}.{interval} | Subscribe to the `interval` K-Line of contract `contractId` based on `priceType` |

**`priceType` Parameter**

| Value       | Description       |
| ----------- | ----------------- |
| LAST\_PRICE | Last Price K-Line |
| MARK\_PRICE | Mark Price K-Line |

**`interval` Parameter**

| Value      | Description      |
| ---------- | ---------------- |
| MINUTE\_1  | 1-Minute K-Line  |
| MINUTE\_5  | 5-Minute K-Line  |
| MINUTE\_15 | 15-Minute K-Line |
| MINUTE\_30 | 30-Minute K-Line |
| HOUR\_1    | 1-Hour K-Line    |
| HOUR\_2    | 2-Hour K-Line    |
| HOUR\_4    | 4-Hour K-Line    |
| HOUR\_6    | 6-Hour K-Line    |
| HOUR\_8    | 8-Hour K-Line    |
| HOUR\_12   | 12-Hour K-Line   |
| DAY\_1     | Daily K-Line     |
| WEEK\_1    | Weekly K-Line    |
| MONTH\_1   | Monthly K-Line   |

**Request**

```json
{
  "type": "subscribe",
  "channel": "kline.LAST_PRICE.10000001.MINUTE_1"
}
```

**Response**

```json
{
  "type": "subscribed",
  "channel": "kline.LAST_PRICE.10000001.MINUTE_1"
}
```

**Payload**

```json
{
  "type": "payload",
  "channel": "kline.LAST_PRICE.10000001.MINUTE_1",
  "content": {
    "dataType": "Changed",
    "channel": "kline.LAST_PRICE.10000001.MINUTE_1",
    "data": [
      {
        "klineId": "1",
        "contractId": "10000001",
        "klineType": "MINUTE_1",
        "klineTime": "1688365544504",
        "trades": "5",
        "size": "10.1",
        "value": "100000",
        "high": "31200",
        "low": "31000",
        "open": "3150",
        "close": "31010",
        "makerBuySize": "5",
        "makerBuyValue": "150000"
      }
    ]
  }
}
```

#### Subscribe to Order Book

**Usage Instructions**

> After a successful subscription, a full dataset is pushed once initially (`depthType=SNAPSHOT`), and subsequent pushes will be incremental updates (`depthType=CHANGED`).

**Channel Explanation**

| Channel                    | Description                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| depth.{contractId}.{depth} | Subscribe to the order book of contract `contractId` with a depth of `depth` |

**`depth` Parameter**

| Value | Description |
| ----- | ----------- |
| 15    | 15 levels   |
| 200   | 200 levels  |

**Request**

```json
{
  "type": "subscribe",
  "channel": "depth.10000001.15"
}
```

**Response**

```json
{
  "type": "subscribed",
  "channel": "depth.10000001.15"
}
```

**Payload**

```json
{
  "type": "payload",
  "channel": "depth.10000001.15",
  "content": {
    "dataType": "Snapshot",
    "channel": "depth.10000001.15",
    "data": [
      {
        "startVersion": "string",
        "endVersion": "string",
        "level": 0,
        "contractId": "10000001",
        "depthType": "Snapshot", // Data type: SNAPSHOT for full data, CHANGED for incremental data
        "bids": [
          [
            "26092",
            // Price
            "0.9014"
            // Size. A size of 0 indicates a deletion. Positive numbers mean increase. Negative numbers mean decrease.
          ],
          [
            "26091",
            "0.9667"
          ]
        ],
        "asks": [
          [
            "26093",
            "0.964"
          ],
          [
            "26094",
            "1.0213"
          ]
        ]
      }
    ]
  }
}
```

#### Subscribe to Latest Trades

**Channel Explanation**

| Channel             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| trades.{contractId} | Subscribe to the latest trades of contract `contractId` |

**Request**

```json
{
  "type": "subscribe",
  "channel": "trades.10000001"
}
```

**Response**

```json
{
  "type": "subscribed",
  "channel": "trades.10000001"
}
```

**Payload**

```json
{
  "type": "payload",
  "channel": "trades.10000001",
  "content": {
    "dataType": "Changed",
    "channel": "trades.10000001",
    "data": [
      {
        "ticketId": "1",
        "time": "1688365544504",
        "price": "30065.12",
        "size": "0.01",
        "value": "300.6512",
        "takerOrderId": "10",
        "makerOrderId": "11",
        "takerAccountId": "3001",
        "makerAccountId": "3002",
        "contractId": "10000001",
        "isBestMatch": true,
        "isBuyerMaker": false
      }
    ]
  }
}
```

------------

连接方式

wss://quote.edgex.exchange/api/v1/public/ws?timestamp=1758456312846

注意timestamp在连接的时候穿入当前时间戳

之后你需要订阅 {"type":"subscribe","channel":"ticker.all.1s"}

返回内容类似 

{"type":"subscribed","channel":"ticker.all.1s","request":"{\"type\":\"subscribe\",\"channel\":\"ticker.all.1s\"}"}

{
  "type": "quote-event",
  "channel": "ticker.all.1s",
  "content": {
    "channel": "ticker.all.1s",
    "dataType": "changed",
    "data": [
      {
        "contractId": "10000024",
        "contractName": "UNI2USD",
        "priceChange": "0.113",
        "priceChangePercent": "0.011388",
        "trades": "0",
        "size": "0",
        "value": "0",
        "high": "10.128",
        "low": "9.773",
        "open": "10.035",
        "close": "10.035",
        "highTime": "1756318424986",
        "lowTime": "1756341303982",
        "startTime": "1758369600000",
        "endTime": "1758456000000",
        "lastPrice": "10.035",
        "indexPrice": "9.115107279",
        "oraclePrice": "9.12028730846941471099853515625",
        "openInterest": "0",
        "fundingRate": "0.00005000",
        "fundingTime": "1758456000000",
        "nextFundingTime": "1758470400000",
        "bestAskPrice": "0",
        "bestBidPrice": "0"
      },
      {
        "contractId": "10000027",
        "contractName": "ATOM2USD",
        "priceChange": "0.269",
        "priceChangePercent": "0.034046",
        "trades": "0",
        "size": "0",
        "value": "0",
        "high": "8.179",
        "low": "8.123",
        "open": "8.170",
        "close": "8.170",
        "highTime": "1732695785990",
        "lowTime": "1732695304463",
        "startTime": "1758369600000",
        "endTime": "1758456000000",
        "lastPrice": "8.170",
        "indexPrice": "4.454661668",
        "oraclePrice": "4.4577054679393768310546875",
        "openInterest": "0",
        "fundingRate": "0.00005000",
        "fundingTime": "1758456000000",
        "nextFundingTime": "1758470400000",
        "bestAskPrice": "0",
        "bestBidPrice": "0"
      },
      {
        "contractId": "10000029",
        "contractName": "NEAR2USD",
        "priceChange": "0.638",
        "priceChangePercent": "0.134005",
        "trades": "0",
        "size": "0",
        "value": "0",
        "high": "5.443",
        "low": "5.384",
        "open": "5.399",
        "close": "5.399",
        "highTime": "1731325908241",
        "lowTime": "1731326229240",
        "startTime": "1758369600000",
        "endTime": "1758456000000",
        "lastPrice": "5.399",
        "indexPrice": "3.114326185",
        "oraclePrice": "3.11577071435749530792236328125",
        "openInterest": "0",
        "fundingRate": "0.00005000",
        "fundingTime": "1758456000000",
        "nextFundingTime": "1758470400000",
        "bestAskPrice": "0",
        "bestBidPrice": "0"
      },
    ]
  }
}

同时你需要定时发送 {"type":"ping","time":"1758456317698"} 来保持长连接

如果出现意外断线，需要支持重连

参考代码

```
import React, { useEffect, useState } from 'react';
import { Text } from 'ink';

function WebSocketComponent() {
  const [message, setMessage] = useState('Connecting...');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL

    ws.onopen = () => {
      setMessage('Connected to WebSocket server!');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      setMessage(`Received: ${event.data}`);
    };

    ws.onclose = () => {
      setMessage('Disconnected from WebSocket server.');
      setSocket(null);
    };

    ws.onerror = (error) => {
      setMessage(`WebSocket error: ${error.message}`);
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // You can add logic here to send messages using `socket.send()`
  // For example, if you have user input in your Ink app

  return (
    <Text>{message}</Text>
  );
}

export default WebSocketComponent;
```