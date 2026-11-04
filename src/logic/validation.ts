import { createDigitValidator } from "./digits.js";

export const isValidGuess = (
  guess: string,
  length: number,
  base: number,
): boolean => {
  const chars = [...guess.toLowerCase()];
  return (
    chars.length === length &&
    chars.every(createDigitValidator(base)) &&
    new Set(chars).size === length
  );
};
