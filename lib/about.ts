import { readFileSync } from "node:fs";
import path from "node:path";
import { parseMarkdown, type MdBlock } from "./markdown";

/*
 * Présentation de la page À propos : content/pages/a-propos/presentation.md
 * (en-tête de commentaires entre deux lignes « --- », puis le texte en markdown simplifié de lib/markdown.ts).
 * À n'utiliser que côté serveur (lecture du disque).
 */

const FILE = path.join(process.cwd(), "content", "pages", "a-propos", "presentation.md");

function fail(message: string): never {
  throw new Error(`Présentation (content/pages/a-propos/presentation.md) : ${message}`);
}

export function getPresentation(): MdBlock[] {
  const source = readFileSync(FILE, "utf8");
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail("le texte doit suivre un en-tête entouré de deux lignes « --- ».");
  const blocks = parseMarkdown(match[1], fail);
  if (blocks.length === 0) fail("le texte est vide.");
  return blocks;
}
