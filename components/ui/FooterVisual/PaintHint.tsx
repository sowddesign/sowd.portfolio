"use client";

import { useEffect, useRef } from "react";

/*
 * Consigne « Appuie  et  glisse » de footerVisual (Figma : bloc « smallAnim », tablette et mobile),
 * affichée sur écran tactile tant qu'aucun logo n'est coloré.
 * Texte captionSwiss/small/accentuation, couleur text/brand/dark (doubles espaces conservés).
 *
 * Animation (demandée hors Figma, valeurs validées par l'utilisateur) : le texte imite un doigt.
 * Appui de 1 s (il rétrécit à 91 % puis reste immobile), faux départ dans une direction au hasard,
 * puis 3 à 5 gestes courbes qui accélèrent et freinent (profil « minimum jerk »), avec pauses,
 * dépassements corrigés et légère inclinaison dans le sens du mouvement ; sortie à droite, en haut
 * ou en bas. Un nouveau trajet est tiré à chaque boucle.
 * Mouvement réduit : texte affiché immobile.
 */

const PRESS = 1000; // appui (ms)
const PRESS_SHRINK = 320; // rétrécissement pendant l'appui (ms)
const RELEASE = 380; // relâche : reprend sa taille en s'effaçant (ms)
const HIDDEN = 380; // retour invisible au départ (ms)
const APPEAR = 380; // réapparition (ms)
const PRESSED_SCALE = 0.91; // taille pendant l'appui (Figma)
const Y_RANGE = 62; // écart vertical maximal des gestes (px)
const EXIT_Y = 120; // sortie par le haut ou le bas : hors de la frame (px)
const FRAME_MS = 16; // pas d'échantillonnage des images clés

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randSign = () => (Math.random() < 0.5 ? -1 : 1);
const clampY = (y: number, margin = 0) => Math.max(-Y_RANGE - margin, Math.min(Y_RANGE + margin, y));
// Profil de vitesse d'un geste humain (minimum jerk) et lissage simple.
const minJerk = (t: number) => t * t * t * (10 - 15 * t + 6 * t * t);
const smooth = (t: number) => t * t * (3 - 2 * t);

type Point = [number, number];
type Stroke = { from: Point; control: Point; to: Point; duration: number; pause: number };

/** Trajet d'une boucle : faux départ, gestes vers la droite, sortie. width = distance horizontale disponible. */
function planStrokes(width: number) {
  const strokes: Stroke[] = [];
  let at: Point = [0, 0];
  const add = (to: Point, curve: number, durationScale = 1, pause = 0) => {
    const dx = to[0] - at[0];
    const dy = to[1] - at[1];
    const distance = Math.hypot(dx, dy) || 1;
    // Point de contrôle décalé perpendiculairement : geste en arc.
    const control: Point = [(at[0] + to[0]) / 2 - (dy / distance) * curve * distance, (at[1] + to[1]) / 2 + (dx / distance) * curve * distance];
    // Durée : un long geste prend plus de temps, sans être proportionnel.
    strokes.push({ from: at, control, to, duration: (200 + 36 * Math.sqrt(distance)) * durationScale, pause });
    at = to;
  };

  // Faux départ : un petit écart vers la gauche, en haut ou en bas.
  const falseStart = randSign();
  add([-rand(10, 24), falseStart * rand(10, 22)], rand(-0.3, 0.3), 1.3, rand(140, 320));

  let x = 0;
  let direction = -falseStart;
  const count = Math.floor(rand(2, 4));
  for (let i = 0; i < count; i++) {
    x = Math.min(width * 0.92, x + width * rand(0.16, 0.34));
    const y = clampY(direction * rand(18, 58));
    if (Math.random() < 0.5) {
      // Dépassement puis correction.
      add([x + rand(10, 26), clampY(y + direction * rand(6, 14), 10)], rand(0.12, 0.32) * randSign());
      add([x, y], rand(-0.1, 0.1), 0.7, rand(60, 200));
    } else {
      add([x, y], rand(0.12, 0.35) * randSign(), 1, rand(40, 260));
    }
    if (Math.random() < 0.7) direction = -direction;
  }

  const exit = Math.floor(Math.random() * 3);
  const exitX = Math.min(width, x + width * rand(0.1, 0.25));
  add(exit === 0 ? [width + 20, rand(-30, 30)] : [exitX, exit === 1 ? -EXIT_Y : EXIT_Y], rand(0.1, 0.3) * randSign(), 0.9);
  return strokes;
}

/** Images clés d'une boucle (translation, inclinaison, taille, opacité). */
function buildKeyframes(width: number) {
  const strokes = planStrokes(width);
  const travel = strokes.reduce((sum, s) => sum + s.duration + s.pause, 0);
  const total = PRESS + travel + RELEASE + HIDDEN + APPEAR;
  const last = strokes[strokes.length - 1].to;
  const steps = Math.round(total / FRAME_MS);
  const keyframes: Keyframe[] = [];
  let previousX = 0;
  let tilt = 0;

  for (let k = 0; k <= steps; k++) {
    const ms = (k / steps) * total;
    let x = 0;
    let y = 0;
    let scale = 1;
    let opacity = 1;

    if (ms < PRESS) {
      scale = 1 - (1 - PRESSED_SCALE) * minJerk(Math.min(ms / PRESS_SHRINK, 1));
    } else if (ms < PRESS + travel) {
      let t = ms - PRESS;
      let stroke = strokes[strokes.length - 1];
      for (const s of strokes) {
        if (t <= s.duration + s.pause) {
          stroke = s;
          break;
        }
        t -= s.duration + s.pause;
      }
      const u = Math.min(t / stroke.duration, 1);
      const e = minJerk(u);
      const q = 1 - e;
      x = q * q * stroke.from[0] + 2 * q * e * stroke.control[0] + e * e * stroke.to[0];
      y = q * q * stroke.from[1] + 2 * q * e * stroke.control[1] + e * e * stroke.to[1];
      // Pression : le texte rétrécit très légèrement pendant chaque geste.
      scale = PRESSED_SCALE - 0.012 * Math.sin(Math.PI * u);
    } else if (ms < PRESS + travel + RELEASE) {
      const s = smooth((ms - PRESS - travel) / RELEASE);
      [x, y] = last;
      scale = PRESSED_SCALE + (1 - PRESSED_SCALE) * s;
      opacity = 1 - s;
    } else if (ms < PRESS + travel + RELEASE + HIDDEN) {
      opacity = 0;
    } else {
      opacity = smooth((ms - PRESS - travel - RELEASE - HIDDEN) / APPEAR);
    }

    // Inclinaison dans le sens du mouvement (± 4°), lissée.
    const velocity = x - previousX;
    previousX = x;
    tilt = opacity === 0 ? 0 : tilt + (Math.max(-4, Math.min(4, velocity * 0.9)) - tilt) * 0.18;

    keyframes.push({
      offset: k / steps,
      opacity,
      transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    });
  }
  return { keyframes, total };
}

export function PaintHint({ animated }: { animated: boolean }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const text = textRef.current;
    if (!area || !text || !animated) return;

    let animation: Animation | undefined;
    const loop = () => {
      const { keyframes, total } = buildKeyframes(Math.max(area.clientWidth - text.offsetWidth, 0));
      animation?.cancel();
      animation = text.animate(keyframes, { duration: total });
      animation.onfinish = loop;
    };
    loop();
    window.addEventListener("resize", loop);
    return () => {
      window.removeEventListener("resize", loop);
      animation?.cancel();
    };
  }, [animated]);

  return (
    // Zone du bloc Figma « smallAnim » : largeur intérieure de la frame, hauteur 108px (valeur fixe sans variable), texte centré verticalement.
    <div
      ref={areaRef}
      className="pointer-events-none absolute inset-x-md top-lg flex h-[108px] items-center tablet:inset-x-lg"
    >
      <span
        ref={textRef}
        className="type-swiss-small-accentuation origin-left whitespace-pre text-text-brand-dark will-change-transform"
      >
        Appuie  et  glisse
      </span>
    </div>
  );
}
