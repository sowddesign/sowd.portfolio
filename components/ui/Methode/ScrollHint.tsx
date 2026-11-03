"use client";

import { useEffect, useRef } from "react";
import { tokenDuration } from "../token-duration";
import { reducedMotionQuery, useMediaQuery } from "../use-media-query";

/*
 * Consigne animée « Défiler » — composant Figma « smallAnim » (asset=defiler), captionSwiss/accentuation.
 * Mouvement Figma : le texte sort vers le haut, revient par le bas avec un léger rebond, puis attend
 * la pause commune des consignes animées (--motion-hint-pause), au lieu du rythme de la boucle Figma de 8 s
 * (décision de l'utilisateur). La piste « hauteur » de Figma (200 → 1 px) est ignorée (décision de l'utilisateur).
 * Mouvement réduit : texte immobile.
 */

const DURATION = 8009; // durée d'une boucle (ms, Figma)
const MOTION_START = 0.2497; // début du mouvement dans la boucle Figma (offset)
const MOTION_END = 0.375; // fin du mouvement dans la boucle Figma (offset)
const OUT = -16.437; // sortie vers le haut (px, Figma)
const IN = 15.5; // point de retour, sous la zone visible (px, Figma)
const BOUNCE = "cubic-bezier(0, 0, 0.2, 1.68)"; // courbe du retour (Figma)

export function ScrollHint({ children }: { children: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduced = useMediaQuery(reducedMotionQuery);

  useEffect(() => {
    const el = textRef.current;
    if (!el || reduced) return;
    const y = (value: number) => `translateY(${value}px)`;
    // Mouvement Figma (offsets de la boucle de 8 s, ramenés à son début), puis la pause commune.
    const motion: Keyframe[] = [
      { transform: y(0), offset: MOTION_START },
      { transform: y(OUT), offset: 0.3106 },
      { transform: y(IN), offset: 0.3107 },
      { transform: y(IN), offset: 0.3108, easing: BOUNCE },
      { transform: y(0), offset: MOTION_END },
    ];
    const total = (MOTION_END - MOTION_START) * DURATION + tokenDuration(el, "--motion-hint-pause");
    const at = (offset: number) => ((offset - MOTION_START) * DURATION) / total;
    const animation = el.animate(
      [...motion.map((frame) => ({ ...frame, offset: at(frame.offset as number) })), { transform: y(0), offset: 1 }],
      { duration: total, iterations: Infinity },
    );
    return () => animation.cancel();
  }, [reduced]);

  return (
    <div className="flex w-full flex-col items-start overflow-clip">
      <p ref={textRef} className="type-swiss-accentuation whitespace-nowrap text-text-neutral-black">
        {children}
      </p>
    </div>
  );
}
