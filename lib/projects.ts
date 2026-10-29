import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/*
 * Contenu des projets : un dossier par projet dans public/projects/<slug>/,
 * avec un index.md (infos en en-tête, puis texte de la page projet) et ses images.
 * Les dossiers commençant par « _ » sont ignorés (ex. _modele, à dupliquer pour un nouveau projet).
 * « order » numérote les projets dans l'ordre d'ajout : le plus grand s'affiche en premier
 * et devient automatiquement le projet nouveau (libellé « Nouveau », tuile « new ») ; les autres ont la tuile « default ».
 * À n'utiliser que côté serveur (lecture du disque).
 */

const PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

export type Project = {
  /** Nom du dossier, utilisé dans l'URL de la page projet. */
  slug: string;
  title: string;
  type?: string;
  year: string;
  tags: string[];
  /** Projet le plus récent (plus grand « order ») : libellé « Nouveau ». */
  isNew: boolean;
  /** Numéro d'ajout : le plus grand s'affiche en premier. */
  order: number;
  /** Chemin public de l'image de la tuile, ex. /projects/mon-projet/cover.jpg. */
  image: string;
  href: string;
  /** Tuile « new » pour le projet nouveau, « default » sinon. */
  layout: "default" | "new" | "autres";
  /** Texte sous l'en-tête de index.md, pour la future page projet. */
  content: string;
};

function fail(slug: string, message: string): never {
  throw new Error(`Projet « ${slug} » (public/projects/${slug}/index.md) : ${message}`);
}

function readProject(slug: string): Omit<Project, "isNew" | "layout"> {
  const source = readFileSync(path.join(PROJECTS_DIR, slug, "index.md"), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail(slug, "l'en-tête doit être entouré de deux lignes « --- ».");

  const data = (parse(match[1]) ?? {}) as Record<string, unknown>;
  const { title, type, year, tags = [], order, image } = data;

  if (typeof title !== "string" || !title) fail(slug, "« title » est obligatoire.");
  if (year === undefined || year === null || year === "") fail(slug, "« year » est obligatoire.");
  if (typeof order !== "number") fail(slug, "« order » doit être un nombre.");
  if (typeof image !== "string" || !image) fail(slug, "« image » est obligatoire (nom du fichier, ex. cover.jpg).");
  if (!existsSync(path.join(PROJECTS_DIR, slug, image))) fail(slug, `l'image « ${image} » est introuvable dans le dossier.`);
  if (!Array.isArray(tags)) fail(slug, "« tags » doit être une liste.");

  return {
    slug,
    title,
    type: typeof type === "string" && type ? type : undefined,
    year: String(year),
    tags: tags.map(String),
    order,
    image: `/projects/${slug}/${image}`,
    href: `/projects/${slug}`,
    content: match[2].trim(),
  };
}

/** Tous les projets, du plus grand « order » au plus petit ; le premier est le projet nouveau. */
export function getProjects(): Project[] {
  const projects = readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .filter((entry) => existsSync(path.join(PROJECTS_DIR, entry.name, "index.md")))
    .map((entry) => readProject(entry.name))
    .sort((a, b) => b.order - a.order);

  projects.forEach((project, i) => {
    const next = projects[i + 1];
    if (next && next.order === project.order) {
      fail(project.slug, `« order: ${project.order} » est déjà utilisé par le projet « ${next.slug} ».`);
    }
  });

  return projects.map((project, i) => ({ ...project, isNew: i === 0, layout: i === 0 ? "new" : "default" }));
}
