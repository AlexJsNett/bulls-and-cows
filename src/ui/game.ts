import { createDigitValidator } from "../logic/digits.js";
import { elapsedMs } from "../logic/state.js";
import type { GameState } from "../logic/types.js";
import { el } from "./dom.js";
import { formatTime } from "./format.js";

export type GameView = {
  readonly root: HTMLElement;
  readonly tick: (now: number) => void;
};

export const renderGame = (
  state: GameState,
  handlers: {
    onGuess: (guess: string) => string | null;
    onNewGame: () => void;
  },
): GameView => {
  const { length, base } = state.settings;
  const isDigit = createDigitValidator(base);
  const won = state.status === "won";

  const timer = el("span", { className: "timer" });
  const message = el("p", { className: "message", role: "status" });
  const input = el("input", {
    type: "text",
    maxLength: length,
    autocomplete: "off",
    placeholder: `${length} unique digits`,
    disabled: won,
  });

  input.addEventListener("input", () => {
    input.value = [...input.value].filter(isDigit).join("");
  });

  const submit = () => {
    const error = handlers.onGuess(input.value);
    if (error) {
      message.textContent = error;
      input.focus();
    }
  };
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });

  const history = el(
    "ol",
    { className: "history" },
    ...[...state.history].reverse().map((attempt) =>
      el(
        "li",
        {},
        el("span", {
          className: "guess",
          textContent: attempt.guess.toUpperCase(),
        }),
        el("span", {
          className: "chip bulls",
          textContent: `${attempt.bulls} ${attempt.bulls === 1 ? "bull" : "bulls"}`,
        }),
        el("span", {
          className: "chip cows",
          textContent: `${attempt.cows} ${attempt.cows === 1 ? "cow" : "cows"}`,
        }),
      ),
    ),
  );

  const controls = won
    ? el(
        "div",
        { className: "result" },
        el("p", {
          textContent: `You won in ${state.history.length} attempts, ${formatTime(elapsedMs(state, 0))}!`,
        }),
        el("button", { textContent: "New game", onclick: handlers.onNewGame }),
      )
    : el(
        "div",
        { className: "controls" },
        input,
        el("button", { textContent: "Guess", onclick: submit }),
      );

  const root = el(
    "section",
    { className: "game" },
    el(
      "div",
      { className: "status" },
      el("span", {}, "Time ", timer),
      el("span", { textContent: `Attempts ${state.history.length}` }),
    ),
    controls,
    message,
    history,
  );

  const tick = (now: number) => {
    timer.textContent = formatTime(elapsedMs(state, now));
  };
  tick(Date.now());
  return { root, tick };
};
