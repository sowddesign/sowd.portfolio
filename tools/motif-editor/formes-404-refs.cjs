/*
 * Formes 7 à 18 de l'éditeur de motifs (page 404), dans un même style (demande de l'utilisateur) :
 * deux couleurs au plus par dessin, codées comme l'éditeur les lit,
 *   jaune foncé = contours, traits et détails (couleur du centre), jaune = intérieur (couleur principale),
 *   blanc = fond (relié au bord de l'image).
 * Deux sortes de sources :
 *   - « flat » (formes 7 à 11) : aplats noirs avec découpes blanches (ref-forme-N.svg dessinés par formes-404.cjs,
 *     icône Souffle) : contour de band px et découpes en détails, le reste en intérieur ;
 *   - références de l'utilisateur (formes 12 à 18, dossier refs/) : traits sombres en détails, épaissis (flou puis
 *     seuil) pour rester lisibles en logos de 4 px ; dark : seuil des traits, blur : épaississement, white : seuil
 *     du fond, crop : recadrage [gauche, haut, largeur, hauteur] en parts de l'image.
 * Lancer depuis la racine du projet, après formes-404.cjs :
 *   NODE_PATH=node_modules node tools/motif-editor/formes-404-refs.cjs
 */
const sharp = require("sharp");
const path = require("path");
const dir = __dirname;

const flats = [
  { n: 11, file: "souffle-icone-originale.png", band: 24 },
];

const refs = [
  // Dessins de formes-404.cjs, dans le style des références (traits encrés).
  { n: 7, file: "dessin-7.svg", dark: 128, blur: 1.5, white: 238 },
  { n: 8, file: "dessin-8.svg", dark: 128, blur: 1.5, white: 238 },
  // Écran : visuel du showreel de l'utilisateur (ordinateur sur un rocher, tournesols), rendu réaliste demandé.
  // Écran repeint en gris clair (texte retiré, écran dans la couleur principale), sol coupé.
  { n: 10, file: "../../../public/showreel/ordinateur-sol-ameliore.webp", dark: 42, blur: 1.2, white: 238,
    paint: [0.399, 0.1595, 0.202, 0.165, 200], crop: [0.23, 0.14, 0.54, 0.31] },
  { n: 12, file: "loupe.png", dark: 90, blur: 2, white: 238 },
  // Arbre : sol raccourci (recadrage au milieu de l'image) pour que l'arbre garde sa taille.
  { n: 13, file: "arbre.png", dark: 200, blur: 3.5, white: 238, crop: [0.24, 0, 0.52, 1] },
  { n: 14, file: "visage.png", dark: 200, blur: 3.5, white: 238 },
  // Livre : sans le bandeau du bas, sol raccourci.
  { n: 9, file: "livre.png", dark: 200, blur: 4, white: 238, crop: [0.12, 0.14, 0.76, 0.64] },
  // Formes bien lisibles plutôt que détaillées (demande de l'utilisateur) : traits épais.
  { n: 16, file: "briques.png", dark: 200, blur: 3, white: 238, crop: [0, 0, 1, 0.9] },
  // Appareil : seuil haut pour garder les traits fins de la référence (molettes, prisme, bagues de l'objectif).
  { n: 17, file: "appareil.png", dark: 175, blur: 2, white: 238 },
  { n: 18, file: "pierre.png", dark: 70, blur: 2, white: 238 },
];
const DETAIL = [200, 140, 5];
const FILL = [250, 192, 56];
const SIZE = 800;

async function convert({ n, file, dark, blur, white, crop, paint }) {
  let input = path.join(dir, "refs", file);
  if (paint) {
    // Zone repeinte [gauche, haut, largeur, hauteur] en parts de l'image, avec un gris (0 à 255).
    const meta = await sharp(input).metadata();
    const [l, t, pw, ph, g] = paint;
    const width = Math.round(pw * meta.width), height = Math.round(ph * meta.height);
    input = await sharp(input)
      .composite([{ input: { create: { width, height, channels: 3, background: { r: g, g, b: g } } }, left: Math.round(l * meta.width), top: Math.round(t * meta.height) }])
      .png()
      .toBuffer();
  }
  if (crop) {
    // Recadrage [gauche, haut, largeur, hauteur] en parts de l'image.
    const meta = await sharp(input).metadata();
    const [l, t, cw, chh] = crop;
    input = await sharp(input)
      .extract({ left: Math.round(l * meta.width), top: Math.round(t * meta.height), width: Math.round(cw * meta.width), height: Math.round(chh * meta.height) })
      .toBuffer();
  }
  const src = sharp(input).flatten({ background: "#fff" }).grayscale().resize(SIZE, SIZE, { fit: "inside" });
  const { data: gray, info } = await src.clone().raw().toBuffer({ resolveWithObject: true });
  const { data: thick } = await src.clone().blur(blur).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const isDark = (i) => thick[i * ch] < dark;
  // Fond : pixels clairs reliés au bord de l'image.
  const outside = floodOutside(w, h, (i) => !isDark(i) && gray[i * ch] >= white);
  const out = Buffer.alloc(w * h * 3, 255);
  for (let i = 0; i < w * h; i++) {
    const color = isDark(i) ? DETAIL : outside[i] ? null : FILL;
    if (color) out.set(color, i * 3);
  }
  await save(out, w, h, n);
}

/** Fond relié au bord : pixels « libres » atteints depuis le bord de l'image. */
function floodOutside(w, h, free) {
  const outside = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (outside[i] || !free(i)) return;
    outside[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i - x) / w;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return outside;
}

async function save(out, w, h, n) {
  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .trim({ background: "#fff" })
    .extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#fff" })
    .webp({ lossless: true })
    .toFile(path.join(dir, `ref-forme-${n}.webp`));
  console.log(`ref-forme-${n}`);
}

/* Aplats : noir = silhouette ; contour (band px depuis le fond) et découpes blanches = détails. */
async function convertFlat({ n, file, band }) {
  const { data: gray, info } = await sharp(path.join(dir, file))
    .flatten({ background: "#fff" })
    .grayscale()
    .resize(SIZE, SIZE, { fit: "inside" })
    .extend({ top: band, bottom: band, left: band, right: band, background: "#fff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const black = (i) => gray[i * ch] < 160;
  const outside = floodOutside(w, h, (i) => !black(i));
  const mask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = outside[i] ? 255 : 0;
  const { data: near, info: nearInfo } = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
    .blur(band / 2)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(w * h * 3, 255);
  for (let i = 0; i < w * h; i++) {
    if (outside[i]) continue;
    out.set(!black(i) || near[i * nearInfo.channels] > 20 ? DETAIL : FILL, i * 3);
  }
  await save(out, w, h, n);
}

(async () => {
  for (const flat of flats) await convertFlat(flat);
  for (const ref of refs) {
    if (!require("fs").existsSync(path.join(dir, "refs", ref.file))) console.log(`refs/${ref.file} absent : ignoré`);
    else await convert(ref);
  }
})();
