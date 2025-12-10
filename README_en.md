# Ritmex DEX CLI

A powerful terminal-based cryptocurrency funding rate monitoring application built with React and Ink. Monitor real-time funding rates from multiple derivatives exchanges in an interactive sortable table format, with advanced features for arbitrage analysis and historical tracking.

## 🚀 Key Features

### Multi-Exchange Support
- **EdgeX**: WebSocket real-time funding rates with auto-reconnection and position filtering
- **Lighter**: HTTP API funding rates with historical analysis capabilities
- **Binance**: HTTP API with dynamic 8h normalization
- **GRVT**: HTTP API with throttled sequential requests
- **Aster**: HTTP API combining premiumIndex and fundingInfo for 8h equivalent rates
- **Backpack**: HTTP markPrices with hourly to 8h rate conversion
- **Hyperliquid**: Predicted fundings with interval normalization

### Advanced Functionality
- **Real-time Monitoring**: Live funding rate updates via WebSocket and HTTP polling
- **8-Hour Standardization**: All rates normalized to 8h equivalent for fair comparison
- **Interactive Tables**: Sortable columns with keyboard navigation (arrow keys, number shortcuts)
- **Arbitrage Analysis**: Top 10 cross-exchange spread opportunities with profit calculations
- **Capital Calculator**: Configure custom capital amounts for profit estimation
- **Data Persistence**: Local snapshots for instant startup and offline viewing
- **Historical Analysis**: 7-day funding history with profit projections (Lighter exchange)

### Two Application Modes
1. **Main Monitor** (`bun start`): Real-time funding rates across all exchanges
2. **Historical Viewer** (`bun run lighter-history`): 7-day funding history analysis

## 📦 Installation & Setup

### Prerequisites
- **Bun** runtime (JavaScript/TypeScript runtime)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ritmex-dex-cli

# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install project dependencies
bun install
```

## 🎯 Usage

### Main Funding Rate Monitor
```bash
# Start with default $1000 capital
bun start

# Start with custom capital
bun start -- --capital 5000
# or
bun start -c 5000
```

### Historical Analysis (Lighter)
```bash
# Lighter 7-day history with default $2000 capital
bun run lighter-history

# With custom capital
bun run lighter-history -- --capital 3000
```

## 🎮 Controls & Navigation

### Keyboard Shortcuts
- **← → Arrow Keys**: Navigate between columns
- **Number Keys (1-9, 0, -)**: Jump to specific columns
- **Enter**: Toggle sort direction for selected column

### Column Layout (Main Monitor)
1. Symbol
2. Lighter
3. Binance
4. Hyperliquid
5. Edgex
6. GRVT
7. Aster
8. Backpack

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Bun (JavaScript/TypeScript runtime)
- **Frontend**: React with Ink (React for CLIs)
- **Language**: TypeScript with strict type checking
- **UI Components**: Custom terminal components
- **Data Visualization**: Charts via `@ppp606/ink-chart`

### Project Structure
```
ritmex-dex-cli/
├── index.tsx                    # Main funding rate monitor
├── lighter-history.tsx          # Lighter 7-day history viewer
├── config.json                  # Exchange configuration
├── package.json                 # Dependencies and scripts
└── src/
    ├── components/              # React UI components
    ├── hooks/                   # React hooks for state management
    ├── services/                # External API integrations
    ├── utils/                   # Utility functions
    └── types/                   # TypeScript type definitions
```

## ⚙️ Configuration

### Exchange Configuration (`config.json`)
```json
{
  "enabledExchanges": ["lighter", "binance", "grvt", "aster", "backpack", "hyperliquid"]
}
```

### Customization
- **Display limits**: Configure number of rows shown
- **Refresh intervals**: Adjust polling frequency for HTTP APIs
- **Snapshot persistence**: Configure data caching behavior

## 📊 Data Features

### Real-time Data Sources
- **WebSocket**: EdgeX real-time funding rates
- **HTTP APIs**: All other exchanges with configurable polling
- **Error handling**: Graceful degradation when exchanges are unavailable

### Data Processing
- **Symbol matching**: Cross-exchange symbol normalization
- **Rate standardization**: 8-hour equivalent calculations
- **Spread analysis**: Real-time arbitrage opportunity detection
- **Profit calculation**: Capital-based profit estimation

### Persistence
- **Local snapshots**: `data/funding-snapshot.json`
- **Quick startup**: Instant load with cached data
- **Offline capability**: View last known data when disconnected

## 🔗 Exchange Registration Links

Get trading fee discounts through these referral links:
- [Aster 30% fee discount](https://www.asterdex.com/zh-CN/referral/4665f3)
- [Binance fee discount](https://www.binance.com/join?ref=KNKCA9XC)
- [GRVT fee discount](https://grvt.io/exchange/sign-up?ref=sea)
- [Backpack fee discount](https://backpack.exchange/join/41d60948-2a75-4d16-b7e9-523df74f2904)
- [EdgeX fee discount](https://pro.edgex.exchange/referral/BULL)

## 📝 Development

### Scripts
```bash
bun start                # Run main monitor with $1000 default capital
bun run lighter-history  # Run historical viewer with $2000 default capital
```

### Dependencies
- **ink**: React for CLIs
- **react**: UI library
- **@ppp606/ink-chart**: Chart components
- **ink-table**: Table components (customized)

## ⚠️ Disclaimer

This application is for data monitoring and research purposes only. It does not constitute investment advice. Please comply with all exchange terms of service and data usage policies.

## 📄 License

Please refer to the project's license file for usage terms.
