import { closeSync, existsSync, openSync, readdirSync, readFileSync, readSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { headerImageBackgrounds, type HeaderImageBackground } from "@/components/ui/HeaderImage/backgrounds";
import type {
  HeaderImagePlacement,
  HeaderImageText,
  HeaderImageTextPlacement,
} from "@/components/ui/HeaderImage/placement";
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
  header: {
    keywords: string[];
    image?: string;
    background?: HeaderImageBackground;
    /** Placement de l'image par appareil (absent : image entière, calée en bas). */
    placement?: { desktop?: HeaderImagePlacement; mobile?: HeaderImagePlacement };
    texts?: HeaderImageText[];
  };
  definition: { left: MdLine[][]; right: MdLine[][] };
  sections: MethodeSection[];
  project: { label: string; href: string };
};

const METHODE_DIR = path.join(process.cwd(), "content", "methode");
// Images des pages méthode. Chemin fixe jusqu'à public/methode : un chemin dynamique depuis public/ ferait embarquer
// tout public/ (vidéo comprise) dans la fonction serveur, au-delà de la limite de taille de Netlify.
const METHODE_IMAGES_DIR = path.join(process.cwd(), "public", "methode");

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

/**
 * En dev, « use cache » n'est vidé que quand le code change : la date de modification la plus récente des textes
 * de content/methode entre dans la clé du cache, pour qu'une modification d'un md s'affiche. En production : 0.
 */
function contentVersion() {
  if (process.env.NODE_ENV !== "development") return 0;
  return readdirSync(METHODE_DIR, { recursive: true, encoding: "utf8" }).reduce(
    (latest, file) => Math.max(latest, statSync(path.join(METHODE_DIR, file)).mtimeMs),
    0,
  );
}

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
  return { body: match![2], data, text, list, fail };
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
    return { kind: "image", src, alt, ...imageSize(path.join(METHODE_IMAGES_DIR, path.relative("methode", folder), name), fail) };
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

/**
 * Image d'en-tête : un nom seul (« photo.png ») est cherché dans public/methode/<page>/ ;
 * un chemin (« public\pages\photo.png », « pages/photo.png », « /pages/photo.png ») part de public/.
 */
function headerImageSrc(value: string, folder: string) {
  const path = value.trim().replace(/\\/g, "/").replace(/^\/+/, "").replace(/^public\//, "");
  return path.includes("/") ? `/${path}` : `/${folder}/${path}`;
}

/** Placement de l'image (« image_desktop » / « image_mobile » : { taille, x, y, rotation }), facultatif. */
function placementOf(
  data: Record<string, unknown>,
  key: string,
  fail: (message: string) => never,
): HeaderImagePlacement | undefined {
  const value = data[key];
  if (value === null || value === undefined) return undefined;
  const entry = (typeof value === "object" ? value : {}) as Record<string, unknown>;
  const [size, x, y] = ["taille", "x", "y"].map((name) => entry[name]);
  const rotation = entry.rotation;
  if (![size, x, y].every((n) => typeof n === "number") || (rotation !== undefined && typeof rotation !== "number")) {
    fail(`« ${key} » s'écrit { taille: nombre, x: nombre, y: nombre } (+ rotation).`);
  }
  return { size: size as number, x: x as number, y: y as number, ...(rotation ? { rotation: rotation as number } : {}) };
}

/**
 * Textes posés sur l'image (« image_textes »), facultatifs. Chaque texte : « texte », « desktop » et « mobile »
 * ({ x, y } et, au besoin, « rotation » en degrés), « couleur: blanc » au besoin.
 */
function textsOf(data: Record<string, unknown>, fail: (message: string) => never): HeaderImageText[] {
  const value = data.image_textes;
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) fail("« image_textes » est une liste (chaque texte commence par « - texte: »).");
  const where = (item: Record<string, unknown>, name: string): HeaderImageTextPlacement => {
    const entry = item[name] as Record<string, unknown> | undefined;
    const { x, y, rotation } = entry ?? {};
    if (typeof x !== "number" || typeof y !== "number" || (rotation !== undefined && typeof rotation !== "number")) {
      fail(`« image_textes » (${String(item.texte)}) : « ${name} » s'écrit { x: nombre, y: nombre } (+ rotation).`);
    }
    return {
      x: x as number,
      y: y as number,
      ...(rotation ? { rotation: rotation as number } : {}),
    };
  };
  return (value as unknown[]).map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    if (typeof item.texte !== "string" || !item.texte) fail("« image_textes » : chaque texte a un « texte: ».");
    if (item.couleur !== undefined && item.couleur !== "blanc") fail("« image_textes » : « couleur » vaut « blanc » ou rien.");
    return {
      text: item.texte as string,
      ...(item.couleur === "blanc" ? { white: true } : {}),
      desktop: where(item, "desktop"),
      mobile: where(item, "mobile"),
    };
  });
}

/** Mis en cache (« use cache ») : la lecture des images n'est pas permise pendant le pré-rendu sinon. */
export async function getMethodePage(slug: string): Promise<MethodePageContent> {
  return loadMethodePage(slug, contentVersion());
}

async function loadMethodePage(slug: string, version: number): Promise<MethodePageContent> {
  "use cache";
  void version;
  const { body, data, text, list, fail } = read(`pages/${slug}.md`);
  const folder = `methode/${slug}`;
  const placement = { desktop: placementOf(data, "image_desktop", fail), mobile: placementOf(data, "image_mobile", fail) };
  const texts = textsOf(data, fail);
  const image = text("image_fichier", true);
  const background = text("image_fond", true)?.trim();
  if (background !== undefined && !(background in headerImageBackgrounds)) {
    fail(`« image_fond » doit être l'un de : ${Object.keys(headerImageBackgrounds).join(", ")}.`);
  }

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
      keywords: list("image_mots_cles"),
      ...(image ? { image: headerImageSrc(image, folder) } : {}),
      ...(background ? { background: background as HeaderImageBackground } : {}),
      ...(placement.desktop || placement.mobile
        ? {
            placement: {
              ...(placement.desktop ? { desktop: placement.desktop } : {}),
              ...(placement.mobile ? { mobile: placement.mobile } : {}),
            },
          }
        : {}),
      ...(texts.length > 0 ? { texts } : {}),
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
  return loadMethode(contentVersion());
}

async function loadMethode(version: number): Promise<MethodeStep[]> {
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
          return { slug, number: number(j), label, content: exists ? await loadMethodePage(slug, version) : null };
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
