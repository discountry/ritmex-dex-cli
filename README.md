# ritmex-dex-cli

基于 Bun + Ink 的终端 CLI，用于监控多交易所永续合约资金费率与跨所价差，帮助快速发现潜在资金费率套利机会。

### 支持的交易所与数据来源
- **edgeX**: WebSocket 实时行情与资金费率（`ticker.all.1s`），自动重连，过滤名义仓位不足的数据。
- **Lighter**: HTTP 轮询资金费率（`/api/v1/funding-rates`），默认每 5 分钟刷新。
- **GRVT**: HTTP 拉取合约清单与最新资金点数据，顺序请求并带节流防止限频，按固定节奏刷新。
- **Aster**: HTTP 合并 `premiumIndex` 与 `fundingInfo` 计算八小时等效资金费率，默认每 5 分钟刷新。

所有来源的资金费率在内部统一按「8 小时」口径归一化，并以小数形式展示（例如 `0.003` 表示 0.3%/8h）。

### 数据功能与特性
- **跨所聚合**：将相同标的（`symbol`）的资金费率聚合展示。
- **八小时归一化**：不同来源的原始口径自动换算至 8h 等效值。
- **价差/套利视图**：展示如下跨所差值列：
  - `L-E Arb`、`L-G Arb`、`E-G Arb`、`L-A Arb`、`E-A Arb`、`G-A Arb`。
- **Top 价差榜**：自动计算前 10 大跨所资金费率差，并给出 24h 粗略收益估算（按 3 个 8h 周期累加）。
- **本地快照**：将最近一次成功计算的表格持久化到 `data/funding-snapshot.json`，下次启动可秒开且在断网时提供回显。
- **排序与键盘导航**：按任意列升/降序排序，提供快捷键快速定位列与切换排序。

### 安装与运行
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

首次启动如暂未拉取到全量数据，请稍等 edgeX WS 建链与各 HTTP 源的刷新周期。

### 运行时操作（快捷键）
- ← →：在表头间移动选中列
- 1-0/-：直接跳转到对应列
- Enter：切换当前列的升序/降序

底部会显示 Top 价差列表与状态提示（如「正在连接 edgeX」「等待 GRVT 刷新」等）。

### 数据刷新策略（默认）
- edgeX：WebSocket 实时（断线自动重连）
- Lighter：每 5 分钟
- GRVT：加载合约清单后按固定节奏轮询（带请求间隔节流）
- Aster：每 5 分钟

### 项目结构（简要）
- `src/components/`：纯展示组件（无数据拉取或状态修改）
- `src/hooks/`：数据编排与业务逻辑（各交易所 funding、表格行构建、排序与键盘交互、快照持久化等）
- `src/services/http/`：各交易所 HTTP 客户端
- `src/utils/`：通用工具（时间、表格、快照、格式化等）
- `src/types/`：TypeScript 类型定义（单一可信源）
- `data/`：本地资金费率快照（启动加速与断网回显）

### 常见问题（FAQ）
- 终端没有数据？请等待 edgeX WS 建链与各 HTTP 源首轮刷新；或检查网络/代理设置。
- 某些标的缺失？可能是交易所暂未返回对应资金费率，或 edgeX 名义仓位不足被过滤。
- 如何修改展示条数或刷新间隔？见 `src/utils/constants.ts` 中 `DISPLAY_LIMIT`、`LIGHTER_REFRESH_MS`、`ASTER_REFRESH_MS` 等常量。

> 本项目仅用于数据监控与研究，不构成投资建议。请在遵守各交易所与数据源使用条款的前提下使用。
