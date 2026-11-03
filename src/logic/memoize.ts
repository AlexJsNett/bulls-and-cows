export const memoize = <Args extends unknown[], Result>(
  _fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  throw new Error("not implemented");
};
