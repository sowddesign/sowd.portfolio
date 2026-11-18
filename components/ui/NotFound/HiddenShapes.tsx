"use client";

import { useEffect, useState, type RefObject } from "react";
import { HiddenShape, hiddenShapePad } from "./HiddenShape";
import { hiddenShapes, type HiddenShapeId } from "./hidden-shapes";
import { tokenPx } from "./token-px";

/*
 * Page 404 : formes cachées dispersées sur le fond (demande de l'utilisateur), rappels du portfolio :
 * double tournesol (double diamant de la méthode), entretien (personnages en pixels et bulle), graine, livre (Scholar),
 * écran (C-Media, showreel), souffle (icône du projet Souffle), loupe, arbre, visage, briques, appareil photo. Elles se découvrent au survol, sans lancer la séquence.
 * Proposition B (« diagonale ») retenue par l'utilisateur, puis ajustée : position du coin haut gauche de chaque forme, depuis le centre de l'écran, à
 * --not-found-shapes-reference-width (tokens --not-found-shape-<forme>-x / -y). Les briques sont à côté du bloc de texte
 * (demande de l'utilisateur : une forme très proche du texte, sans le chevaucher), à --not-found-shape-near-text-gap
 * de son élément le plus large, alignées sur son bas (le bloc est en bas de l'écran : elles y restent entières).
 * Formes entières à l'écran (demande de l'utilisateur) : placées dans l'écran de référence
 * (--not-found-shapes-reference-width × -height) ; formes et écarts proportionnels à l'écran, comme le 404
 * (choix de l'utilisateur).
 */

const scattered: { id: HiddenShapeId; token: string }[] = [
  { id: "doubleTournesol", token: "double-tournesol" },
  { id: "entretien", token: "entretien" },
  { id: "livre", token: "livre" },
  { id: "ecran", token: "ecran" },
  { id: "souffle", token: "souffle" },
  { id: "loupe", token: "loupe" },
  { id: "arbre", token: "arbre" },
  { id: "visage", token: "visage" },
  { id: "graine", token: "graine" },
  { id: "appareil", token: "appareil" },
];
/** Forme collée au bloc de texte : les briques (demande de l'utilisateur). */
const nearText: HiddenShapeId = "briques";

type Layout = {
  center: [number, number];
  offsets: Record<string, [number, number]>;
  near: [number, number] | null;
};

export function HiddenShapes({ textRef, scale }: { textRef: RefObject<HTMLElement | null>; scale: number }) {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const read = tokenPx;
    const measure = () => {
      const offsets = Object.fromEntries(
        scattered.map(({ token }) => [
          token,
          [read(`--not-found-shape-${token}-x`), read(`--not-found-shape-${token}-y`)] as [number, number],
        ]),
      );
      let near: [number, number] | null = null;
      const text = textRef.current;
      if (text) {
        const box = text.getBoundingClientRect();
        const right = Math.max(...[...text.children].map((child) => child.getBoundingClientRect().right));
        const shape = hiddenShapes[nearText];
        near = [
          right + read("--not-found-shape-near-text-gap") * scale - hiddenShapePad * scale,
          box.bottom + window.scrollY - (shape.height + hiddenShapePad) * scale,
        ];
      }
      setLayout({ center: [window.innerWidth / 2, window.innerHeight / 2], offsets, near });
    };
    measure();
    // Largeur des textes : connue une fois les polices chargées.
    let alive = true;
    void document.fonts.ready.then(() => alive && measure());
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    if (textRef.current) [...textRef.current.children].forEach((child) => observer.observe(child));
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [textRef, scale]);

  if (!layout) return null;
  const { center, offsets, near } = layout;
  return (
    <>
      {scattered.map(({ id, token }) => offsets[token] && (
        <HiddenShape
          key={id}
          shape={hiddenShapes[id]}
          scale={scale}
          style={{ left: center[0] + offsets[token][0] * scale, top: center[1] + offsets[token][1] * scale }}
        />
      ))}
      {near && <HiddenShape shape={hiddenShapes[nearText]} scale={scale} style={{ left: near[0], top: near[1] }} />}
    </>
  );
}
