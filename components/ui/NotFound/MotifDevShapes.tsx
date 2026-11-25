"use client";

import forme1 from "@/tools/motif-editor/ref-forme-1.webp";
import forme2 from "@/tools/motif-editor/ref-forme-2.webp";
import forme3 from "@/tools/motif-editor/ref-forme-3.webp";
import forme4 from "@/tools/motif-editor/ref-forme-4.webp";
import forme5 from "@/tools/motif-editor/ref-forme-5.webp";
import { TextualButton } from "../TextualButton";
import type { MotifEditor } from "./motif-editor-engine";

/*
 * Formes 1 à 5 de l'ancien éditeur (demi-tournesols, double tournesol), en local seulement (demande de l'utilisateur) :
 * chargé par MotifEditor en développement, absent du site publié. Un bouton par forme : la forme est posée sur la zone
 * visible, à la taille choisie, en une action (annulable). Règles de l'ancien éditeur : image ajustée à la zone (marge
 * de 16 px), jaune = plein (couleur choisie), jaune foncé = centre (shape/brand/darkest), noir = contour colorié.
 */

const shapes = [forme1, forme2, forme3, forme4, forme5];
/** Marge autour de l'image ajustée à la zone (ancien éditeur). */
const MARGIN = 16;

type Pixels = { data: Uint8ClampedArray; width: number; height: number };
const cache = new Map<string, Promise<Pixels>>();

function pixelsOf(src: string) {
  let promise = cache.get(src);
  if (!promise) {
    promise = new Promise<Pixels>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve({
          data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.onerror = reject;
      img.src = src;
    });
    cache.set(src, promise);
  }
  return promise;
}

export function MotifDevShapes({
  engine,
  area,
  colors,
}: {
  engine: { current: MotifEditor | null };
  /** Zone de dessin (taille en px). */
  area: { current: HTMLElement | null };
  /** Couleurs du moment : plein (couleur choisie) et centre. */
  colors: () => { paint: string; centre: string };
}) {
  const place = async (src: string) => {
    const box = area.current?.getBoundingClientRect();
    if (!box || !engine.current) return;
    const { data, width, height } = await pixelsOf(src);
    const k = Math.min((box.width - 2 * MARGIN) / width, (box.height - 2 * MARGIN) / height);
    const ox = (box.width - width * k) / 2;
    const oy = (box.height - height * k) / 2;
    const px = (x: number, y: number) => {
      const X = Math.round((x - ox) / k);
      const Y = Math.round((y - oy) / k);
      if (X < 0 || Y < 0 || X >= width || Y >= height) return "w";
      const i = (Y * width + X) * 4;
      if (data[i] > 170 && data[i + 2] < 120) return data[i + 1] > 165 ? "y" : "c";
      return data[i] < 110 && data[i + 1] < 110 && data[i + 2] < 110 ? "b" : "w";
    };
    /** Part du disque de rayon r autour du point couverte par chaque couleur. */
    const cover = (x: number, y: number, r: number) => {
      const n = { y: 0, c: 0, b: 0, w: 0 };
      let t = 0;
      for (let a = -r; a <= r + 1e-6; a += r / 3)
        for (let b = -r; b <= r + 1e-6; b += r / 3) {
          if (a * a + b * b > r * r + 1e-6) continue;
          t++;
          n[px(x + a, y + b)]++;
        }
      return { y: n.y / t, c: n.c / t, b: n.b / t };
    };
    engine.current.stampShape((x, y, r) => {
      const c = cover(x, y, r);
      if (c.c >= 0.5) return "centre";
      return c.y + c.c >= 0.5 || c.b >= 0.12 ? "paint" : null;
    }, colors());
  };

  return (
    <div className="pointer-events-auto absolute top-lg right-lg flex items-center gap-sm">
      {shapes.map((s, i) => (
        <TextualButton
          key={s.src}
          color="white"
          align="center"
          onClick={() => void place(s.src)}
          className="w-(--button-size-sm)! shadow-(--dropshadow-mid)"
        >
          {String(i + 1)}
        </TextualButton>
      ))}
    </div>
  );
}
