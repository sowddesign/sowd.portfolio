import type { NextRequest } from "next/server";
import { drawings, expired, keyOf } from "../store";

/** Dessin codé d'un lien court ; 404 s'il est inconnu ou expiré. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/dessins/[id]">) {
  const { id } = await ctx.params;
  const found = keyOf(id);
  if (!found || expired(found.day)) return new Response("Introuvable", { status: 404 });
  try {
    const code = await drawings().get(found.key, { type: "text" });
    if (code === null) return new Response("Introuvable", { status: 404 });
    return new Response(code, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Stockage indisponible", { status: 503 });
  }
}
