"use client";

import { useEffect, useRef } from "react";
import { commun } from "@/content/texts";

/*
 * Consigne « Appuie » de la mosaïque Photos sur écran tactile, en bas à gauche (bloc « smallAnim »,
 * même typo que la consigne de footerVisual : captionSwiss/small/accentuation).
 * Couleur (demandée : noir ou blanc selon le fond) : texte text/neutral/white en mode de fusion « difference »,
 * qui inverse le fond sous le texte : blanc sur fond sombre, noir sur fond clair, couleur inversée sur un fond coloré.
 * Le fond (mosaïque en mouvement) change sans cesse : un vrai noir ou blanc demanderait d'analyser les photos en direct.
 *
 * Animation (demandée hors Figma, valeurs d'essai) : reprend l'appui de la consigne du pied de page, en rapide —
 * le texte rétrécit à 91 % (PRESSED_SCALE de footerVisual), tient un instant, puis rebondit au relâcher
 * (dépassement puis retour à sa taille), suivi d'une pause ; en boucle.
 * Mouvement réduit : texte affiché immobile.
 */

const PRESS = 120; // appui rapide (ms)
const HOLD = 100; // maintien (ms)
const BOUNCE_OUT = 180; // relâche : dépasse sa taille (ms)
const BOUNCE_BACK = 120; // revient un peu en dessous (ms)
const SETTLE = 120; // se pose à sa taille (ms)
const PAUSE = 5_000; // attente avant le prochain appui (ms, 5 s : choix validé)
const PRESSED_SCALE = 0.91; // taille pendant l'appui (comme footerVisual)
const OVERSHOOT = 1.06; // dépassement au relâcher
const UNDERSHOOT = 0.98; // contre-rebond

const steps: [number, number, string][] = [
  // [durée jusqu'à cette étape, taille, courbe vers l'étape suivante]
  [0, 1, "ease-out"],
  [PRESS, PRESSED_SCALE, "linear"],
  [HOLD, PRESSED_SCALE, "ease-out"],
  [BOUNCE_OUT, OVERSHOOT, "ease-in-out"],
  [BOUNCE_BACK, UNDERSHOOT, "ease-in-out"],
  [SETTLE, 1, "linear"],
  [PAUSE, 1, "linear"],
];
const total = steps.reduce((sum, [duration]) => sum + duration, 0);

export function PressHint({ animated }: { animated: boolean }) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text || !animated) return;
    let elapsed = 0;
    const keyframes: Keyframe[] = steps.map(([duration, scale, easing]) => {
      elapsed += duration;
      return { offset: elapsed / total, transform: `scale(${scale})`, easing };
    });
    const animation = text.animate(keyframes, { duration: total, iterations: Infinity });
    return () => animation.cancel();
  }, [animated]);

  return (
    // Même retrait que la consigne de footerVisual : spacing/md en mobile, spacing/lg à partir de la tablette.
    <div className="pointer-events-none absolute bottom-lg left-md mix-blend-difference tablet:left-lg">
      <span ref={textRef} className="type-swiss-small-accentuation inline-block origin-left whitespace-pre text-text-neutral-white will-change-transform">
        {commun.photos_appuie}
      </span>
    </div>
  );
}
