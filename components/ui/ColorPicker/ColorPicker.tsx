"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { TextField } from "../TextField";

/*
 * Modificateur de couleur — Figma « textualButton » 5929:33931 (éditeur de dessin, partie Couleur), recréé en code
 * (demande de l'utilisateur) et passé en version sombre (fond background/buttons/neutral/black, ombre dropshadow/mid).
 *  - cadre de couleur carré, à la largeur du modificateur (--color-picker-width, ou celle du conteneur avec fill) : saturation de gauche à droite, luminosité de haut en bas ;
 *    curseur rond --color-picker-cursor-size, blanc, contour noir (Figma Ellipse 1), qui peut déborder du cadre ;
 *  - barre de nuance (--color-picker-hue-height), collée sous le cadre ; curseur --color-picker-hue-cursor-size, blanc,
 *    ombre dropshadow/mid (choix de l'utilisateur) ;
 *  - champ « Hex code » (TextField, icône Hash, sans croix) à spacing/lg, marges spacing/xs et bas spacing/sm : suit le
 *    réglage en direct ; un code de 6 caractères valide applique la couleur.
 * Dégradés calculés en code (teintes du cercle chromatique), pas d'images.
 */

type Hsv = { h: number; s: number; v: number };

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: ((h * 60 + 360) % 360) / 360, s: max ? d / max : 0, v: max };
}

export function hsvToHex({ h, s, v }: Hsv) {
  const f = (k: number) => {
    const x = (k + h * 6) % 6;
    return v - v * s * Math.max(0, Math.min(x, 4 - x, 1));
  };
  return `#${[f(5), f(3), f(1)]
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Dégradé des nuances (cercle chromatique complet, de gauche à droite). */
const hueGradient = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => `hsl(${h} 100% 50%)`).join(", ")})`;

/** Champ du code Hex (TextField, icône Hash, sans croix) : suit la couleur en direct ; un code de 6 caractères valide
 *  l'applique. Champ quitté ou Entrée (choix de l'utilisateur, comme Figma) : un code de 3 caractères est lu en format
 *  court (« F0A » = « FF00AA ») ; un code incomplet revient à celui de la couleur actuelle. */
export function HexField({
  label,
  value,
  onChange,
  theme = "dark",
  className = "",
}: {
  label: string;
  /** Couleur « #rrggbb ». */
  value: string;
  onChange: (hex: string) => void;
  /** Thème du TextField (light : fenêtre « Mon dessin »). */
  theme?: "dark" | "light";
  className?: string;
}) {
  // Saisie en cours (incomplète) ; remise à la couleur dès qu'elle change.
  const [text, setText] = useState<string | null>(null);
  const [last, setLast] = useState(value);
  if (value !== last) {
    setLast(value);
    setText(null);
  }
  return (
    <TextField
      label={label}
      theme={theme}
      icon="Hash"
      iconAfter={false}
      value={text ?? value.slice(1).toUpperCase()}
      sanitize={(t) =>
        t
          .replace(/[^0-9a-f]/gi, "")
          .slice(0, 6)
          .toUpperCase()
      }
      onValueChange={(t) => {
        setText(t);
        if (t.length === 6) onChange(`#${t.toLowerCase()}`);
      }}
      onCommit={(t) => {
        if (t.length === 3) onChange(`#${[...t.toLowerCase()].map((c) => c + c).join("")}`);
        setText(null);
      }}
      className={className}
    />
  );
}

export type ColorPickerProps = {
  /** Couleur courante, en « #rrggbb ». */
  value: string;
  /** Nouvelle couleur ; final : fin du réglage (curseur relâché, code Hex saisi). */
  onChange: (hex: string, final: boolean) => void;
  /** Textes : champ Hex, cadre (saturation et luminosité), barre de nuance. */
  labels: { hex: string; area: string; hue: string };
  /** Champ « Hex code » sous la barre de nuance (false : champ placé ailleurs par le parent, avec HexField). */
  hexField?: boolean;
  /** Largeur du conteneur au lieu de --color-picker-width (pop-up d'export : à sa largeur, demande de l'utilisateur). */
  fill?: boolean;
  className?: string;
};

export function ColorPicker({
  value,
  onChange,
  labels,
  hexField = true,
  fill = false,
  className = "",
}: ColorPickerProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [last, setLast] = useState(value);
  // Couleur changée par le parent (autre pastille) : nuance recalculée ; la nuance reste celle du réglage sinon
  // (une couleur grise ou noire n'en a pas).
  if (value !== last) {
    setLast(value);
    if (value !== hsvToHex(hsv)) setHsv(hexToHsv(value));
  }

  const apply = (next: Hsv, final: boolean) => {
    setHsv(next);
    const out = hsvToHex(next);
    setLast(out);
    onChange(out, final);
  };

  /** Glisser dans un élément : position relative (0 à 1) à chaque mouvement, fin au relâchement. */
  const drag = (pick: (x: number, y: number) => Hsv) => {
    const at = (event: PointerEvent<HTMLDivElement>) => {
      const box = event.currentTarget.getBoundingClientRect();
      return pick(clamp((event.clientX - box.left) / box.width), clamp((event.clientY - box.top) / box.height));
    };
    return {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        apply(at(event), false);
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) apply(at(event), false);
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => apply(at(event), true),
    };
  };
  /** Flèches du clavier : pas de 1 % (Maj : 10 %). */
  const keys = (move: (dx: number, dy: number) => Hsv) => (event: KeyboardEvent) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!d) return;
    event.preventDefault();
    apply(move(d[0], d[1]), true);
  };

  const pure = `hsl(${hsv.h * 360} 100% 50%)`;

  return (
    <div
      className={`flex ${fill ? "w-full" : "w-(--color-picker-width)"} flex-col gap-lg bg-background-buttons-neutral-black shadow-(--dropshadow-mid) ${className}`}
    >
      <div className="flex flex-col">
        {/* Cadre de couleur : blanc → nuance pure (gauche à droite), puis transparent → noir (haut en bas). */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={labels.area}
          aria-valuenow={Math.round(hsv.s * 100)}
          aria-valuetext={`${Math.round(hsv.s * 100)} %, ${Math.round(hsv.v * 100)} %`}
          className="relative aspect-square w-full cursor-crosshair touch-none outline-none"
          style={{
            background: `linear-gradient(to top, var(--shape-neutral-black), transparent), linear-gradient(to right, var(--shape-neutral-white), ${pure})`,
          }}
          {...drag((x, y) => ({ h: hsv.h, s: x, v: 1 - y }))}
          onKeyDown={keys((dx, dy) => ({ h: hsv.h, s: clamp(hsv.s + dx), v: clamp(hsv.v - dy) }))}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute size-(--color-picker-cursor-size) -translate-1/2 rounded-full border-(length:--divider-width) border-border-neutral-black bg-shape-neutral-white"
            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
          />
        </div>
        {/* Barre de nuance */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={labels.hue}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(hsv.h * 360)}
          className="relative h-(--color-picker-hue-height) w-full cursor-pointer touch-none outline-none"
          style={{ background: hueGradient }}
          {...drag((x) => ({ ...hsv, h: Math.min(x, 0.9999) }))}
          onKeyDown={keys((dx) => ({ ...hsv, h: clamp(hsv.h + dx) }))}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 size-(--color-picker-hue-cursor-size) -translate-1/2 rounded-full bg-shape-neutral-white shadow-(--dropshadow-mid)"
            style={{ left: `${hsv.h * 100}%` }}
          />
        </div>
      </div>
      {hexField && (
        <div className="flex px-xs pb-sm">
          <HexField label={labels.hex} value={hsvToHex(hsv)} onChange={(h) => apply(hexToHsv(h), true)} />
        </div>
      )}
    </div>
  );
}
