import { leafDefs } from "../SiteIntro";
import { tokenDuration } from "../token-duration";

/*
 * Page 404, tige révélée (demande de l'utilisateur, première version à régler en test) :
 * principe de l'arrivée de l'intro, à l'envers. Dans l'intro, des pétales partent du logo en spirale et deviennent
 * les lettres ; ici, chaque « 4 » se replie (rotation et rebond de l'intro, inversés) et devient une feuille de
 * l'intro, qui part en spirale et rentre dans le logo. Le logo tourne pendant toute la séquence et « avale »
 * chaque feuille (petit rebond).
 * Durées : tokens --not-found-*-duration. Les autres valeurs (angles, rebonds, tailles) sont celles de l'intro ou
 * des valeurs d'essai signalées.
 */

const NS = "http://www.w3.org/2000/svg";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x * x;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const overshoot = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const n = (v: number, d = 2) => v.toFixed(d);

/** Décalage entre les deux « 4 » (intro : 120 ms entre deux pétales). */
const stagger = 120;
/** Tours de spirale de la feuille (intro : 320°). */
const spiralTurn = 320;
/** Longueur de la feuille, en part de la hauteur du « 4 » (valeur d'essai). */
const leafLength = 0.45;
/** Longueur de la feuille de l'intro (pétiole + limbe), repère feuille. */
const leafUnits = 124;
/** Tours du logo pendant la séquence (valeur d'essai). */
const logoTurns = 1;
/** Rebond du logo quand une feuille y entre (valeur d'essai). */
const gulp = 0.08;

export function playPlantSequence(
  svg: SVGSVGElement,
  parts: { digits: HTMLElement[]; logo: HTMLElement },
  onEnd: () => void,
) {
  const read = (token: string) => tokenDuration(svg, token);
  const T = {
    leaf: read("--not-found-leaf-duration"),
    spiral: read("--not-found-spiral-duration"),
    spin: read("--not-found-spin-duration"),
  };

  svg.innerHTML = "";
  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML = leafDefs("not-found-leaf");
  svg.appendChild(defs);

  const logoBox = parts.logo.getBoundingClientRect();
  const end = [logoBox.left + logoBox.width / 2, logoBox.top + logoBox.height / 2] as const;
  const leaves = parts.digits.map((digit) => {
    const box = digit.getBoundingClientRect();
    const use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#not-found-leaf");
    use.style.opacity = "0";
    svg.appendChild(use);
    return {
      digit,
      use,
      start: [box.left + box.width / 2, box.top + box.height / 2] as const,
      scale: (box.height * leafLength) / leafUnits,
    };
  });
  /** Fin de la spirale de chaque feuille (rebond du logo). */
  const arrivals = leaves.map((_, i) => i * stagger + T.leaf * 0.6 + T.spiral);
  const total = Math.max(T.spin, ...arrivals.map((a) => a + 400));

  let frame = 0;
  let begin = 0;
  const tick = (now: number) => {
    if (!begin) begin = now;
    const ms = now - begin;

    leaves.forEach((leaf, i) => {
      const t = ms - i * stagger;
      // « 4 » qui se replie : apparition des lettres de l'intro, à l'envers.
      const fold = clamp(t / T.leaf);
      const u = 1 - fold;
      leaf.digit.style.transform = `rotate(${n(-150 * (1 - easeOut(u)), 1)}deg) scale(${n(Math.max(overshoot(u), 0), 4)})`;
      leaf.digit.style.opacity = fold < 1 ? "1" : "0";

      // Feuille : naît pendant le repli, puis spirale jusqu'au centre du logo en rapetissant.
      const born = easeOut(clamp((t - T.leaf * 0.3) / (T.leaf * 0.5)));
      const travel = easeInOut(clamp((t - T.leaf * 0.6) / T.spiral));
      const spin = (spiralTurn * travel * Math.PI) / 180;
      const dx = (leaf.start[0] - end[0]) * (1 - travel);
      const dy = (leaf.start[1] - end[1]) * (1 - travel);
      const x = end[0] + dx * Math.cos(spin) - dy * Math.sin(spin);
      const y = end[1] + dx * Math.sin(spin) + dy * Math.cos(spin);
      // Pointe tournée vers le centre du logo (pétiole à l'arrière).
      const toward = (Math.atan2(end[1] - y, end[0] - x) * 180) / Math.PI;
      const s = Math.max(leaf.scale * born * (1 - easeIn(travel)), 0.0001);
      leaf.use.setAttribute(
        "transform",
        `translate(${n(x)} ${n(y)}) rotate(${n(toward, 1)}) scale(${n(s, 4)}) translate(${-leafUnits / 2} 0)`,
      );
      leaf.use.style.opacity = born > 0 && travel < 1 ? "1" : "0";
    });

    // Logo : tourne pendant toute la séquence, rebondit quand une feuille entre.
    const turn = 360 * logoTurns * easeInOut(clamp(ms / T.spin));
    const bump = arrivals.reduce((sum, at) => {
      const p = clamp((ms - at) / 400);
      return sum + (p > 0 && p < 1 ? gulp * Math.sin(p * Math.PI) : 0);
    }, 0);
    parts.logo.style.transform = `rotate(${n(turn, 1)}deg) scale(${n(1 + bump, 4)})`;

    if (ms < total) frame = requestAnimationFrame(tick);
    else {
      parts.logo.style.transform = "";
      svg.innerHTML = "";
      onEnd();
    }
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
