# Ritmex DEX CLI

## Project Overview
A terminal-based cryptocurrency funding rate monitoring application built with React and Ink. This CLI tool displays real-time funding rates from multiple derivatives exchanges (Lighter, Binance, GRVT, Aster, Backpack, Hyperliquid) in a sortable table format, with additional features like historical analysis and spread calculations.

## Architecture

### Technology Stack
- **Runtime**: Bun (JavaScript/TypeScript runtime)
- **Frontend Framework**: React with Ink (React for CLIs)
- **Language**: TypeScript with strict type checking
- **UI Components**: Custom terminal components using Ink
- **Data Visualization**: Charts via `@ppp606/ink-chart`

### Project Structure

```
ritmex-dex-cli/
├── index.tsx                    # Main funding rate monitor application
├── lighter-history.tsx          # Lighter 7-day funding history viewer
├── config.json                  # Exchange configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .gitignore                  # Git ignore rules
└── src/
    ├── components/             # React UI components
    │   ├── Header.tsx         # Application header with status
    │   ├── Footer.tsx         # Footer component
    │   ├── FundingTable.tsx   # Main funding rates table
    │   ├── LighterHistoryTable.tsx # Historical data table
    │   ├── TopSpreadList.tsx  # Top spread opportunities
    │   └── InkTable.tsx       # Reusable table component
    ├── hooks/                  # React hooks for state management
    │   ├── useEdgexFunding.ts # EdgeX websocket data
    │   ├── useLighterFunding.ts # Lighter API data
    │   ├── useBinanceFunding.ts # Binance API data
    │   ├── useGrvtFunding.ts  # GRVT API data
    │   ├── useAsterFunding.ts  # Aster API data
    │   ├── useBackpackFunding.ts # Backpack API data
    │   ├── useFundingRows.ts  # Combine and process funding data
    │   ├── useTableSorting.ts  # Table sorting functionality
    │   ├── useKeyboardNavigation.ts # Keyboard controls
    │   ├── useSnapshotPersistence.ts # Data persistence
    │   ├── useLighterFundingHistory.ts # Historical analysis
    │   └── useLighterHistorySorting.ts # History sorting
    ├── services/               # External API integrations
    │   ├── http/              # HTTP API clients
    │   │   ├── lighter.ts     # Lighter exchange API
    │   │   ├── lighter-history.ts # Lighter historical API
    │   │   ├── binance.ts     # Binance API
    │   │   ├── grvt.ts        # GRVT API
    │   │   ├── aster.ts       # Aster API
    │   │   ├── backpack.ts    # Backpack API
    │   │   └── hyperliquid.ts # Hyperliquid API
    │   └── websocket/         # WebSocket connections
    └── utils/                  # Utility functions
        ├── config.ts          # Configuration management
        ├── snapshot.ts        # Data snapshot persistence
        ├── table.ts           # Table formatting utilities
        ├── spread.ts          # Spread calculations
        ├── format.ts          # Data formatting helpers
        ├── constants.ts       # Application constants
        ├── time.ts            # Time utilities
        └── series.ts          # Time series calculations
    └── types/                  # TypeScript type definitions
        ├── edgex.ts           # EdgeX types
        ├── lighter.ts         # Lighter types
        ├── binance.ts         # Binance types
        ├── grvt.ts            # GRVT types
        ├── aster.ts           # Aster types
        ├── backpack.ts        # Backpack types
        ├── hyperliquid.ts     # Hyperliquid types
        ├── table.ts           # Table component types
        ├── lighter-history.ts # Historical data types
        └── index.ts           # Type exports
```

## Key Features

### Main Application (`index.tsx`)
- Real-time funding rate monitoring across multiple exchanges
- Interactive sortable table with keyboard navigation
- WebSocket connection to EdgeX for live data
- Periodic HTTP polling for other exchanges
- Data persistence across application restarts
- Capital calculator for potential profits
- Top spread opportunities display

### Historical Analysis (`lighter-history.tsx`)
- 7-day funding history for Lighter exchange
- Profit calculation based on historical rates
- Annualized rate estimation
- Sortable historical data table

### Exchange Integration
- **EdgeX**: WebSocket connection for real-time funding rates
- **Lighter**: HTTP API for current and historical funding rates
- **Binance**: HTTP API for funding rates
- **GRVT**: HTTP API for funding rates
- **Aster**: HTTP API for funding rates
- **Backpack**: HTTP API for funding rates
- **Hyperliquid**: HTTP API for funding rates

## Data Flow

1. **Data Collection**: Each exchange has a dedicated hook that fetches funding rates
2. **Data Processing**: `useFundingRows` combines data from all exchanges and matches symbols
3. **Display**: Processed data is displayed in sortable tables
4. **Persistence**: Data snapshots are saved for offline capability
5. **User Interaction**: Keyboard navigation allows sorting and column selection

## Usage

### Main Funding Monitor
```bash
bun run start                    # Start with default capital
bun run start -- --capital 5000  # Start with $5000 capital
```

### Historical Analysis
```bash
bun run lighter-history                    # Lighter history with default capital
bun run lighter-history -- --capital 2000  # With $2000 capital
```

### Keyboard Controls
- **Arrow Keys (←→)**: Navigate columns
- **Number Keys (1-9, 0, -)**: Jump to specific column
- **Enter**: Toggle sort direction for selected column

## Configuration

### Exchange Configuration (`config.json`)
```json
{
  "enabledExchanges": ["lighter", "binance", "grvt", "aster", "backpack", "hyperliquid"]
}
```

### TypeScript Configuration
- Strict type checking enabled
- React JSX support
- Path aliases for cleaner imports
- ESNext target for modern features

## Development Notes

### State Management
- React hooks for local state
- No external state management library
- Custom hooks for complex data fetching logic

### Performance Considerations
- Data pagination (`DISPLAY_LIMIT`)
- Efficient sorting algorithms
- WebSocket for real-time updates where available
- Snapshot persistence for quick startup

### Error Handling
- Graceful degradation when exchanges are unavailable
- Connection retry logic for WebSocket
- Error display in UI

### Data Persistence
- Snapshots saved to local filesystem
- Quick startup with cached data
- Automatic cleanup of old snapshots

## Dependencies
- **ink**: React for CLIs
- **react**: UI library
- **@ppp606/ink-chart**: Chart components
- **ink-table**: Table components (customized)

## Runtime Requirements
- **Bun**: JavaScript runtime and package manager
- **Node.js compatibility**: Through Bun