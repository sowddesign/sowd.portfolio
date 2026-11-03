"use client";

import { useState, type ReactNode } from "react";
import { touchQuery, useMediaQuery } from "../use-media-query";

/*
 * Image d'en-tête — composant Figma « headerImage » (fichier portfolio, node 4277:5106). Remplit son parent.
 * Variantes Figma → props :
 *   device  → type d'entrée (souris : desktop, tactile : mobile), comme navSidetTiles ;
 *   content → title, keywords et image (le principe d'image changera : fond blanc tant qu'il n'y a pas d'image) ;
 *   state   → hovered : au survol à la souris, tant que le doigt reste posé au toucher.
 * Titre au centre (captionSwiss/accentuation, text/neutral/black), fourni par un autre composant.
 * Mots-clés (captionSwiss/regular, text/neutral/black), visibles seulement en hovered :
 *   desktop : en bas à droite, par paires « a  -  b », alignés à droite, écart spacing/xxs ;
 *   mobile  : à gauche, centrés verticalement, un mot par ligne.
 * Marges et écart mobile de 24 px sans variable dans Figma : spacing/lg (même valeur).
 * Consigne « Reste appuyer » (smallAnim) pas encore reprise.
 */

export type HeaderImageProps = {
  /** Texte au centre. */
  title: ReactNode;
  /** Mots-clés, écrits dans le md de la page (liste « - »). En desktop, groupés deux par deux. */
  keywords: string[];
  /** Image de fond (couvre le composant) ; absente : fond blanc provisoire. */
  image?: string;
  className?: string;
};

export function HeaderImage({ title, keywords, image, className = "" }: HeaderImageProps) {
  const touch = useMediaQuery(touchQuery);
  const [hovered, setHovered] = useState(false);

  const pairs: string[] = [];
  for (let i = 0; i < keywords.length; i += 2) pairs.push(keywords.slice(i, i + 2).join("  -  "));

  return (
    <div
      className={`relative size-full overflow-hidden bg-background-neutral-white select-none [-webkit-touch-callout:none] ${className}`}
      onPointerEnter={(event) => event.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={(event) => event.pointerType !== "touch" && setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      onTouchCancel={() => setHovered(false)}
      onContextMenu={(event) => touch && event.preventDefault()}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- image décorative qui couvre le composant
        <img src={image} alt="" className="pointer-events-none absolute inset-0 size-full object-cover" />
      )}
      <p className="type-swiss-accentuation absolute top-1/2 left-1/2 -translate-1/2 text-center whitespace-nowrap text-text-neutral-black">
        {title}
      </p>
      {hovered &&
        (touch ? (
          <div className="type-swiss-regular absolute top-1/2 left-lg flex -translate-y-1/2 flex-col gap-lg whitespace-nowrap text-text-neutral-black">
            {keywords.map((keyword) => (
              <p key={keyword}>{keyword}</p>
            ))}
          </div>
        ) : (
          <div className="type-swiss-regular absolute right-lg bottom-lg flex flex-col items-end gap-xxs text-right whitespace-pre text-text-neutral-black">
            {pairs.map((pair) => (
              <p key={pair}>{pair}</p>
            ))}
          </div>
        ))}
    </div>
  );
}
