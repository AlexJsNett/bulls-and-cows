export type Base = 2 | 8 | 10 | 16;

export type Random = () => number;

export type Evaluation = { readonly bulls: number; readonly cows: number };

export type Settings = { readonly length: number; readonly base: Base };

export type Attempt = {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
};

export type GameState = {
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly Attempt[];
  readonly status: "playing" | "won";
  readonly startedAt: number;
  readonly finishedAt: number | null;
};

export type Score = {
  readonly length: number;
  readonly base: Base;
  readonly attempts: number;
  readonly timeMs: number;
  readonly playedAt: number;
};
