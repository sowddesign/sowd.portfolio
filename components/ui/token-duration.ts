/** Durée d'un token CSS en ms (la valeur calculée peut être réécrite en s : 5000ms → 5s). */
export function tokenDuration(element: Element, token: string) {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  const number = parseFloat(value) || 0;
  return value.endsWith("ms") ? number : value.endsWith("s") ? number * 1000 : number;
}
