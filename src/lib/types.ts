export const SOURCES = ["github", "modrinth", "curseforge"] as const;
export type Source = (typeof SOURCES)[number];

export interface ProjectConfig {
  id: string;
  name: string;
  github?: string;
  modrinth?: string;
  curseforge?: number;
}

export interface Snapshot {
  /** ISO 8601 (UTC) */
  t: string;
  /** 配布元ごとの累計ダウンロード数 */
  sources: Partial<Record<Source, number>>;
}

export const SOURCE_LABELS: Record<Source, string> = {
  github: "GitHub",
  modrinth: "Modrinth",
  curseforge: "CurseForge",
};

export function totalOf(s: Snapshot): number {
  return Object.values(s.sources).reduce((a, b) => a + b, 0);
}
