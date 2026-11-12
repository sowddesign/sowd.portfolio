"use client";

import { useEffect, useRef } from "react";
import { commun } from "@/content/texts";
import { tokenDuration } from "../token-duration";
import { reducedMotionQuery, useMediaQuery } from "../use-media-query";

/*
 * Consigne animée « Reste appuyé » de headerImage en mobile — composant Figma « smallAnim » (node 5030:21721).
 * Dans Figma, le texte est vectorisé : captionSwiss/small/accentuation, faded/black/40 ou faded/white/40 selon le fond (à l'essai),
 * position spacing/sm en bas et à gauche (12 px sans variable) et texte corrigé (décisions de l'utilisateur).
 * Mouvement Figma : échelle depuis le centre, de 1 à 0,91, maintien, puis retour ; les attentes de la boucle Figma
 * de 6 s sont remplacées par la pause commune --motion-hint-pause (décision de l'utilisateur).
 * Mouvement réduit : texte immobile.
 */

const LOOP = 6000; // durée de la boucle Figma (ms)
const MOTION_START = 0.1667; // début du mouvement dans la boucle Figma (offset)
const MOTION_END = 0.8333; // fin du mouvement dans la boucle Figma (offset)

const frames: [number, number, string][] = [
  // [offset dans la boucle Figma, échelle, courbe vers l'étape suivante]
  [MOTION_START, 1, "cubic-bezier(0.5, 0, 0.5, 1)"],
  [0.2667, 0.92, "linear"],
  [0.4, 0.91, "linear"],
  [0.6, 0.91, "linear"],
  [0.7333, 0.92, "ease-in"],
  [MOTION_END, 1, "linear"],
];

/** Mouvement de la consigne animée (échelle en boucle), réutilisable sur un autre élément. */
export function useHintMotion<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useMediaQuery(reducedMotionQuery);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const motion = (MOTION_END - MOTION_START) * LOOP;
    const total = motion + tokenDuration(el, "--motion-hint-pause");
    const keyframes: Keyframe[] = frames.map(([offset, scale, easing]) => ({
      offset: ((offset - MOTION_START) * LOOP) / total,
      transform: `scale(${scale})`,
      easing,
    }));
    const animation = el.animate([...keyframes, { offset: 1, transform: "scale(1)" }], {
      duration: total,
      iterations: Infinity,
    });
    return () => animation.cancel();
  }, [reduced]);

  return ref;
}

export function HoldHint({ className = "" }: { className?: string }) {
  const textRef = useHintMotion<HTMLParagraphElement>();

  return (
    <div className="pointer-events-none absolute bottom-sm left-sm">
      <p ref={textRef} className={`type-swiss-small-accentuation whitespace-nowrap will-change-transform ${className}`}>
        {commun.header_image_reste_appuye}
      </p>
    </div>
  );
}
