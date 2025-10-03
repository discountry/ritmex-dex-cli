Retrieve predicted funding rates for different venues
POST https://api.hyperliquid.xyz/info

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"predictedFundings"

[
    ["0G", [
        ["BinPerp", {
            "fundingRate": "-0.00019328",
            "nextFundingTime": 1759492800000,
            "fundingIntervalHours": 1
        }],
        ["HlPerp", {
            "fundingRate": "-0.0001942593",
            "nextFundingTime": 1759489200000,
            "fundingIntervalHours": 1
        }],
        ["BybitPerp", {
            "fundingRate": "0.0000125",
            "nextFundingTime": 1759492800000,
            "fundingIntervalHours": 1
        }]
    ]],
    ["2Z", [
        ["BinPerp", {
            "fundingRate": "-0.0014888",
            "nextFundingTime": 1759492800000,
            "fundingIntervalHours": 4
        }],
        ["HlPerp", {
            "fundingRate": "-0.0003093788",
            "nextFundingTime": 1759489200000,
            "fundingIntervalHours": 1
        }],
        ["BybitPerp", {
            "fundingRate": "-0.00192828",
            "nextFundingTime": 1759492800000,
            "fundingIntervalHours": 4
        }]
    ]],
]