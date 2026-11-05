/*
 * Placement de l'image et textes posés dessus (headerImage, repris des frames Figma desktop 800 × 218 et mobile
 * 376 × 218, demande de l'utilisateur). Écrits dans le md de la page, lus aussi côté serveur (sans « use client »).
 *
 * Placement, en % de la hauteur du cadre (la hauteur est fixe, l'image garde donc sa taille à toutes les largeurs) :
 *   size : hauteur de l'image (largeur selon ses proportions) ;
 *   x    : écart entre le centre de l'image et le centre du cadre (négatif : à gauche) ;
 *   y    : haut de l'image par rapport au haut du cadre (négatif : rogné en haut) ;
 *   rotation : inclinaison de l'image autour de son centre, en degrés (sens horaire), facultative.
 * Textes : centre du texte en % de l'image (x : largeur, y : hauteur), inclinaison en degrés par rapport à
 * l'image (sens horaire ; les textes tournent avec elle), un placement desktop et un mobile ; style captionSwiss/accentuation ou,
 * en captionSwiss/accentuation 16 px partout ; couleur text/neutral/black, ou text/neutral/white (« blanc »).
 */
export type HeaderImagePlacement = { size: number; x: number; y: number; rotation?: number };

export type HeaderImageTextPlacement = { x: number; y: number; rotation?: number };

export type HeaderImageText = {
  text: string;
  white?: boolean;
  desktop: HeaderImageTextPlacement;
  mobile: HeaderImageTextPlacement;
};
