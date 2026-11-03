import { describe, expect, it } from "vitest";
import { countPossibleSecrets } from "./count";

describe("countPossibleSecrets", () => {
  it("returns 1 for length 0", () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it("counts permutations P(base, length) for decimal", () => {
    expect(countPossibleSecrets(1, 10)).toBe(10);
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it("includes secrets that start with zero", () => {
    // 10 * 9 * 8 * 7 = 5040, not 9 * 9 * 8 * 7
    expect(countPossibleSecrets(4, 10)).not.toBe(4536);
  });

  it("counts binary secrets", () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it("counts octal and hex secrets", () => {
    expect(countPossibleSecrets(6, 8)).toBe(20160);
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it("returns 0 when length exceeds base", () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it("returns the same value on repeated calls", () => {
    expect(countPossibleSecrets(5, 16)).toBe(countPossibleSecrets(5, 16));
  });
});
