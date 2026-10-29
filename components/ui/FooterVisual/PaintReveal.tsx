"use client";

import { useEffect, useId, type RefObject } from "react";
import { LogoDefs, logoDefsIds, patternGeometry, toFramePx } from "../LogoPattern";

/*
 * Coloriage des logos de footerVisual (demande hors Figma) : le motif est en shape/neutral/black
 * (invisible sur le fond noir) ; chaque logo survolé (ou touché) passe en shape/brand/brand
 * et le reste. Fondu --motion-duration-base / --motion-ease-out, coupé si le mouvement est réduit.
 * Les logos sont placés un par un sur la grille du pattern Figma (voir pattern-geometry.ts).
 */

const { scale, originX, originY } = patternGeometry;

export type PaintRevealProps = {
  /** Frame qui reçoit les évènements du pointeur (boutons compris). */
  frameRef: RefObject<HTMLDivElement | null>;
  /** Logos à afficher (patternLogos), dans l'ordre de superposition. */
  logos: { key: string; x: number; y: number }[];
  /** Logos déjà colorés au survol. */
  painted: ReadonlySet<string>;
  /** Calque des logos colorés posé par-dessus (« tout voir » et reset). */
  overlay: PaintOverlay;
  /** Survol actif (désactivé une fois tous les logos colorés). */
  interactive: boolean;
  onPaint: (key: string) => void;
};

/*
 * Calque des logos en brand au-dessus du motif : « tout voir » et reset ne font qu'un fondu d'opacité
 * sur ce seul calque, au lieu d'une transition de couleur sur chaque logo (plus fluide).
 * keys : logos affichés dans le calque ; instant : changement sans transition (préparation du reset).
 */
export type PaintOverlay = { keys: "all" | ReadonlySet<string>; visible: boolean; instant: boolean };

const fade = "transition-[opacity,fill] duration-(--motion-duration-base) ease-(--motion-ease-out) motion-reduce:transition-none";

export function PaintReveal({ frameRef, logos, painted, overlay, interactive, onPaint }: PaintRevealProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const logoId = logoDefsIds(uid).logo;
  const overlayUid = `${uid}-overlay`;
  const overlayLogoId = logoDefsIds(overlayUid).logo;

  // Survol et toucher : le logo sous le pointeur (le plus haut en cas de chevauchement) est coloré.
  useEffect(() => {
    const root = frameRef.current;
    if (!root || !interactive) return;
    const paintAt = (e: PointerEvent) => {
      const logo = document.elementFromPoint(e.clientX, e.clientY)?.closest<SVGElement>("[data-logo]");
      const key = logo?.dataset.logo;
      if (key && root.contains(logo)) onPaint(key);
    };
    root.addEventListener("pointerdown", paintAt);
    root.addEventListener("pointermove", paintAt);
    return () => {
      root.removeEventListener("pointerdown", paintAt);
      root.removeEventListener("pointermove", paintAt);
    };
  }, [frameRef, interactive, onPaint]);

  const transform = (x: number, y: number) =>
    `matrix(${scale} 0 0 ${scale} ${toFramePx(x, originX)} ${toFramePx(y, originY)})`;

  return (
    <>
      <svg aria-hidden className="absolute inset-0 block size-full">
        <defs>
          <LogoDefs uid={uid} />
        </defs>
        {logos.map(({ key, x, y }) => (
          <use
            key={key}
            data-logo={key}
            href={`#${logoId}`}
            transform={transform(x, y)}
            className={[
              overlay.instant ? "" : fade,
              painted.has(key) ? "fill-shape-brand-brand" : "fill-shape-neutral-black",
            ].join(" ")}
          />
        ))}
      </svg>

      <svg
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 block size-full will-change-[opacity]",
          overlay.instant ? "" : fade,
          overlay.visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <defs>
          <LogoDefs uid={overlayUid} fillClassName="fill-shape-brand-brand" />
        </defs>
        {logos.map(({ key, x, y }) => (
          <use
            key={key}
            href={`#${overlayLogoId}`}
            transform={transform(x, y)}
            className={overlay.keys === "all" || overlay.keys.has(key) ? "" : "invisible"}
          />
        ))}
      </svg>
    </>
  );
}
