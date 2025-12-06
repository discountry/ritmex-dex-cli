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

  // Rates from providers are already expressed in percent units (e.g., 0.0012 = 0.0012%),
  // so we avoid re-scaling and only format/sign them.
  const formatted = value.toFixed(4);

  if (value > 0) {
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
