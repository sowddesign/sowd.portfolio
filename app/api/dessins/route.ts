import { drawings, MAX_CODE_LENGTH, newId, purgeExpired } from "./store";

/** Enregistre un dessin codé (corps texte, base64url) et renvoie l'identifiant de son lien court. */
export async function POST(request: Request) {
  const code = await request.text();
  if (!code || code.length > MAX_CODE_LENGTH || !/^[\w-]+$/.test(code)) {
    return new Response("Dessin invalide", { status: 400 });
  }
  try {
    const { id, key } = newId();
    await drawings().set(key, code);
    // Ménage des dessins expirés ; un échec n'empêche pas le partage.
    await purgeExpired().catch(() => undefined);
    return Response.json({ id });
  } catch {
    // Stockage indisponible (ex. hors de Netlify) : le client garde le lien long.
    return new Response("Stockage indisponible", { status: 503 });
  }
}
