import { generateSecret } from "./logic/secret.js";
import { addScore, loadScores, saveScores } from "./logic/scores.js";
import { createGame, submitGuess } from "./logic/state.js";
import { isValidGuess } from "./logic/validation.js";
import type { GameState, Score, Settings } from "./logic/types.js";
import { el } from "./ui/dom.js";
import { renderGame, type GameView } from "./ui/game.js";
import { renderScores } from "./ui/scores.js";
import { renderSettings } from "./ui/settings.js";

type Screen =
  | { readonly kind: "settings"; readonly settings: Settings }
  | { readonly kind: "game"; readonly game: GameState };

const root = document.body;
let screen: Screen = { kind: "settings", settings: { length: 4, base: 10 } };
let scores: readonly Score[] = loadScores(localStorage);
let timerId: number | undefined;

const stopTimer = () => window.clearInterval(timerId);

const startGame = (settings: Settings) => {
  const secret = generateSecret(settings.length, settings.base);
  screen = { kind: "game", game: createGame(settings, secret, Date.now()) };
  render();
};

const guess = (input: string): string | null => {
  if (screen.kind !== "game") return null;
  const { game } = screen;
  const { length, base } = game.settings;
  const normalized = input.toLowerCase();
  if (!isValidGuess(normalized, length, base)) {
    return `Enter ${length} different digits.`;
  }
  if (game.history.some((a) => a.guess === normalized)) {
    return "You already tried this number.";
  }
  const next = submitGuess(game, normalized, Date.now());
  if (next.status === "won" && next.finishedAt !== null) {
    scores = addScore(scores, {
      length,
      base,
      attempts: next.history.length,
      timeMs: next.finishedAt - next.startedAt,
      playedAt: next.finishedAt,
    });
    saveScores(localStorage, scores);
  }
  screen = { kind: "game", game: next };
  render();
  return null;
};

const newGame = () => {
  screen =
    screen.kind === "game"
      ? { kind: "settings", settings: screen.game.settings }
      : screen;
  render();
};

const render = () => {
  stopTimer();
  let view: GameView | undefined;
  const body =
    screen.kind === "settings"
      ? el(
          "div",
          {},
          renderSettings(screen.settings, {
            locked: false,
            onChange: (settings) => {
              screen = { kind: "settings", settings };
              render();
            },
          }),
          el("button", {
            textContent: "Start",
            onclick: () => {
              if (screen.kind === "settings") startGame(screen.settings);
            },
          }),
        )
      : (() => {
          view = renderGame(screen.game, {
            onGuess: guess,
            onNewGame: newGame,
          });
          return el(
            "div",
            {},
            renderSettings(screen.game.settings, {
              locked: true,
              onChange: () => undefined,
            }),
            view.root,
          );
        })();

  root.replaceChildren(
    el(
      "main",
      {},
      el("h1", { textContent: "Bulls and Cows" }),
      body,
      renderScores(scores),
    ),
  );

  if (screen.kind === "game") {
    const current = view;
    if (screen.game.status === "playing" && current) {
      timerId = window.setInterval(() => current.tick(Date.now()), 250);
    }
    root.querySelector("input")?.focus();
  }
};

render();
