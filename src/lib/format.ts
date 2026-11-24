export const fmt = (n: number) => n.toLocaleString("en-US");

export function fmtDelta(n: number | null): string {
  if (n === null) return "—";
  return (n > 0 ? "+" : "") + fmt(n);
}

/** ハイドレーション時の差異を避けるため、ロケールに依存しない固定書式にする。 */
export function fmtDateTime(iso: string): string {
  return iso.slice(0, 16).replace("T", " ") + " UTC";
}

export const COLORS = ["#4c8dff", "#34c4a0", "#f2a93b", "#c97bff", "#ff6f7d", "#7bd0ff"];
