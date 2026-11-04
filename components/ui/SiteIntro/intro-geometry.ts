import { logotypePaths } from "../LogoButton";

/*
 * Géométrie de l'intro du site (démo validée par l'utilisateur) : tige, feuilles et repères des lettres.
 *
 * Tige : courbe en deux segments de Bézier dans un repère « plante » (pied en 96, 430 ; pointe en 100, 96),
 * forme pleine effilée vers le haut. Feuilles : deux « o » croisés et découpés l'un par l'autre (o du logotype × o light,
 * écartement 1,9:1, choix de l'utilisateur), sur un pétiole effilé. Le o light vient du SVG fourni par l'utilisateur.
 */

/** Pied et pointe de la tige, repère plante. */
export const stemBase = [96, 430] as const;
const segments = [
  [
    [96, 430],
    [90, 340],
    [110, 270],
    [103, 190],
  ],
  [
    [103, 190],
    [97, 135],
    [101, 108],
    [100, 96],
  ],
] as const;

function bezier(s: (typeof segments)[number], t: number) {
  const u = 1 - t;
  return [0, 1].map(
    (k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k],
  ) as [number, number];
}

/** Point de la tige, de 0 (pied) à 1 (pointe). */
export function stemPoint(t: number) {
  return t < 0.5 ? bezier(segments[0], t * 2) : bezier(segments[1], (t - 0.5) * 2);
}

const samples = 90;
const points = Array.from({ length: samples + 1 }, (_, i) => stemPoint(i / samples));
/** Normale unitaire de la tige à l'échantillon i. */
function normal(i: number) {
  const a = points[Math.max(0, i - 1)];
  const b = points[Math.min(samples, i + 1)];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  return [-dy / l, dx / l] as const;
}
const halfWidth = (t: number) => 3.4 * Math.pow(1 - t, 0.55);
const xy = (p: readonly number[]) => p.map((v) => v.toFixed(2)).join(" ");

/** Forme pleine de la tige. */
export const stemPath = (() => {
  const left: number[][] = [];
  const right: number[][] = [];
  points.forEach((p, i) => {
    const n = normal(i);
    const w = halfWidth(i / samples);
    left.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    right.push([p[0] + n[0] * w, p[1] + n[1] * w]);
  });
  return `M${left.map(xy).join("L")}L${right.reverse().map(xy).join("L")}Z`;
})();

/** Ligne centrale de la tige, tracée par le masque pendant la pousse. */
export const stemLine = `M${points.map(xy).join("L")}`;

/** Feuilles alternées : position sur la tige, côté, taille et angle de chute. */
export const leaves = [
  { t: 0.2, side: 1, scale: 0.78, droop: 28 },
  { t: 0.38, side: -1, scale: 0.68, droop: 32 },
  { t: 0.56, side: 1, scale: 0.55, droop: 24 },
  { t: 0.72, side: -1, scale: 0.42, droop: 20 },
] as const;

/** Point d'attache et normale d'une feuille. */
export function leafAnchor(t: number) {
  const i = Math.round(t * samples);
  return { point: points[i], normal: normal(i) };
}

/* o du logotype (contour extérieur et intérieur) et o light. */
const boldO = logotypePaths[3];
const boldOuter = boldO.slice(0, boldO.indexOf("Z") + 1);
const lightOuter =
  "M473.559 307.6C453.293 307.6 435.026 302.8 418.759 293.2C402.493 283.6 389.559 270.4 379.959 253.6C370.626 236.533 365.959 217.467 365.959 196.4C365.959 175.333 370.626 156.4 379.959 139.6C389.559 122.8 402.359 109.6 418.359 100C434.626 90.4 453.026 85.6 473.559 85.6C493.826 85.6 512.093 90.4 528.359 100C544.626 109.6 557.426 122.8 566.759 139.6C576.093 156.133 580.759 175.067 580.759 196.4C580.759 217.733 575.959 236.8 566.359 253.6C556.759 270.4 543.826 283.6 527.559 293.2C511.559 302.8 493.559 307.6 473.559 307.6Z";
const lightInner =
  "M473.559 284C488.759 284 502.493 280.267 514.759 272.8C527.293 265.067 537.159 254.533 544.359 241.2C551.559 227.867 555.159 212.933 555.159 196.4C555.159 179.867 551.559 165.067 544.359 152C537.159 138.933 527.426 128.533 515.159 120.8C502.893 113.067 489.026 109.2 473.559 109.2C458.093 109.2 444.093 113.067 431.559 120.8C419.293 128.267 409.559 138.667 402.359 152C395.159 165.067 391.559 179.867 391.559 196.4C391.559 212.933 395.159 227.867 402.359 241.2C409.826 254.533 419.693 265.067 431.959 272.8C444.226 280.267 458.093 284 473.559 284Z";
type Glyph = { outer: string; full: string; cx: number; cy: number; r: number };
const glyphA: Glyph = { outer: boldOuter, full: boldO, cx: 164.38, cy: 106.01, r: 62.5 };
const glyphB: Glyph = { outer: lightOuter, full: lightOuter + lightInner, cx: 473.36, cy: 196.6, r: 109.2 };
/** Ramène un o à un cercle de rayon 100 centré sur l'origine. */
const unit = (g: Glyph) => `scale(${(100 / g.r).toFixed(5)}) translate(${-g.cx} ${-g.cy})`;
/** Écartement des deux o (rayon 100) : rapport longueur / largeur 1,9:1. */
const spread = 115;

/**
 * Définitions SVG d'une feuille (id), pétiole compris, pointe vers +x : pétiole de 0 à 30, limbe de 30 à 124.
 * Chaque o est découpé par le contour de l'autre.
 */
export function leafDefs(id: string) {
  const h = Math.sqrt(100 * 100 - (spread / 2) ** 2);
  const s = 94 / (2 * h);
  return `<clipPath id="${id}-b" clipPathUnits="userSpaceOnUse"><path d="${glyphB.outer}" transform="translate(${spread} 0) ${unit(glyphB)}"/></clipPath><clipPath id="${id}-a" clipPathUnits="userSpaceOnUse"><path d="${glyphA.outer}" transform="translate(${-spread} 0) ${unit(glyphA)}"/></clipPath><g id="${id}"><path d="M0 -1.8 C10 -1.4 20 -0.9 30 -0.5 L30 0.5 C20 0.9 10 1.4 0 1.8 Z"/><g transform="translate(30 0) rotate(-90) scale(${s.toFixed(5)}) translate(${-spread / 2} ${h.toFixed(2)})" fill-rule="evenodd"><g clip-path="url(#${id}-b)"><path d="${glyphA.full}" transform="${unit(glyphA)}"/></g><g transform="translate(${spread} 0)"><g clip-path="url(#${id}-a)"><path d="${glyphB.full}" transform="${unit(glyphB)}"/></g></g></g></g>`;
}

/** Lettres du logotype (repère 533 × 169) : tracés, centre horizontal de chaque lettre. */
export const letters = [
  { paths: logotypePaths.slice(0, 3), cx: 48 },
  { paths: [logotypePaths[3]], cx: 164 },
  { paths: [logotypePaths[4]], cx: 317 },
  { paths: [logotypePaths[5]], cx: 470 },
] as const;
/** Centre vertical des lettres, hauteur et largeur du repère du logotype. */
export const letterMiddle = 106;
export const logotypeHeight = 169;
export const logotypeWidth = 533;
