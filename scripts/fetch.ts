import { parse } from "yaml";
import { mkdir } from "node:fs/promises";
import type { ProjectConfig, Snapshot } from "../src/lib/types";
import { fetchCurseforge, fetchGithub, fetchModrinth } from "./sources";

const HISTORY_DIR = "data/history";

const config = parse(await Bun.file("projects.yml").text()) as { projects: ProjectConfig[] };
const curseforgeKey = process.env.CURSEFORGE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const t = new Date().toISOString();

// 途中で失敗した回の記録が部分的に残ると合計と増加数が壊れるため、全件取得できるまで何も書き込まない。
const results = await Promise.all(
  config.projects.map(async (p) => {
    const sources: Snapshot["sources"] = {};
    if (p.github) sources.github = await fetchGithub(p.github, githubToken);
    if (p.modrinth) sources.modrinth = await fetchModrinth(p.modrinth);
    if (p.curseforge) {
      if (!curseforgeKey) throw new Error(`${p.id}: CURSEFORGE_API_KEY is not set`);
      sources.curseforge = await fetchCurseforge(p.curseforge, curseforgeKey);
    }
    return { id: p.id, snapshot: { t, sources } satisfies Snapshot };
  }),
);

await mkdir(HISTORY_DIR, { recursive: true });
for (const { id, snapshot } of results) {
  const file = Bun.file(`${HISTORY_DIR}/${id}.json`);
  const history: Snapshot[] = (await file.exists()) ? await file.json() : [];
  history.push(snapshot);
  await Bun.write(file, JSON.stringify(history, null, "\t") + "\n");
  console.log(id, JSON.stringify(snapshot.sources));
}
