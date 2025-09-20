1. 获取交易对

curl --location 'https://market-data.grvt.io/full/v1/instruments' \
--data '{
    "kind": ["PERPETUAL"],
    "quote": ["USDT"],
    "is_active": true,
}
'

{
    "result": [{
        "instrument": "BTC_USDT_Perp",
        "instrument_hash": "0x030501",
        "base": "BTC",
        "quote": "USDT",
        "kind": "PERPETUAL",
        "venues": ["ORDERBOOK"],
        "settlement_period": "PERPETUAL",
        "base_decimals": 3,
        "quote_decimals": 3,
        "tick_size": "0.01",
        "min_size": "0.01",
        "create_time": "1697788800000000000",
        "max_position_size": "100.0"
    }]
}

2. 获取资金费率

curl --location 'https://market-data.grvt.io/full/v1/funding' \
--data '{
    "instrument": "BTC_USDT_Perp",
    "start_time": "1697788800000000000",
    "end_time": "1697788800000000000",
    "limit": 500,
    "cursor": ""
}
'

{
    "result": [{
        "instrument": "BTC_USDT_Perp",
        "funding_rate": 0.0003,
        "funding_time": "1697788800000000000",
        "mark_price": "65038.01",
        "funding_rate_8_h_avg": 0.0003
    }],
    "next": "Qw0918="
}
