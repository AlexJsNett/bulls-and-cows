import type { Score } from "../logic/types.js";
import { el } from "./dom.js";
import { baseLabel, formatTime } from "./format.js";

export const renderScores = (scores: readonly Score[]): HTMLElement => {
  const header = el(
    "tr",
    {},
    ...["#", "Settings", "Attempts", "Time"].map((text) =>
      el("th", { textContent: text }),
    ),
  );
  const rows = scores.map((score, i) =>
    el(
      "tr",
      {},
      el("td", { textContent: String(i + 1) }),
      el(
        "td",
        {},
        el("span", {
          className: "badge",
          textContent: `${score.length} · ${baseLabel(score.base)}`,
        }),
      ),
      el("td", { textContent: String(score.attempts) }),
      el("td", { textContent: formatTime(score.timeMs) }),
    ),
  );
  return el(
    "section",
    { className: "scores" },
    el("h2", { textContent: "High scores" }),
    scores.length === 0
      ? el("p", { className: "hint", textContent: "No results yet." })
      : el("table", {}, el("thead", {}, header), el("tbody", {}, ...rows)),
  );
};
