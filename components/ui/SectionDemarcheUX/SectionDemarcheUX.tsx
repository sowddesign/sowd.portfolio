"use client";

import { useState, type PointerEvent } from "react";
import { accueil } from "@/content/texts";
import { parseLine } from "@/lib/markdown";
import { DoubleFlower } from "../DoubleFlower";
import { HeaderText } from "../HeaderText";
import { PageHead } from "../PageHead";

/*
 * Section « Démarche UX » — composant Figma « sectionDemarcheUX » (fichier portfolio, node 4214:5704).
 * Variantes Figma : device (desktop, tablet, mobile) × state (base, hovered).
 * Assemblage : pageHead H1, headerText puis doubleFlower ; desktop et tablette avec souris : trait et copyright dessous.
 * state=hovered : survol du bloc méthode → headerText hovered et doubleFlower en diamonds.
 * Tablette : reprend le desktop (pas de variante Figma à jour). Mobile et écran tactile : pas d'état hovered.
 */

const description = parseLine(accueil.demarche_description, (message) => {
  throw new Error(`content/pages/accueil.md : ${message}`);
});

export type SectionDemarcheUXProps = {
  /** Ancre de la section (lien « Démarche UX » du menu). */
  id?: string;
  className?: string;
};

export function SectionDemarcheUX({ id, className = "" }: SectionDemarcheUXProps) {
  const [hovered, setHovered] = useState(false);
  const hover = (value: boolean) => (event: PointerEvent) => event.pointerType === "mouse" && setHovered(value);

  return (
    <section id={id} className={`flex w-full flex-col text-text-neutral-white ${className}`}>
      <div className="flex flex-col gap-lg desktop:gap-xxl">
        <PageHead type="H1" title={accueil.demarche_ux} headingLevel="h2" />
        <div className="flex flex-col gap-lg">
          <div className="flex w-full desktop:px-lg" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
            <HeaderText
              label={accueil.demarche_methode}
              name={accueil.demarche_methode_nom}
              description={description}
              hovered={hovered}
            />
          </div>
          <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />
        </div>
      </div>

      {/* Schéma : trait vertical au centre, sous le visuel (desktop et tablette, hauteur de la scène). */}
      <div className="relative tablet:px-lg">
        {/* Même boîte que la scène de doubleFlower (format de la maquette, 720 de haut au plus). */}
        <div
          aria-hidden
          className="absolute inset-x-lg top-0 hidden max-h-(--double-flower-height) tablet:block"
          style={{ aspectRatio: "1440 / 721.33" }}
        >
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-shape-neutral-white" />
        </div>
        <DoubleFlower diamonds={hovered} className="relative" />
      </div>

      {/* Copyright de la section (desktop et tablette avec souris) ; sur écran tactile, celui de doubleFlower. */}
      <div className="hidden flex-col tablet:[@media(hover:hover)]:flex">
        <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />
        <p className="px-lg py-lg type-swiss-small-regular text-brand-50">{accueil.demarche_copyright}</p>
      </div>
    </section>
  );
}
