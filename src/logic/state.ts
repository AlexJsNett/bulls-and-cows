import { evaluateGuess } from "./evaluate.js";
import { isValidGuess } from "./validation.js";
import type { Base, GameState, Settings } from "./types.js";

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;
export const BASES: readonly Base[] = [2, 8, 10, 16];

export const availableLengths = (base: Base): readonly number[] =>
  Array.from(
    { length: Math.min(MAX_LENGTH, base) - MIN_LENGTH + 1 },
    (_, i) => MIN_LENGTH + i,
  );

export const createGame = (
  settings: Settings,
  secret: string,
  now: number,
): GameState => ({
  settings,
  secret,
  history: [],
  status: "playing",
  startedAt: now,
  finishedAt: null,
});

export const submitGuess = (
  state: GameState,
  guess: string,
  now: number,
): GameState => {
  const { length, base } = state.settings;
  const normalized = guess.toLowerCase();
  const isRepeat = state.history.some((a) => a.guess === normalized);
  if (
    state.status === "won" ||
    isRepeat ||
    !isValidGuess(normalized, length, base)
  ) {
    return state;
  }
  const { bulls, cows } = evaluateGuess(state.secret, normalized);
  const won = bulls === length;
  return {
    ...state,
    history: [...state.history, { guess: normalized, bulls, cows }],
    status: won ? "won" : "playing",
    finishedAt: won ? now : null,
  };
};

export const elapsedMs = (state: GameState, now: number): number =>
  (state.finishedAt ?? now) - state.startedAt;
