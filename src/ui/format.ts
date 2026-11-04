export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const baseLabel = (base: number): string =>
  ({ 2: "bin", 8: "oct", 10: "dec", 16: "hex" })[base] ?? String(base);
