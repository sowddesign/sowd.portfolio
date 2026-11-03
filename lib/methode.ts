import { closeSync, existsSync, openSync, readFileSync, readSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { parseLine, type MdLine } from "./markdown";

/*
 * Méthode (composants Figma « methodeContainer » et « methode »).
 * Étapes et pages, dans l'ordre, dans content/methode/ordre.yaml : l'utilisateur y déplace une page
 * d'une étape à l'autre ou change l'ordre ; les numéros (01, 02…) suivent la position.
 *   intros/<intro>.md : introduction d'une étape (page00, en-tête seul) ;
 *   pages/<fichier>.md : modèle de page (en-tête : image d'en-tête, « En quelques mots », bouton du projet ;
 *            texte : « Utilisation dans un projet », découpé en parties, rangées et colonnes,
 *            voir pages/recherches-quantitatives.md), images dans public/methode/<fichier>/.
 * Un fichier pas encore écrit donne un contenu null (la page reste listée dans le menu).
 * À n'utiliser que côté serveur (lecture du disque).
 */

export type MethodeElement =
  | { kind: "subtitle"; line: MdLine }
  | { kind: "text"; lines: MdLine[] }
  | { kind: "numbered"; items: { number: string; line: MdLine }[] }
  | { kind: "bullets"; items: MdLine[] }
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  | { kind: "caption"; lines: MdLine[] }
  | { kind: "figure"; value: string; label: MdLine };

/** Rangée : une colonne (pleine largeur) ou deux ; alignEnd cale la colonne de droite en bas. */
export type MethodeRow = { columns: MethodeElement[][]; alignEnd: boolean };
/** Partie : titre facultatif (la première partie n'en a pas) et ses rangées. */
export type MethodeSection = { title?: MdLine; rows: MethodeRow[] };

export type MethodeIntroContent = { label: string; title: string; text: string; hint: string };

export type MethodePageContent = {
  header: { title: string; keywords: string[]; image?: string };
  definition: { left: MdLine[][]; right: MdLine[][] };
  sections: MethodeSection[];
  project: { label: string; href: string };
};

const METHODE_DIR = path.join(process.cwd(), "content", "methode");

export type MethodePageEntry = {
  /** Nom du fichier (content/methode/pages/<slug>.md). */
  slug: string;
  /** Numéro selon la position dans l'étape, ex. « 01 ». */
  number: string;
  /** Nom affiché dans le menu. */
  label: string;
  content: MethodePageContent | null;
};

export type MethodeStep = {
  /** Numéro selon la position, ex. « 01 ». */
  number: string;
  title: string;
  description: string;
  intro: MethodeIntroContent | null;
  pages: MethodePageEntry[];
};

function read(file: string) {
  const fail = (message: string): never => {
    throw new Error(`content/methode/${file} : ${message}`);
  };
  const source = readFileSync(path.join(METHODE_DIR, file), "utf8").replace(/\r\n/g, "\n");
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) fail("les textes doivent commencer par un en-tête entouré de deux lignes « --- ».");
  const data = (parse(match![1]) ?? {}) as Record<string, unknown>;
  const text = (key: string, optional = false) => {
    const value = data[key];
    if (value === null || value === undefined || value === "") {
      if (optional) return undefined;
      fail(`le texte « ${key} » est manquant.`);
    }
    if (typeof value !== "string" && typeof value !== "number") fail(`« ${key} » doit être un texte.`);
    return String(value);
  };
  const list = (key: string) => {
    const value = data[key];
    if (!Array.isArray(value)) fail(`la liste « ${key} » est manquante (un élément par ligne, précédé de « - »).`);
    return (value as unknown[]).map(String);
  };
  return { body: match![2], text, list, fail };
}

/** Paragraphes séparés par une ligne vide, lignes par retour à la ligne. */
function paragraphs(source: string, fail: (message: string) => never): MdLine[][] {
  return source
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => paragraph.split("\n").map((line) => parseLine(line.trim(), fail)));
}

/** Largeur et hauteur d'une image PNG ou JPEG (pour réserver sa place avant le chargement). */
function imageSize(file: string, fail: (message: string) => never) {
  // Début du fichier seulement : les dimensions sont dans l'en-tête.
  const data = Buffer.alloc(65536);
  try {
    const fd = openSync(file, "r");
    readSync(fd, data, 0, data.length, 0);
    closeSync(fd);
  } catch {
    return fail(`image introuvable : ${path.relative(process.cwd(), file)}.`);
  }
  if (data.readUInt32BE(0) === 0x89504e47) return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  for (let i = 2; i + 9 < data.length; ) {
    const marker = data.readUInt16BE(i);
    if (marker >= 0xffc0 && marker <= 0xffcf && ![0xffc4, 0xffc8, 0xffcc].includes(marker)) {
      return { height: data.readUInt16BE(i + 5), width: data.readUInt16BE(i + 7) };
    }
    i += 2 + data.readUInt16BE(i + 2);
  }
  return fail(`format d'image non reconnu (PNG ou JPEG) : ${path.relative(process.cwd(), file)}.`);
}

const NUMBERED = /^(\d+)\.\s+(.*)$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const FIGURE = /^=\s*(\S+)\s*\|\s*(.+)$/;

function element(source: string, folder: string, fail: (message: string) => never): MethodeElement {
  const lines = source.split("\n").map((line) => line.trim());
  const [first] = lines;
  if (lines.length === 1 && first.startsWith("### ")) return { kind: "subtitle", line: parseLine(first.slice(4), fail) };
  if (lines.length === 1 && IMAGE.test(first)) {
    const [, alt, name] = first.match(IMAGE)!;
    const src = `/${folder}/${name}`;
    return { kind: "image", src, alt, ...imageSize(path.join(process.cwd(), "public", folder, name), fail) };
  }
  if (lines.length === 1 && FIGURE.test(first)) {
    const [, value, label] = first.match(FIGURE)!;
    return { kind: "figure", value, label: parseLine(label, fail) };
  }
  if (lines.every((line) => NUMBERED.test(line))) {
    return {
      kind: "numbered",
      items: lines.map((line) => {
        const [, number, text] = line.match(NUMBERED)!;
        return { number: `${number}.`, line: parseLine(text, fail) };
      }),
    };
  }
  if (lines.every((line) => line.startsWith("- "))) {
    return { kind: "bullets", items: lines.map((line) => parseLine(line.slice(2), fail)) };
  }
  if (lines.every((line) => line.startsWith("> "))) {
    return { kind: "caption", lines: lines.map((line) => parseLine(line.slice(2), fail)) };
  }
  return { kind: "text", lines: lines.map((line) => parseLine(line, fail)) };
}

function row(source: string, folder: string, fail: (message: string) => never): MethodeRow | null {
  const parts = source.split(/^\|\|[ \t]*(bas)?[ \t]*$/m);
  if (parts.length > 3) fail("une rangée a au plus deux colonnes (un seul « || » par rangée).");
  const alignEnd = parts[1] === "bas";
  const columns = [parts[0], parts[2]]
    .filter((column) => column !== undefined)
    .map((column) =>
      column
        .split(/\n\s*\n/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => element(item, folder, fail)),
    );
  if (columns.every((column) => column.length === 0)) return null;
  return { columns, alignEnd };
}

export function getMethodeIntro(intro: string): MethodeIntroContent {
  const { text } = read(`intros/${intro}.md`);
  return { label: text("libelle")!, title: text("titre")!, text: text("texte")!, hint: text("consigne")! };
}

/** Mis en cache (« use cache ») : la lecture des images n'est pas permise pendant le pré-rendu sinon. */
export async function getMethodePage(slug: string): Promise<MethodePageContent> {
  "use cache";
  const { body, text, list, fail } = read(`pages/${slug}.md`);
  const folder = `methode/${slug}`;
  const image = text("image_fichier", true);

  // Commentaires : lignes commençant par « # » suivi d'un espace.
  const source = body
    .split("\n")
    .filter((line) => !/^#\s/.test(line) && line.trim() !== "#")
    .join("\n");
  const sections = source
    .split(/^(?=## )/m)
    .map((part) => {
      const titled = part.startsWith("## ");
      const [heading, ...rest] = titled ? part.split("\n") : ["", part];
      const rows = rest
        .join("\n")
        .split(/^---[ \t]*$/m)
        .map((chunk) => row(chunk, folder, fail))
        .filter((value): value is MethodeRow => value !== null);
      return { ...(titled ? { title: parseLine(heading.slice(3).trim(), fail) } : {}), rows };
    })
    .filter((section) => section.title || section.rows.length > 0);

  return {
    header: {
      title: text("image_titre")!,
      keywords: list("image_mots_cles"),
      ...(image ? { image: `/${folder}/${image}` } : {}),
    },
    definition: {
      left: paragraphs(text("definition_gauche")!, fail),
      right: paragraphs(text("definition_droite")!, fail),
    },
    sections,
    project: { label: text("projet_bouton")!, href: text("projet_lien")! },
  };
}

function failOrder(message: string): never {
  throw new Error(`Méthode (content/methode/ordre.yaml) : ${message}`);
}

const number = (i: number) => String(i + 1).padStart(2, "0");
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Étapes et pages de ordre.yaml, dans cet ordre, avec leur contenu (null si le fichier n'existe pas encore). */
export async function getMethode(): Promise<MethodeStep[]> {
  "use cache";
  const order = parse(readFileSync(path.join(METHODE_DIR, "ordre.yaml"), "utf8")) ?? [];
  if (!Array.isArray(order)) failOrder("le fichier doit être une liste d'étapes (chacune commence par « - titre: »).");
  const seen = new Set<string>();

  return Promise.all(
    order.map(async (entry: unknown, i: number) => {
      const step = (entry ?? {}) as Record<string, unknown>;
      const where = `étape ${number(i)}`;
      const field = (key: string) => {
        const value = step[key];
        if (typeof value !== "string" || !value.trim()) failOrder(`${where} : « ${key} » est manquant.`);
        return value as string;
      };
      const title = field("titre");
      const description = field("description");
      const intro = field("intro");
      if (!Array.isArray(step.pages)) failOrder(`étape « ${title} » : la liste « pages » est manquante.`);

      const pages = await Promise.all(
        (step.pages as unknown[]).map(async (item, j) => {
          const pair = item && typeof item === "object" ? Object.entries(item) : [];
          if (pair.length !== 1 || typeof pair[0][1] !== "string") {
            failOrder(`étape « ${title} », page ${number(j)} : écris « - fichier: Nom affiché ».`);
          }
          const [slug, label] = pair[0] as [string, string];
          if (!SLUG.test(slug)) {
            failOrder(`« ${slug} » : le nom de fichier ne prend que des minuscules sans accent, des chiffres et des « - ».`);
          }
          if (seen.has(slug)) failOrder(`la page « ${slug} » est listée deux fois.`);
          seen.add(slug);
          const exists = existsSync(path.join(METHODE_DIR, "pages", `${slug}.md`));
          return { slug, number: number(j), label, content: exists ? await getMethodePage(slug) : null };
        }),
      );

      return {
        number: number(i),
        title,
        description,
        intro: existsSync(path.join(METHODE_DIR, "intros", `${intro}.md`)) ? getMethodeIntro(intro) : null,
        pages,
      };
    }),
  );
}
