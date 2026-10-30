import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { Photo } from "@/components/ui/Photos";

/*
 * Photos du carrousel : images dans public/photos/, ordre, descriptions et couleur des boutons
 * dans content/photos/ordre.yaml.
 * Une image absente de la liste n'est pas affichée ; une entrée sans image correspondante bloque la compilation.
 * À n'utiliser que côté serveur (lecture du disque).
 */

const ORDER_FILE = path.join(process.cwd(), "content", "photos", "ordre.yaml");
const IMAGES_DIR = path.join(process.cwd(), "public", "photos");

/** Valeurs de « bouton » dans ordre.yaml → couleur des boutons. */
const BUTTON_COLORS = { blanc: "white", noir: "black" } as const;

function fail(message: string): never {
  throw new Error(`Photos (content/photos/ordre.yaml) : ${message}`);
}

/** Photos listées dans ordre.yaml, dans cet ordre. */
export function getPhotos(): Photo[] {
  if (!existsSync(ORDER_FILE)) fail("fichier introuvable.");
  const entries = parse(readFileSync(ORDER_FILE, "utf8")) ?? [];
  if (!Array.isArray(entries)) fail("le fichier doit être une liste (« - fichier: … », « description: … », « bouton: … » par photo).");

  const files: string[] = [];
  return entries.map((entry: unknown, i) => {
    const { fichier, description, bouton } = (entry ?? {}) as Record<string, unknown>;
    const position = `photo n°${i + 1}`;

    if (typeof fichier !== "string" || !fichier) fail(`${position} : « fichier » est obligatoire.`);
    if (typeof description !== "string" || !description) fail(`${position} (${fichier}) : « description » est obligatoire.`);
    if (bouton !== "blanc" && bouton !== "noir") fail(`${position} (${fichier}) : « bouton » doit valoir blanc ou noir.`);
    if (files.includes(fichier)) fail(`« ${fichier} » est listé deux fois.`);
    if (!existsSync(path.join(IMAGES_DIR, fichier))) fail(`l'image « ${fichier} » est introuvable dans public/photos/.`);
    files.push(fichier);

    // Nom encodé : les noms de fichier avec « = » ou « , » cassent sinon l'optimiseur d'images (erreur 404).
    return { src: `/photos/${encodeURIComponent(fichier)}`, description, buttonColor: BUTTON_COLORS[bouton] };
  });
}
