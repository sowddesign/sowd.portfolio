import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

/*
 * Éditeur de formes du motif (outil mis de côté, hors de public/) servi pour l'UI kit en développement seulement :
 * /ui-kit/dessin/motif-dessin.html et ses images ref-forme-N.webp, lues dans tools/motif-editor.
 * Absent du site publié (404 en production).
 */
const dir = path.join(process.cwd(), "tools", "motif-editor");
const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".webp": "image/webp" };

export async function GET(_req: NextRequest, ctx: RouteContext<"/ui-kit/dessin/[file]">) {
  const { file } = await ctx.params;
  const type = types[path.extname(file)];
  if (process.env.NODE_ENV === "production" || !type || !/^[\w-]+\.\w+$/.test(file)) {
    return new Response("Introuvable", { status: 404 });
  }
  try {
    return new Response(await readFile(path.join(dir, file)), {
      headers: { "Content-Type": type, "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
