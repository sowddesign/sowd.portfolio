/*
 * Lecture des pages de la méthode, gardée entre les visites (localStorage, demande de l'utilisateur) :
 * progression par page (la plus grande valeur atteinte, de 0 à 1). Les introductions (intro du site,
 * introduction au projet) gardent leur mémoire le temps de la visite seulement (sessionStorage).
 * Stockage indisponible (navigation privée stricte…) : la progression reste en mémoire le temps de l'affichage.
 */

const storageKey = "sowd-methode-lecture";
const listeners = new Set<() => void>();
const empty: Record<string, number> = {};
let memory: string | null = null;
let cachedRaw: string | null = null;
let cached: Record<string, number> = empty;

function readRaw() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return memory;
  }
}

function writeRaw(raw: string) {
  memory = raw;
  try {
    localStorage.setItem(storageKey, raw);
  } catch {}
}

export function readingSnapshot(): Record<string, number> {
  const raw = readRaw() ?? memory;
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cached = parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : empty;
  } catch {
    cached = empty;
  }
  return cached;
}

export const readingServerSnapshot = () => empty;

export function subscribeReading(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Garde la plus grande progression atteinte pour la page. */
export function saveReading(slug: string, value: number) {
  const all = readingSnapshot();
  if (value <= (all[slug] ?? 0)) return;
  writeRaw(JSON.stringify({ ...all, [slug]: value }));
  listeners.forEach((listener) => listener());
}

/* Parties lues jusqu'en bas (mobile), par page : gardées entre les visites elles aussi. */
const partKey = (slug: string, part: string) => `methode-partie-lue:${slug}:${part}`;

export function isPartRead(slug: string, part: string) {
  try {
    return localStorage.getItem(partKey(slug, part)) === "1";
  } catch {
    return false;
  }
}

export function savePartRead(slug: string, part: string) {
  try {
    localStorage.setItem(partKey(slug, part), "1");
  } catch {}
}
