/*
 * Vérification du numéro de téléphone du formulaire de contact (demande de l'utilisateur).
 * Séparateurs acceptés : espaces, points, tirets, barres obliques et parenthèses. « (0) » après l'indicatif est ignoré.
 * « 00 » en tête vaut « + ».
 *
 * Numéros nationaux (sans indicatif) :
 *   0 + 9 chiffres (10 chiffres) : France, Maroc, Suisse ;
 *   Canada : 10 chiffres (indicatif régional 2-9), précédés ou non de 1.
 * Numéros internationaux :
 *   +33 (France), +212 (Maroc), +41 (Suisse) : 9 chiffres, sans le 0 ;
 *   +1 (Canada, États-Unis) : 10 chiffres (indicatif régional 2-9) ;
 *   autre indicatif : 8 à 15 chiffres en tout, indicatif compris (maximum de la norme internationale E.164).
 * Lettres : impossibles à écrire dans le champ (filtre sanitize de ContacterContainer, demande de l'utilisateur).
 */

/* Canada : indicatif régional (2-9 puis 2 chiffres), puis 7 chiffres. */
const CANADA = /^[2-9]\d{9}$/;

export function isValidPhone(input: string): boolean {
  const text = input.trim().replace(/\(0\)/g, "");
  if (!/^\+?[\d\s.\-/()]+$/.test(text)) return false;
  const compact = text.replace(/[\s.\-/()]/g, "");

  const international = compact.startsWith("+") ? compact.slice(1) : compact.startsWith("00") ? compact.slice(2) : null;

  if (international !== null) {
    if (international.startsWith("1")) return CANADA.test(international.slice(1));
    if (/^(33|41)/.test(international)) return /^\d{2}[1-9]\d{8}$/.test(international);
    if (international.startsWith("212")) return /^212[1-9]\d{8}$/.test(international);
    return /^[1-9]\d{7,14}$/.test(international);
  }

  if (compact.startsWith("0")) return /^0[1-9]\d{8}$/.test(compact);
  return CANADA.test(compact.startsWith("1") ? compact.slice(1) : compact);
}
