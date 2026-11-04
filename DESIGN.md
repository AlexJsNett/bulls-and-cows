# Design

Game logic lives in `src/logic` and is a set of pure functions with no DOM, no classes and no
third-party helpers. `src/ui` and `src/main.ts` are a thin imperative shell that renders state.

## 1. Data structures and algorithms

### Secret and guess

Both are **strings** (`"0123"`). A string keeps leading zeros (a number would turn `0123` into `123`),
is cheap to compare and can be spread into an array of characters when needed. Hex digits are always
compared in lower case.

### Game state (`src/logic/types.ts`, `src/logic/state.ts`)

```ts
type GameState = {
  settings: { length; base };
  secret: string;
  history: readonly Attempt[]; // { guess, bulls, cows }
  status: "playing" | "won";
  startedAt: number;
  finishedAt: number | null;
};
```

- **`history` is an immutable array.** `submitGuess` returns a new state with
  `[...state.history, entry]`. Old entries are the same object references, so they cannot change
  and reference equality checks stay cheap. The history is ordered by time and only ever
  appended, so an array is the natural fit (a `Set` would lose order).
- The state is a plain object, so every transition is `(state, input) => newState` and can be tested
  without a browser. Time is passed in as `now` instead of calling `Date.now()` inside.
- Invalid, repeated or post-win guesses return the **same** state object (`===`), so the UI can
  detect "nothing happened".

### `generateSecret(length, base, random = Math.random)`

Partial Fisher-Yates style draw without mutation. A pool of the first `base` digits is kept; each
step takes index `floor(random() * pool.length)`, appends that digit to the result and removes it from
the pool (`filter`). The pool shrinks, so digits cannot repeat. Randomness is a parameter, so tests
pass a deterministic `random` (`() => 0` gives `0123`, `() => 0.999` gives `9876`).

### `evaluateGuess(secret, guess)`

```
bulls  = guess chars where char === secret char at the same index
common = guess chars that occur anywhere in the secret
cows   = common - bulls
```

Because digits are unique in both strings, every bull is also a "common" digit, so subtracting
bulls from the common count leaves exactly the digits that are present but misplaced. It is written
with `filter` and `includes` instead of counter loops.

### `countPossibleSecrets(length, base)`

The number of ordered selections of `length` different digits from `base` digits (the first digit may
be 0): `P(base, length) = base! / (base - length)!`. Recursive form:

```
count(0, base)      = 1
count(length, base) = base * count(length - 1, base - 1)
```

The function is wrapped with a generic `memoize` (a `Map` keyed by `JSON.stringify(args)`). Since the
recursion calls the memoized binding, sub-results (for example `count(3, 9)`) are cached as well.
When `length > base` the base case `base = 0` returns `0`.

### `createDigitValidator(base)`

A curried factory: `base => char => boolean`. It slices the first `base` characters of
`"0123456789abcdef"` once and returns a predicate which lowercases the char first. The same factory is
used by `isValidGuess` and by the input field (`src/ui/game.ts`) to filter typed characters.

### High scores (`src/logic/scores.ts`)

A flat array sorted by `compareScores` (attempts, then time). One list is shown with a
`length · base` badge on each row, and at most `TOP_N` entries are kept per combination. Storage
access takes a `getItem/setItem` object parameter, so tests use an in-memory fake. Corrupted
`localStorage` data is ignored.

## 2. Complexity

`n` = secret length (at most 6), `b` = base (at most 16).

| Function               | Time                         | Why                                                                                                                                                                                                               |
| ---------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret`       | O(n * b)                     | `n` draws; each draw filters the pool of at most `b` items. Space O(b).                                                                                                                                           |
| `evaluateGuess`        | O(n²)                        | two `filter` passes over `n` chars; `includes` scans up to `n` chars per char. With `n <= 6` this is cheaper than building a `Set`.                                                                               |
| `isValidGuess`         | O(n * b)                     | `every` runs the validator once per char; the validator calls `includes` on a string of at most `b` chars. Duplicate check with a `Set` is O(n). Both `n` and `b` are small constants, so in practice it is O(1). |
| `countPossibleSecrets` | O(n) first call, O(1) cached | recursion depth `n`, one multiplication per level. Memoization turns repeat calls into a `Map` lookup. Space O(n) for cache entries and call stack.                                                               |

## 3. Clean code principles

- **Pure functions / no side effects**: everything in `src/logic` returns new values. `submitGuess`
  (`state.ts`) never mutates `state`; `addScore` (`scores.ts`) copies the array before sorting.
- **Dependency injection for impurity**: `generateSecret(length, base, random)` takes the random
  source, `submitGuess(state, guess, now)` takes the time, `loadScores(storage)` takes the storage.
- **Single responsibility**: one file per concept (`digits.ts`, `evaluate.ts`, `secret.ts`,
  `count.ts`, `memoize.ts`, `state.ts`, `scores.ts`). UI files only build DOM (`ui/settings.ts`,
  `ui/game.ts`, `ui/scores.ts`); `main.ts` wires state and screens.
- **Meaningful names**: `bulls`, `cows`, `isValidGuess`, `availableLengths`, `elapsedMs`; no
  abbreviations, boolean names start with `is`.
- **No magic numbers**: `MIN_LENGTH`, `MAX_LENGTH`, `BASES` (`state.ts`), `TOP_N`, `STORAGE_KEY`
  (`scores.ts`), `ALPHABET` (`digits.ts`).
- **DRY**: one `createDigitValidator` is reused by validation and input filtering; one `el` helper
  (`ui/dom.ts`) builds all DOM and uses `textContent`, never `innerHTML`.
- **Small functions, early returns**: see `submitGuess` and `countPossibleSecrets`.
- **Tests first**: for each logic function a failing-test commit comes before the implementation
  commit (see `git log`).
