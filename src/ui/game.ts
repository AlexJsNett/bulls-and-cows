import { ALPHABET, createDigitValidator } from "../logic/digits.js";
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

  const plural = (count: number, word: string) =>
    `${count} ${word}${count === 1 ? "" : "s"}`;

  const history = el(
    "ol",
    { className: "history" },
    ...state.history.map((attempt, i) =>
      el(
        "li",
        {},
        el("span", { className: "num", textContent: String(i + 1) }),
        el(
          "span",
          { className: "tiles" },
          ...[...attempt.guess].map((char) =>
            el("span", {
              className: "tile",
              textContent: char.toUpperCase(),
            }),
          ),
        ),
        el(
          "span",
          { className: "clue" },
          el("span", {
            className: "clue-text",
            textContent: `${plural(attempt.bulls, "bull")}, ${plural(attempt.cows, "cow")}`,
          }),
          el("span", {
            className: "clue-icons",
            ariaHidden: "true",
            textContent:
              "\u{1F402}".repeat(attempt.bulls) +
              "\u{1F404}".repeat(attempt.cows),
          }),
        ),
      ),
    ),
  );

  const keypad = el(
    "div",
    { className: "keypad" },
    ...[...ALPHABET.slice(0, base)].filter(isDigit).map((digit) =>
      el("button", {
        type: "button",
        className: "key",
        textContent: digit.toUpperCase(),
        onclick: () => {
          if (input.value.length < length && !input.value.includes(digit)) {
            input.value += digit;
          }
          input.focus();
        },
      }),
    ),
    el("button", {
      type: "button",
      className: "key key-wide",
      textContent: "\u232B",
      ariaLabel: "Delete",
      onclick: () => {
        input.value = input.value.slice(0, -1);
        input.focus();
      },
    }),
  );

  const legend = el("p", {
    className: "legend",
    textContent: "\u{1F402} right place \u00B7 \u{1F404} wrong place",
  });

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

  const top = won ? [controls] : [];
  const entry = won ? [] : [history, controls, message, keypad];

  const root = el(
    "section",
    { className: "game" },
    el(
      "div",
      { className: "status" },
      el("span", {}, "Time ", timer),
      el("span", { textContent: `Attempts ${state.history.length}` }),
    ),
    legend,
    ...top,
    ...(won ? [history] : entry),
  );

  const tick = (now: number) => {
    timer.textContent = formatTime(elapsedMs(state, now));
  };
  tick(Date.now());
  return { root, tick };
};
