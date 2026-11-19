"use client";

import { useEffect, useState, type RefObject } from "react";
import { HiddenShape, hiddenShapePad } from "./HiddenShape";
import { hiddenShapeIds, hiddenShapeSlug, type HiddenShapeData, type HiddenShapeId } from "./hidden-shapes";
import { sampleShape } from "./shape-sampler";
import { tokenPx, type NotFoundLayout } from "./token-px";

/*
 * Page 404 : formes cachées dispersées sur le fond (demande de l'utilisateur), rappels du portfolio :
 * double tournesol (double diamant de la méthode), entretien (personnages en pixels et bulle), graine, livre (Scholar),
 * écran (C-Media, showreel), souffle (icône du projet Souffle), loupe, arbre, visage, briques, appareil photo.
 * Elles se découvrent au survol, sans lancer la séquence.
 * Position du coin haut gauche de chaque forme depuis le centre de l'écran, à l'écran de référence du placement
 * (tokens --not-found-shape-<forme>-x / -y en desktop, --not-found-<mobile|tablette>-shape-<forme>-x / -y en portrait),
 * positions et tailles proportionnelles à l'écran (NotFoundLayout.scale), logos toujours de 4 px (useLayoutShapes).
 * Desktop : proposition B (« diagonale ») retenue puis ajustée ; les briques sont à côté du bloc de texte
 * (--not-found-shape-near-text-gap de son élément le plus large, alignées sur son bas). Portrait : placements simulés
 * puis validés par l'utilisateur.
 */

const tokens = hiddenShapeSlug;
const ids = hiddenShapeIds.filter((id) => id !== "stem");
/** Desktop : forme collée au bloc de texte, les briques (demande de l'utilisateur). */
const nearText: HiddenShapeId = "briques";

/** Portrait : forme derrière le « 4 » de gauche (demande de l'utilisateur). */
const behindDigit: HiddenShapeId = "loupe";

type Placed = { id: HiddenShapeId; shape: HiddenShapeData; left: number; top: number };

export type LayoutShapes = Partial<Record<HiddenShapeId, HiddenShapeData>>;

/**
 * Tige et formes tracées à leur taille sur l'écran (shape-sampler), en logos de 4 px : taille du token
 * (--not-found[-<placement>]-size-<forme>) × proportion de l'écran ; tige : --not-found-stem-height × taille du logo.
 * null pendant le tracé.
 */
export function useLayoutShapes(layout: NotFoundLayout | null): LayoutShapes | null {
  const [data, setData] = useState<{ key: string; shapes: LayoutShapes } | null>(null);
  const key = layout ? `${layout.name}-${layout.scale.toFixed(3)}-${layout.logoScale.toFixed(3)}` : "";
  useEffect(() => {
    if (!layout) return;
    let alive = true;
    const prefix = layout.name === "desktop" ? "--not-found-size-" : `--not-found-${layout.name}-size-`;
    void Promise.all(
      hiddenShapeIds.map(async (id) => {
        const size =
          id === "stem"
            ? { height: tokenPx("--not-found-stem-height") * layout.logoScale }
            : { side: tokenPx(`${prefix}${tokens[id]}`) * layout.scale };
        return [id, await sampleShape(id, size)] as const;
      }),
    ).then((entries) => alive && setData({ key, shapes: Object.fromEntries(entries) }));
    return () => {
      alive = false;
    };
    // key résume le placement et ses proportions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return data && data.key === key ? data.shapes : null;
}

/**
 * Portrait : les formes s'étirent en hauteur jusqu'au bas de l'écran, derrière le bloc de texte qui disparaît ensuite
 * (demande de l'utilisateur), à spacing/md du haut et du bas. Une forme qui touche le bouton vers l'accueil (seul
 * élément qui reste) passe au-dessus, à --not-found-shape-near-text-gap.
 */
function fillPortrait(list: Placed[], button: DOMRect | undefined, scale: number) {
  if (!list.length) return;
  const margin = tokenPx("--spacing-md");
  const bottomOf = (p: Placed) => p.top + p.shape.height + 2 * hiddenShapePad;
  const minTop = Math.min(...list.map((p) => p.top));
  const maxBottom = Math.max(...list.map(bottomOf));
  const spanFrom = maxBottom - minTop;
  const spanTo = window.innerHeight - 2 * margin;
  for (const p of list) {
    // Haut de la forme ramené entre la marge haute et (bas de l'écran − marge − sa hauteur), à la même proportion.
    const height = bottomOf(p) - p.top;
    p.top = margin + ((p.top - minTop) / (spanFrom - height || 1)) * (spanTo - height);
  }
  if (!button) return;
  const gap = tokenPx("--not-found-shape-near-text-gap") * scale;
  for (const p of list) {
    const width = p.shape.width + 2 * hiddenShapePad;
    const right = p.left + width;
    const touches =
      p.left < button.right + gap && right > button.left - gap && p.top < button.bottom + gap && bottomOf(p) > button.top - gap;
    // Au-dessus du bouton : la forme garde sa place à gauche (demande de l'utilisateur, Flash Invader de l'entretien).
    if (touches) p.top = button.top - gap - (bottomOf(p) - p.top);
  }
}

export function HiddenShapes({
  textRef,
  digitRef,
  layout,
  shapes,
}: {
  textRef: RefObject<HTMLElement | null>;
  /** « 4 » de gauche. */
  digitRef: RefObject<HTMLElement | null>;
  layout: NotFoundLayout;
  shapes: LayoutShapes;
}) {
  const [placed, setPlaced] = useState<Placed[] | null>(null);
  const { name, scale, scaleX, scaleY, shapePrefix } = layout;

  useEffect(() => {
    const measure = () => {
      const center = [window.innerWidth / 2, window.innerHeight / 2];
      const list: Placed[] = [];
      for (const id of ids) {
        const shape = shapes[id];
        if (!shape) continue;
        if (name === "desktop" && id === nearText) {
          const text = textRef.current;
          if (!text) continue;
          const box = text.getBoundingClientRect();
          const right = Math.max(...[...text.children].map((child) => child.getBoundingClientRect().right));
          list.push({
            id,
            shape,
            left: right + tokenPx("--not-found-shape-near-text-gap") * scale - hiddenShapePad,
            top: box.bottom + window.scrollY - (shape.height + hiddenShapePad),
          });
          continue;
        }
        list.push({
          id,
          shape,
          left: center[0] + tokenPx(`${shapePrefix}${tokens[id]}-x`) * scaleX,
          top: center[1] + tokenPx(`${shapePrefix}${tokens[id]}-y`) * scaleY,
        });
      }
      if (name !== "desktop") {
        fillPortrait(list, textRef.current?.children[1]?.getBoundingClientRect(), scale);
        // Portrait : loupe centrée derrière le « 4 » de gauche (demande de l'utilisateur).
        const loupe = list.find((p) => p.id === behindDigit);
        const digit = digitRef.current?.getBoundingClientRect();
        if (loupe && digit) {
          loupe.left = digit.left + digit.width / 2 - loupe.shape.width / 2 - hiddenShapePad;
          loupe.top = digit.top + digit.height / 2 - loupe.shape.height / 2 - hiddenShapePad;
        }
      }
      setPlaced(list);
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
  }, [textRef, digitRef, name, scale, scaleX, scaleY, shapePrefix, shapes]);

  if (!placed) return null;
  return (
    <>
      {placed.map(({ id, shape, left, top }) => (
        <HiddenShape key={`${name}-${id}`} shape={shape} scale={1} style={{ left, top }} />
      ))}
    </>
  );
}
