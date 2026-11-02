"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Barre de progression — composant Figma « progressBar » (fichier portfolio, node 5010:21991).
 * Variantes Figma → props : color (black | white | brand | whitish).
 * La propriété Figma « progress » (empty | 50% | 100%) devient une valeur continue (value, de 0 à 1).
 * Seules les couleurs et la forme viennent de Figma : barre pleine, sans rayon, partie vide transparente.
 * La barre prend la largeur de son parent.
 *
 * Sans retour arrière : la barre garde la plus grande valeur reçue.
 * Au montage, la barre s'affiche directement à la valeur reçue ; seules les avancées suivantes sont animées.
 * Animation « houle » (W3, réglages choisis par l'utilisateur, tokens --progress-bar-*) :
 * le remplissage rattrape la valeur avec un ressort amorti, et des vagues courent sur le dessus de l'eau
 * en se creusant vers le front, d'autant plus que l'eau avance vite. Les vagues restent dans la barre.
 * Mouvement réduit : remplissage direct, sans vagues.
 */

export type ProgressBarColor = "black" | "white" | "brand" | "whitish";

export type ProgressBarProps = {
  /** Propriété Figma « color ». */
  color?: ProgressBarColor;
  /** Progression, de 0 à 1. */
  value: number;
  /** Appelé quand le remplissage affiché atteint 100 %. */
  onFilled?: () => void;
  "aria-label"?: string;
  className?: string;
};

const fill: Record<ProgressBarColor, string> = {
  black: "text-shape-neutral-black",
  white: "text-shape-neutral-white",
  brand: "text-shape-brand-brand",
  whitish: "text-shape-brand-whitish",
};

/* Réglages de la houle lus dans les tokens. */
function readWave(el: HTMLElement) {
  const style = getComputedStyle(el);
  const num = (name: string) => parseFloat(style.getPropertyValue(name));
  const catchUp = style.getPropertyValue("--progress-bar-catch-up").trim();
  return {
    catchUp: catchUp.endsWith("ms") ? parseFloat(catchUp) / 1000 : parseFloat(catchUp),
    height: num("--progress-bar-wave-height"),
    length: num("--progress-bar-wave-length"),
    speed: num("--progress-bar-wave-speed"),
    reach: num("--progress-bar-wave-reach"),
    rest: num("--progress-bar-wave-rest"),
  };
}

export function ProgressBar({
  color = "black",
  value,
  onFilled,
  "aria-label": ariaLabel,
  className = "",
}: ProgressBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const wakeRef = useRef<() => void>(() => {});
  const onFilledRef = useRef(onFilled);

  useEffect(() => {
    onFilledRef.current = onFilled;
  }, [onFilled]);

  const clamped = Math.min(1, Math.max(0, value));
  const [shown, setShown] = useState(clamped);
  /* Valeur au montage : la barre y est affichée tout de suite, sans se remplir depuis 0. */
  const initialRef = useRef(clamped);
  if (clamped > shown) setShown(clamped);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const wave = readWave(canvas);
    const omega = 4.5 / wave.catchUp;
    const initial = initialRef.current;
    targetRef.current = initial;
    const state = { d: initial, v: 0, energy: 0, t: 0, filled: initial >= 1 };
    let frame = 0;
    let last = 0;
    let dpr = 1;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      g.clearRect(0, 0, W, H);
      const x = state.d * W;
      if (x <= 0) return;
      g.fillStyle = getComputedStyle(canvas).color;
      g.beginPath();
      g.moveTo(0, H);
      g.lineTo(0, 0);
      const amp = wave.height * dpr * (wave.rest + (1 - wave.rest) * state.energy);
      if (amp > 0.01 && !reducedMotion.matches) {
        const length = wave.length * dpr;
        const reach = wave.reach * dpr;
        const phase = (state.t * wave.speed) / wave.length;
        const start = Math.max(0, x - reach * 4);
        g.lineTo(start, 0);
        for (let px = start; px <= x; px += dpr) {
          const k = Math.exp(-(x - px) / reach);
          const w = 0.5 + 0.5 * Math.sin((px / length - phase) * Math.PI * 2);
          g.lineTo(px, Math.min(H, amp * k * (1 - w)));
        }
      }
      g.lineTo(x, 0);
      g.lineTo(x, H);
      g.closePath();
      g.fill();
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      state.t += dt;
      const target = targetRef.current;
      if (reducedMotion.matches) {
        state.d = target;
        state.v = 0;
        state.energy = 0;
      } else {
        const a = omega * omega * (target - state.d) - 2 * omega * state.v;
        state.v += a * dt;
        state.d = Math.min(1, Math.max(0, state.d + state.v * dt));
        state.energy += (Math.min(Math.abs(state.v) * 8, 1) - state.energy) * Math.min(1, dt * 3);
      }
      draw();
      if (!state.filled && target >= 1 && state.d >= 0.995) {
        state.filled = true;
        onFilledRef.current?.();
      }
      const settled =
        Math.abs(target - state.d) < 1e-4 && Math.abs(state.v) < 1e-4 && state.energy < 1e-3 && wave.rest === 0;
      if (settled || reducedMotion.matches) {
        state.d = target;
        draw();
        frame = 0;
        last = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      dpr = devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    wake();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      wakeRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    targetRef.current = shown;
    wakeRef.current();
  }, [shown]);

  /* Redessine au changement de couleur, même barre immobile. */
  useEffect(() => {
    wakeRef.current();
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown * 100)}
      className={`block h-(--progress-bar-height) w-full ${fill[color]} ${className}`}
    />
  );
}
