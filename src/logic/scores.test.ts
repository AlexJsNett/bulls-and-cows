import { describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  addScore,
  compareScores,
  loadScores,
  saveScores,
  type KeyValueStorage,
} from "./scores.js";
import type { Score } from "./types.js";

const score = (
  attempts: number,
  timeMs: number,
  length = 4,
  base = 10,
): Score => ({
  length,
  base: base as Score["base"],
  attempts,
  timeMs,
  playedAt: 0,
});

const memoryStorage = (
  initial?: string,
): KeyValueStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(STORAGE_KEY, initial);
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
};

describe("compareScores", () => {
  it("ranks fewer attempts first", () => {
    expect(compareScores(score(3, 9000), score(5, 1000))).toBeLessThan(0);
  });

  it("breaks ties by lower time", () => {
    expect(compareScores(score(3, 1000), score(3, 2000))).toBeLessThan(0);
    expect(compareScores(score(3, 2000), score(3, 1000))).toBeGreaterThan(0);
  });
});

describe("addScore", () => {
  it("inserts in sorted order without mutating the input", () => {
    const scores = [score(2, 1000), score(6, 1000)];
    const next = addScore(scores, score(4, 1000));
    expect(next.map((s) => s.attempts)).toEqual([2, 4, 6]);
    expect(scores).toHaveLength(2);
  });

  it("keeps only the top N per length/base combination", () => {
    const scores = [score(1, 1), score(2, 1), score(3, 1)];
    const next = addScore(scores, score(9, 1), 3);
    expect(next.map((s) => s.attempts)).toEqual([1, 2, 3]);
  });

  it("replaces the worst entry when the new score is better", () => {
    const scores = [score(1, 1), score(2, 1), score(3, 1)];
    const next = addScore(scores, score(2, 0), 3);
    expect(next.map((s) => [s.attempts, s.timeMs])).toEqual([
      [1, 1],
      [2, 0],
      [2, 1],
    ]);
  });

  it("limits each length/base combination independently", () => {
    const scores = [score(1, 1, 4, 10), score(2, 1, 4, 10)];
    const next = addScore(scores, score(9, 1, 2, 2), 2);
    expect(next).toHaveLength(3);
  });
});

describe("storage", () => {
  it("round-trips scores", () => {
    const storage = memoryStorage();
    const scores = [score(3, 1200), score(5, 800)];
    saveScores(storage, scores);
    expect(loadScores(storage)).toEqual(scores);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadScores(memoryStorage())).toEqual([]);
  });

  it("returns an empty list for corrupted data", () => {
    expect(loadScores(memoryStorage("{not json"))).toEqual([]);
    expect(loadScores(memoryStorage('{"a":1}'))).toEqual([]);
  });

  it("drops malformed entries", () => {
    const stored = JSON.stringify([score(3, 1200), { attempts: "x" }]);
    expect(loadScores(memoryStorage(stored))).toEqual([score(3, 1200)]);
  });
});
