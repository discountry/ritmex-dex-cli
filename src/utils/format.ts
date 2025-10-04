export const NORMALISE_REGEX = /(USDT|USD)$/i;

export const normaliseSymbol = (contractName: string): string =>
  contractName.replace(NORMALISE_REGEX, "").toUpperCase();

// Convert Hyperliquid internal symbols (kSYMBOL) to standardized format (1000SYMBOL)
export const convertHyperliquidSymbol = (symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  
  // Handle k prefix maps (kBONK -> 1000BONK, kFLOKI -> 1000FLOKI, etc.)
  if (upperSymbol.startsWith("K")) {
    const baseSymbol = upperSymbol.substring(1);
    return `1000${baseSymbol}`;
  }
  
  return upperSymbol;
};

export const parseNumber = (value: string | number | undefined | null): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatPercentWithSign = (value: number | undefined): string => {
  if (value === undefined || !Number.isFinite(value)) {
    return "--";
  }

  const percent = value * 100;
  const formatted = percent.toFixed(4);

  if (percent > 0) {
    return `+${formatted}%`;
  }

  return `${formatted}%`;
};

export const formatRateValue = (value: number | undefined): string => formatPercentWithSign(value);

export const formatArbValue = (value: number | undefined): string => formatPercentWithSign(value);

export const formatUsd = (value: number | undefined): string => {
  if (value === undefined || !Number.isFinite(value)) return "--";
  const sign = value >= 0 ? "" : "-";
  const abs = Math.abs(value);
  const formatted = abs >= 1000 ? abs.toLocaleString(undefined, { maximumFractionDigits: 2 }) : abs.toFixed(2);
  return `${sign}$${formatted}`;
};
