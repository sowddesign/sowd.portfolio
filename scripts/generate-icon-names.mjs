// Génère la liste typée des icônes à partir des SVG de public/icons.
// À relancer après ajout/suppression d'une icône : npm run icons
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const iconsDir = join(root, "public", "icons");
const outFile = join(root, "components", "ui", "Icon", "icon-names.ts");

const names = readdirSync(iconsDir)
  .filter((file) => file.endsWith(".svg"))
  .map((file) => file.slice(0, -4))
  .sort();

const content = `// Fichier généré par scripts/generate-icon-names.mjs — ne pas modifier à la main.
export const iconNames = [
${names.map((name) => `  "${name}",`).join("\n")}
] as const;

export type IconName = (typeof iconNames)[number];
`;

writeFileSync(outFile, content);
console.log(`${names.length} icônes → ${outFile}`);
