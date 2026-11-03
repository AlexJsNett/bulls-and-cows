import type { Base, GameState, Settings } from "./types";

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;
export const BASES: readonly Base[] = [2, 8, 10, 16];

export const availableLengths = (_base: Base): readonly number[] => {
  throw new Error("not implemented");
};

export const createGame = (
  _settings: Settings,
  _secret: string,
  _now: number,
): GameState => {
  throw new Error("not implemented");
};

export const submitGuess = (
  _state: GameState,
  _guess: string,
  _now: number,
): GameState => {
  throw new Error("not implemented");
};

export const elapsedMs = (_state: GameState, _now: number): number => {
  throw new Error("not implemented");
};
