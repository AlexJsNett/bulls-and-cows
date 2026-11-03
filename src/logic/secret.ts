import { ALPHABET } from "./digits";
import type { Random } from "./types";

type Draw = { readonly pool: readonly string[]; readonly picked: string };

export const generateSecret = (
  length: number,
  base: number,
  random: Random = Math.random,
): string => {
  if (length > base) {
    throw new RangeError("length cannot exceed the number of digits in base");
  }
  const initial: Draw = { pool: [...ALPHABET.slice(0, base)], picked: "" };
  const { picked } = Array.from({ length }).reduce<Draw>(({ pool, picked }) => {
    const index = Math.floor(random() * pool.length);
    return {
      pool: pool.filter((_, i) => i !== index),
      picked: picked + pool[index],
    };
  }, initial);
  return picked;
};
