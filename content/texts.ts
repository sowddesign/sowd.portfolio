import accueilSource from "./pages/accueil.md";
import aProposSource from "./pages/a-propos.md";
import contactSource from "./pages/contact.md";
import projetsSource from "./pages/projets.md";
import communSource from "./commun.md";
import { iconNames, type IconName } from "@/components/ui/Icon/icon-names";

/*
 * Textes du site, modifiables dans content/ : commun.md (en-tête, menu, pied de page, tuiles)
 * et un fichier par page dans content/pages/.
 * Chaque liste ci-dessous donne les clés attendues : une clé absente du fichier bloque la compilation
 * avec un message qui nomme le fichier et la clé.
 * Utilisable côté serveur comme côté client (fichiers lus à la compilation).
 */

function texts<const K extends string, const L extends string = never>(
  file: string,
  source: Record<string, string | string[] | Record<string, string>[]>,
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
  "message_curieux",
  "message_decouvre",
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
  "photos_precedente",
  "photos_suivante",
  "photos_fermer",
  "photos_appuie",
  "champ_supprimer",
  "curseur_menu_ouvrir",
  "curseur_menu_fermer",
  "curseur_visuel_afficher",
  "curseur_visuel_remettre_noir",
  "curseur_voir_projet",
  "curseur_photos_precedente",
  "curseur_photos_suivante",
  "curseur_photos_fermer",
  "curseur_champ_supprimer",
  "curseur_agrandir",
  "curseur_regarder_dessous",
  "curseur_video_lecture",
  "curseur_video_pause",
  "curseur_couper_son",
  "curseur_remettre_son",
  "curseur_video_fermer",
  "video_lecture",
  "video_pause",
  "video_couper_son",
  "video_remettre_son",
  "video_son_coupe",
  "video_volume",
  "video_progression",
  "video_agrandir",
  "video_fermer",
  "chargement_progression",
  "double_probleme",
  "double_solution",
  "double_decouvrir",
  "double_definir",
  "double_developper",
  "double_livrer",
  "double_texte_diamants",
  "double_texte_probleme",
  "double_texte_01",
  "double_texte_02",
  "double_texte_solution",
  "double_texte_03",
  "double_texte_04",
  "double_decouvrir_methode",
  "double_continuer",
  "double_retour",
  "double_afficher_diamants",
  "double_revoir_methode",
  "double_copyright",
  "methode_definition_titre",
  "methode_projet_titre",
  "methode_projet_titre_mobile",
  "methode_etape_suivante",
  "methode_precedente",
  "methode_suivante",
  "methode_ouvrir",
  "methode_fermer",
  "methode_agrandir",
  "methode_image_fermer",
  "methode_terminees",
]);

export const accueil = texts("pages/accueil.md", accueilSource, [
  "titre",
  "showreel",
  "demarche_ux",
  "demarche_methode",
  "demarche_methode_nom",
  "demarche_description",
  "demarche_copyright",
  "showreel_duree",
  "showreel_logiciel",
  "showreel_attends",
  "showreel_metier",
  "showreel_projets",
  "appliquer_methode",
  "appliquer_methode_nom",
], ["showreel_mots_cles"]);

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

export const contact = texts("pages/contact.md", contactSource, [
  "titre",
  "photos_texte",
  "formulaire_details",
  "formulaire_titre",
  "message_titre",
  "message_details",
  "message_obligatoire",
  "message_icone",
  "envoyer",
  "envoye",
]);

/* Champs du formulaire de contact (content/pages/contact.md) : ordre, textes, obligatoire, icône et type. */

export type ContactFieldType = "texte" | "email" | "telephone";

export type ContactField = {
  titre: string;
  /** Vide : pas de texte sous le trait. */
  details: string;
  obligatoire: boolean;
  /** Absente : pas d'icône avant le texte. */
  icone?: IconName;
  type: ContactFieldType;
};

const fieldTypes: readonly ContactFieldType[] = ["texte", "email", "telephone"];

function contactField(where: string, block: Record<string, string | undefined>): ContactField {
  const fail = (message: string): never => {
    throw new Error(`content/pages/contact.md, ${where} : ${message}`);
  };
  const titre = block.titre ?? fail("le texte « titre » est manquant.");
  const obligatoire = block.obligatoire ?? "non";
  if (obligatoire !== "oui" && obligatoire !== "non") fail(`« obligatoire » doit valoir oui ou non (« ${obligatoire} »).`);
  const icone = block.icone ?? "";
  if (icone !== "" && !(iconNames as readonly string[]).includes(icone)) {
    fail(`l'icône « ${icone} » n'existe pas dans public/icons.`);
  }
  const type = block.type ?? "texte";
  if (!(fieldTypes as readonly string[]).includes(type)) fail(`« type » doit valoir texte, email ou telephone (« ${type} »).`);
  return {
    titre,
    details: block.details ?? "",
    obligatoire: obligatoire === "oui",
    icone: icone === "" ? undefined : (icone as IconName),
    type: type as ContactFieldType,
  };
}

const contactFieldBlocks = contactSource.champs;
if (!Array.isArray(contactFieldBlocks) || !contactFieldBlocks.every((block) => typeof block === "object")) {
  throw new Error("content/pages/contact.md : la liste de blocs « champs » est manquante.");
}

/** Champs deux par ligne à partir de la tablette, dans l'ordre du fichier. */
export const contactFields = (contactFieldBlocks as Record<string, string>[]).map((block, index) =>
  contactField(`champ n° ${index + 1}`, block),
);

/** Zone du message, pleine largeur au-dessus du bouton Envoyer. */
export const contactMessage = contactField("message", {
  titre: contact.message_titre,
  details: contact.message_details,
  obligatoire: contact.message_obligatoire,
  icone: contact.message_icone,
});
