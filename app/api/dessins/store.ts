import { getStore } from "@netlify/blobs";

/*
 * Dessins partagés de l'éditeur (page 404) : stockage Netlify Blobs (choix de l'utilisateur), lien court.
 * Clé « jour/aléa » (jour = jours depuis 1970) : le jour sert à l'expiration ; identifiant du lien « jour36-aléa ».
 * Conservation : RETENTION_DAYS jours (décision de l'utilisateur) ; un dessin expiré n'est plus servi, et chaque envoi
 * supprime les jours expirés.
 */

export const RETENTION_DAYS = 30;
/** Taille maximale d'un dessin codé (caractères) : garde-fou contre les envois abusifs. */
export const MAX_CODE_LENGTH = 512 * 1024;

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const RANDOM_LENGTH = 8;

export const drawings = () => getStore("dessins");
export const today = () => Math.floor(Date.now() / 86_400_000);

/** Nouvel identifiant de lien et sa clé de stockage. */
export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_LENGTH));
  const random = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  const day = today();
  return { id: `${day.toString(36)}-${random}`, key: `${day}/${random}` };
}

/** Clé de stockage d'un identifiant de lien, et son jour ; null si l'identifiant est invalide. */
export function keyOf(id: string) {
  const match = /^([0-9a-z]{1,8})-([0-9a-zA-Z]{8})$/.exec(id);
  if (!match) return null;
  const day = parseInt(match[1], 36);
  return { day, key: `${day}/${match[2]}` };
}

export const expired = (day: number) => today() - day > RETENTION_DAYS;

/** Supprime les dessins des jours expirés. */
export async function purgeExpired() {
  const store = drawings();
  const { directories } = await store.list({ directories: true });
  for (const dir of directories) {
    if (!expired(Number(dir))) continue;
    const { blobs } = await store.list({ prefix: `${dir}/` });
    await Promise.all(blobs.map((b) => store.delete(b.key)));
  }
}
