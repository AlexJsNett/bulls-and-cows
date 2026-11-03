import type { Score } from "./types";

export const TOP_N = 10;
export const STORAGE_KEY = "bulls-and-cows:scores";

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

export const compareScores = (_a: Score, _b: Score): number => {
  throw new Error("not implemented");
};

export const addScore = (
  _scores: readonly Score[],
  _score: Score,
  _limit: number = TOP_N,
): readonly Score[] => {
  throw new Error("not implemented");
};

export const loadScores = (_storage: KeyValueStorage): readonly Score[] => {
  throw new Error("not implemented");
};

export const saveScores = (
  _storage: KeyValueStorage,
  _scores: readonly Score[],
): void => {
  throw new Error("not implemented");
};
