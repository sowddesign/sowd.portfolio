import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/*
 * Contenu des projets : un dossier par projet dans content/projects/<slug>/ avec un index.md
 * (infos en en-tête, puis texte de la page projet), hors de public pour ne pas être téléchargeable ;
 * ses images dans public/projects/<slug>/ (servies par le site).
 * L'ordre d'affichage est la liste de content/projects/ordre.yaml : le premier de la liste
 * est automatiquement le projet nouveau (libellé « Nouveau », tuile « new ») ; les autres ont la tuile « default ».
 * Un dossier absent de la liste est masqué (ni tuile ni page) ; ex. _modele, à dupliquer pour un nouveau projet.
 * À n'utiliser que côté serveur (lecture du disque).
 */

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const ORDER_FILE = path.join(PROJECTS_DIR, "ordre.yaml");
const IMAGES_DIR = path.join(process.cwd(), "public", "projects");

export type Project = {
  /** Nom du dossier, utilisé dans l'URL de la page projet. */
  slug: string;
  title: string;
  type?: string;
  year: string;
  tags: string[];
  /** Premier projet de ordre.yaml : libellé « Nouveau ». */
  isNew: boolean;
  /** Chemin public de l'image de la tuile, ex. /projects/mon-projet/cover.jpg. */
  image: string;
  href: string;
  /** Tuile « new » pour le projet nouveau, « default » sinon. */
  layout: "default" | "new" | "autres";
  /** Texte sous l'en-tête de index.md, pour la future page projet. */
  content: string;
};

function fail(slug: string, message: string): never {
  throw new Error(`Projet « ${slug} » (content/projects/${slug}/index.md) : ${message}`);
}

function failOrder(message: string): never {
  throw new Error(`Ordre des projets (content/projects/ordre.yaml) : ${message}`);
}

function readProject(slug: string): Omit<Project, "isNew" | "layout"> {
  const source = readFileSync(path.join(PROJECTS_DIR, slug, "index.md"), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail(slug, "l'en-tête doit être entouré de deux lignes « --- ».");

  const data = (parse(match[1]) ?? {}) as Record<string, unknown>;
  const { title, type, year, tags = [], image } = data;

  if (typeof title !== "string" || !title) fail(slug, "« title » est obligatoire.");
  if (year === undefined || year === null || year === "") fail(slug, "« year » est obligatoire.");
  if (typeof image !== "string" || !image) fail(slug, "« image » est obligatoire (nom du fichier, ex. cover.jpg).");
  if (!existsSync(path.join(IMAGES_DIR, slug, image))) fail(slug, `l'image « ${image} » est introuvable dans public/projects/${slug}/.`);
  if (!Array.isArray(tags)) fail(slug, "« tags » doit être une liste.");

  return {
    slug,
    title,
    type: typeof type === "string" && type ? type : undefined,
    year: String(year),
    tags: tags.map(String),
    image: `/projects/${slug}/${image}`,
    href: `/projects/${slug}`,
    content: match[2].trim(),
  };
}

/** Noms des dossiers listés dans ordre.yaml, dans l'ordre d'affichage. */
function readOrder(): string[] {
  if (!existsSync(ORDER_FILE)) failOrder("fichier introuvable.");
  const order = parse(readFileSync(ORDER_FILE, "utf8")) ?? [];
  if (!Array.isArray(order)) failOrder("le fichier doit être une liste (une ligne « - dossier » par projet).");

  const slugs = order.map(String);
  slugs.forEach((slug, i) => {
    if (slugs.indexOf(slug) !== i) failOrder(`« ${slug} » est listé deux fois.`);
    if (!existsSync(path.join(PROJECTS_DIR, slug, "index.md"))) {
      failOrder(`« ${slug} » ne correspond à aucun dossier content/projects/${slug}/ avec un index.md.`);
    }
  });
  return slugs;
}

/** Projets listés dans ordre.yaml, dans cet ordre ; le premier est le projet nouveau. */
export function getProjects(): Project[] {
  return readOrder()
    .map(readProject)
    .map((project, i) => ({ ...project, isNew: i === 0, layout: i === 0 ? "new" : "default" }));
}
