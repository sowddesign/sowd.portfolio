"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ColorBackground } from "../ColorBackground";
import { Photos, type Photo } from "../Photos";
import { contact } from "@/content/texts";

/*
 * Conteneur du visuel de photos — composant Figma « photosContainer » (fichier portfolio, node 4932:42591).
 * Largeur : celle du parent (50 % de l'écran en tablette et desktop dans la maquette). Hauteur : remplit le parent,
 * au minimum la hauteur de la variante Figma (311 en mobile, 562 à partir de la tablette ; valeurs sans variable).
 *
 * Logique de scène (choix validé) : le visuel (bureau et moniteur) et l'écran
 * forment une scène aux proportions fixes, celles du cadre visuelBackground de la variante desktop (2168 × 843).
 * Tout y est placé en % de la scène, mesuré sur la variante desktop : l'écran reste aligné au moniteur
 * à toutes les tailles. La variante Figma « device » passe par les breakpoints et ne règle que l'échelle de la scène,
 * reprise des variantes Figma (largeur de visuelBackground pour une largeur de cadre) :
 * mobile 1465,9 pour 402, tablette 1448 pour 410 (tablet: et tablet-lg:), desktop 2168 pour 719,5.
 * La scène est centrée dans le conteneur, qui la recadre. colorBackground (aplat et ombre simulée) et le voile
 * assombrissement remplissent tout le conteneur.
 * Écarts assumés avec Figma en tablette et mobile : l'écran garde l'échelle
 * du visuel (Figma : 348 × 200 en tablette au lieu de 353 × 204), décalages de centrage de moins d'un pixel ignorés,
 * sauf en mobile (12 px, 4,5 px).
 *
 * Écran : la mosaïque Photos (composant Figma « photos »). Texte : contact.photos_texte (content/pages/contact.md),
 * captionSwiss/regular, text/neutral/white, placé par rapport à l'écran.
 */

/**
 * Échelle de la scène, par variante Figma (demande validée) : la scène montre toujours le cadrage dessiné.
 * - Cadrage : la scène est mise à l'échelle pour que le cadre Figma entier tienne dans le conteneur (« contain ») :
 *   largeur = min(largeur du conteneur × --ratio-w, hauteur du conteneur × --ratio-h), où --ratio-w et --ratio-h
 *   (hauteur mesurée en JS dans --container-h : les unités cqh ignorent la hauteur minimale ; par défaut, la minimale)
 *   sont la largeur Figma de la scène (--scene) divisée par la largeur et la hauteur du cadre Figma.
 *   Un conteneur plus large ou plus haut que le cadre Figma montre plus de décor autour.
 * - Léger dézoom : la scène ne suit cette mise à l'échelle qu'à SCENE_GROWTH, autour de sa taille Figma :
 *   plus l'écran est grand, plus on dézoome, très légèrement (valeur d'essai).
 * Cadres Figma : mobile 402 × 311, tablette 410 × 562, desktop 719,5 × 562.
 */
const SCENE_GROWTH = 0.8;
const sceneReference =
  "[--scene:1465.9px] [--ratio-w:3.6465] [--ratio-h:4.7135] " +
  "tablet:[--scene:1448px] tablet:[--ratio-w:3.5317] tablet:[--ratio-h:2.5765] " +
  "desktop:[--scene:2168px] desktop:[--ratio-w:3.0132] desktop:[--ratio-h:3.8577]";
/*
 * Tablette (demande de l'utilisateur) : le conteneur suit la hauteur du formulaire et peut devenir plus haut que le visuel.
 * La scène zoome alors juste assez pour que le visuel couvre toute la hauteur : son bord haut (-9,29 % de la scène,
 * scène de hauteur 843/2168 de sa largeur, centrée) atteint le haut du conteneur quand
 * largeur de scène = hauteur du conteneur × 2,1688. Sans effet en mobile et en desktop (--cover-h: 0).
 */
const sceneCover = "[--cover-h:0] tablet:[--cover-h:2.1688] desktop:[--cover-h:0]";
const sceneWidth = `max(calc(var(--scene) * ${1 - SCENE_GROWTH} + min(100cqw * var(--ratio-w), var(--container-h) * var(--ratio-h)) * ${SCENE_GROWTH}), var(--container-h) * var(--cover-h))`;
/** Décalage du centre de la scène en mobile (12 px, 4,5 px sur 1465,9 × 570), en % de la scène. */
const sceneOffset = "-translate-x-[49.18%] -translate-y-[49.21%] tablet:-translate-1/2";

export function PhotosContainer({ photos, className = "" }: { photos: Photo[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  // Hauteur réelle du conteneur, pour l'échelle de la scène.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => element.style.setProperty("--container-h", `${element.clientHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      className={`@container relative h-full min-h-[311px] w-full overflow-clip [--container-h:311px] tablet:min-h-[562px] tablet:[--container-h:562px] ${className}`}
    >
      {/* colorBackground : tout le conteneur (variante desktop : taille du cadre). */}
      <ColorBackground className="absolute! inset-0" />

      <div style={{ width: sceneWidth }} className={`absolute top-1/2 left-1/2 aspect-[2168/843] ${sceneReference} ${sceneCover} ${sceneOffset}`}>
        {/* Visuel (bureau et moniteur), recadré comme dans visuelBackground. */}
        <div className="absolute top-[-9.29%] left-[24%] h-[133.64%] w-[51.97%]">
          <Image src="/photos-container/visuel.png" alt="" fill sizes="(width > 1300px) 80vw, (width > 740px) 95vw, 190vw" className="object-cover" />
        </div>

        {/* Voile extra/backgroundColor/behindVisual/assombrissement : dans Figma, il couvre tout visuelBackground,
            au-dessus du visuel et sous l'écran. Étendu au-delà de la scène pour couvrir aussi un conteneur plus haut. */}
        <div aria-hidden className="pointer-events-none absolute -inset-full bg-extra-assombrissement" />

        {/* Écran du moniteur : 529 × 304 dans la variante desktop. */}
        <div className="absolute top-[30.84%] left-[36.95%] h-[36.06%] w-[24.40%]">
          <Photos photos={photos} sizes="(width > 1300px) 20vw, (width > 740px) 25vw, 50vw" />

          {/* Texte (choix validé) : spacing/md au-dessus de l'écran ; dépasse de 9 px (valeur sans token)
              à gauche de l'écran en mobile, aligné à gauche, et à droite à partir de la tablette, aligné à droite.
              captionSwiss/small/regular quand le composant fait 368 px de large ou moins (choix validé). */}
          <p className="type-swiss-regular @max-[368px]:type-swiss-small-regular absolute bottom-[calc(100%+var(--spacing-md))] -left-[9px] whitespace-pre text-text-neutral-white tablet:right-[-9px] tablet:left-auto tablet:text-right">
            {contact.photos_texte}
          </p>
        </div>
      </div>
    </div>
  );
}
