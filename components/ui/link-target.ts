/*
 * Cible d'un lien ouvert dans un nouvel onglet (boutons de renvoi, liens des fiches méthode).
 * Lien interne : onglet nommé d'après l'adresse, pour que le navigateur réutilise l'onglet déjà ouvert par un lien
 * vers la même page au lieu d'en créer un autre (demande de l'utilisateur). Sans « noopener », qui empêcherait
 * de retrouver l'onglet par son nom : sans risque, la page ouverte est sur le même site.
 * Lien externe : nouvel onglet à chaque fois, isolé (noopener noreferrer).
 */
export function newTabProps(href: string) {
  if (/^https?:\/\//.test(href)) return { target: "_blank", rel: "noopener noreferrer" } as const;
  return { target: `sowd:${href}` } as const;
}
