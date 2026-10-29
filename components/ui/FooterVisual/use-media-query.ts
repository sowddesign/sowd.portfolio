import { useSyncExternalStore } from "react";

/** État d'une media query, mis à jour en direct (false côté serveur). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Appareil tactile : pas de survol possible avec le pointeur principal. */
export const touchQuery = "(hover: none)";
export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
