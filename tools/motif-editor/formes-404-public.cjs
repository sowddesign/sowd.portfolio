/*
 * Page 404 : copie les images des formes de l'éditeur de motifs dans public/not-found/formes, où la page les lit pour
 * tracer chaque forme en logos de 4 px à la taille de l'écran (shape-sampler). À relancer après avoir modifié une forme
 * (formes-404.cjs puis formes-404-refs.cjs) : node tools/motif-editor/formes-404-public.cjs
 */
const fs = require("fs");
const path = require("path");

const files = {
  stem: 6,
  "double-tournesol": 5,
  entretien: 7,
  graine: 8,
  livre: 9,
  ecran: 10,
  souffle: 11,
  loupe: 12,
  arbre: 13,
  visage: 14,
  briques: 16,
  appareil: 17,
};
const out = path.join(__dirname, "..", "..", "public", "not-found", "formes");
fs.mkdirSync(out, { recursive: true });
for (const [name, n] of Object.entries(files)) {
  fs.copyFileSync(path.join(__dirname, `ref-forme-${n}.webp`), path.join(out, `${name}.webp`));
  console.log(`public/not-found/formes/${name}.webp`);
}
