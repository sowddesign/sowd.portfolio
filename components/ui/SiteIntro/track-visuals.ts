/*
 * Suivi du chargement des visuels affichés à l'écran (intro du site, attente des pages, visuels à chargement propre).
 * Un bloc marqué data-intro-defer gère son propre chargement (ex. photosContainer de la page Contact) : ses images
 * ne retiennent pas la page, il les suit lui-même en se passant comme racine.
 * Développement : « chargement lent » (raccourci de KitShortcut) retient slowLoadingDuration ms chaque suivi
 * qui a des images à attendre,
 * pour revoir les animations de chargement une fois les images en cache.
 */

const slowKey = "sowd-slow-loading";
const slowLoadingDuration = 5000;

/** Chargement lent simulé (développement seulement). */
export function isSlowLoading() {
  if (process.env.NODE_ENV !== "development") return false;
  try {
    return sessionStorage.getItem(slowKey) === "1";
  } catch {
    return false;
  }
}

/** Active ou coupe le chargement lent simulé, puis recharge la page. */
export function toggleSlowLoading() {
  try {
    if (isSlowLoading()) sessionStorage.removeItem(slowKey);
    else sessionStorage.setItem(slowKey, "1");
  } catch {}
  window.location.reload();
}

/** Images affichées dans la zone visible, sous root, hors blocs à chargement propre (sauf root lui-même). */
function screenImages(root: ParentNode) {
  const own = root instanceof Element ? root.closest("[data-intro-defer]") : null;
  return Array.from(root.querySelectorAll<HTMLImageElement>("img")).filter((img) => {
    if (img.closest("[data-intro-defer]") !== own) return false;
    if (!img.getClientRects().length) return false;
    const box = img.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight;
  });
}

/**
 * Suit le chargement des visuels sous root (et des polices avec withFonts). Les images comptées sont celles
 * réellement visibles, découpes des parents comprises (IntersectionObserver) : une image différée masquée par une
 * découpe ne se charge jamais. Vérification régulière : React peut remplacer une image pendant l'hydratation.
 */
export function trackVisuals(
  root: ParentNode,
  { onProgress, onReady, withFonts = false }: { onProgress?: (value: number) => void; onReady: () => void; withFonts?: boolean },
) {
  // Chargement lent simulé : seulement là où des images sont à attendre.
  const slowUntil = isSlowLoading() && screenImages(root).length ? performance.now() + slowLoadingDuration : 0;
  let fontsReady = !withFonts;
  let stopped = false;
  let watched: HTMLImageElement[] | null = null;
  if (withFonts) void document.fonts.ready.then(() => (fontsReady = true));
  let observer: IntersectionObserver | null = null;
  const observe = () => {
    observer?.disconnect();
    watched = null;
    const candidates = screenImages(root);
    if (!candidates.length) {
      watched = [];
      return;
    }
    const current = new IntersectionObserver((entries) => {
      current.disconnect();
      // Surface visible non nulle : une image qui touche seulement le bord n'est pas chargée par le navigateur.
      watched = entries.filter((entry) => entry.intersectionRatio > 0).map((entry) => entry.target as HTMLImageElement);
    });
    observer = current;
    candidates.forEach((img) => current.observe(img));
  };
  const pending = !!slowUntil || screenImages(root).some((img) => !img.complete);
  observe();
  const check = () => {
    if (!watched) return false;
    // Image remplacée par React (hydratation) : nouvelle recherche des images visibles.
    if (watched.some((img) => !img.isConnected)) {
      observe();
      return false;
    }
    const loaded = watched.filter((img) => img.complete).length;
    const fonts = withFonts ? 1 : 0;
    const real = (loaded + (withFonts && fontsReady ? 1 : 0)) / (watched.length + fonts || 1);
    const slow = slowUntil ? Math.min(1, 1 - (slowUntil - performance.now()) / slowLoadingDuration) : 1;
    onProgress?.(Math.min(real, slow));
    return loaded === watched.length && fontsReady && slow >= 1;
  };
  const timer = window.setInterval(() => {
    if (stopped || !check()) return;
    window.clearInterval(timer);
    onReady();
  }, 100);
  onProgress?.(0);
  return {
    /** Des images visibles manquaient au départ. */
    pending,
    stop() {
      stopped = true;
      observer?.disconnect();
      window.clearInterval(timer);
    },
  };
}
