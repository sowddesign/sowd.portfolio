"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Barre de progression — composant Figma « progressBar » (fichier portfolio, node 5010:21991).
 * Variantes Figma → props : color (black | white | brand | whitish).
 * La propriété Figma « progress » (empty | 50% | 100%) devient une valeur continue (value, de 0 à 1).
 * Seules les couleurs et la forme viennent de Figma : barre pleine, sans rayon, partie vide transparente.
 * La barre prend la largeur de son parent.
 *
 * Sans retour arrière par défaut : la barre garde la plus grande valeur reçue ; avec backward (lecture vidéo), le liquide
 * recule avec le même ressort. immediate : la barre suit la valeur sans ressort (glisser sur la barre de lecture).
 * Au montage, la barre s'affiche directement à la valeur reçue ; seules les avancées suivantes sont animées.
 * Animation « liquide contenu » (onde douce, réglages choisis par l'utilisateur, tokens --progress-bar-*) :
 * le remplissage rattrape la valeur avec un ressort amorti, et une onde descend le long du bord droit qui progresse,
 * d'autant plus ample que le liquide avance vite (au repos : --progress-bar-edge-rest). L'onde reste dans la barre.
 * Mouvement réduit : remplissage direct, bord droit.
 */

export type ProgressBarColor = "black" | "white" | "brand" | "whitish";

export type ProgressBarProps = {
  /** Propriété Figma « color ». */
  color?: ProgressBarColor;
  /** Progression, de 0 à 1. */
  value: number;
  /** Appelé quand le remplissage affiché atteint 100 %. */
  onFilled?: () => void;
  /** Le liquide peut reculer (lecture vidéo) ; sinon la barre garde la plus grande valeur reçue. */
  backward?: boolean;
  /** Suit la valeur sans ressort (glisser). */
  immediate?: boolean;
  "aria-label"?: string;
  /** Barre décorative, doublée par un autre contrôle accessible (barre de lecture vidéo). */
  "aria-hidden"?: boolean;
  className?: string;
};

const fill: Record<ProgressBarColor, string> = {
  black: "text-shape-neutral-black",
  white: "text-shape-neutral-white",
  brand: "text-shape-brand-brand",
  whitish: "text-shape-brand-whitish",
};

/* Réglages de l'onde du bord lus dans les tokens. */
function readWave(el: HTMLElement) {
  const style = getComputedStyle(el);
  const num = (name: string) => parseFloat(style.getPropertyValue(name));
  const catchUp = style.getPropertyValue("--progress-bar-catch-up").trim();
  return {
    catchUp: catchUp.endsWith("ms") ? parseFloat(catchUp) / 1000 : parseFloat(catchUp),
    amplitude: num("--progress-bar-edge-amplitude"),
    rest: num("--progress-bar-edge-rest"),
    speed: num("--progress-bar-edge-speed"),
  };
}

export function ProgressBar({
  color = "black",
  value,
  onFilled,
  backward = false,
  immediate = false,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
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
  if (backward ? clamped !== shown : clamped > shown) setShown(clamped);
  const immediateRef = useRef(immediate);
  useEffect(() => {
    immediateRef.current = immediate;
  }, [immediate]);

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
      g.moveTo(0, 0);
      // Bord droit : une onde descend du haut vers le bas, son amplitude suit l'élan du liquide.
      const amp = reducedMotion.matches ? 0 : (wave.rest + wave.amplitude * state.energy) * dpr;
      const steps = 16;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const offset = amp * 0.5 * Math.sin(2 * Math.PI * (u - state.t * wave.speed));
        g.lineTo(Math.min(W, Math.max(0, x + offset)), u * H);
      }
      g.lineTo(0, H);
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
      } else if (immediateRef.current) {
        state.d = target;
        state.v = 0;
        state.energy += (0 - state.energy) * Math.min(1, dt * 1.5);
      } else {
        const a = omega * omega * (target - state.d) - 2 * omega * state.v;
        state.v += a * dt;
        state.d = Math.min(1, Math.max(0, state.d + state.v * dt));
        // Élan : monte vite quand le liquide avance, retombe lentement quand il s'arrête.
        const surge = Math.min(Math.abs(state.v) * 6, 1);
        state.energy += (surge - state.energy) * Math.min(1, dt * (surge > state.energy ? 6 : 1.5));
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
      role={ariaHidden ? undefined : "progressbar"}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-valuemin={ariaHidden ? undefined : 0}
      aria-valuemax={ariaHidden ? undefined : 100}
      aria-valuenow={ariaHidden ? undefined : Math.round(shown * 100)}
      className={`block h-(--progress-bar-height) w-full ${fill[color]} ${className}`}
    />
  );
}
