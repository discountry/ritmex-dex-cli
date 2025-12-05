import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { promises as fs } from "fs";
import path from "path";
import { LIGHTER_HISTORY_CACHE_MS } from "./constants";
import type { LighterHistoryRow, LighterHistorySnapshot } from "../types/lighter-history";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "lighter-history.json");

const ensureDirectory = () => {
  const directory = path.dirname(SNAPSHOT_PATH);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
};

const isLighterHistoryRow = (value: unknown): value is LighterHistoryRow => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.marketId === "number" &&
    typeof candidate.symbol === "string" &&
    Array.isArray(candidate.series)
  );
};

const sanitiseSnapshot = (raw: unknown): LighterHistorySnapshot | null => {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const rows = candidate.rows;
  const lastUpdated = candidate.lastUpdated;

  if (!Array.isArray(rows) || typeof lastUpdated !== "string") return null;

  const parsedRows = rows.filter(isLighterHistoryRow) as LighterHistoryRow[];
  const snapshot: LighterHistorySnapshot = { rows: parsedRows, lastUpdated };

  const ageMs = Date.now() - new Date(lastUpdated).getTime();
  if (Number.isFinite(ageMs) && ageMs <= LIGHTER_HISTORY_CACHE_MS) {
    return snapshot;
  }

  return null;
};

export const loadLighterHistorySnapshotSync = (): LighterHistorySnapshot | null => {
  try {
    const contents = readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(contents) as unknown;
    return sanitiseSnapshot(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    console.error("Failed to load lighter history snapshot:", error);
    return null;
  }
};

export const saveLighterHistorySnapshot = async (snapshot: LighterHistorySnapshot): Promise<void> => {
  if (!snapshot.rows.length) return;
  ensureDirectory();
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
};

export const saveLighterHistorySnapshotSync = (snapshot: LighterHistorySnapshot): void => {
  if (!snapshot.rows.length) return;
  try {
    ensureDirectory();
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to persist lighter history snapshot:", error);
  }
};
