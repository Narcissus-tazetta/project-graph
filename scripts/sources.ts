// 配布元ごとの累計ダウンロード数の取得。失敗は握りつぶさず呼び出し側まで伝播させる。
const USER_AGENT = "project-graph-downloads-tracker";

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers } });
  if (!res.ok) {
    throw new Error(
      `GET ${url} -> ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  return res.json();
}

interface GithubRelease {
  assets: { download_count: number }[];
}

/** 全リリースの全アセットの合計。リリースページ上の表示と同じ数え方。 */
export async function fetchGithub(repo: string, token?: string): Promise<number> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  let total = 0;
  for (let page = 1; ; page++) {
    const releases = (await getJson(
      `https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`,
      headers,
    )) as GithubRelease[];
    for (const r of releases) for (const a of r.assets) total += a.download_count;
    if (releases.length < 100) return total;
  }
}

export async function fetchModrinth(slug: string): Promise<number> {
  const d = (await getJson(`https://api.modrinth.com/v2/project/${slug}`)) as { downloads: number };
  return d.downloads;
}

// /v1/mods/search は API キーが有効でも 403 になることがあるため、プロジェクト ID を直接引く。
export async function fetchCurseforge(projectId: number, apiKey: string): Promise<number> {
  const d = (await getJson(`https://api.curseforge.com/v1/mods/${projectId}`, {
    "x-api-key": apiKey,
  })) as { data: { downloadCount: number } };
  return d.data.downloadCount;
}
