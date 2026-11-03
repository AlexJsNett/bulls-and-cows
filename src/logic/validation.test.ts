import { describe, expect, it } from "vitest";
import { isValidGuess } from "./validation";

describe("isValidGuess", () => {
  it("accepts a guess of correct length with unique valid digits", () => {
    expect(isValidGuess("1234", 4, 10)).toBe(true);
  });

  it("accepts a leading zero", () => {
    expect(isValidGuess("0123", 4, 10)).toBe(true);
  });

  it("rejects a guess that is too short", () => {
    expect(isValidGuess("123", 4, 10)).toBe(false);
  });

  it("rejects a guess that is too long", () => {
    expect(isValidGuess("12345", 4, 10)).toBe(false);
  });

  it("rejects an empty guess", () => {
    expect(isValidGuess("", 2, 10)).toBe(false);
  });

  it("rejects digits outside of the base", () => {
    expect(isValidGuess("12", 2, 2)).toBe(false);
    expect(isValidGuess("89", 2, 8)).toBe(false);
    expect(isValidGuess("1a", 2, 10)).toBe(false);
  });

  it("rejects repeated digits", () => {
    expect(isValidGuess("1123", 4, 10)).toBe(false);
  });

  it("treats hex digits case-insensitively, including repeats", () => {
    expect(isValidGuess("aBcD", 4, 16)).toBe(true);
    expect(isValidGuess("aA", 2, 16)).toBe(false);
  });

  it("accepts the only valid binary guesses of length 2", () => {
    expect(isValidGuess("01", 2, 2)).toBe(true);
    expect(isValidGuess("10", 2, 2)).toBe(true);
    expect(isValidGuess("11", 2, 2)).toBe(false);
  });
});
