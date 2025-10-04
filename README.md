# ritmex-dex-cli

基于 Bun + Ink 的终端 CLI，用于监控多交易所永续合约资金费率与跨所价差，帮助快速发现潜在套利机会。

* [Aster 30% 手续费优惠注册链接](https://www.asterdex.com/zh-CN/referral/4665f3)
* [Binance 手续费优惠注册链接](https://www.binance.com/join?ref=KNKCA9XC)
* [GRVT 手续费优惠注册链接](https://grvt.io/exchange/sign-up?ref=sea)
* [Backpack 手续费优惠注册链接](https://backpack.exchange/join/41d60948-2a75-4d16-b7e9-523df74f2904)
* [edgex 手续费优惠注册链接](https://pro.edgex.exchange/referral/BULL)


### 支持的交易所
- **edgeX**：WebSocket 实时行情与资金费率（自动重连，过滤名义仓位不足）。
- **Lighter**：HTTP 资金费率接口，默认每 5 分钟刷新。
- **GRVT**：HTTP 拉取合约与最新资金点，顺序请求并节流。
- **Aster**：HTTP 合并 `premiumIndex` 与 `fundingInfo`，计算 8h 等效资金费率。
- **Backpack**：HTTP `markPrices`，按小时资金费率折算到 8h。
- **Binance**：结合 `fundingInfo` 动态归一化至 8h 口径。
- **Hyperliquid**：`predictedFundings`（预测资金），按其资金间隔归一化至 8h。

所有来源的资金费率统一按「8 小时」口径归一化，并以小数形式展示（如 `0.003` 表示 0.3%/8h）。

### 功能
- **跨所聚合**：相同 `symbol` 的资金费率合并展示（edgeX/Lighter/GRVT/Aster/Backpack/Binance/Hyperliquid）。
- **8h 归一化**：自动换算不同口径到 8h 等效值。
- **Top 价差榜**：计算前 10 大跨所差，并估算 24h 粗略收益。
- **本地快照**：最近一次表格持久化到 `data/funding-snapshot.json`，支持秒开与断网回显。
- **排序/导航**：支持列排序与键盘快捷操作。

### 快速开始
1) 安装 Bun（如未安装）：
```bash
curl -fsSL https://bun.sh/install | bash
```

2) 安装依赖：
```bash
bun install
```

3) 启动 CLI：
```bash
bun start
# 或
bun run index.tsx
```

提示：首次启动若未立即显示全量数据，请等待 edgeX 建链及各 HTTP 源首轮刷新。

### 配置与参数
- 关键常量（展示条数、刷新间隔等）见 `src/utils/constants.ts`。
- 本地快照文件位于 `data/funding-snapshot.json`。

> 本项目仅用于数据监控与研究，不构成投资建议；请遵守各交易所与数据源使用条款。
