import { describe, expect, it } from "vitest";
import { evaluateGuess } from "./evaluate";

describe("evaluateGuess", () => {
  it("returns 4 bulls for an exact match", () => {
    expect(evaluateGuess("1234", "1234")).toEqual({ bulls: 4, cows: 0 });
  });

  it("returns 0 bulls and 0 cows when nothing matches", () => {
    expect(evaluateGuess("1234", "5678")).toEqual({ bulls: 0, cows: 0 });
  });

  it("returns only cows when all digits are in wrong places", () => {
    expect(evaluateGuess("1234", "4321")).toEqual({ bulls: 0, cows: 4 });
  });

  it("counts bulls and cows together", () => {
    expect(evaluateGuess("0123", "0321")).toEqual({ bulls: 2, cows: 2 });
    expect(evaluateGuess("1234", "1359")).toEqual({ bulls: 1, cows: 1 });
  });

  it("handles a leading zero", () => {
    expect(evaluateGuess("0123", "1023")).toEqual({ bulls: 2, cows: 2 });
  });

  it("ignores hex letter case in both secret and guess", () => {
    expect(evaluateGuess("a1B2", "A1b2")).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess("abcd", "DCBA")).toEqual({ bulls: 0, cows: 4 });
  });

  it("works for binary length 2", () => {
    expect(evaluateGuess("01", "10")).toEqual({ bulls: 0, cows: 2 });
    expect(evaluateGuess("01", "01")).toEqual({ bulls: 2, cows: 0 });
  });

  it("does not mutate its inputs and is repeatable", () => {
    const first = evaluateGuess("1234", "1243");
    const second = evaluateGuess("1234", "1243");
    expect(first).toEqual({ bulls: 2, cows: 2 });
    expect(second).toEqual(first);
  });
});
