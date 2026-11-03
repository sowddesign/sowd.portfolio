"use client";

import { useEffect, useRef, useState } from "react";
import { GridBar, type GridBarNumber } from "@/components/ui/GridBar";

/*
 * Grille animée — composant Figma « animationGrid » (fichier portfolio, node 4214:6208). Remplit son parent.
 * Rangée de gridBar (flex, gouttière et marges spacing/md en mobile, spacing/lg à partir de la tablette) :
 *   desktop : 12 tuiles 01 → 12 ; tablette : 01, 02, 04, 06, 07, 09, 11, 12 ; mobile : 01, 04, 06, 08
 *   (la première tuile à gauche est toujours celle du logo, demande de l'utilisateur).
 * Chaque tuile passe à son état hovered indépendamment : tant que la souris la survole,
 * ou tant que le doigt reste posé dessus. Au toucher, le doigt peut glisser d'une tuile à l'autre
 * (demande de l'utilisateur) : seule la tuile sous le doigt est allumée, tout s'éteint quand il se lève.
 * Le glissement horizontal reste sur la grille ; un glissement vertical fait défiler la page
 * et la tuile reste allumée tant que le doigt est posé (demande de l'utilisateur).
 * Le choix survol / appui suit le type d'entrée, pas la largeur d'écran.
 * Au toucher, la tuile s'allume aussi quand le doigt est posé sur un élément placé au-dessus de la grille (photo,
 * textes du showreel…), sans gêner cet élément (demande de l'utilisateur) : le toucher est suivi sur toute la page
 * et comparé à la zone visible de la grille.
 */

const numbers: GridBarNumber[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

/* Visibilité de chaque tuile selon le mode Figma (mobile, tablet, desktop). */
const visibility: Record<GridBarNumber, string> = {
  "01": "block",
  "02": "hidden tablet:block",
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
     là où l'appui pointeur serait annulé. Écoutés sur toute la page (passifs) pour réagir aussi à travers
     les éléments posés au-dessus de la grille. */
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    /** Zone visible de la grille : sa boîte, rognée par ses parents qui découpent leur contenu. */
    const visibleArea = () => {
      let { left, top, right, bottom } = grid.getBoundingClientRect();
      for (let el = grid.parentElement; el && el !== document.body; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.overflowX === "visible" && style.overflowY === "visible") continue;
        const box = el.getBoundingClientRect();
        left = Math.max(left, box.left);
        top = Math.max(top, box.top);
        right = Math.min(right, box.right);
        bottom = Math.min(bottom, box.bottom);
      }
      return { left, top, right, bottom };
    };
    const follow = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || !grid.offsetParent) return;
      const { clientX: x, clientY: y } = touch;
      const area = visibleArea();
      /* Doigt hors de la grille (pendant un défilement) : la tuile reste allumée. */
      if (x < area.left || x > area.right || y < area.top || y > area.bottom) return;
      const tile = Array.from(grid.querySelectorAll<HTMLElement>("[data-tile]")).find((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && x >= box.left && x <= box.right;
      });
      setTouched(tile ? (tile.dataset.tile as GridBarNumber) : null);
    };
    const release = () => setTouched(null);
    window.addEventListener("touchstart", follow, { passive: true });
    window.addEventListener("touchmove", follow, { passive: true });
    window.addEventListener("touchend", release);
    window.addEventListener("touchcancel", release);
    return () => {
      window.removeEventListener("touchstart", follow);
      window.removeEventListener("touchmove", follow);
      window.removeEventListener("touchend", release);
      window.removeEventListener("touchcancel", release);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      aria-hidden
      className={`flex size-full touch-pan-y gap-md px-md select-none [-webkit-touch-callout:none] tablet:gap-lg tablet:px-lg ${className}`}
    >
      {numbers.map((number) => (
        <AnimationGridTile key={number} number={number} touched={touched === number} />
      ))}
    </div>
  );
}
