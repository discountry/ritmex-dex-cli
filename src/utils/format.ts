export const NORMALISE_REGEX = /(USDT|USD)$/i;

export const normaliseSymbol = (contractName: string): string =>
  contractName.replace(NORMALISE_REGEX, "").toUpperCase();

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
