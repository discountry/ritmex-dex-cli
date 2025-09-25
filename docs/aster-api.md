1. 获取全币种资金费率

https://fapi.asterdex.com/fapi/v1/premiumIndex

[
{
"symbol": "GNSUSD",
"markPrice": "1.85641978",
"indexPrice": "1.85641978",
"estimatedSettlePrice": "1.85897142",
"lastFundingRate": "0",
"interestRate": "0",
"nextFundingTime": 1758787200000,
"time": 1758764335000
},
{
"symbol": "EGL1USD",
"markPrice": "0.03353156",
"indexPrice": "0.03353156",
"estimatedSettlePrice": "0.03418930",
"lastFundingRate": "0",
"interestRate": "0",
"nextFundingTime": 1758787200000,
"time": 1758764335000
},
{
"symbol": "INJUSDT",
"markPrice": "12.24330596",
"indexPrice": "12.24397502",
"estimatedSettlePrice": "12.29963314",
"lastFundingRate": "0.00010000",
"interestRate": "0.00010000",
"nextFundingTime": 1758787200000,
"time": 1758764335000
}]

2. 获取资金费率配置

https://fapi.asterdex.com/fapi/v1/fundingInfo

[
{
"symbol": "GNSUSD",
"interestRate": "0",
"time": 1758764399000,
"fundingIntervalHours": 8,
"fundingFeeCap": null,
"fundingFeeFloor": null
},
{
"symbol": "EGL1USD",
"interestRate": "0",
"time": 1758764399000,
"fundingIntervalHours": 8,
"fundingFeeCap": null,
"fundingFeeFloor": null
},
{
"symbol": "INJUSDT",
"interestRate": "0.00010000",
"time": 1758764399000,
"fundingIntervalHours": 8,
"fundingFeeCap": 0.03,
"fundingFeeFloor": -0.03
}]