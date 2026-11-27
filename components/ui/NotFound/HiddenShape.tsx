"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { logoPatternPaths } from "../LogoPattern/logo-pattern-paths";
import { hiddenLogoSize, type HiddenShapeData } from "./hidden-shapes";

/*
 * Page 404 : forme cachée en logos de 4 px (formes de l'éditeur de motifs, hidden-shapes, généré).
 * Invisible au départ ; au survol, les logos à moins de --not-found-stem-reveal-radius logos du curseur se dessinent
 * (logo du motif : remplissage shape/brand/brand, ou shape/brand/somber pour le centre, contour border/neutral/black,
 * comme dans l'éditeur). onComplete : tous les logos visibles à l'écran sont découverts (une forme peut sortir de
 * l'écran). scale : réduction sur les petits écrans (formes du fond), le rayon reste compté en logos.
 * Rendu canvas : plusieurs milliers de logos, dessinés un à un au fil de la découverte.
 */

/** Taille du logo du motif, repère interne (comme l'éditeur et LogoDefs). */
const LOGO_UNITS = 442;
/** Pas horizontal de la grille du motif, repère interne (rayon compté en logos). */
const GRID_STEP = 384.54;
/** Marge autour des logos pour le contour. */
const PAD = 1;

/** Événement (sur window) qui découvre les logos autour d'un point écran : bouton « Tout révéler » de la 404. */
export const hiddenShapeSweepEvent = "not-found-sweep";
export type HiddenShapeSweep = { x: number; y: number; radius: number };

export function HiddenShape({
  shape,
  scale = 1,
  onComplete,
  className = "",
  style,
}: {
  shape: HiddenShapeData;
  scale?: number;
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const done = useRef(onComplete);
  /** Logos déjà découverts, gardés quand la taille change. */
  const shown = useRef<Uint8Array | null>(null);
  useEffect(() => {
    done.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const cells = [...shape.paint, ...shape.centre];
    const count = cells.length / 2;
    const firstCentre = shape.paint.length / 2;
    if (!shown.current || shown.current.length !== count) shown.current = new Uint8Array(count);
    const seen = shown.current;

    const dpr = window.devicePixelRatio || 1;
    const ratio = dpr * scale;
    canvas.width = Math.ceil((shape.width + 2 * PAD) * ratio);
    canvas.height = Math.ceil((shape.height + 2 * PAD) * ratio);

    const styles = getComputedStyle(canvas);
    const radius =
      parseFloat(styles.getPropertyValue("--not-found-stem-reveal-radius")) * GRID_STEP * (hiddenLogoSize / LOGO_UNITS);

    // Logo du motif, dessiné une fois par couleur à la bonne résolution, puis posé à chaque logo découvert.
    const paths = logoPatternPaths.map((d) => new Path2D(d));
    const unit = (hiddenLogoSize / LOGO_UNITS) * ratio;
    const margin = Math.ceil(6 * unit) + 1;
    const sprite = (fill: string) => {
      const c = document.createElement("canvas");
      c.width = c.height = Math.ceil(hiddenLogoSize * ratio) + 2 * margin;
      const s = c.getContext("2d")!;
      s.translate(margin, margin);
      s.scale(unit, unit);
      s.strokeStyle = styles.getPropertyValue("--border-neutral-black").trim();
      s.lineWidth = 12;
      s.lineJoin = "round";
      paths.forEach((p) => s.stroke(p));
      s.fillStyle = fill;
      paths.forEach((p) => s.fill(p));
      return c;
    };
    const paint = sprite(styles.getPropertyValue("--shape-brand-brand").trim());
    const centre = sprite(styles.getPropertyValue("--shape-brand-somber").trim());
    const stamp = (i: number) => {
      const x = (cells[2 * i] + PAD) * ratio;
      const y = (cells[2 * i + 1] + PAD) * ratio;
      ctx.drawImage(i < firstCentre ? paint : centre, Math.round(x) - margin, Math.round(y) - margin);
    };
    for (let i = 0; i < count; i++) if (seen[i]) stamp(i);

    let finished = false;
    const complete = (box: DOMRect) => {
      for (let i = 0; i < count; i++) {
        if (seen[i]) continue;
        const left = box.left + (cells[2 * i] + PAD) * scale;
        const top = box.top + (cells[2 * i + 1] + PAD) * scale;
        const size = hiddenLogoSize * scale;
        if (top >= 0 && top + size <= window.innerHeight && left >= 0 && left + size <= window.innerWidth) return false;
      }
      return true;
    };
    /** Découvre les logos à moins de r (repère de la forme) du point écran (clientX, clientY). */
    const revealAt = (clientX: number, clientY: number, r: number) => {
      if (finished) return;
      const box = canvas.getBoundingClientRect();
      // Repère de la forme (avant réduction).
      const x = (clientX - box.left) / scale - PAD;
      const y = (clientY - box.top) / scale - PAD;
      if (x < -r || y < -r || x > shape.width + r || y > shape.height + r) return;
      let changed = false;
      for (let i = 0; i < count; i++) {
        if (seen[i]) continue;
        const cx = cells[2 * i] + hiddenLogoSize / 2;
        const cy = cells[2 * i + 1] + hiddenLogoSize / 2;
        if ((cx - x) ** 2 + (cy - y) ** 2 > r * r) continue;
        seen[i] = 1;
        changed = true;
        stamp(i);
      }
      if (changed && done.current && complete(box)) {
        finished = true;
        done.current();
      }
    };
    const move = (event: PointerEvent) => revealAt(event.clientX, event.clientY, radius);
    // « Tout révéler » : grande gomme qui balaie l'écran (rayon en px écran).
    const sweep = (event: Event) => {
      const { x, y, radius: r } = (event as CustomEvent<HiddenShapeSweep>).detail;
      revealAt(x, y, r / scale);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener(hiddenShapeSweepEvent, sweep);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener(hiddenShapeSweepEvent, sweep);
    };
  }, [shape, scale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ width: (shape.width + 2 * PAD) * scale, height: (shape.height + 2 * PAD) * scale, ...style }}
    />
  );
}

/** Marge du canvas autour des logos (pour placer une forme d'après ses logos). */
export const hiddenShapePad = PAD;
