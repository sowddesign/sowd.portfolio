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

/** Taille de la page 404 proportionnelle à l'écran (choix de l'utilisateur) : 1 à l'écran de référence, plus petit
 *  ou plus grand au-delà, selon la largeur ou la hauteur la plus contraignante. */
export function notFoundScale() {
  return Math.min(
    window.innerWidth / tokenPx("--not-found-shapes-reference-width"),
    window.innerHeight / tokenPx("--not-found-shapes-reference-height"),
  );
}
