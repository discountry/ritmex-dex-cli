# How to get data from API

1. 获取多平台费率

https://mainnet.zklighter.elliot.ai/api/v1/funding-rates

```json
{
"code": 200,
"funding_rates": [
{
"market_id": 48,
"exchange": "binance",
"symbol": "PAXG",
"rate": 0.00002338
},
{
"market_id": 44,
"exchange": "binance",
"symbol": "SYRUP",
"rate": 0.00005406
},
{
"market_id": 18,
"exchange": "binance",
"symbol": "1000BONK",
"rate": 0.0001
},
{
"market_id": 14,
"exchange": "bybit",
"symbol": "POL",
"rate": -0.00014744
},
{
"market_id": 12,
"exchange": "lighter",
"symbol": "TON",
"rate": 0.00009599999999999999
},
```

2. 获取edgex交易所元数据

https://pro.edgex.exchange/api/v1/public/meta/getMetaData

```json
{
"code": "SUCCESS",
"data": {
"global": {
"appName": "edgeX",
"appEnv": "mainnet",
"appOnlySignOn": "https://pro.edgex.exchange",
"feeAccountId": "256105",
"feeAccountL2Key": "0x70092acf49d535fbb64d99883abda95dcf9a4fc60f494437a3d76f27db0a0f5",
"poolAccountId": "508126509156794507",
"poolAccountL2Key": "0x7f2e1e8a572c847086ee93c9b5bbce8b96320aaa69147df1cfca91d5e90bc60",
"fastWithdrawAccountId": "508126509156794507",
"fastWithdrawAccountL2Key": "0x7f2e1e8a572c847086ee93c9b5bbce8b96320aaa69147df1cfca91d5e90bc60",
"fastWithdrawMaxAmount": "100000",
"fastWithdrawRegistryAddress": "0xBE9a129909EbCb954bC065536D2bfAfBd170d27A",
"starkExChainId": "0x1",
"starkExContractAddress": "0xfAaE2946e846133af314d1Df13684c89fA7d83DD",
"starkExCollateralCoin": {
"coinId": "1000",
"coinName": "USD",
"stepSize": "0.000001",
"showStepSize": "0.0001",
"iconUrl": "https://static.edgex.exchange/icons/coin/USDT.svg",
"starkExAssetId": "0x2ce625e94458d39dd0bf3b45a843544dd4a14b8169045a3a3d15aa564b936c5",
"starkExResolution": "0xf4240"
},
"starkExMaxFundingRate": 12000,
"starkExOrdersTreeHeight": 64,
"starkExPositionsTreeHeight": 64,
"starkExFundingValidityPeriod": 86400,
"starkExPriceValidityPeriod": 86400,
"maintenanceReason": ""
},
"coinList": [
{
"coinId": "1000",
"coinName": "USD",
"stepSize": "0.000001",
"showStepSize": "0.0001",
"iconUrl": "https://static.edgex.exchange/icons/coin/USDT.svg",
"starkExAssetId": "0x2ce625e94458d39dd0bf3b45a843544dd4a14b8169045a3a3d15aa564b936c5",
"starkExResolution": "0xf4240"
},
{
"coinId": "1001",
"coinName": "BTC",
"stepSize": "0.001",
"showStepSize": "0.001",
"iconUrl": "https://static.edgex.exchange/icons/coin/BTC.svg",
"starkExAssetId": null,
"starkExResolution": null
}
],
"contractList": [
{
"contractId": "10000001",
"contractName": "BTCUSD",
"baseCoinId": "1001",
"quoteCoinId": "1000",
"tickSize": "0.1",
"stepSize": "0.001",
"minOrderSize": "0.001",
"maxOrderSize": "50",
"maxOrderBuyPriceRatio": "0.05",
"minOrderSellPriceRatio": "0.05",
"maxPositionSize": "120",
"maxMarketPositionSize": "15",
"riskTierList": [
{
"tier": 1,
"positionValueUpperBound": "800000",
"maxLeverage": "100",
"maintenanceMarginRate": "0.005",
"starkExRisk": "21474837",
"starkExUpperBound": "3435973836800000000000"
},
{
"tier": 2,
"positionValueUpperBound": "2000000",
"maxLeverage": "75",
"maintenanceMarginRate": "0.0065",
"starkExRisk": "27917288",
"starkExUpperBound": "8589934592000000000000"
},
{
"tier": 3,
"positionValueUpperBound": "10000000",
"maxLeverage": "50",
"maintenanceMarginRate": "0.01",
"starkExRisk": "42949673",
"starkExUpperBound": "42949672960000000000000"
},
{
"tier": 4,
"positionValueUpperBound": "50000000",
"maxLeverage": "25",
"maintenanceMarginRate": "0.02",
"starkExRisk": "85899345",
"starkExUpperBound": "214748364800000000000000"
},
{
"tier": 5,
"positionValueUpperBound": "100000000",
"maxLeverage": "20",
"maintenanceMarginRate": "0.025",
"starkExRisk": "107374182",
"starkExUpperBound": "429496729600000000000000"
},
{
"tier": 6,
"positionValueUpperBound": "150000000",
"maxLeverage": "10",
"maintenanceMarginRate": "0.05",
"starkExRisk": "214748364",
"starkExUpperBound": "644245094400000000000000"
},
{
"tier": 7,
"positionValueUpperBound": "180000000",
"maxLeverage": "9",
"maintenanceMarginRate": "0.07",
"starkExRisk": "300647710",
"starkExUpperBound": "773094113280000000000000"
},
{
"tier": 8,
"positionValueUpperBound": "200000000",
"maxLeverage": "8",
"maintenanceMarginRate": "0.08",
"starkExRisk": "343597383",
"starkExUpperBound": "858993459200000000000000"
},
{
"tier": 9,
"positionValueUpperBound": "250000000",
"maxLeverage": "7",
"maintenanceMarginRate": "0.09",
"starkExRisk": "386547056",
"starkExUpperBound": "1073741824000000000000000"
},
{
"tier": 10,
"positionValueUpperBound": "79228162514264337593543",
"maxLeverage": "6",
"maintenanceMarginRate": "0.1",
"starkExRisk": "429496729",
"starkExUpperBound": "340282366920938463463374607431768211455"
}
],
"defaultTakerFeeRate": "0.00038",
"defaultMakerFeeRate": "0.00015",
"defaultLeverage": "10",
"liquidateFeeRate": "0.01",
"enableTrade": true,
"enableDisplay": true,
"enableOpenPosition": true,
"fundingInterestRate": "0.0003",
"fundingImpactMarginNotional": "0.16",
"fundingMaxRate": "0.001875",
"fundingMinRate": "-0.001875",
"fundingRateIntervalMin": "240",
"displayDigitMerge": "0.1,1,5,10",
"displayMaxLeverage": "100",
"displayMinLeverage": "1",
"displayNewIcon": false,
"displayHotIcon": true,
"matchServerName": "edgex-match-server",
"starkExSyntheticAssetId": "0x425443322d31300000000000000000",
"starkExResolution": "0x2540be400",
"starkExOraclePriceQuorum": "0x3",
"starkExOraclePriceSignedAssetId": [
"0x425443555344000000000000000000005374437277",
"0x4254435553440000000000000000000053746b6169",
"0x4254435553440000000000000000000053746f726b",
"0x425443555344000000000000000000006465787472",
"0x425443555344540000000000000000005374437277",
"0x4254435553445400000000000000000053746b6169",
"0x4254435553445400000000000000000053746f726b",
"0x425443555344540000000000000000006465787472"
],
"starkExOraclePriceSigner": [
"0x41dbe627aeab66504b837b3abd88ae2f58ba6d98ee7bbd7f226c4684d9e6225",
"0x1f191d23b8825dcc3dba839b6a7155ea07ad0b42af76394097786aca0d9975c",
"0xcc85afe4ca87f9628370c432c447e569a01dc96d160015c8039959db8521c4",
"0x6ee80350406f9e753797c3f0e1303a63ea2ae1f1adb86340e52722f41b31b64"
]
}
}
```

3. 根据 contractId 获取费率

https://pro.edgex.exchange/api/v1/public/funding/getLatestFundingRate?contractId=10000001

```json
{
    "code": "SUCCESS",
    "data": [
    {
    "contractId": "10000001",
    "fundingTime": "1758268800000",
    "fundingTimestamp": "1758280980000",
    "oraclePrice": "116405.53792007267475128173828125",
    "indexPrice": "116402.887264047",
    "fundingRate": "-0.00005574",
    "isSettlement": false,
    "forecastFundingRate": "-0.00001936",
    "previousFundingRate": "-0.00004550",
    "previousFundingTimestamp": "1758268740000",
    "premiumIndex": "-0.00048183",
    "avgPremiumIndex": "-0.00051936",
    "premiumIndexTimestamp": "1758280980000",
    "impactMarginNotional": "100",
    "impactAskPrice": "116346.8",
    "impactBidPrice": "116344.0",
    "interestRate": "0.0003",
    "predictedFundingRate": "0.00005000",
    "fundingRateIntervalMin": "240",
    "starkExFundingIndex": "116405.53792007267475128173828125"
    }
    ],
    "msg": null,
    "errorParam": null,
    "requestTime": "1758281035034",
    "responseTime": "1758281035036",
    "traceId": "e90925c5daecc626305ea4255e06ae92"
    }
```