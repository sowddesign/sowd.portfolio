"use client";

import { HiddenShape, hiddenShapePad } from "./HiddenShape";
import { hiddenLogoSize, hiddenShapes } from "./hidden-shapes";

/*
 * Page 404 : tige cachée sous le logo (demande de l'utilisateur), forme 6 de l'éditeur de motifs en logos de 4 px.
 * Se dessine au survol (HiddenShape) ; une fois tous ses logos visibles à l'écran découverts : onComplete (séquence
 * de la fleur). Placée par le haut de la tige (centre du logo le plus haut), à left / top du parent ; réduite avec
 * le reste de la page (scale).
 */

const stem = hiddenShapes.stem;
/** Centre du logo le plus haut de la tige, depuis le bord gauche de ses logos. */
const top = (() => {
  const cells = [...stem.paint, ...stem.centre];
  let best = 0;
  for (let i = 1; i < cells.length / 2; i++) if (cells[2 * i + 1] < cells[2 * best + 1]) best = i;
  return cells[2 * best] + hiddenLogoSize / 2;
})();

export function HiddenStem({
  onComplete,
  scale,
  className = "",
}: {
  onComplete: () => void;
  scale: number;
  className?: string;
}) {
  return (
    <HiddenShape
      shape={stem}
      scale={scale}
      onComplete={onComplete}
      className={className}
      style={{ marginLeft: -(top + hiddenShapePad) * scale, marginTop: -hiddenShapePad * scale }}
    />
  );
}
