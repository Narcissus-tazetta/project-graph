import { loadProjects } from "#lib/server/data.ts";

export const prerender = true;

export function load() {
  const projects = loadProjects();
  const updatedAt =
    projects
      .map((p) => p.updatedAt)
      .filter((t): t is string => t !== null)
      .sort()
      .at(-1) ?? null;
  return { projects, updatedAt };
}
