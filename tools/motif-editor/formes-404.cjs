/*
 * Formes 7, 8 et 10 de la page 404, dessinées pour l'éditeur de motifs dans le style des références de l'utilisateur :
 * traits encrés sur fond blanc (intérieurs blancs). Écrit les sources refs/dessin-N.svg ; formes-404-refs.cjs en tire
 * les images à deux couleurs (traits = couleur du centre, intérieur = couleur principale).
 * Lancer depuis la racine du projet : node tools/motif-editor/formes-404.cjs
 */
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "refs");

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;
const ink = (w) => `fill="#fff" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const line = (w) => `fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/* 7 : entretien et FlashInvaders : deux personnes qui discutent, bulle avec une petite créature en mosaïque de
   pixels (dessin original, clin d'œil aux mosaïques de rue du projet). */
function entretien() {
  const creature = [
    "..X...X..",
    "...XXX...",
    ".XXXXXXX.",
    "XX.XXX.XX",
    "XXXXXXXXX",
    "X.X...X.X",
    "...X.X...",
  ];
  const cell = 20;
  const ox = 190, oy = 62;
  const tiles = [];
  creature.forEach((row, r) =>
    [...row].forEach((v, c) => {
      if (v === "X") tiles.push(`<rect x="${ox + c * cell + 2}" y="${oy + r * cell + 2}" width="${cell - 4}" height="${cell - 4}" fill="#000"/>`);
    }),
  );
  const bust = (x, flip) => {
    const s = flip ? -1 : 1;
    return `<circle cx="${x}" cy="300" r="36" ${ink(10)}/>
<path d="M${x - 34} 292 Q${x} 250 ${x + 34} 292" ${line(8)}/>
<circle cx="${x + s * 14}" cy="302" r="5" fill="#000"/>
<path d="M${x - 62} 426 Q${x - 60} 352 ${x} 346 Q${x + 60} 352 ${x + 62} 426 Z" ${ink(10)}/>`;
  };
  const body = `<path d="M140 28 H420 Q452 28 452 60 V206 Q452 238 420 238 H200 L150 282 L164 238 H140 Q108 238 108 206 V60 Q108 28 140 28 Z" ${ink(10)}/>
${tiles.join("")}
${bust(80, false)}${bust(480, true)}`;
  return svg(560, 440, body);
}

/* 8 : graine de tournesol (projet Graine), pointe en haut, inclinée, rayures. */
function graine() {
  const body = `<g transform="rotate(-22 180 240)">
<path d="M180 90 C214 120 258 220 256 300 C254 360 224 392 180 392 C136 392 106 360 104 300 C102 220 146 120 180 90 Z" ${ink(12)}/>
<path d="M150 150 C126 220 124 310 144 380 M210 150 C234 220 236 310 216 380" ${line(10)}/>
<path d="M180 120 C174 200 174 300 180 386" ${line(7)}/>
<path d="M168 108 L192 108" ${line(8)}/>
</g>`;
  return svg(380, 460, body);
}

/* 10 : écran du showreel, d'après le visuel de l'utilisateur : ordinateur portable, bouton de lecture, et un
   tournesol à côté (tige, feuille, pétales pointus, cœur). Retouches de l'utilisateur : sans cadre intérieur ni
   cercle autour du bouton ; cœur et socle pleins (couleur des traits) ; sans feuille, posé sur un rocher à dessus
   plat. */
function ecran() {
  const petals = [];
  for (let i = 0; i < 11; i++) {
    petals.push(`<path d="M0 -38 C26 -62 22 -98 0 -122 C-22 -98 -26 -62 0 -38 Z" transform="rotate(${(i * 360) / 11})" ${ink(7)}/>`);
  }
  // Rocher à dessus plat (d'après la référence de l'utilisateur) : silhouette et arêtes des facettes seulement.
  const rock = `<path d="M30 354 L64 340 H654 L678 362 L666 424 L636 474 L122 480 L70 446 L38 402 Z" ${ink(10)}/>
<path d="M40 372 L126 366 L320 374 L506 364 L672 378" ${line(8)}/>
<path d="M150 368 L128 476 M346 374 L370 478 M528 366 L572 476" ${line(7)}/>`;
  // Fleur écartée de l'ordinateur : l'espace entre la tige, l'ordinateur et le rocher reste ouvert (fond).
  const body = `${rock}
<path d="M116 342 C114 300 118 264 122 230" ${line(12)}/>
<g transform="translate(122 150) scale(0.86)">${petals.join("")}<circle r="42" fill="#000"/></g>
<rect x="270" y="70" width="340" height="230" rx="16" ${ink(10)}/>
<path d="M426 163 L426 207 L462 185 Z" ${ink(8)}/>
<path d="M236 310 H644 L620 338 H260 Z" fill="#000" stroke="#000" stroke-width="10" stroke-linejoin="round"/>`;
  return svg(700, 500, body);
}

for (const [n, make] of [[7, entretien], [8, graine], [10, ecran]]) {
  fs.writeFileSync(path.join(dir, `dessin-${n}.svg`), make());
  console.log(`refs/dessin-${n}.svg`);
}
