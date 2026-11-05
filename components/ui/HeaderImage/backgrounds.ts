/*
 * Fonds possibles de headerImage, écrits dans le md de la page (« image_fond ») par le nom du token
 * primitive/color/brand/… sans le préfixe (choix de l'utilisateur : toute la gamme brand, pour des couleurs
 * sans équivalent sémantique). Fond vide : background/neutral/white.
 * Fichier sans « use client » : lu aussi côté serveur (lib/methode) pour vérifier la valeur du md.
 */
export const headerImageBackgrounds = {
  "brand/50": "bg-brand-50",
  "brand/100": "bg-brand-100",
  "brand/200": "bg-brand-200",
  "brand/300": "bg-brand-300",
  "brand/400": "bg-brand-400",
  "brand/500": "bg-brand-500",
  "brand/600": "bg-brand-600",
  "brand/700": "bg-brand-700",
  "brand/800": "bg-brand-800",
  "brand/900": "bg-brand-900",
  "brand/950": "bg-brand-950",
} as const;

export type HeaderImageBackground = keyof typeof headerImageBackgrounds;

/**
 * Fonds foncés : mots-clés en text/neutral/white (choix de l'utilisateur : couleur adaptée au fond, noir par défaut).
 * Seuil au meilleur contraste : brand/700 donne 4,8:1 en blanc contre 4,3:1 en noir.
 */
export const headerImageDarkBackgrounds: ReadonlySet<HeaderImageBackground> = new Set([
  "brand/700",
  "brand/800",
  "brand/900",
  "brand/950",
]);

/** Fond quand le md n'en indique pas. */
export const headerImageDefaultBackground = "bg-background-neutral-white";
