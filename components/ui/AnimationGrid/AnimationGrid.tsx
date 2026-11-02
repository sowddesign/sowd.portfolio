"use client";

import { useState, type TouchEvent } from "react";
import { GridBar, type GridBarNumber } from "@/components/ui/GridBar";

/*
 * Grille animée — composant Figma « animationGrid » (fichier portfolio, node 4214:6208). Remplit son parent.
 * Rangée de gridBar (flex, gouttière et marges spacing/md en mobile, spacing/lg à partir de la tablette) :
 *   desktop : 12 tuiles 01 → 12 ; tablette : 01, 02, 04, 06, 07, 09, 11, 12 ; mobile : 02, 04, 06, 08.
 * Chaque tuile passe à son état hovered indépendamment : tant que la souris la survole,
 * ou tant que le doigt reste posé dessus. Au toucher, le doigt peut glisser d'une tuile à l'autre
 * (demande de l'utilisateur) : seule la tuile sous le doigt est allumée, tout s'éteint quand il se lève.
 * Le glissement horizontal reste sur la grille ; un glissement vertical fait défiler la page
 * et la tuile reste allumée tant que le doigt est posé (demande de l'utilisateur).
 * Le choix survol / appui suit le type d'entrée, pas la largeur d'écran.
 */

const numbers: GridBarNumber[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

/* Visibilité de chaque tuile selon le mode Figma (mobile, tablet, desktop). */
const visibility: Record<GridBarNumber, string> = {
  "01": "hidden tablet:block",
  "02": "block",
  "03": "hidden desktop:block",
  "04": "block",
  "05": "hidden desktop:block",
  "06": "block",
  "07": "hidden tablet:block",
  "08": "block tablet:hidden desktop:block",
  "09": "hidden tablet:block",
  "10": "hidden desktop:block",
  "11": "hidden tablet:block",
  "12": "hidden tablet:block",
};

function AnimationGridTile({ number, touched }: { number: GridBarNumber; touched: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      data-tile={number}
      className={`h-full min-w-px flex-1 ${visibility[number]}`}
      onPointerEnter={(event) => event.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <GridBar number={number} state={hovered || touched ? "hovered" : "default"} />
    </div>
  );
}

export function AnimationGrid({ className = "" }: { className?: string }) {
  /* Tuile sous le doigt (toucher seulement). */
  const [touched, setTouched] = useState<GridBarNumber | null>(null);

  /* Événements tactiles (et non pointeur) : ils continuent pendant le défilement de la page,
     là où l'appui pointeur serait annulé. */
  const follow = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const grid = event.currentTarget;
    const under = document.elementFromPoint(touch.clientX, touch.clientY);
    /* Doigt hors de la grille (pendant un défilement) : la tuile reste allumée. */
    if (!under || !grid.contains(under)) return;
    const tile = under.closest<HTMLElement>("[data-tile]");
    setTouched(tile ? (tile.dataset.tile as GridBarNumber) : null);
  };
  const release = () => setTouched(null);

  return (
    <div
      aria-hidden
      className={`flex size-full touch-pan-y gap-md px-md select-none [-webkit-touch-callout:none] tablet:gap-lg tablet:px-lg ${className}`}
      onTouchStart={follow}
      onTouchMove={follow}
      onTouchEnd={release}
      onTouchCancel={release}
    >
      {numbers.map((number) => (
        <AnimationGridTile key={number} number={number} touched={touched === number} />
      ))}
    </div>
  );
}
