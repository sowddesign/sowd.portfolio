"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

/*
 * Curseur de réglage horizontal : taille de la gomme de l'éditeur de dessin (page 404).
 * Le design de test Figma (5912:32535) le dessine comme un « progressBar » détaché. Comportement repris de la barre de
 * volume (TimeManager), à la demande de l'utilisateur : cliquer ou glisser n'importe où sur la barre règle la valeur,
 * les flèches du clavier la font varier par pas de 10 %, Début et Fin vont aux extrêmes.
 * Couleurs Figma : partie remplie et poignée shape/brand/darkest, partie restante faded/white/40 %.
 * Tailles : épaisseur et poignée de la barre de volume (--slider-thickness, --slider-handle-size).
 * La barre prend la largeur de son parent ; la zone de prise (--slider-hit-zone) déborde autour.
 */

export type SliderProps = {
  /** Valeur, de 0 à 1. */
  value: number;
  onChange: (value: number) => void;
  "aria-label": string;
  /** Texte lu par les lecteurs d'écran (ex. « 32 px »). */
  "aria-valuetext"?: string;
  className?: string;
};

const keyboardStep = 0.1;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function Slider({ value, onChange, className = "", ...aria }: SliderProps) {
  const trackRef = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const v = clamp(value);

  const setFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) onChange(clamp((clientX - rect.left) / rect.width));
  };
  const onPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.clientX);
  };
  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragging.current) setFromPointer(event.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const steps: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 };
    if (event.key in steps) onChange(clamp(v + steps[event.key] * keyboardStep));
    else if (event.key === "Home") onChange(0);
    else if (event.key === "End") onChange(1);
    else return;
    event.preventDefault();
  };

  return (
    <span
      role="slider"
      tabIndex={0}
      aria-label={aria["aria-label"]}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-valuetext={aria["aria-valuetext"]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={`flex cursor-pointer touch-none p-(--slider-hit-zone) outline-none ${className}`}
    >
      <span ref={trackRef} className="relative h-(--slider-thickness) w-full">
        <span className="absolute inset-0 overflow-clip rounded-xs bg-faded-white-40">
          <span className="absolute inset-y-0 left-0 bg-shape-brand-darkest" style={{ width: `${v * 100}%` }} />
        </span>
        <span
          aria-hidden
          className="absolute top-1/2 size-(--slider-handle-size) -translate-1/2 rounded-rounded bg-shape-brand-darkest"
          style={{ left: `${v * 100}%` }}
        />
      </span>
    </span>
  );
}
