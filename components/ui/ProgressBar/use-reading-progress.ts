"use client";

import { useEffect, useState, type RefObject } from "react";

/*
 * Progression de lecture d'un élément (article), de 0 à 1, pour ProgressBar.
 * 0 quand le haut de l'élément atteint le haut de l'écran, 1 quand son bas atteint le bas de l'écran.
 * Un élément plus court que l'écran compte comme lu dès que son haut atteint le haut de l'écran.
 */
export function useReadingProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const next = distance > 0 ? -rect.top / distance : rect.top <= 0 ? 1 : 0;
      setProgress(Math.min(1, Math.max(0, next)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
}
