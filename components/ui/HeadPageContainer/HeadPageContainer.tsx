"use client";

import Image from "next/image";
import { useRef } from "react";
import { commun } from "@/content/texts";
import { PageHead } from "../PageHead";
import { ProgressBar } from "../ProgressBar";
import { ShowreelLogo } from "../ShowreelLogo";
import { useVisualsLoading } from "../SiteIntro";

/*
 * En-tête de page avec photo — composant Figma « headPage Container » (fichier portfolio, node 5549:25383).
 * La variante « device » passe par les breakpoints ; le slot « Navigation Image » → image + tags.
 * Hauteur ajustée au contenu (validé par l'utilisateur).
 *
 * Mobile : photo (tags en lignes, calés en bas à gauche), trait, pageHead H2.
 * Tablette et desktop : pageHead H2 | trait vertical | photo (tags en bas à gauche), deux moitiés égales.
 * Le pageHead de l'instance Figma n'a pas de trait. Son titre est un h1 quand l'en-tête nomme la page
 * (page projet), un h2 quand un pageHead H1 est au-dessus (page À propos).
 * Tags : retour à la ligne en mobile (Figma) ; en tablette et desktop, une ligne en Figma,
 * avec retour à la ligne s'ils dépassent (choix de l'utilisateur).
 * Écart entre tags et entre lignes : spacing/md en mobile, spacing/lg ensuite (choix de l'utilisateur).
 *
 * Chargement (demandes de l'utilisateur, comme photosContainer de la page Contact) : la photo ne retient pas la page
 * (data-intro-defer). Elle reste masquée sur le fond de la page jusqu'à son chargement ; au-delà de
 * --site-intro-nav-threshold, la boucle du logo « 01 » (blanc, --photos-container-loader-size) tourne au centre,
 * avec la barre de progression blanche en haut de la photo. Photo chargée : elle apparaît d'un bloc
 * (--site-intro-reveal-duration). Les tags restent visibles. Mouvement réduit : sans boucle.
 */

export type HeadPageContainerProps = {
  title: string;
  /** Petit texte au-dessus du titre (détailsText du pageHead). */
  details?: string;
  /** Chemin public de la photo, ex. /projects/graine/cover.png. */
  image: string;
  tags: string[];
  /** Balise du titre : h1 s'il nomme la page, h2 sous un pageHead H1. */
  headingLevel?: "h1" | "h2";
  className?: string;
};

export function HeadPageContainer({ title, details, image, tags, headingLevel = "h1", className = "" }: HeadPageContainerProps) {
  const visual = useRef<HTMLDivElement>(null);
  const { state, progress } = useVisualsLoading(visual);
  return (
    <div className={`flex w-full flex-col ${className}`}>
      {/* Page Header */}
      {/* Tablette et desktop : deux moitiés égales autour du trait de 1px (FILL / FILL dans Figma). */}
      <div className="flex w-full flex-col tablet:grid tablet:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <PageHead
          type="H2"
          headingLevel={headingLevel}
          divider={false}
          title={title}
          details={details}
          className="order-3 tablet:order-1"
        />

        {/* dividerBar : horizontal sous la photo en mobile, vertical entre les deux moitiés ensuite. */}
        <span aria-hidden className="order-2 w-full shrink-0 border-t border-shape-neutral-white tablet:h-auto tablet:w-auto tablet:border-t-0 tablet:border-l" />

        {/* Navigation Image — hauteur fixe de 144px en mobile (valeur Figma validée), hauteur du pageHead ensuite. */}
        <div
          ref={visual}
          data-intro-defer
          className={[
            "relative order-1 flex h-[144px] w-full flex-wrap content-end items-end gap-md px-md py-sm",
            "tablet:order-3 tablet:h-auto tablet:gap-lg tablet:p-lg",
          ].join(" ")}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(width > 740px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-(--site-intro-reveal-duration) ease-(--motion-ease-out) ${
              state === "ready" ? "opacity-100" : "opacity-0"
            }`}
          />
          {tags.map((tag) => (
            <p key={tag} className="relative type-swiss-regular whitespace-pre text-text-neutral-white">
              {tag}
            </p>
          ))}

          {/* Chargement : barre de progression en haut, boucle du logo au centre. */}
          {state === "loading" && (
            <>
              <ProgressBar
                value={progress}
                color="white"
                aria-label={commun.chargement_progression}
                className="absolute! inset-x-0 top-0"
              />
              <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square h-(--photos-container-loader-size) -translate-1/2 motion-reduce:hidden">
                <ShowreelLogo phase="loop" className="size-full" />
              </div>
            </>
          )}
        </div>
      </div>
      <span aria-hidden className="w-full shrink-0 border-t border-shape-neutral-white" />
    </div>
  );
}
