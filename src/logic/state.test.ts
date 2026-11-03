import { describe, expect, it } from "vitest";
import {
  availableLengths,
  createGame,
  elapsedMs,
  submitGuess,
} from "./state.js";

const game = () => createGame({ length: 4, base: 10 }, "0123", 1000);

describe("availableLengths", () => {
  it("offers 2-6 for decimal, octal and hex", () => {
    expect(availableLengths(10)).toEqual([2, 3, 4, 5, 6]);
    expect(availableLengths(8)).toEqual([2, 3, 4, 5, 6]);
    expect(availableLengths(16)).toEqual([2, 3, 4, 5, 6]);
  });

  it("offers only 2 for binary", () => {
    expect(availableLengths(2)).toEqual([2]);
  });
});

describe("createGame", () => {
  it("starts playing with empty history", () => {
    expect(game()).toEqual({
      settings: { length: 4, base: 10 },
      secret: "0123",
      history: [],
      status: "playing",
      startedAt: 1000,
      finishedAt: null,
    });
  });
});

describe("submitGuess", () => {
  it("appends an attempt with bulls and cows", () => {
    const next = submitGuess(game(), "0132", 2000);
    expect(next.history).toEqual([{ guess: "0132", bulls: 2, cows: 2 }]);
    expect(next.status).toBe("playing");
  });

  it("does not mutate the previous state or history", () => {
    const first = submitGuess(game(), "0132", 2000);
    const frozenHistory = first.history;
    const second = submitGuess(first, "4567", 3000);
    expect(first.history).toBe(frozenHistory);
    expect(first.history).toHaveLength(1);
    expect(second.history).toHaveLength(2);
    expect(second.history[0]).toBe(first.history[0]);
    expect(second).not.toBe(first);
  });

  it("wins when bulls equal length and records finish time", () => {
    const won = submitGuess(game(), "0123", 5000);
    expect(won.status).toBe("won");
    expect(won.finishedAt).toBe(5000);
    expect(won.history[0]).toEqual({ guess: "0123", bulls: 4, cows: 0 });
  });

  it("ignores a repeated guess", () => {
    const first = submitGuess(game(), "0132", 2000);
    expect(submitGuess(first, "0132", 3000)).toBe(first);
  });

  it("ignores a repeated hex guess in a different case", () => {
    const hex = createGame({ length: 2, base: 16 }, "ab", 0);
    const first = submitGuess(hex, "cd", 1);
    expect(submitGuess(first, "CD", 2)).toBe(first);
  });

  it("ignores invalid guesses", () => {
    const state = game();
    expect(submitGuess(state, "12", 2000)).toBe(state);
    expect(submitGuess(state, "1123", 2000)).toBe(state);
    expect(submitGuess(state, "12a4", 2000)).toBe(state);
  });

  it("ignores guesses after the game is won", () => {
    const won = submitGuess(game(), "0123", 5000);
    expect(submitGuess(won, "4567", 6000)).toBe(won);
  });
});

describe("elapsedMs", () => {
  it("measures from start to now while playing", () => {
    expect(elapsedMs(game(), 4500)).toBe(3500);
  });

  it("freezes at the finish time once won", () => {
    const won = submitGuess(game(), "0123", 5000);
    expect(elapsedMs(won, 9000)).toBe(4000);
  });
});
