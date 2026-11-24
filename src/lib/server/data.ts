import { parse } from "yaml";
import { readFileSync, existsSync } from "node:fs";
import { totalOf, type ProjectConfig, type Snapshot, type Source } from "../types";

export const PERIODS = [
  { key: "24h", label: "24h", ms: 24 * 3600_000 },
  { key: "7d", label: "7d", ms: 7 * 24 * 3600_000 },
  { key: "30d", label: "30d", ms: 30 * 24 * 3600_000 },
] as const;
export type PeriodKey = (typeof PERIODS)[number]["key"];

export interface DailyPoint {
  /** YYYY-MM-DD (UTC) */
  day: string;
  total: number;
}

export interface ProjectData {
  id: string;
  name: string;
  links: Partial<Record<Source, string>>;
  total: number;
  sources: Partial<Record<Source, number>>;
  /** 期間に満たない履歴しかないときは null */
  deltas: Record<PeriodKey, number | null>;
  /** 日ごとの最終累計 */
  daily: DailyPoint[];
  firstRecordedAt: string | null;
  updatedAt: string | null;
  /** 累計が最後に増えた時刻。まだ増えていなければ記録開始時刻 */
  changedAt: string | null;
}

function readHistory(id: string): Snapshot[] {
  const path = `data/history/${id}.json`;
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as Snapshot[]) : [];
}

function linksOf(p: ProjectConfig): ProjectData["links"] {
  return {
    ...(p.github && { github: `https://github.com/${p.github}/releases` }),
    ...(p.modrinth && { modrinth: `https://modrinth.com/project/${p.modrinth}` }),
    ...(p.curseforge && {
      curseforge: `https://www.curseforge.com/projects/${p.curseforge}`,
    }),
  };
}

function delta(history: Snapshot[], periodMs: number): number | null {
  const latest = history.at(-1);
  if (!latest) return null;
  const cutoff = Date.parse(latest.t) - periodMs;
  const base = history.findLast((s) => Date.parse(s.t) <= cutoff);
  return base ? totalOf(latest) - totalOf(base) : null;
}

function toDaily(history: Snapshot[]): DailyPoint[] {
  const byDay = new Map<string, number>();
  for (const s of history) byDay.set(s.t.slice(0, 10), totalOf(s));
  return [...byDay].map(([day, total]) => ({ day, total }));
}

function lastChangedAt(history: Snapshot[]): string | null {
  for (let i = history.length - 1; i > 0; i--) {
    if (totalOf(history[i]) !== totalOf(history[i - 1])) return history[i].t;
  }
  return history[0]?.t ?? null;
}

export function loadProjects(): ProjectData[] {
  const config = parse(readFileSync("projects.yml", "utf8")) as { projects: ProjectConfig[] };
  return config.projects.map((p) => {
    const history = readHistory(p.id);
    const latest = history.at(-1);
    return {
      id: p.id,
      name: p.name,
      links: linksOf(p),
      total: latest ? totalOf(latest) : 0,
      sources: latest?.sources ?? {},
      deltas: Object.fromEntries(
        PERIODS.map((x) => [x.key, delta(history, x.ms)]),
      ) as ProjectData["deltas"],
      daily: toDaily(history),
      firstRecordedAt: history[0]?.t ?? null,
      updatedAt: latest?.t ?? null,
      changedAt: lastChangedAt(history),
    };
  });
}
