/* Fichiers de textes du dossier content/, transformés en { clé: texte ou liste } par scripts/texts-loader.cjs. */
declare module "*.md" {
  const texts: Record<string, string | string[]>;
  export default texts;
}
