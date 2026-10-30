// Loader webpack exécuté par Turbopack en CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parse } = require("yaml");

/*
 * Loader Turbopack des textes du site (content/**\/*.md, voir next.config.ts).
 * Lit l'en-tête entre les deux lignes « --- » et le transforme en objet { clé: texte }.
 * Exécuté à la compilation : les composants serveur et client importent le résultat comme un module JS.
 */
const isFlatBlock = (item) =>
  item !== null &&
  typeof item === "object" &&
  !Array.isArray(item) &&
  Object.values(item).every((text) => text === null || typeof text !== "object");

module.exports = function textsLoader(source) {
  const file = this.resourcePath.replace(/\\/g, "/").replace(/^.*\/content\//, "content/");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file} : les textes doivent être entourés de deux lignes « --- ».`);

  const data = parse(match[1]) ?? {};
  const texts = {};
  for (const [key, value] of Object.entries(data)) {
    // Liste (ex. tags) : un élément par ligne, précédé de « - ».
    if (Array.isArray(value) && value.every((item) => item !== null && typeof item !== "object")) {
      texts[key] = value.map(String);
      continue;
    }
    // Liste de blocs (ex. champs du formulaire) : chaque « - » ouvre un bloc de lignes « nom: texte ».
    if (Array.isArray(value) && value.every(isFlatBlock)) {
      texts[key] = value.map((block) =>
        Object.fromEntries(Object.entries(block).map(([name, text]) => [name, text === null ? "" : String(text)])),
      );
      continue;
    }
    if (value === null || typeof value === "object") {
      throw new Error(
        `${file} : « ${key} » doit être un texte sur une seule ligne, une liste (« - » par ligne) ou une liste de blocs.`,
      );
    }
    texts[key] = String(value);
  }
  return `export default ${JSON.stringify(texts)};`;
};
