import { hiddenLogoSize, hiddenShapeSlug, type HiddenShapeData, type HiddenShapeId } from "./hidden-shapes";

/*
 * Trace une forme de l'éditeur de motifs en logos de 4 px, à une taille donnée (règles de l'ancien éditeur, reprises dans MotifDevShapes) :
 * jaune = plein, jaune foncé = centre (couleur secondaire), noir = colorié (seuil d'un contour). Grille en quinconce du
 * motif. Formes 7 et plus (dessins de la page 404) : seuil des détails plus bas (0,3 au lieu de 0,5), pour garder les
 * traits fins.
 */

const LOGO_UNITS = 442;
const W0 = 384.54;
const R0 = 322.66;
const SH = 192.27;
/** Formes dont les détails gardent le seuil de l'éditeur (double tournesol, tige). */
const editorThreshold: HiddenShapeId[] = ["doubleTournesol", "stem"];

type Pixels = { data: Uint8ClampedArray; width: number; height: number };
const images = new Map<HiddenShapeId, Promise<Pixels>>();

function pixelsOf(id: HiddenShapeId) {
  let promise = images.get(id);
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
        resolve({ data: ctx.getImageData(0, 0, canvas.width, canvas.height).data, width: canvas.width, height: canvas.height });
      };
      img.onerror = reject;
      img.src = `/not-found/formes/${hiddenShapeSlug[id]}.webp`;
    });
    images.set(id, promise);
  }
  return promise;
}

/** Forme tracée : plus grand côté (side) ou hauteur (height), en px. */
export async function sampleShape(id: HiddenShapeId, size: { side?: number; height?: number }): Promise<HiddenShapeData> {
  const { data, width: iw, height: ih } = await pixelsOf(id);
  const k = size.height ? size.height / ih : size.side! / Math.max(iw, ih);
  const kind = (X: number, Y: number) => {
    X = Math.round(X);
    Y = Math.round(Y);
    if (X < 0 || Y < 0 || X >= iw || Y >= ih) return 0;
    const i = (Y * iw + X) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 170 && b < 120) return g > 165 ? 1 : 2; // 1 jaune, 2 jaune foncé
    return r < 110 && g < 110 && b < 110 ? 3 : 0; // 3 noir
  };
  const r = hiddenLogoSize * 0.45;
  const step = r / 3;
  const cover = (cx: number, cy: number) => {
    const n = [0, 0, 0, 0];
    let t = 0;
    for (let a = -r; a <= r + 1e-6; a += step)
      for (let b = -r; b <= r + 1e-6; b += step) {
        if (a * a + b * b > r * r + 1e-6) continue;
        t++;
        n[kind((cx + a) / k, (cy + b) / k)]++;
      }
    return n.map((v) => v / t);
  };
  const s = hiddenLogoSize / LOGO_UNITS;
  const sx = W0 * s, sy = R0 * s;
  const W = iw * k, H = ih * k;
  const centreMin = editorThreshold.includes(id) ? 0.5 : 0.3;
  const paint: number[] = [], centre: number[] = [];
  for (let row = -1; row < H / sy + 1; row++)
    for (let c = -1; c < W / sx + 1; c++) {
      const x = (c * W0 + (row & 1 ? SH : 0)) * s, y = row * R0 * s;
      const [, yellow, dark, black] = cover(x + hiddenLogoSize / 2, y + hiddenLogoSize / 2);
      if (dark >= centreMin) centre.push(x, y);
      else if (yellow + dark >= 0.5 || black >= 0.12) paint.push(x, y);
    }
  // Repère : coin haut gauche des logos, à 0.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const list of [paint, centre])
    for (let i = 0; i < list.length; i += 2) {
      minX = Math.min(minX, list[i]);
      maxX = Math.max(maxX, list[i]);
      minY = Math.min(minY, list[i + 1]);
      maxY = Math.max(maxY, list[i + 1]);
    }
  const shift = (list: number[]) => list.map((v, i) => v - (i % 2 === 0 ? minX : minY));
  return { width: maxX - minX + hiddenLogoSize, height: maxY - minY + hiddenLogoSize, paint: shift(paint), centre: shift(centre) };
}
