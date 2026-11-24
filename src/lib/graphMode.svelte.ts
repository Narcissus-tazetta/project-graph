import type { DailyPoint } from "./server/data";
import type { Series } from "./Chart.svelte";

export const GRAPH_MODES = [
  { key: "increase", label: "Daily increase" },
  { key: "total", label: "Total downloads" },
] as const;
export type GraphMode = (typeof GRAPH_MODES)[number]["key"];

const STORAGE_KEY = "graph-mode";

// 静的出力のため初期値はサーバーと同じ既定値にし、保存値はハイドレーション後に反映する
export const graph = $state<{ mode: GraphMode }>({ mode: "increase" });

export function restoreGraphMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (GRAPH_MODES.some((m) => m.key === saved)) graph.mode = saved as GraphMode;
  } catch {
    // localStorage が使えない環境では既定値のまま動かす
  }
}

export function saveGraphMode() {
  try {
    localStorage.setItem(STORAGE_KEY, graph.mode);
  } catch {
    // 保存できなくても表示は切り替わる
  }
}

/** 日ごとの累計を、選択中のモードの値に変換する。増加数は初日が取れないため1日短くなる */
export function pointsFor(daily: DailyPoint[], mode: GraphMode): DailyPoint[] {
  if (mode === "total") return daily;
  return daily.slice(1).map((d, i) => ({ day: d.day, total: d.total - daily[i].total }));
}

export function toValues(points: DailyPoint[]): Series["values"] {
  return Object.fromEntries(points.map((d) => [d.day, d.total]));
}
