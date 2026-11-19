"use client";

import { commun } from "@/content/texts";
import { CursorLabel } from "../CursorLabel";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Logomark } from "../LogoButton/Logomark";
import { colorTransition } from "../button-tones";
import { reducedTileWidth, type NavSideTileLayout } from "./NavSideTile";

/*
 * Tuile « Bonus » — composant Figma « navSidetTiles/bonus » (fichier portfolio, node 5851:30891).
 * Remplace le compteur « Terminés » de navSideMenus quand toutes les pages de l'étape sont lues (NavSideMenus).
 * Variantes Figma → props :
 *   device   → layout : desktop, reduced (tuile carrée « tablet »), mobile ;
 *   selected → selected (Figma : state=hovered, selected=yes, appliqué sélectionnée, survolée ou non, comme les autres tuiles) ;
 *   state    → hovered = :hover.
 * Desktop : fond background/brand/darkest ; logo (toUseLogo), puis ArrowRight au survol, X sélectionnée ;
 *   survol shape/brand/whitish, sélectionnée shape/brand/somber, textes body/accentuation text/neutral/white.
 *   Logo et X : 32 sans variable dans Figma, --icon-lg comme ArrowRight (décision de l'utilisateur).
 * Réduite : « Bonus » seul ; ArrowRight au survol, X sélectionnée (le numéro est masqué dans Figma) ; texte au curseur.
 * Mobile : « Bonus », texte, puis à droite le Plus qui tourne en X (IconButton « turned », comme les autres tuiles mobiles,
 *   choix de l'utilisateur ; Figma : ArrowRight puis X), tertiary black, white sélectionnée ; sans logo (Figma), sans texte au curseur.
 * Pas de trait propre : le trait de navSideMenus sous le compteur sert de trait du bas (un seul trait).
 */

const bonusHeights: Record<NavSideTileLayout, string> = {
  desktop: "h-[calc(var(--spacing-sm)*2+var(--button-size-sm))]",
  mobile: "h-[calc(var(--spacing-sm)*2+var(--button-size-sm))]",
  /* Carrée : même côté que les autres tuiles réduites, trait compris (le trait vient de navSideMenus). */
  reduced: "h-[calc(var(--spacing-sm)*2+var(--button-size-sm)+var(--progress-bar-height))]",
};

/** Hauteur de la tuile Bonus, sans trait. */
export const bonusTileHeight = (layout: NavSideTileLayout) => bonusHeights[layout];

export type BonusTileContentProps = {
  layout: NavSideTileLayout;
  number: string;
  label: string;
  selected?: boolean;
  /** Icônes du survol (tuile interactive) ; sans : logo seul (aperçu de l'animation). */
  hover?: boolean;
  /** Largeur commune de la colonne du numéro (NavSideTiles), pour s'aligner sur les autres tuiles. */
  numberWidth?: number;
  /** Mobile : ouvre ou ferme la page (Plus / X) ; sans : bouton inerte (aperçu de l'animation). */
  onToggle?: () => void;
  className?: string;
};

/** Contenu de la tuile Bonus, sans fond ni bouton : partagé avec l'animation qui la dévoile (NavSideMenus). */
export function BonusTileContent({
  layout,
  number,
  label,
  selected = false,
  hover = false,
  numberWidth,
  onToggle,
  className = "",
}: BonusTileContentProps) {
  const text = selected
    ? "type-body-accentuation text-text-neutral-white"
    : "type-body-regular text-text-neutral-black";
  const icon = selected ? "text-shape-neutral-white" : "text-shape-neutral-black";
  const size = "size-(--icon-lg)";

  if (layout === "reduced") {
    return (
      <div className={`grid place-items-center py-sm ${className}`}>
        <p
          className={`${colorTransition} ${text} text-center [grid-area:1/1] ${
            selected ? "invisible" : hover ? "group-hover:invisible" : ""
          }`}
        >
          {number}
        </p>
        {(selected || hover) && (
          <span className={`[grid-area:1/1] ${selected ? "flex" : "hidden group-hover:flex"}`}>
            <Icon name={selected ? "X" : "ArrowRight"} size="var(--icon-lg)" className={`${colorTransition} ${icon}`} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center py-sm ${layout === "mobile" ? "gap-lg px-md" : "gap-sm pr-sm pl-lg"} ${className}`}>
      <p
        style={numberWidth !== undefined ? { width: numberWidth } : undefined}
        className={`${colorTransition} ${text} ${
          numberWidth !== undefined
            ? "min-w-max shrink-0"
            : `min-w-[3ch] shrink ${
                layout === "mobile"
                  ? "basis-(--nav-side-tile-number-max-mobile)"
                  : "basis-(--nav-side-tile-number-max-desktop)"
              }`
        }`}
      >
        {number}
      </p>
      <div className="flex h-(--button-size-sm) min-w-0 grow items-center gap-sm">
        {layout === "mobile" ? (
          <>
            <p className={`${colorTransition} ${text} min-w-0 grow truncate`}>{label}</p>
            {/* Croix toujours visible (pas de survol au toucher), comme les autres tuiles mobiles. */}
            <span className="pointer-events-auto flex">
              <IconButton
                icon="Plus"
                turned={selected}
                label={`${selected ? "Fermer" : "Ouvrir"} ${label}`}
                cursorLabel={null}
                variant="tertiary"
                color={selected ? "white" : "black"}
                onClick={onToggle}
                tabIndex={-1}
              />
            </span>
          </>
        ) : selected ? (
          <Icon name="X" size="var(--icon-lg)" className={`${colorTransition} ${icon}`} />
        ) : (
          <>
            <Logomark className={`${size} ${icon} ${hover ? "group-hover:hidden" : ""}`} />
            {hover && (
              <span className="hidden shrink-0 group-hover:flex">
                <Icon name="ArrowRight" size="var(--icon-lg)" className={`${colorTransition} ${icon}`} />
              </span>
            )}
          </>
        )}
        {layout !== "mobile" && <p className={`${colorTransition} ${text} min-w-0 grow truncate`}>{label}</p>}
      </div>
    </div>
  );
}

export type NavSideBonusTileProps = {
  number: string;
  label: string;
  layout?: NavSideTileLayout;
  selected?: boolean;
  numberWidth?: number;
  onToggle?: () => void;
};

export function NavSideBonusTile({
  number,
  label,
  layout = "desktop",
  selected = false,
  numberWidth,
  onToggle,
}: NavSideBonusTileProps) {
  const reduced = layout === "reduced";
  const background = selected
    ? "bg-shape-brand-somber"
    : "bg-background-brand-darkest hover:bg-shape-brand-whitish";

  const toggle = (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${number} ${label}`}
      onClick={onToggle}
      className="absolute inset-0 cursor-pointer"
    />
  );

  return (
    <div
      className={`group relative flex shrink-0 flex-col ${colorTransition} ${background} ${bonusTileHeight(layout)} ${
        reduced ? reducedTileWidth : "w-full"
      }`}
    >
      {/* Desktop : « Sélectionner » (ou « Fermer », tuile ouverte) au curseur, comme les tuiles des pages
          (demande de l'utilisateur) ; réduite : Main text ; mobile : sans texte au curseur. */}
      {reduced ? (
        <CursorLabel label={label} className="absolute inset-0">
          {toggle}
        </CursorLabel>
      ) : layout === "mobile" ? (
        toggle
      ) : (
        <CursorLabel
          label={selected ? commun.curseur_methode_fermer_page : commun.curseur_methode_selectionner}
          className="absolute inset-0"
        >
          {toggle}
        </CursorLabel>
      )}
      <BonusTileContent
        layout={layout}
        number={number}
        label={label}
        selected={selected}
        hover
        numberWidth={numberWidth}
        onToggle={onToggle}
        className="pointer-events-none relative flex-1"
      />
    </div>
  );
}
