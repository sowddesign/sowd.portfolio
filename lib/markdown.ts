/*
 * Markdown simplifié des textes longs du site (réponses de la FAQ, présentation de la page À propos).
 * Le découpage en blocs et paragraphes est commun ; les espaces entre eux dépendent du composant qui affiche.
 *
 *   ligne « --- »          → nouveau bloc
 *   ligne vide             → nouveau paragraphe dans le bloc
 *   retour à la ligne      → retour à la ligne dans le paragraphe
 *   « 1. texte » par ligne → liste numérotée
 *   [texte](https://…)     → lien (style hyperlien)
 *   [texte]{brand}         → texte en couleur : un token text/* du projet (voir TEXT_COLORS)
 *   *texte*                → italique
 */

/** Couleurs autorisées dans [texte]{couleur} : tokens text/brand/* et text/neutral/*. */
export const TEXT_COLORS = ["brand", "whitish", "bright", "dark", "somber", "white", "black"] as const;
export type TextColor = (typeof TEXT_COLORS)[number];

/** Morceau de texte avec ses éventuels lien, couleur et italique. */
export type MdInline = { text: string; href?: string; color?: TextColor; italic?: boolean };
/** Une ligne de texte (les retours à la ligne séparent les lignes). */
export type MdLine = MdInline[];
export type MdParagraph =
  | { kind: "text"; lines: MdLine[] }
  | { kind: "list"; items: { number: string; lines: MdLine[] }[] };
export type MdBlock = MdParagraph[];

/** [texte](lien) ou [texte]{couleur}. */
const BRACKET = /\[([^\]]+)\](?:\(([^)\s]+)\)|\{([^}\s]+)\})/g;
const ITALIC = /\*([^*]+)\*/g;
const LIST_ITEM = /^(\d+)\.\s+(.*)$/;

function parseBrackets(text: string, italic: boolean, fail: (message: string) => never): MdLine {
  const parts: MdLine = [];
  const flag = italic ? { italic } : {};
  let last = 0;
  for (const match of text.matchAll(BRACKET)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), ...flag });
    const [, label, href, color] = match;
    if (color !== undefined && !(TEXT_COLORS as readonly string[]).includes(color)) {
      fail(`couleur « ${color} » inconnue dans « [${label}]{${color}} » (couleurs possibles : ${TEXT_COLORS.join(", ")}).`);
    }
    parts.push({ text: label, ...flag, ...(href ? { href } : { color: color as TextColor }) });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), ...flag });
  return parts;
}

function parseLine(line: string, fail: (message: string) => never): MdLine {
  const parts: MdLine = [];
  let last = 0;
  for (const match of line.matchAll(ITALIC)) {
    if (match.index > last) parts.push(...parseBrackets(line.slice(last, match.index), false, fail));
    parts.push(...parseBrackets(match[1], true, fail));
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(...parseBrackets(line.slice(last), false, fail));
  return parts;
}

function parseParagraph(source: string, fail: (message: string) => never): MdParagraph {
  const lines = source.split("\n").map((line) => line.trimEnd());
  if (lines.every((line) => LIST_ITEM.test(line))) {
    return {
      kind: "list",
      items: lines.map((line) => {
        const [, number, text] = line.match(LIST_ITEM)!;
        return { number: `${number}.`, lines: [parseLine(text, fail)] };
      }),
    };
  }
  return { kind: "text", lines: lines.map((line) => parseLine(line, fail)) };
}

/** Découpe un texte en blocs (« --- ») puis en paragraphes (ligne vide). */
export function parseMarkdown(source: string, fail: (message: string) => never): MdBlock[] {
  return source
    .replace(/\r\n/g, "\n")
    .split(/^---\s*$/m)
    .map((block) =>
      block
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => parseParagraph(paragraph, fail)),
    )
    .filter((block) => block.length > 0);
}
