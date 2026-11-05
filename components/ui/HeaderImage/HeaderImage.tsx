"use client";

import { useState } from "react";
import { touchQuery, useMediaQuery } from "../use-media-query";
import {
  headerImageBackgrounds,
  headerImageDarkBackgrounds,
  headerImageDefaultBackground,
  type HeaderImageBackground,
} from "./backgrounds";
import type { HeaderImagePlacement, HeaderImageText } from "./placement";

/*
 * Image d'en-tête — composant Figma « headerImage » (fichier portfolio, node 4277:5106). Remplit son parent.
 * Variantes Figma → props :
 *   device  → type d'entrée (souris : desktop, tactile : mobile), comme navSidetTiles ;
 *   content → keywords, image et background (hors Figma, demande de l'utilisateur : image entière
 *             centrée en largeur et calée en bas (le bas du dessin touche le bas du cadre, mobile compris), sur un fond
 *             token choisi dans le md, blanc par défaut) ;
 *   state   → hovered : au survol à la souris, tant que le doigt reste posé au toucher.
 *             Hors Figma (demande de l'utilisateur) : tout le bloc (fond compris) est en noir et blanc et passe
 *             en couleur en hovered, fondu --motion-duration-fast, --motion-ease-out.
 * Titre retiré (demande de l'utilisateur) : il est dessiné dans l'image.
 * Placement et textes par page (frames Figma desktop 800 × 218 et mobile 376 × 218, demande de l'utilisateur) :
 *   l'image est placée en % de la hauteur du cadre depuis son centre, les textes (toujours visibles,
 *   captionSwiss/accentuation, text/neutral/black ou white, inclinés au besoin)
 *   en % de l'image ; sans placement, image entière calée en bas.
 * Tous les textes en 16 px sur tous les appareils (--header-image-text-size, choix de l'utilisateur).
 * Mots-clés (captionSwiss/regular), visibles seulement en hovered ; text/neutral/black, ou text/neutral/white
 *   sur les fonds foncés (headerImageDarkBackgrounds, demande de l'utilisateur) :
 *   desktop : en bas à droite, par paires « a  -  b », alignés à droite, écart spacing/xxs ;
 *   mobile  : à gauche, centrés verticalement, un mot par ligne.
 * Marges et écart mobile de 24 px sans variable dans Figma : spacing/lg (même valeur).
 * Consigne « Reste appuyer » (smallAnim) pas encore reprise.
 */

export type HeaderImageProps = {
  /** Mots-clés, écrits dans le md de la page (liste « - »). En desktop, groupés deux par deux. */
  keywords: string[];
  /** Image, entière et centrée, à la hauteur du composant (choix de l'utilisateur). */
  image?: string;
  /** Fond derrière l'image, token primitive/color/brand/… choisi dans le md ; absent : background/neutral/white. */
  background?: HeaderImageBackground;
  /** Mise en page de la page (mobile : frames Figma 376, sinon frames 800). Distinct du type d'entrée (touch). */
  layout?: "desktop" | "mobile";
  /** Placement de l'image par mise en page (voir placement.ts) ; absent : image entière, calée en bas. */
  placement?: { desktop?: HeaderImagePlacement; mobile?: HeaderImagePlacement };
  /** Textes posés sur l'image, toujours visibles (affichés seulement avec un placement). */
  texts?: HeaderImageText[];
  className?: string;
};

export function HeaderImage({
  keywords,
  image,
  background,
  layout = "desktop",
  placement,
  texts = [],
  className = "",
}: HeaderImageProps) {
  const place = placement?.[layout];
  /* Proportions de l'image (lues au chargement) : le bloc placé en prend la largeur, les textes s'y calent. */
  const [ratio, setRatio] = useState<{ src: string; value: number }>();
  const readRatio = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalHeight > 0 && ratio?.src !== img.currentSrc) {
      setRatio({ src: img.currentSrc, value: img.naturalWidth / img.naturalHeight });
    }
  };
  const aspect = ratio && image && ratio.src.endsWith(image) ? ratio.value : undefined;
  const touch = useMediaQuery(touchQuery);
  const [hovered, setHovered] = useState(false);

  /* Mots-clés : blancs sur fond foncé, noirs sinon. */
  const keywordColor =
    background && headerImageDarkBackgrounds.has(background) ? "text-text-neutral-white" : "text-text-neutral-black";
  const pairs: string[] = [];
  for (let i = 0; i < keywords.length; i += 2) pairs.push(keywords.slice(i, i + 2).join("  -  "));

  return (
    <div
      className={`relative size-full overflow-hidden [container-type:size] ${background ? headerImageBackgrounds[background] : headerImageDefaultBackground} transition-[filter] duration-(--motion-duration-fast) ease-(--motion-ease-out) ${hovered ? "" : "grayscale"} select-none [-webkit-touch-callout:none] ${className}`}
      onPointerEnter={(event) => event.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={(event) => event.pointerType !== "touch" && setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      onTouchCancel={() => setHovered(false)}
      onContextMenu={(event) => touch && event.preventDefault()}
    >
      {image && place ? (
        /* Image placée (cqh : % de la hauteur du cadre), inclinée autour de son centre ; les textes suivent l'image. */
        <div
          className={`pointer-events-none absolute ${aspect ? "" : "invisible"}`}
          style={{
            transform: `translateX(-50%) rotate(${place.rotation ?? 0}deg)`,
            height: `${place.size}cqh`,
            width: aspect ? `${place.size * aspect}cqh` : undefined,
            top: `${place.y}cqh`,
            left: `calc(50cqw + ${place.x}cqh)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- image décorative */}
          <img
            ref={readRatio}
            src={image}
            alt=""
            className="block size-full"
            onLoad={(event) => readRatio(event.currentTarget)}
          />
          {texts.map((item) => {
            const { x, y, rotation = 0 } = item[layout];
            return (
              <p
                key={item.text}
                className={`type-swiss-accentuation absolute text-center whitespace-pre ${item.white ? "text-text-neutral-white" : "text-text-neutral-black"}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  fontSize: "var(--header-image-text-size)",
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
              >
                {item.text}
              </p>
            );
          })}
        </div>
      ) : (
        image && (
          // eslint-disable-next-line @next/next/no-img-element -- image décorative qui couvre le composant
          <img src={image} alt="" className="pointer-events-none absolute inset-0 size-full object-contain object-bottom" />
        )
      )}
      {hovered &&
        (touch ? (
          <div className={`type-swiss-regular text-(length:--header-image-text-size) absolute top-1/2 left-lg flex -translate-y-1/2 flex-col gap-lg whitespace-nowrap ${keywordColor}`}>
            {keywords.map((keyword) => (
              <p key={keyword}>{keyword}</p>
            ))}
          </div>
        ) : (
          <div className={`type-swiss-regular text-(length:--header-image-text-size) absolute right-lg bottom-lg flex flex-col items-end gap-xxs text-right whitespace-pre ${keywordColor}`}>
            {pairs.map((pair) => (
              <p key={pair}>{pair}</p>
            ))}
          </div>
        ))}
    </div>
  );
}
