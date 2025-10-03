import { readFileSync } from "fs";
import path from "path";

export type ExchangeKey = "lighter" | "binance" | "edgex" | "grvt" | "aster" | "backpack";

export interface AppConfig {
  enabledExchanges: ExchangeKey[];
}

const DEFAULT_CONFIG: AppConfig = {
  enabledExchanges: ["lighter", "binance", "edgex", "grvt", "aster", "backpack"],
};

export const loadConfigSync = (): AppConfig => {
  const configPath = path.join(process.cwd(), "config.json");
  try {
    const contents = readFileSync(configPath, "utf8");
    const parsed = JSON.parse(contents) as Partial<AppConfig>;

    const enabled = Array.isArray(parsed.enabledExchanges)
      ? (parsed.enabledExchanges.filter((e) =>
          ["lighter", "binance", "edgex", "grvt", "aster", "backpack"].includes(e as string)
        ) as ExchangeKey[])
      : DEFAULT_CONFIG.enabledExchanges;

    return { enabledExchanges: enabled.length ? enabled : DEFAULT_CONFIG.enabledExchanges };
  } catch {
    return DEFAULT_CONFIG;
  }
};


