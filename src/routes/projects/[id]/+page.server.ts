import { loadProjects } from "#lib/server/data.ts";
import { error } from "@sveltejs/kit";

export function entries() {
  return loadProjects().map((p) => ({ id: p.id }));
}

export function load({ params }) {
  const project = loadProjects().find((p) => p.id === params.id);
  if (!project) error(404, "Project not found");
  return { project };
}
