import { tabletQuery } from "../use-media-query";

/** Token de longueur en pixels (certains sont en rem) : mesuré sur un élément témoin. Marge plutôt que largeur :
 *  la valeur peut être négative. */
export function tokenPx(token: string) {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;margin-left:var(${token})`;
  document.documentElement.append(probe);
  const px = parseFloat(getComputedStyle(probe).marginLeft);
  probe.remove();
  return px;
}

/** Token sans unité (facteur). */
const tokenNumber = (token: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token));

export type NotFoundLayoutName = "desktop" | "tablette" | "mobile";

export type NotFoundLayout = {
  name: NotFoundLayoutName;
  /** Préfixe des tokens de position des formes : --not-found-shape- (desktop) ou --not-found-<placement>-shape-. */
  shapePrefix: string;
  /** Taille des formes et écarts : proportionnelle à l'écran de référence du placement (côté le plus contraignant). */
  scale: number;
  /** Positions des formes : proportionnelles à la largeur et à la hauteur de l'écran séparément, pour
   *  occuper tout l'écran quel que soit son rapport (demandes de l'utilisateur, portrait puis desktop large). */
  scaleX: number;
  scaleY: number;
  /** 404 et logo : même proportion, multipliée par la taille du 404 dans ce placement. */
  logoScale: number;
  /** Décalage vertical du 404 depuis le centre de l'écran (px, proportionné à la hauteur comme les formes). */
  rowOffset: number;
};

/**
 * Placement de la page 404 selon l'écran (choix de l'utilisateur) : écran plus haut que large → placement portrait,
 * mobile jusqu'à 740 px de large (tabletQuery), tablette au-delà ; sinon placement desktop. Taille proportionnelle à
 * l'écran de référence du placement, selon la largeur ou la hauteur la plus contraignante.
 */
export function notFoundLayout(): NotFoundLayout {
  const tall = window.innerHeight > window.innerWidth;
  const name: NotFoundLayoutName = !tall ? "desktop" : window.matchMedia(tabletQuery).matches ? "tablette" : "mobile";
  const prefix = name === "desktop" ? "--not-found-shapes" : `--not-found-${name}`;
  const sx = window.innerWidth / tokenPx(`${prefix}-reference-width`);
  const sy = window.innerHeight / tokenPx(`${prefix}-reference-height`);
  const scale = Math.min(sx, sy);
  const portrait = name !== "desktop";
  return {
    name,
    scaleX: sx,
    scaleY: sy,
    shapePrefix: name === "desktop" ? "--not-found-shape-" : `--not-found-${name}-shape-`,
    scale,
    logoScale: name === "desktop" ? scale : scale * tokenNumber(`--not-found-${name}-logo-scale`),
    rowOffset: portrait ? tokenPx(`--not-found-${name}-row-offset`) * sy : 0,
  };
}
