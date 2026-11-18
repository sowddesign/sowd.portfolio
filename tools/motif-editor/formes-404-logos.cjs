/*
 * Page 404 : logos de 4 px des formes cachées, avec les règles de l'éditeur de motifs (motif-dessin.html) :
 * jaune = plein, jaune foncé = centre (couleur secondaire), noir = colorié (seuil d'un contour).
 * Écrit components/ui/NotFound/hidden-shapes.ts. Lancer depuis la racine du projet après avoir modifié une forme :
 *   NODE_PATH=node_modules node tools/motif-editor/formes-404-logos.cjs
 * Tailles : tige à la hauteur de l'éditeur (528 px) ; autres formes, plus grand côté en px (proposition B retenue,
 * ajustée avec l'utilisateur).
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SIZE = 4, L = 442, W0 = 384.54, R0 = 322.66, SH = 192.27;
const shapes = [
  { id: "stem", file: 6, height: 528 },
  // Proposition B retenue par l'utilisateur (« diagonale »), puis ajustée : souffle réduit, visage et appareil agrandis.
  { id: "appareil", file: 17, side: 400 },
  { id: "doubleTournesol", file: 5, side: 360 },
  { id: "ecran", file: 10, side: 260 },
  { id: "livre", file: 9, side: 240 },
  { id: "visage", file: 14, side: 240 },
  { id: "arbre", file: 13, side: 200 },
  { id: "entretien", file: 7, side: 180 },
  { id: "souffle", file: 11, side: 160 },
  { id: "loupe", file: 12, side: 160 },
  { id: "briques", file: 16, side: 220 },
  { id: "graine", file: 8, side: 110 },
];

async function cellsOf({ file, height, side }) {
  const src = path.join(__dirname, `ref-forme-${file}.webp`);
  const { data, info } = await sharp(src).flatten({ background: "#fff" }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels, iw = info.width, ih = info.height;
  const k = height ? height / ih : side / Math.max(iw, ih);
  const W = iw * k, H = ih * k;
  const px = (X, Y) => {
    X = Math.round(X); Y = Math.round(Y);
    if (X < 0 || Y < 0 || X >= iw || Y >= ih) return "w";
    const i = (Y * iw + X) * ch;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    return r > 170 && b < 120 ? (g > 165 ? "y" : "c") : r < 110 && g < 110 && b < 110 ? "b" : "w";
  };
  const cover = (cx, cy, kind, r) => {
    let n = 0, t = 0;
    for (let a = -r; a <= r + 1e-6; a += r / 3) for (let b = -r; b <= r + 1e-6; b += r / 3) {
      if (a * a + b * b > r * r + 1e-6) continue;
      t++; if (px((cx + a) / k, (cy + b) / k) === kind) n++;
    }
    return n / t;
  };
  const s = SIZE / L, sx = W0 * s, sy = R0 * s, r = SIZE * 0.45;
  const paint = [], centre = [];
  for (let row = -1; row < H / sy + 1; row++) for (let c = -1; c < W / sx + 1; c++) {
    const x = (c * W0 + (row & 1 ? SH : 0)) * s, y = row * R0 * s, cx = x + SIZE / 2, cy = y + SIZE / 2;
    // Seuil des détails plus bas que l'éditeur (0,5) : les traits fins des formes 7 et plus restent visibles.
    const core = cover(cx, cy, "c", r) >= (file >= 7 ? 0.3 : 0.5);
    if (core) centre.push(x, y);
    else if (cover(cx, cy, "y", r) + cover(cx, cy, "c", r) >= 0.5 || cover(cx, cy, "b", r) >= 0.12) paint.push(x, y);
  }
  // Repère : coin haut gauche des logos, à 0.
  const all = [...paint, ...centre];
  const minX = Math.min(...all.filter((_, i) => i % 2 === 0)), minY = Math.min(...all.filter((_, i) => i % 2 === 1));
  const shift = (list) => list.map((v, i) => +(v - (i % 2 === 0 ? minX : minY)).toFixed(2));
  const p = shift(paint), c = shift(centre), a = [...p, ...c];
  return {
    width: +(Math.max(...a.filter((_, i) => i % 2 === 0)) + SIZE).toFixed(2),
    height: +(Math.max(...a.filter((_, i) => i % 2 === 1)) + SIZE).toFixed(2),
    paint: p,
    centre: c,
  };
}

(async () => {
  const out = [];
  for (const shape of shapes) {
    const { width, height, paint, centre } = await cellsOf(shape);
    out.push(`  ${shape.id}: {\n    width: ${width},\n    height: ${height},\n    paint: [${paint.join(",")}],\n    centre: [${centre.join(",")}],\n  },`);
    console.log(shape.id, width, "x", height, paint.length / 2 + centre.length / 2, "logos");
  }
  const file = path.join(__dirname, "..", "..", "components", "ui", "NotFound", "hidden-shapes.ts");
  fs.writeFileSync(
    file,
    `/*
 * Page 404 : formes cachées en logos de 4 px (formes de l'éditeur de motifs, tools/motif-editor).
 * Fichier généré par tools/motif-editor/formes-404-logos.cjs : ne pas modifier à la main.
 * Par forme : taille (px), paires x, y (px, coin haut gauche de chaque logo) coloriées en couleur principale (paint)
 * ou en couleur du centre (centre).
 */
export const hiddenLogoSize = ${SIZE};

export type HiddenShapeData = { width: number; height: number; paint: number[]; centre: number[] };

export const hiddenShapes = {
${out.join("\n")}
} satisfies Record<string, HiddenShapeData>;

export type HiddenShapeId = keyof typeof hiddenShapes;
`,
  );
})();
