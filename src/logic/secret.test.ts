import { describe, expect, it } from "vitest";
import { generateSecret } from "./secret.js";

const sequence = (values: readonly number[]) => {
  let i = 0;
  return () => values[i++ % values.length] as number;
};

describe("generateSecret", () => {
  it("picks the first remaining digit when random always returns 0", () => {
    expect(generateSecret(4, 10, () => 0)).toBe("0123");
  });

  it("picks the last remaining digit when random is close to 1", () => {
    expect(generateSecret(4, 10, () => 0.999)).toBe("9876");
  });

  it("follows a scripted random sequence", () => {
    // pool 0-9: 0.5 -> idx 5 -> "5"; pool 0-4,6-9: 0.0 -> "0"; 0.99 -> "9"
    expect(generateSecret(3, 10, sequence([0.5, 0, 0.99]))).toBe("509");
  });

  it("returns the requested number of characters", () => {
    expect(generateSecret(6, 16, () => 0.3)).toHaveLength(6);
  });

  it("never repeats a digit", () => {
    const secret = generateSecret(6, 16, sequence([0.1, 0.9, 0.5, 0.3]));
    expect(new Set(secret).size).toBe(6);
  });

  it("only uses digits from the requested base", () => {
    expect(generateSecret(2, 2, () => 0)).toMatch(/^[01]{2}$/);
    expect(generateSecret(6, 8, () => 0.999)).toMatch(/^[0-7]{6}$/);
  });

  it("can produce a secret with a leading zero", () => {
    expect(generateSecret(3, 10, () => 0).startsWith("0")).toBe(true);
  });

  it("is repeatable with the same random source", () => {
    expect(generateSecret(4, 10, sequence([0.2, 0.7, 0.4]))).toBe(
      generateSecret(4, 10, sequence([0.2, 0.7, 0.4])),
    );
  });

  it("uses Math.random by default", () => {
    expect(generateSecret(4, 10)).toMatch(/^\d{4}$/);
  });

  it("throws when length exceeds the number of digits in the base", () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
  });
});
