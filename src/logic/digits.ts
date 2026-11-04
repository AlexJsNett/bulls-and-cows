export const ALPHABET = "0123456789abcdef";

export const createDigitValidator = (base: number) => {
  const digits = ALPHABET.slice(0, base);
  return (char: string): boolean =>
    char.length === 1 && digits.includes(char.toLowerCase());
};
