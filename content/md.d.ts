/* Fichiers de textes du dossier content/, transformés en { clé: texte, liste ou liste de blocs } par scripts/texts-loader.cjs. */
declare module "*.md" {
  const texts: Record<string, string | string[] | Record<string, string>[]>;
  export default texts;
}
