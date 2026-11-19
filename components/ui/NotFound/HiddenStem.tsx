"use client";

import { HiddenShape, hiddenShapePad } from "./HiddenShape";
import { hiddenLogoSize, type HiddenShapeData } from "./hidden-shapes";

/*
 * Page 404 : tige cachée sous le logo (demande de l'utilisateur), forme 6 de l'éditeur de motifs en logos de 4 px,
 * à la taille du placement (desktop, tablette ou mobile). Se dessine au survol (HiddenShape) ; une fois tous ses logos
 * visibles à l'écran découverts : onComplete (séquence de la fleur). Placée par le haut de la tige (centre du logo le
 * plus haut), à left / top du parent ; scale : 1 (logos de 4 px) ou 2 (8 px).
 */

/** Centre du logo le plus haut de la tige, depuis le bord gauche de ses logos. */
function topOf(stem: HiddenShapeData) {
  const cells = [...stem.paint, ...stem.centre];
  let best = 0;
  for (let i = 1; i < cells.length / 2; i++) if (cells[2 * i + 1] < cells[2 * best + 1]) best = i;
  return cells[2 * best] + hiddenLogoSize / 2;
}

export function HiddenStem({
  shape,
  onComplete,
  scale,
  className = "",
}: {
  shape: HiddenShapeData;
  onComplete: () => void;
  scale: number;
  className?: string;
}) {
  return (
    <HiddenShape
      shape={shape}
      scale={scale}
      onComplete={onComplete}
      className={className}
      style={{ marginLeft: -(topOf(shape) + hiddenShapePad) * scale, marginTop: -hiddenShapePad * scale }}
    />
  );
}
