import type { MotifSnapshot } from "./motif-editor-engine";

/*
 * Partage du dessin par lien (demande de l'utilisateur) : lien court (#d=identifiant), le dessin codé étant enregistré
 * par app/api/dessins (Netlify Blobs, 30 jours) ; si le stockage ne répond pas, lien long avec le dessin codé dans
 * l'adresse (#dessin=…).
 * Format binaire v1 : version, nombre de couleurs, chaque couleur CSS (longueur + UTF-8), nombre de logos (32 bits),
 * puis 6 octets par logo (taille, rangée + 1 et colonne + 1 sur 16 bits, couleur) ; compressé (deflate-raw), base64url.
 */

/** Clés de l'adresse : dessin codé (lien long), identifiant du lien court. */
const CODE_KEY = "dessin";
const ID_KEY = "d";
const VERSION = 1;

async function pipe(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}

const toBase64Url = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = (text: string) => {
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

/** Code du dessin pour l'adresse. */
export async function encodeMotif({ colors, logos }: MotifSnapshot) {
  const names = colors.map((c) => new TextEncoder().encode(c).slice(0, 255));
  const size = 2 + names.reduce((n, b) => n + 1 + b.length, 0) + 4 + logos.length * 6;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  let o = 0;
  bytes[o++] = VERSION;
  bytes[o++] = names.length;
  for (const b of names) {
    bytes[o++] = b.length;
    bytes.set(b, o);
    o += b.length;
  }
  view.setUint32(o, logos.length);
  o += 4;
  for (const [s, r, c, color] of logos) {
    bytes[o++] = s;
    view.setUint16(o, r + 1);
    view.setUint16(o + 2, c + 1);
    o += 4;
    bytes[o++] = color;
  }
  return toBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
}

/** Dessin d'une adresse, ou null si le code est absent ou illisible. */
export async function decodeMotif(code: string): Promise<MotifSnapshot | null> {
  try {
    const bytes = await pipe(fromBase64Url(code), new DecompressionStream("deflate-raw"));
    const view = new DataView(bytes.buffer);
    let o = 0;
    if (bytes[o++] !== VERSION) return null;
    const colors: string[] = [];
    for (let n = bytes[o++]; n > 0; n--) {
      const len = bytes[o++];
      colors.push(new TextDecoder().decode(bytes.subarray(o, o + len)));
      o += len;
    }
    const count = view.getUint32(o);
    o += 4;
    if (bytes.length < o + count * 6) return null;
    const logos: MotifSnapshot["logos"] = [];
    for (let i = 0; i < count; i++) {
      logos.push([bytes[o], view.getUint16(o + 1) - 1, view.getUint16(o + 3) - 1, bytes[o + 5]]);
      o += 6;
    }
    return { colors, logos };
  } catch {
    return null;
  }
}

/** Dessin partagé dans l'adresse de la page : identifiant de lien court ou code, ou null. */
export function sharedLink(): { id: string } | { code: string } | null {
  const params = new URLSearchParams(location.hash.slice(1));
  const id = params.get(ID_KEY);
  if (id) return { id };
  const code = params.get(CODE_KEY);
  return code ? { code } : null;
}

/** Code du dessin d'un lien partagé (lien court : demandé au serveur) ; « missing » : lien court inconnu ou expiré ;
 *  null : serveur injoignable. */
export async function sharedCodeOf(link: { id: string } | { code: string }): Promise<string | "missing" | null> {
  if ("code" in link) return link.code;
  try {
    const res = await fetch(`/api/dessins/${encodeURIComponent(link.id)}`);
    if (res.status === 404) return "missing";
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Lien de partage du dessin codé : court (expire, short) si le stockage répond, sinon long. */
export async function shareUrl(code: string): Promise<{ url: string; short: boolean }> {
  const base = `${location.origin}${location.pathname}`;
  try {
    const res = await fetch("/api/dessins", { method: "POST", body: code });
    if (res.ok) {
      const { id } = (await res.json()) as { id: string };
      return { url: `${base}#${ID_KEY}=${id}`, short: true };
    }
  } catch {
    // Hors ligne ou stockage indisponible : lien long.
  }
  return { url: `${base}#${CODE_KEY}=${code}`, short: false };
}
