/*
 * Page 404 : formes cachées en logos de 4 px. Chaque forme est tracée dans le navigateur à partir de son image
 * (public/not-found/formes, copiées par tools/motif-editor/formes-404-public.cjs), à sa taille sur l'écran (shape-sampler).
 */
export const hiddenLogoSize = 4;

/** Taille (px), paires x, y (px, coin haut gauche de chaque logo) en couleur principale (paint) ou du centre (centre). */
export type HiddenShapeData = { width: number; height: number; paint: number[]; centre: number[] };

export const hiddenShapeIds = [
  "stem",
  "appareil",
  "doubleTournesol",
  "ecran",
  "livre",
  "visage",
  "arbre",
  "entretien",
  "souffle",
  "loupe",
  "briques",
  "graine",
] as const;

export type HiddenShapeId = (typeof hiddenShapeIds)[number];

/** Nom de fichier et de token de chaque forme. */
export const hiddenShapeSlug: Record<HiddenShapeId, string> = {
  stem: "stem",
  appareil: "appareil",
  doubleTournesol: "double-tournesol",
  ecran: "ecran",
  livre: "livre",
  visage: "visage",
  arbre: "arbre",
  entretien: "entretien",
  souffle: "souffle",
  loupe: "loupe",
  briques: "briques",
  graine: "graine",
};
