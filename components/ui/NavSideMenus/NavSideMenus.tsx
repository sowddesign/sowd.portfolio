"use client";

import { commun } from "@/content/texts";
import {
  NavSideTileEmpty,
  NavSideTiles,
  reducedTileWidth,
  type NavSideTileLayout,
  type NavSideTilesProps,
} from "../NavSideTiles";

/*
 * Menu latéral des étapes — composant Figma « navSideMenus » (fichier portfolio, node 4293:5409).
 * Variantes Figma → props :
 *   device       → affichage retenu par NavSideTiles (souris : desktop ou réduit ; tactile : mobile) ;
 *   pageSelected → selected (index de l'étape, null pour « none »).
 * Structure : trait, tuiles, compteur « Terminés », trait, puis en desktop une tuile vide qui prend la place restante.
 * Compteur : étapes terminées / nombre d'étapes. En affichage réduit, il devient « 0/7 » seul,
 * avec l'espacement des tuiles carrées (décision de l'utilisateur).
 */

export type NavSideMenusProps = Omit<NavSideTilesProps, "frame">;

const separator = "block h-px shrink-0 bg-shape-neutral-black";

function FinishedCounter({ finished, total, layout }: { finished: number; total: number; layout: NavSideTileLayout }) {
  const reduced = layout === "reduced";
  const count = `${finished}/${total}`;
  return (
    <div
      className={`flex h-(--nav-side-menus-counter-height) shrink-0 items-center rounded-l-xs bg-background-brand-bright py-sm text-text-neutral-black ${
        reduced ? `${reducedTileWidth} justify-center` : `w-full gap-lg ${layout === "mobile" ? "px-md" : "px-lg"}`
      }`}
    >
      <p className={reduced ? "sr-only" : "type-body-italic"}>{commun.methode_terminees}</p>
      {reduced ? (
        <p className="type-body-regular">{count}</p>
      ) : (
        <div className="flex grow items-center gap-sm">
          <p className="type-body-regular grow text-right">{count}</p>
        </div>
      )}
    </div>
  );
}

export function NavSideMenus({ className = "", ...props }: NavSideMenusProps) {
  return (
    <NavSideTiles
      {...props}
      className={className}
      frame={(tiles, { layout, finished }) => {
        const width = layout === "reduced" ? reducedTileWidth : "w-full";
        return (
          <>
            <span aria-hidden className={`${separator} ${width}`} />
            {tiles}
            <FinishedCounter finished={finished} total={props.steps.length} layout={layout} />
            <span aria-hidden className={`${separator} ${width}`} />
            {layout !== "mobile" && <NavSideTileEmpty layout={layout} className="grow" />}
          </>
        );
      }}
    />
  );
}
