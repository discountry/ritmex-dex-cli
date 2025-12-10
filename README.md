# Ritmex DEX CLI

一个基于 React 和 Ink 构建的强大终端加密货币资金费率监控应用。通过交互式可排序表格实时监控多个衍生品交易所的资金费率，具备高级套利分析和历史追踪功能。

## 🔗 交易所注册链接

通过以下推荐链接注册可享受交易手续费折扣：

- **Aster** - [30% 手续费折扣](https://www.asterdex.com/zh-CN/referral/4665f3)
- **Binance** - [手续费折扣](https://www.binance.com/join?ref=KNKCA9XC)
- **GRVT** - [手续费折扣](https://grvt.io/exchange/sign-up?ref=sea)
- **Backpack** - [手续费折扣](https://backpack.exchange/join/41d60948-2a75-4d16-b7e9-523df74f2904)
- **EdgeX** - [手续费折扣](https://pro.edgex.exchange/referral/BULL)

## 🚀 核心功能

### 多交易所支持
- **EdgeX**: WebSocket 实时资金费率，支持自动重连和仓位过滤
- **Lighter**: HTTP API 资金费率，支持历史分析功能
- **Binance**: HTTP API，动态 8 小时标准化
- **GRVT**: HTTP API，节流顺序请求
- **Aster**: HTTP API，结合 premiumIndex 和 fundingInfo 计算 8 小时等效费率
- **Backpack**: HTTP markPrices，小时到 8 小时费率转换
- **Hyperliquid**: 预测资金费率，区间标准化

### 高级功能
- **实时监控**: 通过 WebSocket 和 HTTP 轮询进行实时资金费率更新
- **8小时标准化**: 所有费率标准化为 8 小时等效值，确保公平比较
- **交互式表格**: 可排序列，支持键盘导航（方向键、数字快捷键）
- **套利分析**: 前 10 大跨交易所套利机会及利润计算
- **资金计算器**: 配置自定义资金金额进行利润估算
- **数据持久化**: 本地快照，支持即时启动和离线查看
- **历史分析**: 7 天资金历史及利润预测（Lighter 交易所）

### 两种应用模式
1. **主监控器** (`bun start`): 所有交易所的实时资金费率
2. **历史查看器** (`bun run lighter-history`): 7 天资金历史分析

## 📦 安装与设置

### 环境要求
- **Bun** 运行时 (JavaScript/TypeScript 运行时)

### 安装步骤
```bash
# 克隆仓库
git clone <repository-url>
cd ritmex-dex-cli

# 安装 Bun（如果未安装）
curl -fsSL https://bun.sh/install | bash

# 安装项目依赖
bun install
```

## 🎯 使用方法

### 主资金费率监控器
```bash
# 使用默认 $1000 资金启动
bun start

# 使用自定义资金启动
bun start -- --capital 5000
# 或者
bun start -c 5000
```

### 历史分析（Lighter）
```bash
# Lighter 7 天历史，默认 $2000 资金
bun run lighter-history

# 使用自定义资金
bun run lighter-history -- --capital 3000
```

## 🎮 控制与导航

### 键盘快捷键
- **← → 方向键**: 在列之间导航
- **数字键 (1-9, 0, -)**: 跳转到特定列
- **Enter**: 切换选中列的排序方向

### 列布局（主监控器）
1. 交易对
2. Lighter
3. Binance
4. Hyperliquid
5. Edgex
6. GRVT
7. Aster
8. Backpack

## 🏗️ 架构设计

### 技术栈
- **运行时**: Bun (JavaScript/TypeScript 运行时)
- **前端**: React with Ink (React for CLIs)
- **语言**: TypeScript，严格类型检查
- **UI 组件**: 自定义终端组件
- **数据可视化**: 通过 `@ppp606/ink-chart` 实现图表

### 项目结构
```
ritmex-dex-cli/
├── index.tsx                    # 主资金费率监控器
├── lighter-history.tsx          # Lighter 7 天历史查看器
├── config.json                  # 交易所配置
├── package.json                 # 依赖和脚本
└── src/
    ├── components/              # React UI 组件
    ├── hooks/                   # React hooks 状态管理
    ├── services/                # 外部 API 集成
    ├── utils/                   # 工具函数
    └── types/                   # TypeScript 类型定义
```

## ⚙️ 配置

### 交易所配置 (`config.json`)
```json
{
  "enabledExchanges": ["lighter", "binance", "grvt", "aster", "backpack", "hyperliquid"]
}
```

### 自定义配置
- **显示限制**: 配置显示的行数
- **刷新间隔**: 调整 HTTP API 的轮询频率
- **快照持久化**: 配置数据缓存行为

## 📊 数据功能

### 实时数据源
- **WebSocket**: EdgeX 实时资金费率
- **HTTP APIs**: 所有其他交易所，可配置轮询
- **错误处理**: 交易所不可用时的优雅降级

### 数据处理
- **交易对匹配**: 跨交易所交易对标准化
- **费率标准化**: 8 小时等效计算
- **价差分析**: 实时套利机会检测
- **利润计算**: 基于资金的利润估算

### 持久化
- **本地快照**: `data/funding-snapshot.json`
- **快速启动**: 使用缓存数据即时加载
- **离线功能**: 断开连接时查看最新已知数据

## 📝 开发

### 脚本命令
```bash
bun start                # 运行主监控器，默认 $1000 资金
bun run lighter-history  # 运行历史查看器，默认 $2000 资金
```

### 依赖项
- **ink**: React for CLIs
- **react**: UI 库
- **@ppp606/ink-chart**: 图表组件
- **ink-table**: 表格组件（已自定义）

## ⚠️ 免责声明

本应用仅供数据监控和研究目的使用，不构成投资建议。请遵守所有交易所的服务条款和数据使用政策。

## 📄 许可证

请参考项目的许可证文件了解使用条款。