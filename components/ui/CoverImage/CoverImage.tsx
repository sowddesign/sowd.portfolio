"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

/*
 * Cover d'un projet qui remplit son cadre (en-tête de page projet, tuiles) : comme <Image fill object-cover>,
 * avec un point de l'image ramené au centre du cadre quand elle est coupée en hauteur (demande de l'utilisateur,
 * ex. le logo de Flash Invaders). Sans dépasser le bord de l'image : près du bord, le point s'en approche au mieux.
 * Les proportions de l'image sont lues une fois chargée (pas de lecture de fichier côté serveur, refusée par Next
 * pendant le prérendu). Le calcul se fait ensuite en CSS (unités du conteneur), quelle que soit la taille du cadre :
 *   hauteur affichée de l'image = largeur du cadre × ratio (hauteur / largeur de l'image) ;
 *   décalage = moitié du cadre − point × hauteur affichée, borné entre (cadre − image) et 0.
 */

export type CoverImageProps = {
  src: string;
  /** Hauteur du point à centrer, de 0 (haut) à 1 (bas). Sans valeur : centre de l'image. */
  focus?: number;
  sizes: string;
  draggable?: boolean;
  className?: string;
};

export function CoverImage({ src, focus, sizes, draggable, className = "" }: CoverImageProps) {
  const [ratio, setRatio] = useState<number>();
  const style: CSSProperties | undefined =
    focus !== undefined && ratio
      ? {
          objectPosition: `50% clamp(min(0px, 100cqh - 100cqw * ${ratio}), 50cqh - ${focus} * 100cqw * ${ratio}, 0px)`,
        }
      : undefined;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 block overflow-hidden [container-type:size]">
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        draggable={draggable}
        style={style}
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth) setRatio(img.naturalHeight / img.naturalWidth);
        }}
        className={`object-cover ${className}`}
      />
    </span>
  );
}
