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
import { isProjectAvailable, PROJECTS_ORDER_FILE } from "./projects";

/*
 * Méthode (composants Figma « methodeContainer » et « methode »).
 * Étapes et pages, dans l'ordre, dans content/methode/ordre.yaml : l'utilisateur y déplace une page
 * d'une étape à l'autre ou change l'ordre ; les numéros (01, 02…) suivent la position.
 *   intros/<intro>.md : introduction d'une étape (page00, en-tête seul) ;
 *   pages/<fichier>.md : modèle de page (en-tête : image d'en-tête, « En quelques mots », projet cité ;
 *            texte : « Utilisation dans un projet », découpé en parties, sous-parties, blocs et colonnes,
 *            voir pages/recherches-quantitatives.md), images dans public/methode/<fichier>/ ;
 *   projets/<projet>.md : introduction au projet cité et bouton vers le projet, communs aux pages qui le citent.
 * Un fichier pas encore écrit donne un contenu null (la page reste listée dans le menu).
 * À n'utiliser que côté serveur (lecture du disque).
 */

export type MethodeImage = { src: string; alt: string; width: number; height: number };

/** Élément numéroté : numéro, image facultative à côté du numéro, paragraphes (à côté du numéro, ou sous l'image). */
export type MethodeNumberedItem = { number: string; image?: MethodeImage; paragraphs: MdLine[] };

export type MethodeElement =
  | { kind: "subtitle"; line: MdLine }
  | { kind: "text"; lines: MdLine[] }
  | { kind: "numbered"; items: MethodeNumberedItem[] }
  | { kind: "bullets"; items: MdLine[] }
  | ({ kind: "image" } & MethodeImage)
  | { kind: "caption"; lines: MdLine[] }
  | { kind: "figure"; value: string; label: MdLine }
  /** Extrait audio (« ~ fichier.mp3 | légende ») : fichier dans le dossier des images de la page. */
  | { kind: "audio"; src: string; caption: string }
  /** Titre captionText/accentuation et son texte (« ##### Titre » puis le texte en dessous). */
  | { kind: "titled"; title: MdLine; lines: MdLine[] };

/** Rangée d'un bloc : une colonne (pleine largeur) ou deux ; alignEnd cale la colonne de droite en bas. */
export type MethodeRow = { columns: MethodeElement[][]; alignEnd: boolean };
/** Bloc : rangées l'une sous l'autre. */
export type MethodeBlock = MethodeRow[];
/** Sous-partie : sous-titre facultatif et ses blocs. */
export type MethodeSubpart = { title?: MdLine; blocks: MethodeBlock[] };
/** Partie : titre facultatif et ses sous-parties ; les parties sont séparées par un trait. */
export type MethodePart = { title?: MdLine; subparts: MethodeSubpart[] };

/** Introduction au projet cité (content/methode/projets/<slug>.md), commune à toutes les pages qui le citent. */
export type MethodeProjectIntro = { slug: string; title: string; blocks: MethodeBlock[] };

/**
 * Groupe de « En quelques mots » : paragraphes, ou liste numérotée avec un titre facultatif
 * (« #### Titre » puis une ligne « 1. texte » par élément).
 */
export type MethodeDefinitionGroup =
  | { kind: "text"; lines: MdLine[] }
  | { kind: "numbered"; title?: MdLine; items: { number: string; line: MdLine }[] };

export type MethodeIntroContent ={ label: string; title: string; text: string; hint: string };

export type MethodePageContent = {
  /** Nom du fichier (content/methode/pages/<slug>.md). */
  slug: string;
  header: {
    keywords: string[];
    image?: string;
    background?: HeaderImageBackground;
    /** Placement de l'image par appareil (absent : image entière, calée en bas). */
    placement?: { desktop?: HeaderImagePlacement; mobile?: HeaderImagePlacement };
    texts?: HeaderImageText[];
  };
  /** « En quelques mots » : groupes de paragraphes (un paragraphe par ligne) ou listes numérotées. */
  definition: MethodeDefinitionGroup[];
  intro?: MethodeProjectIntro;
  parts: MethodePart[];
  /** Bouton du projet ; labelMobile : texte en mobile ; available faux : page du projet pas encore accessible
      (projet « off » dans content/projects/ordre.yaml), bouton grisé. */
  project: { label: string; labelMobile: string; href: string; available: boolean };
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
  // Avec l'ordre des projets : un projet passé « off » ou rendu accessible change le bouton du projet.
  return readdirSync(METHODE_DIR, { recursive: true, encoding: "utf8" }).reduce(
    (latest, file) => Math.max(latest, statSync(path.join(METHODE_DIR, file)).mtimeMs),
    statSync(PROJECTS_ORDER_FILE).mtimeMs,
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

/**
 * Une ligne de texte (lib/markdown) ; un lien vers un projet pas encore accessible (« off » dans
 * content/projects/ordre.yaml) devient du texte regular, sans lien ni italique (demande de l'utilisateur).
 */
function parseMethodeLine(line: string, fail: (message: string) => never): MdLine {
  return parseLine(line, fail).map((part) =>
    part.href && !linkAvailable(part.href) ? { text: part.text, ...(part.bold ? { bold: true } : {}) } : part,
  );
}

/** Groupes séparés par une ligne vide ; dans un groupe, une ligne par paragraphe. */
/**
 * « En quelques mots » : groupes séparés par une ligne vide. Un groupe dont les lignes sont « 1. texte »
 * (précédées au besoin d'un « #### Titre ») est une liste numérotée ; sinon, un paragraphe par ligne.
 */
function definitionGroups(source: string, fail: (message: string) => never): MethodeDefinitionGroup[] {
  return source
    .split(/\n\s*\n/)
    .map((group) => group.trim())
    .filter(Boolean)
    .map((group): MethodeDefinitionGroup => {
      const lines = group.split("\n").map((line) => line.trim());
      const titled = lines[0].startsWith("#### ");
      const rest = titled ? lines.slice(1) : lines;
      if (rest.length > 0 && rest.every((line) => NUMBERED.test(line))) {
        return {
          kind: "numbered",
          ...(titled ? { title: parseMethodeLine(lines[0].slice(5), fail) } : {}),
          items: rest.map((line) => {
            const [, number, text] = line.match(NUMBERED)!;
            return { number: `${number}.`, line: parseMethodeLine(text, fail) };
          }),
        };
      }
      if (titled) fail("« En quelques mots » : « #### Titre » se place juste avant une liste « 1. texte ».");
      return { kind: "text", lines: lines.map((line) => parseMethodeLine(line, fail)) };
    });
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
const AUDIO = /^~\s*(\S+)\s*\|\s*(.+)$/;

/** Extrait audio : le fichier doit exister dans le dossier des images de la page. */
function audio(source: string, folder: string, fail: (message: string) => never): MethodeElement {
  const [, name, caption] = source.match(AUDIO)!;
  const file = path.join(METHODE_IMAGES_DIR, path.relative("methode", folder), name);
  if (!existsSync(file)) fail(`fichier audio introuvable : ${path.relative(process.cwd(), file)}.`);
  return { kind: "audio", src: `/${folder}/${name}`, caption: caption.trim() };
}

function image(source: string, folder: string, fail: (message: string) => never): MethodeImage {
  const [, alt, name] = source.match(IMAGE)!;
  const src = `/${folder}/${name}`;
  return { src, alt, ...imageSize(path.join(METHODE_IMAGES_DIR, path.relative("methode", folder), name), fail) };
}

function element(source: string, folder: string, fail: (message: string) => never): MethodeElement {
  const lines = source.split("\n").map((line) => line.trim());
  const [first] = lines;
  if (lines.length === 1 && first.startsWith("#### ")) return { kind: "subtitle", line: parseMethodeLine(first.slice(5), fail) };
  if (lines.length > 1 && first.startsWith("##### ")) {
    return {
      kind: "titled",
      title: parseMethodeLine(first.slice(6), fail),
      lines: lines.slice(1).map((line) => parseMethodeLine(line, fail)),
    };
  }
  if (lines.length === 1 && AUDIO.test(first)) return audio(first, folder, fail);
  if (lines.length === 1 && IMAGE.test(first)) return { kind: "image", ...image(first, folder, fail) };
  if (lines.length === 1 && FIGURE.test(first)) {
    const [, value, label] = first.match(FIGURE)!;
    return { kind: "figure", value, label: parseMethodeLine(label, fail) };
  }
  if (NUMBERED.test(first)) {
    // Chaque « 1. » commence un élément ; les lignes suivantes sans numéro sont ses paragraphes suivants.
    const items: MethodeNumberedItem[] = [];
    for (const line of lines) {
      const numbered = line.match(NUMBERED);
      if (numbered) {
        const [, number, text] = numbered;
        items.push(
          IMAGE.test(text)
            ? { number: `${number}.`, image: image(text, folder, fail), paragraphs: [] }
            : { number: `${number}.`, paragraphs: [parseMethodeLine(text, fail)] },
        );
      } else {
        items[items.length - 1].paragraphs.push(parseMethodeLine(line, fail));
      }
    }
    return { kind: "numbered", items };
  }
  if (lines.every((line) => line.startsWith("- "))) {
    return { kind: "bullets", items: lines.map((line) => parseMethodeLine(line.slice(2), fail)) };
  }
  if (lines.every((line) => line.startsWith("> "))) {
    return { kind: "caption", lines: lines.map((line) => parseMethodeLine(line.slice(2), fail)) };
  }
  return { kind: "text", lines: lines.map((line) => parseMethodeLine(line, fail)) };
}

/** Éléments d'un morceau de texte, séparés par une ligne vide. */
function elements(source: string, folder: string, fail: (message: string) => never): MethodeElement[] {
  return source
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => element(item, folder, fail));
}

/**
 * Bloc : éléments en pleine largeur, et deux colonnes entre « << » et « >> » (« || » ou « || bas » passe
 * à droite). Sans « << », « || » met à gauche tout ce qui le précède dans le bloc ; sans « >> », les colonnes
 * vont jusqu'au bout du bloc.
 */
function block(source: string, folder: string, fail: (message: string) => never): MethodeBlock {
  const pieces = source.split(/^(<<|>>|\|\|(?:[ \t]+bas)?)[ \t]*$/m);
  const rows: MethodeBlock = [];
  let full: MethodeElement[] = [];
  let pair: { left: MethodeElement[]; right: MethodeElement[] | null; alignEnd: boolean } | null = null;
  const flushFull = () => {
    if (full.length > 0) rows.push({ columns: [full], alignEnd: false });
    full = [];
  };
  const flushPair = () => {
    if (pair) rows.push({ columns: pair.right ? [pair.left, pair.right] : [pair.left], alignEnd: pair.alignEnd });
    pair = null;
  };
  pieces.forEach((piece, i) => {
    if (i % 2 === 0) {
      const items = elements(piece, folder, fail);
      if (!pair) full.push(...items);
      else (pair.right ?? pair.left).push(...items);
      return;
    }
    const marker = piece.trim();
    if (marker === "<<") {
      if (pair) fail("« << » : les colonnes précédentes ne sont pas fermées par « >> ».");
      flushFull();
      pair = { left: [], right: null, alignEnd: false };
    } else if (marker === ">>") {
      if (!pair) fail("« >> » sans « << » avant.");
      flushPair();
    } else {
      if (pair?.right) fail("deux colonnes au plus (un seul « || » entre « << » et « >> »).");
      if (!pair) {
        pair = { left: full, right: null, alignEnd: false };
        full = [];
      }
      pair!.right = [];
      pair!.alignEnd = marker.endsWith("bas");
    }
  });
  flushPair();
  flushFull();
  return rows;
}

/** Blocs séparés par « --- ». */
function blocks(source: string, folder: string, fail: (message: string) => never): MethodeBlock[] {
  return source
    .split(/^---[ \t]*$/m)
    .map((chunk) => block(chunk, folder, fail))
    .filter((rows) => rows.length > 0);
}

/** Retire les commentaires : lignes commençant par « # » suivi d'un espace. */
const withoutComments = (body: string) =>
  body
    .split("\n")
    .filter((line) => !/^#\s/.test(line) && line.trim() !== "#")
    .join("\n");

/** « ## Titre » : partie ; « ### Sous-titre » ou « ### » seul : sous-partie ; puis blocs. */
function parts(source: string, folder: string, fail: (message: string) => never): MethodePart[] {
  return source
    .split(/^(?=##[ \t])/m)
    .map((chunk) => {
      const titled = chunk.startsWith("## ");
      const [heading, ...rest] = titled ? chunk.split("\n") : ["", chunk];
      const subparts = rest
        .join("\n")
        .split(/^(?=###(?:[ \t]|$))/m)
        .map((sub) => {
          const subTitled = /^###(?:[ \t]|$)/m.test(sub.split("\n")[0]);
          const [subHeading, ...subRest] = subTitled ? sub.split("\n") : ["", sub];
          const title = subHeading.replace(/^###/, "").trim();
          return {
            ...(title ? { title: parseMethodeLine(title, fail) } : {}),
            blocks: blocks(subRest.join("\n"), folder, fail),
          };
        })
        .filter((sub) => sub.title || sub.blocks.length > 0);
      return { ...(titled ? { title: parseMethodeLine(heading.slice(3).trim(), fail) } : {}), subparts };
    })
    .filter((part) => part.title || part.subparts.length > 0);
}

/** Lien vers une page projet (/projects/<dossier>) : accessible seulement si le projet n'est pas « off ». */
function linkAvailable(href: string) {
  const match = href.match(/^\/projects\/([^/?#]+)/);
  return match ? isProjectAvailable(match[1]) : true;
}

/** Introduction au projet cité : content/methode/projets/<slug>.md (lue une fois par page qui le cite). */
function projectIntro(slug: string) {
  const { body, text } = read(`projets/${slug}.md`);
  const intro: MethodeProjectIntro = {
    slug,
    title: text("titre")!,
    blocks: blocks(withoutComments(body), `methode/projets/${slug}`, (message) => {
      throw new Error(`content/methode/projets/${slug}.md : ${message}`);
    }),
  };
  return { intro, label: text("bouton")!, labelMobile: text("bouton_mobile")!, href: text("lien")! };
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

  // Projet cité : son introduction et son bouton viennent de content/methode/projets/<projet>.md.
  // Sans « projet » (pages pas encore rédigées) : bouton « projet_bouton » / « projet_lien », sans introduction.
  const projectSlug = text("projet", true)?.trim();
  if (projectSlug && !existsSync(path.join(METHODE_DIR, "projets", `${projectSlug}.md`))) {
    fail(`le projet « ${projectSlug} » n'existe pas (content/methode/projets/${projectSlug}.md).`);
  }
  const project = projectSlug ? projectIntro(projectSlug) : null;
  const legacyLabel = project ? "" : text("projet_bouton")!;

  return {
    slug,
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
    definition: definitionGroups(text("definition")!, fail),
    ...(project ? { intro: project.intro } : {}),
    parts: parts(withoutComments(body), folder, fail),
    project: project
      ? { label: project.label, labelMobile: project.labelMobile, href: project.href, available: linkAvailable(project.href) }
      : { label: legacyLabel, labelMobile: legacyLabel, href: text("projet_lien")!, available: linkAvailable(text("projet_lien")!) },
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
