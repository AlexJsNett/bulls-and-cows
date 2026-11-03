import type { Random } from "./types";

export const generateSecret = (
  _length: number,
  _base: number,
  _random: Random = Math.random,
): string => {
  throw new Error("not implemented");
};
