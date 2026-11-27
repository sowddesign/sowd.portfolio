import { tokenDuration } from "../token-duration";
import { hiddenShapeSweepEvent, type HiddenShapeSweep } from "./HiddenShape";
import { tokenPx } from "./token-px";

/*
 * Page 404, bouton « Tout révéler » : une grande gomme invisible balaie l'écran en allers-retours, comme un pinceau
 * (demande de l'utilisateur), et découvre les formes cachées et la tige sur son passage (événement
 * hiddenShapeSweepEvent). La tige entièrement découverte lance la séquence de la fleur, comme au survol.
 * Rayon --not-found-sweep-radius × la proportion de l'écran, durée --not-found-sweep-duration (valeurs d'essai) ;
 * passes horizontales espacées de 1,5 rayon, du haut vers le bas, en alternant le sens.
 * Mouvement réduit : tout est découvert d'un coup.
 */

const emit = (x: number, y: number, radius: number) =>
  window.dispatchEvent(
    new CustomEvent<HiddenShapeSweep>(hiddenShapeSweepEvent, {
      detail: { x, y, radius },
    }),
  );

export function playRevealSweep(scale: number, reduced: boolean) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (reduced) {
    emit(w / 2, h / 2, Math.hypot(w, h));
    return;
  }
  const radius = tokenPx("--not-found-sweep-radius") * scale;
  const duration = tokenDuration(document.documentElement, "--not-found-sweep-duration");

  // Trajet en zigzag : une passe par rangée, débordant d'un rayon de chaque côté.
  const gap = radius * 1.5;
  const rows = Math.max(1, Math.ceil(h / gap));
  const points: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * (h / rows);
    const [a, b] = r % 2 ? [w + radius, -radius] : [-radius, w + radius];
    points.push([a, y], [b, y]);
  }
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((s, l) => s + l, 0);
  const at = (d: number): [number, number] => {
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i]) {
        const t = d / lengths[i];
        return [
          points[i][0] + (points[i + 1][0] - points[i][0]) * t,
          points[i][1] + (points[i + 1][1] - points[i][1]) * t,
        ];
      }
      d -= lengths[i];
    }
    return points[points.length - 1];
  };

  // Points émis tous les demi-rayons, pour ne laisser aucun trou entre deux images.
  const step = radius / 2;
  let done = 0;
  const start = performance.now();
  const frame = (now: number) => {
    const target = Math.min(1, (now - start) / duration) * total;
    for (; done <= target; done += step) emit(...at(done), radius);
    if (target < total) requestAnimationFrame(frame);
    else emit(...at(total), radius);
  };
  requestAnimationFrame(frame);
}
