import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { parseMarkdown, type MdBlock } from "./markdown";

/*
 * Questions de la FAQ (page À propos) : un fichier par question dans content/pages/a-propos/faq/,
 * avec un en-tête (numero, question, double) puis la réponse en markdown simplifié.
 * Les fichiers commençant par « _ » sont ignorés (ex. _modele.md, à dupliquer).
 * « numero » fixe l'ordre d'affichage (le plus petit en premier).
 *
 * Réponse : markdown simplifié de lib/markdown.ts (voir _modele.md) ;
 * espace spacing/md entre les blocs, spacing/xs entre les paragraphes.
 * À n'utiliser que côté serveur (lecture du disque).
 */

const FAQ_DIR = path.join(process.cwd(), "content", "pages", "a-propos", "faq");

export type { MdBlock as FaqBlock, MdLine as FaqLine } from "./markdown";

export type FaqItem = {
  /** Nom du fichier, sans extension. */
  slug: string;
  /** Numéro affiché sur deux chiffres, ex. « 01 ». */
  number: string;
  order: number;
  question: string;
  double: boolean;
  answer: MdBlock[];
};

function fail(file: string, message: string): never {
  throw new Error(`FAQ (content/pages/a-propos/faq/${file}) : ${message}`);
}

function readItem(file: string): FaqItem {
  const source = readFileSync(path.join(FAQ_DIR, file), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail(file, "l'en-tête doit être entouré de deux lignes « --- ».");

  const data = (parse(match[1]) ?? {}) as Record<string, unknown>;
  const { numero, question, double = false } = data;

  if (typeof numero !== "number" || !Number.isInteger(numero) || numero < 1) fail(file, "« numero » doit être un nombre entier (1, 2, 3…).");
  if (typeof question !== "string" || !question.trim()) fail(file, "« question » est obligatoire.");
  // YAML lit « yes » / « no » comme du texte : on accepte les deux écritures.
  const isDouble = double === true || double === "yes";
  if (!isDouble && double !== false && double !== "no") fail(file, "« double » doit valoir yes ou no.");

  const answer = parseMarkdown(match[2], (message) => fail(file, message));
  if (answer.length === 0) fail(file, "la réponse est vide (à écrire sous l'en-tête).");

  return {
    slug: file.replace(/\.md$/, ""),
    number: String(numero).padStart(2, "0"),
    order: numero,
    question: question.trim(),
    double: isDouble,
    answer,
  };
}

/** Toutes les questions, triées par « numero ». */
export function getFaq(): FaqItem[] {
  const items = readdirSync(FAQ_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map(readItem)
    .sort((a, b) => a.order - b.order);

  items.forEach((item, i) => {
    const next = items[i + 1];
    if (next && next.order === item.order) {
      fail(`${item.slug}.md`, `« numero: ${item.order} » est déjà utilisé par « ${next.slug}.md ».`);
    }
  });

  return items;
}
