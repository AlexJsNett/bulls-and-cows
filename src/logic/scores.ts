import type { Score } from "./types";

export const TOP_N = 10;
export const STORAGE_KEY = "bulls-and-cows:scores";

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

export const compareScores = (a: Score, b: Score): number =>
  a.attempts - b.attempts || a.timeMs - b.timeMs;

const sameCombination = (a: Score, b: Score): boolean =>
  a.length === b.length && a.base === b.base;

export const addScore = (
  scores: readonly Score[],
  score: Score,
  limit: number = TOP_N,
): readonly Score[] => {
  const sorted = [...scores, score].sort(compareScores);
  return sorted.filter(
    (s, i) =>
      sorted.slice(0, i).filter((o) => sameCombination(o, s)).length < limit,
  );
};

const isScore = (value: unknown): value is Score => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.length === "number" &&
    typeof v.base === "number" &&
    typeof v.attempts === "number" &&
    typeof v.timeMs === "number" &&
    typeof v.playedAt === "number"
  );
};

export const loadScores = (storage: KeyValueStorage): readonly Score[] => {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isScore) : [];
  } catch {
    return [];
  }
};

export const saveScores = (
  storage: KeyValueStorage,
  scores: readonly Score[],
): void => {
  storage.setItem(STORAGE_KEY, JSON.stringify(scores));
};
