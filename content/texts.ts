import accueilSource from "./pages/accueil.md";
import aProposSource from "./pages/a-propos.md";
import contactSource from "./pages/contact.md";
import projetsSource from "./pages/projets.md";
import communSource from "./commun.md";

/*
 * Textes du site, modifiables dans content/ : commun.md (en-tête, menu, pied de page, tuiles)
 * et un fichier par page dans content/pages/.
 * Chaque liste ci-dessous donne les clés attendues : une clé absente du fichier bloque la compilation
 * avec un message qui nomme le fichier et la clé.
 * Utilisable côté serveur comme côté client (fichiers lus à la compilation).
 */

function texts<const K extends string, const L extends string = never>(
  file: string,
  source: Record<string, string | string[]>,
  keys: readonly K[],
  /** Clés attendues sous forme de liste (« - » par ligne). */
  lists: readonly L[] = [],
) {
  for (const key of keys) {
    if (typeof source[key] !== "string") throw new Error(`content/${file} : le texte « ${key} » est manquant.`);
  }
  for (const key of lists) {
    if (!Array.isArray(source[key])) throw new Error(`content/${file} : la liste « ${key} » est manquante.`);
  }
  return source as Record<K, string> & Record<L, string[]>;
}

export const commun = texts("commun.md", communSource, [
  "site_titre",
  "site_description",
  "entete_accueil",
  "entete_projets",
  "entete_a_propos",
  "entete_contact",
  "menu_ouvrir",
  "menu_fermer",
  "naviguer_titre",
  "naviguer_accueil",
  "naviguer_showreel",
  "naviguer_demarche_ux",
  "naviguer_projets",
  "naviguer_a_propos",
  "contacter_titre",
  "contacter_linkedin",
  "contacter_instagram",
  "contacter_email",
  "contacter_telephone",
  "savoir_plus_titre",
  "savoir_plus_cv",
  "savoir_plus_demarche_ux",
  "savoir_plus_contacter",
  "visuel_afficher",
  "visuel_remettre_noir",
  "visuel_recommencer",
  "visuel_bien_joue",
  "pied_signature",
  "pied_annee",
  "pied_design_par",
  "tuile_nouveau",
  "tuile_voir_projet",
  "infos_numero",
  "infos_question",
  "infos_reponse",
]);

export const accueil = texts("pages/accueil.md", accueilSource, ["titre", "showreel", "demarche_ux"]);

export const projets = texts("pages/projets.md", projetsSource, [
  "titre",
  "recent_details",
  "recent_titre",
  "autres_details",
  "autres_titre",
]);

export const aPropos = texts(
  "pages/a-propos.md",
  aProposSource,
  ["titre", "entete_details", "entete_titre", "entete_image", "faq_titre"],
  ["entete_tags"],
);

export const contact = texts("pages/contact.md", contactSource, ["titre"]);
