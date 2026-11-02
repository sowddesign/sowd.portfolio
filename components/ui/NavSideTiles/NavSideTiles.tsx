"use client";

import { useEffect, useRef, useState } from "react";
import { touchQuery, useMediaQuery } from "../use-media-query";
import { NavSideTile } from "./NavSideTile";

/*
 * Liste de tuiles navSidetTiles. Prend toute la largeur de son emplacement.
 * Souris : affichage desktop ; tactile : affichage mobile (décision de l'utilisateur, tablette comprise).
 * Quand un Main text manque de place, la colonne du numéro rétrécit d'abord jusqu'à 3 chiffres ;
 * si un seul Main text ne tient toujours pas sur une ligne :
 *   souris  → toutes les tuiles passent en affichage réduit (tuile carrée, Main text au curseur) ;
 *   tactile → les Main text passent sur plusieurs lignes.
 * La mesure se fait sur une copie invisible en affichage complet, avec le contenu le plus large (icônes du survol).
 */

export type NavSideStep = {
  number: string;
  label: string;
  /** Progression de lecture de l'étape, de 0 à 1 (terminée à 1). */
  progress: number;
};

export type NavSideTilesProps = {
  steps: NavSideStep[];
  /** Index de l'étape sélectionnée, null si aucune. */
  selected: number | null;
  onSelectedChange: (index: number | null) => void;
  className?: string;
};

export function NavSideTiles({ steps, selected, onSelectedChange, className = "" }: NavSideTilesProps) {
  const touch = useMediaQuery(touchQuery);
  const base = touch ? "mobile" : "desktop";
  const measureRef = useRef<HTMLDivElement>(null);
  const containers = useRef<(HTMLDivElement | null)[]>([]);
  const [overflow, setOverflow] = useState(false);
  const [numberWidth, setNumberWidth] = useState<number>();

  /* Progression sauvegardée : chaque étape garde la plus grande valeur reçue, même quand une autre est sélectionnée. */
  const [saved, setSaved] = useState<number[]>(() => steps.map((step) => step.progress));
  const next = steps.map((step, i) => Math.max(step.progress, saved[i] ?? 0));
  if (next.length !== saved.length || next.some((value, i) => value !== saved[i])) setSaved(next);

  useEffect(() => {
    const ghost = measureRef.current;
    if (!ghost) return;
    const check = () => {
      const rows = containers.current.filter((el): el is HTMLDivElement => el !== null);
      setOverflow(rows.some((el) => el.scrollWidth > el.clientWidth));
      /* Colonne du numéro commune : la plus étroite après rétrécissement, pour aligner les tuiles. */
      const widths = rows.map((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width);
      setNumberWidth(widths.length ? Math.min(...widths) : undefined);
    };
    const observer = new ResizeObserver(check);
    observer.observe(ghost);
    document.fonts.ready.then(check);
    check();
    return () => observer.disconnect();
  }, [steps, base]);

  const layout = base === "desktop" && overflow ? "reduced" : base;

  return (
    <div className={`relative flex w-full flex-col ${className}`}>
      <div ref={measureRef} aria-hidden inert className="invisible absolute inset-x-0 top-0 flex flex-col">
        {steps.map((step, i) => (
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
      </div>
      {steps.map((step, i) => (
        <NavSideTile
          key={i}
          {...step}
          progress={next[i]}
          layout={layout}
          wrap={base === "mobile" && overflow}
          numberWidth={numberWidth}
          selected={selected === i}
          onToggle={() => onSelectedChange(selected === i ? null : i)}
        />
      ))}
    </div>
  );
}
