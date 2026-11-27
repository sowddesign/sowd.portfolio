/*
 * Adresse d'une page de la méthode, utilisable côté serveur comme côté client (pages projet, conteneur de la méthode).
 * Ex. methodeHref("design-system") → "/?methode=design-system".
 */
export function methodeHref(slug: string) {
  return `/?methode=${encodeURIComponent(slug)}`;
}
