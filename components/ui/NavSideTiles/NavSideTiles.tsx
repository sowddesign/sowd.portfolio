"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { touchQuery, useMediaQuery } from "../use-media-query";
import { NavSideTile, type NavSideTileLayout } from "./NavSideTile";

/*
 * Liste de tuiles navSidetTiles. Prend toute la largeur de son emplacement.
 * Souris : affichage desktop ; tactile : affichage mobile (décision de l'utilisateur, tablette comprise).
 * Quand un Main text manque de place, la colonne du numéro rétrécit d'abord jusqu'à 3 chiffres ;
 * si un seul Main text ne tient toujours pas sur une ligne :
 *   souris  → toutes les tuiles passent en affichage réduit (tuile carrée, Main text au curseur) ;
 *   tactile → les Main text passent sur plusieurs lignes.
 * La mesure se fait sur une copie invisible en affichage complet, avec le contenu le plus large (icônes du survol).
 * Dans methodeContainer : mobile impose l'affichage mobile, panel s'ouvre sous la tuile sélectionnée
 * et repousse les suivantes (variante Figma 01Demo), measureWidth mesure à la largeur desktop de la colonne
 * même quand elle est réduite, onLayoutChange signale l'affichage retenu ; avec stickyTop, la tuile sélectionnée
 * reste collée à cette hauteur tant que son contenu ouvert défile (data-selected-tile sur le bloc de la tuile sélectionnée).
 */

export type NavSideStep = {
  number: string;
  label: string;
  /** Progression de lecture de l'étape, de 0 à 1 (terminée à 1). */
  progress: number;
};

export type NavSideFrameState = {
  layout: NavSideTileLayout;
  finished: number;
  numberWidth?: number;
  completions: number;
};

export type NavSideTilesProps = {
  steps: NavSideStep[];
  /** Index de l'étape sélectionnée, null si aucune. */
  selected: number | null;
  onSelectedChange: (index: number | null) => void;
  className?: string;
  /** Habillage autour des tuiles (NavSideMenus), avec l'affichage retenu, le nombre d'étapes terminées,
      la largeur commune de la colonne du numéro et le nombre d'accomplissements joués (goutte arrivée sur le Check). */
  frame?: (tiles: ReactNode, state: NavSideFrameState) => ReactNode;
  /** Affichage mobile imposé (variante Figma device=mobile), souris comprise. */
  mobile?: boolean;
  /** Contenu ouvert sous la tuile sélectionnée. */
  panel?: ReactNode;
  /** Hauteur CSS où la tuile sélectionnée reste collée pendant que son contenu ouvert défile. */
  stickyTop?: string;
  /** Largeur (px) de la copie de mesure, quand elle diffère de la largeur affichée. */
  measureWidth?: number;
  /** Tuiles mesurées (par défaut steps) : toutes celles de la méthode, pour une colonne du numéro et un passage
      en réduit identiques d'une étape à l'autre (methodeContainer, demande de l'utilisateur). */
  measureSteps?: NavSideTilesProps["steps"];
  onLayoutChange?: (layout: NavSideTileLayout) => void;
};

export function NavSideTiles({
  steps,
  selected,
  onSelectedChange,
  className = "",
  frame,
  mobile = false,
  panel,
  measureWidth,
  measureSteps,
  onLayoutChange,
  stickyTop,
}: NavSideTilesProps) {
  const measured = measureSteps ?? steps;
  const touch = useMediaQuery(touchQuery);
  const base = mobile || touch ? "mobile" : "desktop";
  const measureRef = useRef<HTMLDivElement>(null);
  const containers = useRef<(HTMLDivElement | null)[]>([]);
  /* Copie de mesure avec les noms courts (desktop) : la liste rétrécie passe aux noms courts avant le réduit
     (demande de l'utilisateur). */
  const shortContainers = useRef<(HTMLDivElement | null)[]>([]);
  const [overflow, setOverflow] = useState(false);
  const [shortOverflow, setShortOverflow] = useState(false);
  const [numberWidth, setNumberWidth] = useState<number>();
  const [completions, setCompletions] = useState(0);

  /* Progression sauvegardée : chaque étape garde la plus grande valeur reçue, même quand une autre est sélectionnée. */
  const [saved, setSaved] = useState<number[]>(() => steps.map((step) => step.progress));
  const next = steps.map((step, i) => Math.max(step.progress, saved[i] ?? 0));
  if (next.length !== saved.length || next.some((value, i) => value !== saved[i])) setSaved(next);

  useEffect(() => {
    const ghost = measureRef.current;
    if (!ghost) return;
    const check = () => {
      const present = (list: (HTMLDivElement | null)[]) => list.filter((el): el is HTMLDivElement => el !== null);
      const overflows = (list: HTMLDivElement[]) => list.some((el) => el.scrollWidth > el.clientWidth);
      const rows = present(containers.current);
      const shortRows = present(shortContainers.current);
      const full = overflows(rows);
      setOverflow(full);
      setShortOverflow(shortRows.length > 0 ? overflows(shortRows) : full);
      /* Colonne du numéro commune : la plus étroite après rétrécissement, pour aligner les tuiles
         (mesurée sur les noms affichés : complets, ou courts quand les complets ne tiennent plus). */
      const shown = full && shortRows.length > 0 ? shortRows : rows;
      const widths = shown.map((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width);
      setNumberWidth(widths.length ? Math.min(...widths) : undefined);
    };
    const observer = new ResizeObserver(check);
    observer.observe(ghost);
    document.fonts.ready.then(check);
    check();
    return () => observer.disconnect();
  }, [measured, base, measureWidth]);

  const layout = base === "desktop" && shortOverflow ? "reduced" : base;
  const short = base === "desktop" && overflow;
  const reportLayout = useRef(onLayoutChange);
  useEffect(() => {
    reportLayout.current = onLayoutChange;
  });
  useEffect(() => reportLayout.current?.(layout), [layout]);

  /* Chaque tuile dans son bloc (structure stable : la tuile reste montée quand elle est sélectionnée). */
  const tiles = steps.map((step, i) => {
    const open = selected === i && Boolean(panel);
    const sticky = open && stickyTop !== undefined;
    return (
      <div key={i} data-selected-tile={selected === i || undefined} className="flex flex-col">
        <div style={sticky ? { top: stickyTop } : undefined} className={sticky ? "sticky z-1" : ""}>
          <NavSideTile
            {...step}
            progress={next[i]}
            layout={layout}
            short={short}
            wrap={base === "mobile" && overflow}
            numberWidth={numberWidth}
            selected={selected === i}
            onToggle={() => onSelectedChange(selected === i ? null : i)}
            onCompleted={() => setCompletions((count) => count + 1)}
          />
        </div>
        {open && panel}
      </div>
    );
  });

  return (
    <div className={`relative flex w-full flex-col ${className}`}>
      <div
        ref={measureRef}
        aria-hidden
        inert
        style={measureWidth !== undefined ? { width: measureWidth } : undefined}
        className={`invisible absolute top-0 left-0 flex h-0 flex-col overflow-hidden ${measureWidth !== undefined ? "" : "right-0"}`}
      >
        {measured.map((step, i) => (
          <NavSideTile
            key={i}
            {...step}
            layout={base}
            measure
            containerRef={(el) => {
              containers.current[i] = el;
            }}
          />
        ))}
        {base === "desktop" &&
          measured.map((step, i) => (
            <NavSideTile
              key={`court-${i}`}
              {...step}
              layout={base}
              short
              measure
              containerRef={(el) => {
                shortContainers.current[i] = el;
              }}
            />
          ))}
      </div>
      {frame
        ? frame(tiles, { layout, finished: next.filter((value) => value >= 1).length, numberWidth, completions })
        : tiles}
    </div>
  );
}
