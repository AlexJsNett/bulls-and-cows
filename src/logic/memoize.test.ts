import { describe, expect, it, vi } from "vitest";
import { memoize } from "./memoize.js";

describe("memoize", () => {
  it("returns the same result as the original function", () => {
    const add = memoize((a: number, b: number) => a + b);
    expect(add(1, 2)).toBe(3);
  });

  it("calls the original function once per distinct arguments", () => {
    const fn = vi.fn((a: number, b: number) => a * b);
    const mul = memoize(fn);
    mul(2, 3);
    mul(2, 3);
    mul(3, 2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("caches falsy results too", () => {
    const fn = vi.fn((n: number) => n - n);
    const zero = memoize(fn);
    zero(5);
    zero(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
