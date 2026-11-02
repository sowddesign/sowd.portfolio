"use client";

import { useEffect, useRef, type RefObject } from "react";
import { checkStart } from "./CheckTrace";

/*
 * Goutte d'accomplissement (animation C2, réglages choisis par l'utilisateur, tokens --nav-side-tile-drop-*).
 * Une goutte en larme jaillit du bout de la barre, pointe vers l'arrière dans le sens du saut,
 * et décrit un arc jusqu'au début du Check en passant de shape/brand/brand à shape/brand/whitish.
 * Calque posé sur la tuile, sans interaction. Mouvement réduit : arrivée immédiate.
 */

function readMs(style: CSSStyleDeclaration, name: string) {
  const value = style.getPropertyValue(name).trim();
  return value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
}

/* Couleur CSS → composantes RGB, normalisée par le canvas (#rrggbb). */
function toRgb(g: CanvasRenderingContext2D, color: string) {
  g.fillStyle = color;
  const hex = g.fillStyle.slice(1);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/* Larme : tête ronde à l'avant, pointe à l'arrière (longueur 2,2 rayons). */
function tear(g: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.beginPath();
  g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  g.bezierCurveTo(-r * 0.9, r, -r * 1.6, r * 0.25, -r * 2.2, 0);
  g.bezierCurveTo(-r * 1.6, -r * 0.25, -r * 0.9, -r, 0, -r);
  g.closePath();
  g.fill();
  g.restore();
}

export function CompletionDrop({
  targetRef,
  onLand,
}: {
  /** Check d'arrivée. */
  targetRef: RefObject<SVGSVGElement | null>;
  onLand: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onLandRef = useRef(onLand);

  useEffect(() => {
    onLandRef.current = onLand;
  }, [onLand]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    const target = targetRef.current;
    if (!canvas || !g || !target) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onLandRef.current();
      return;
    }

    const style = getComputedStyle(canvas);
    const flight = readMs(style, "--nav-side-tile-drop-flight");
    const dpr = devicePixelRatio || 1;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const px = (name: string) => {
      const value = style.getPropertyValue(name).trim();
      return parseFloat(value) * (value.endsWith("rem") ? rem : 1) * dpr;
    };
    const jump = px("--nav-side-tile-drop-jump");
    const radius = px("--nav-side-tile-drop-size") / 2;
    const barHeight = px("--progress-bar-height");
    const from = toRgb(g, style.getPropertyValue("--shape-brand-brand"));
    const to = toRgb(g, style.getPropertyValue("--shape-brand-whitish"));

    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    const box = canvas.getBoundingClientRect();
    const check = target.getBoundingClientRect();
    /* Départ : bout de la barre (au-dessus du trait de 1px). Arrivée : début du trait du Check. */
    const sx = canvas.width - radius;
    const sy = canvas.height - dpr - barHeight;
    const cx = (check.left + check.width * checkStart.x - box.left) * dpr;
    const cy = (check.top + check.height * checkStart.y - box.top) * dpr;
    const at = (q: number) => [sx + (cx - sx) * q, sy + (cy - sy) * q - Math.sin(q * Math.PI) * jump];

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const q = Math.min(1, (now - start) / flight);
      g.clearRect(0, 0, canvas.width, canvas.height);
      if (q >= 1) {
        onLandRef.current();
        return;
      }
      const [x, y] = at(q);
      const [px, py] = at(Math.max(0, q - 0.02));
      g.fillStyle = `rgb(${from.map((c, i) => Math.round(c + (to[i] - c) * q)).join(",")})`;
      tear(g, x, y, radius, Math.atan2(y - py, x - px));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-10 size-full" />;
}
