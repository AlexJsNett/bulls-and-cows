import type { Evaluation } from "./types.js";

export const evaluateGuess = (secret: string, guess: string): Evaluation => {
  const secretChars = [...secret.toLowerCase()];
  const guessChars = [...guess.toLowerCase()];
  const bulls = guessChars.filter((char, i) => char === secretChars[i]).length;
  const common = guessChars.filter((char) => secretChars.includes(char)).length;
  return { bulls, cows: common - bulls };
};
