"use client";

import { useEffect, useState, type RefObject } from "react";
import { tokenDuration } from "../token-duration";
import { trackVisuals } from "./track-visuals";

/*
 * Chargement propre d'un bloc visuel (marqué data-intro-defer) : « waiting » tant que ses images visibles chargent,
 * « loading » au-delà de --site-intro-nav-threshold (le bloc affiche alors son aperçu de chargement), « ready » une
 * fois chargées. Repris par photosContainer (Contact) et headPage Container.
 */

export type VisualsLoadingState = "waiting" | "loading" | "ready";

export function useVisualsLoading(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<VisualsLoadingState>("waiting");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let loaded = false;
    let timer = 0;
    const tracker = trackVisuals(element, {
      onProgress: setProgress,
      onReady: () => {
        loaded = true;
        window.clearTimeout(timer);
        setState("ready");
      },
    });
    timer = window.setTimeout(
      () => {
        if (!loaded) setState("loading");
      },
      tokenDuration(element, "--site-intro-nav-threshold"),
    );
    return () => {
      window.clearTimeout(timer);
      tracker.stop();
    };
  }, [ref]);

  return { state, progress };
}
