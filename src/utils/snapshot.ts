import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { promises as fs } from "fs";
import path from "path";
import type { FundingSnapshot, TableRow } from "../types/table";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "funding-snapshot.json");

const ensureDirectory = () => {
  const directory = path.dirname(SNAPSHOT_PATH);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
};

const isTableRow = (value: unknown): value is TableRow => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return typeof candidate.symbol === "string" && typeof candidate.contractName === "string";
};

const sanitiseSnapshot = (raw: unknown): FundingSnapshot | null => {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const rows = candidate.rows;
  const lastUpdated = candidate.lastUpdated;

  if (!Array.isArray(rows) || typeof lastUpdated !== "string") return null;

  const parsedRows = rows.filter(isTableRow) as TableRow[];

  return {
    rows: parsedRows,
    lastUpdated,
  };
};

export const loadSnapshotSync = (): FundingSnapshot | null => {
  try {
    const contents = readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(contents) as unknown;
    return sanitiseSnapshot(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    console.error("Failed to load funding snapshot:", error);
    return null;
  }
};

export const saveSnapshot = async (snapshot: FundingSnapshot): Promise<void> => {
  if (!snapshot.rows.length) return;
  ensureDirectory();
  const serialised = JSON.stringify(snapshot, null, 2);
  await fs.writeFile(SNAPSHOT_PATH, serialised, "utf8");
};

export const saveSnapshotSync = (snapshot: FundingSnapshot): void => {
  if (!snapshot.rows.length) return;
  try {
    ensureDirectory();
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to persist funding snapshot:", error);
  }
};
