import { countPossibleSecrets } from "../logic/count.js";
import { BASES, availableLengths } from "../logic/state.js";
import type { Base, Settings } from "../logic/types.js";
import { el } from "./dom.js";
import { baseLabel } from "./format.js";

const field = (label: string, control: HTMLElement) =>
  el(
    "label",
    { className: "field" },
    el("span", { textContent: label }),
    control,
  );

export const renderSettings = (
  settings: Settings,
  options: { locked: boolean; onChange: (next: Settings) => void },
): HTMLElement => {
  const { locked, onChange } = options;

  const baseSelect = el(
    "select",
    { id: "base", disabled: locked },
    ...BASES.map((base) =>
      el("option", {
        value: String(base),
        textContent: `${baseLabel(base)} (${base})`,
        selected: base === settings.base,
      }),
    ),
  );

  const allowed = availableLengths(settings.base);
  const lengthSelect = el(
    "select",
    { id: "length", disabled: locked },
    ...[2, 3, 4, 5, 6].map((length) =>
      el("option", {
        value: String(length),
        textContent: String(length),
        selected: length === settings.length,
        disabled: !allowed.includes(length),
      }),
    ),
  );

  baseSelect.addEventListener("change", () => {
    const base = Number(baseSelect.value) as Base;
    const lengths = availableLengths(base);
    const length = lengths.includes(settings.length)
      ? settings.length
      : (lengths[lengths.length - 1] as number);
    onChange({ length, base });
  });
  lengthSelect.addEventListener("change", () =>
    onChange({ ...settings, length: Number(lengthSelect.value) }),
  );

  return el(
    "section",
    { className: "settings" },
    field("Base", baseSelect),
    field("Length", lengthSelect),
    el("p", {
      className: "hint",
      textContent: `Possible secrets: ${countPossibleSecrets(settings.length, settings.base).toLocaleString("en-US")}`,
    }),
  );
};
