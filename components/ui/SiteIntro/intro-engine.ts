import { petal, petalCenter, petalCount, petalOffsetXY } from "../ShowreelLogo";
import { tokenDuration } from "../token-duration";
import {
  leafAnchor,
  leafDefs,
  leaves,
  letterMiddle,
  letters,
  logotypeHeight,
  logotypeWidth,
  stemBase,
  stemLine,
  stemPath,
  stemPoint,
} from "./intro-geometry";

/*
 * Moteur de l'intro du site (démo validée par l'utilisateur), dessiné image par image dans un SVG plein écran :
 * 1. la tige pousse (bouton floral à la pointe), les feuilles se déplient, le logo éclot au centre de l'écran ;
 * 2. la tige et les feuilles rentrent ; si la page n'est pas chargée, le moteur s'arrête (onWait) : le composant joue
 *    la boucle du logo « 01 » à la même place ; page chargée, la boucle s'efface, puis après --site-intro-loop-gap le
 *    composant relance le moteur (resume) : le logo au repos revient en fondu (--site-intro-loop-fade) ;
 * 3. quatre pétales partent en spirale et deviennent s, o, w, d pendant que la fleur se décale à gauche ;
 *    les pétales repoussent en se dépliant depuis leur base ;
 * 4. le logo rejoint ses cibles (logo de l'en-tête) ; sans cible, la fleur, ou la fleur et « sowd », se referment
 *    sur place (choix de l'utilisateur) ; onLanded à l'arrivée.
 * Durées : tokens --site-intro-*. Les autres valeurs (tailles relatives, angles, décalages) sont celles de la démo.
 */

export type IntroTargets = { mark: DOMRect | null; type: DOMRect | null };
export type IntroCallbacks = {
  isLoaded: () => boolean;
  getTargets: () => IntroTargets;
  /** Le moteur attend le chargement : boucle du logo à jouer à ce centre, à cette taille (px). */
  onWait: (logo: { x: number; y: number; size: number }) => void;
  /** Début de l'envol (la barre de progression peut disparaître). */
  onFlight: () => void;
  onLanded: () => void;
};

const NS = "http://www.w3.org/2000/svg";
const C = petalCenter;
/** Taille du logo éclos, repère plante (démo : logo agrandi, centré à l'écran). */
const flowerSize = 170;
/** Centre du logo sous la pointe de la tige, en part du rayon. */
const flowerDrop = 0.72;
/** Pétales qui deviennent s, o, w, d (côté droit de la fleur). */
const letterPetals = [3, 4, 5, 6];
/** Logotype : hauteur et écart par rapport à la fleur, en part de la fleur. */
const typeRatio = 0.47;
const gapRatio = 0.14;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeIn = (x: number) => x * x * x;
const overshoot = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const n = (v: number, d = 2) => v.toFixed(d);

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string> = {}, parent?: Element) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent?.appendChild(node);
  return node;
}

/** Taille du logo éclos au centre de l'écran (px), reprise par la boucle d'attente. */
export function introLogoSize() {
  const k = (window.innerHeight / 2 + 12) / (stemBase[1] - (96 - (flowerSize / 2) * flowerDrop));
  return flowerSize * k;
}

export function createIntroEngine(svg: SVGSVGElement, callbacks: IntroCallbacks) {
  const read = (token: string) => tokenDuration(svg, token);
  const T = {
    grow: read("--site-intro-grow-duration"),
    bloomDelay: read("--site-intro-bloom-delay"),
    bloom: read("--site-intro-bloom-duration"),
    retractDelay: read("--site-intro-retract-delay"),
    retract: read("--site-intro-retract-duration"),
    arrivalDelay: read("--site-intro-arrival-delay"),
    arrival: read("--site-intro-arrival-duration"),
    hold: read("--site-intro-hold"),
    flight: read("--site-intro-flight-duration"),
    loopFade: read("--site-intro-loop-fade"),
  };

  // Construction du SVG.
  svg.innerHTML = "";
  const defs = el("defs", {}, svg);
  defs.innerHTML = leafDefs("site-intro-leaf");
  const mask = el("mask", { id: "site-intro-stem", maskUnits: "userSpaceOnUse", x: "-200", y: "-400", width: "800", height: "1200" }, defs);
  const maskLine = el("path", { d: stemLine, fill: "none", stroke: "#fff", "stroke-width": "20" }, mask);
  const stemLength = maskLine.getTotalLength();
  maskLine.setAttribute("stroke-dasharray", String(stemLength));

  const plantMap = el("g", {}, svg);
  const plant = el("g", {}, plantMap);
  const leafGroup = el("g", {}, plant);
  const leafUses = leaves.map(() => el("use", { href: "#site-intro-leaf" }, leafGroup));
  el("path", { d: stemPath, mask: "url(#site-intro-stem)" }, plant);

  const logo = el("g", {}, svg);
  const letterGroups = letters.map((letter) => {
    const g = el("g", {}, logo);
    for (const d of letter.paths) el("path", { d }, g);
    return g;
  });

  const flower = el("g", {}, svg);
  const petals = Array.from({ length: petalCount }, (_, i) => {
    const turn = el("g", { transform: `rotate(${(i * 360) / petalCount} ${C} ${C})` }, flower);
    const motion = el("g", {}, turn);
    const offset = el("g", { transform: `translate(${petalOffsetXY[0]} ${petalOffsetXY[1]})` }, motion);
    const path = el("path", { d: petal }, offset);
    return { motion, path };
  });
  const flyers = letterPetals.map(() => el("path", { d: petal }, svg));

  // Centre du pétale (repère du pétale) et point de dépliage (base intérieure).
  const box = petals[0].path.getBBox();
  const petalMiddle = [box.x + box.width / 2, box.y + box.height / 2];
  const petalMiddleLogo = [petalOffsetXY[0] + petalMiddle[0], petalOffsetXY[1] + petalMiddle[1]];
  const unfoldPivot = [petalOffsetXY[0] + box.x + box.width * 0.86, petalOffsetXY[1] + box.y + box.height * 0.97];

  let frame = 0;
  let start = 0;
  let arrivalAt: number | null = null;
  let waiting = false;
  /** Reprise après la boucle d'attente : le logo au repos revient en fondu. */
  let resumedAt: number | null = null;
  let flightStarted = false;
  let landed = false;
  let targets: IntroTargets | null = null;

  const rotateAroundBase = (p: readonly number[], deg: number) => {
    const r = (deg * Math.PI) / 180;
    const x = p[0] - stemBase[0];
    const y = p[1] - stemBase[1];
    return [stemBase[0] + x * Math.cos(r) - y * Math.sin(r), stemBase[1] + x * Math.sin(r) + y * Math.cos(r)];
  };

  function render(ms: number) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Plante mise à l'échelle : logo éclos au centre de l'écran, pied de la tige sous le bas de l'écran.
    const bloomCenterY = 96 - (flowerSize / 2) * flowerDrop;
    const k = (H / 2 + 12) / (stemBase[1] - bloomCenterY);
    const tx = W / 2 - 100 * k;
    const ty = H / 2 - bloomCenterY * k;
    plantMap.setAttribute("transform", `translate(${n(tx)} ${n(ty)}) scale(${n(k, 4)})`);

    const grown = easeOut(clamp(ms / T.grow));
    const retracted = easeOut(clamp((ms - T.retractDelay) / T.retract));
    const sway =
      ms < T.grow
        ? 1.8 * Math.sin(ms / 260)
        : 1.8 * Math.sin(T.grow / 260) * Math.exp(-(ms - T.grow) / 450) * Math.cos((ms - T.grow) / 180);
    plant.setAttribute("transform", `rotate(${n(sway, 3)} ${stemBase[0]} ${stemBase[1]})`);
    const visible = grown * (1 - retracted);
    maskLine.setAttribute("stroke-dashoffset", String(stemLength * (1 - visible)));
    // Sans tige visible, la plante est masquée (le tiret du masque laisse sinon un reste au pied).
    plant.style.visibility = visible > 0.001 ? "visible" : "hidden";

    leaves.forEach((leaf, i) => {
      const { point, normal } = leafAnchor(leaf.t);
      const open = clamp((ms - T.grow * leaf.t * 0.8) / 650);
      const unfolded = easeOut(open);
      const size = Math.max(leaf.scale * overshoot(open) * clamp((1 - retracted - leaf.t) * 6), 0.0001);
      const outward = (Math.atan2(normal[1] * leaf.side, normal[0] * leaf.side) * 180) / Math.PI;
      const folded = leaf.side > 0 ? -80 : -100;
      const final = leaf.side > 0 ? outward + leaf.droop : outward - leaf.droop;
      const angle = folded + (final - folded) * unfolded;
      leafUses[i].setAttribute(
        "transform",
        `translate(${n(point[0])} ${n(point[1])}) rotate(${n(angle)}) scale(${n(size, 4)} ${n(size * (0.3 + 0.7 * unfolded) * leaf.side, 4)})`,
      );
      leafUses[i].style.opacity = open > 0 ? "1" : "0";
    });

    // Fleur : bouton à la pointe de la tige, puis éclosion.
    const bloomed = easeOut(clamp((ms - T.bloomDelay) / T.bloom));
    const sizePlant = 12 + (flowerSize - 12) * bloomed;
    const tip = stemPoint(grown);
    let center = rotateAroundBase([tip[0], tip[1] - (sizePlant / 2) * flowerDrop], sway);
    center = [tx + center[0] * k, ty + center[1] * k];
    let size = sizePlant * k;
    let rotation = -270 * (1 - bloomed) + (ms < T.bloomDelay ? ms * 0.05 : 0) + sway;
    let flowerOpacity = grown > 0.04 ? 1 : 0;
    const F = flowerSize * k;
    if (ms >= T.retractDelay) {
      center = [W / 2, H / 2];
      size = F;
    }

    // Logo complet au centre (fleur + « sowd »), réduit si l'écran est trop étroit.
    const fit = Math.min(1, (W - 40) / (F + F * gapRatio + ((F * typeRatio) / logotypeHeight) * logotypeWidth));
    const lockFlower = F * fit;
    const lockType = F * typeRatio * fit;
    const lockTypeWidth = (lockType / logotypeHeight) * logotypeWidth;
    const lockLeft = W / 2 - (lockFlower + lockFlower * gapRatio + lockTypeWidth) / 2;
    const lock = {
      fx: lockLeft + lockFlower / 2,
      fs: lockFlower,
      lx: lockLeft + lockFlower * (1 + gapRatio),
      ly: H / 2 - lockType / 2,
      lh: lockType,
    };
    const unit = lock.lh / logotypeHeight;
    let type = { x: lock.lx, y: lock.ly, h: lock.lh, opacity: 0 };

    letterGroups.forEach((g) => {
      g.removeAttribute("transform");
      g.style.opacity = "1";
    });
    flyers.forEach((f) => (f.style.opacity = "0"));

    if (arrivalAt !== null) {
      const t = ms - arrivalAt;
      const flightAt = T.arrival + T.hold;
      const shift = easeInOut(clamp((t - 500) / 900));
      center = [lerp(W / 2, lock.fx, shift), H / 2];
      size = lerp(F, lock.fs, shift);
      type.opacity = 1;

      if (t < flightAt) {
        letterPetals.forEach((pi, j) => {
          const angle0 = rotation + (pi * 360) / petalCount;
          const scale0 = F / 262;
          const a = (angle0 * Math.PI) / 180;
          const vx = petalMiddleLogo[0] - C;
          const vy = petalMiddleLogo[1] - C;
          const startX = W / 2 + (vx * Math.cos(a) - vy * Math.sin(a)) * scale0;
          const startY = H / 2 + (vx * Math.sin(a) + vy * Math.cos(a)) * scale0;
          const endX = lock.lx + letters[j].cx * unit;
          const endY = lock.ly + letterMiddle * unit;
          const e = clamp((t - j * 120) / 1000);
          const travel = easeInOut(clamp(e / 0.75));
          const spin = (320 * travel * Math.PI) / 180;
          const cx = lerp(W / 2, endX, travel);
          const cy = lerp(H / 2, endY, travel);
          const dx = (startX - W / 2) * (1 - travel);
          const dy = (startY - H / 2) * (1 - travel);
          const x = cx + dx * Math.cos(spin) - dy * Math.sin(spin);
          const y = cy + dx * Math.sin(spin) + dy * Math.cos(spin);
          const become = clamp((e - 0.72) / 0.28);
          const s = Math.max(scale0 * (1 - 0.2 * travel) * (1 - become), 0.0001);
          flyers[j].setAttribute(
            "transform",
            `translate(${n(x)} ${n(y)}) rotate(${n(angle0 + 320 * travel + 180 * become, 1)}) scale(${n(s, 4)}) translate(${-petalMiddle[0]} ${-petalMiddle[1]})`,
          );
          flyers[j].style.opacity = e > 0 && become < 1 ? "1" : "0";
          const cxL = letters[j].cx;
          letterGroups[j].setAttribute(
            "transform",
            `translate(${cxL} ${letterMiddle}) rotate(${n(-150 * (1 - easeOut(become)), 1)}) scale(${n(Math.max(overshoot(become), 0.001), 4)}) translate(${-cxL} ${-letterMiddle})`,
          );
          letterGroups[j].style.opacity = become > 0 ? "1" : "0";
        });
      } else {
        // Envol vers les cibles.
        if (!flightStarted) {
          flightStarted = true;
          targets = callbacks.getTargets();
          callbacks.onFlight();
        }
        const f = easeInOut(clamp((t - flightAt) / T.flight));
        const close = easeIn(clamp((t - flightAt) / (T.flight * 0.6)));
        const mark = targets?.mark;
        const typeTarget = targets?.type;
        center = [lock.fx, H / 2];
        size = lock.fs;
        if (mark) {
          center = [lerp(lock.fx, mark.x + mark.width / 2, f), lerp(H / 2, mark.y + mark.height / 2, f)];
          size = lerp(lock.fs, mark.height, f);
        } else {
          size = Math.max(lock.fs * (1 - close), 0.001);
          rotation += -180 * close;
          flowerOpacity = 1 - close;
        }
        if (typeTarget) {
          type = {
            x: lerp(lock.lx, typeTarget.x, f),
            y: lerp(lock.ly, typeTarget.y, f),
            h: lerp(lock.lh, typeTarget.height, f),
            opacity: 1,
          };
        } else {
          const h = lock.lh * (1 - close);
          const w = (lock.lh / logotypeHeight) * logotypeWidth;
          type = {
            x: lock.lx + (w * close) / 2,
            y: lock.ly + (lock.lh * close) / 2,
            h: Math.max(h, 0.001),
            opacity: 1 - close,
          };
        }
        if (f >= 1 && !landed) {
          landed = true;
          callbacks.onLanded();
        }
      }
    }

    flower.setAttribute(
      "transform",
      `translate(${n(center[0])} ${n(center[1])}) rotate(${n(rotation)}) scale(${n(Math.max(size, 0.001) / 262, 5)}) translate(${-C} ${-C})`,
    );
    const fadeIn = resumedAt === null ? 1 : Math.min(1, (ms - resumedAt) / (T.loopFade || 1));
    flower.style.opacity = waiting ? "0" : String(flowerOpacity * fadeIn);
    petals.forEach((p, i) => {
      const open = clamp((ms - T.bloomDelay - i * 25) / (T.bloom * 0.7));
      const s = ms < T.bloomDelay ? 0.6 : 0.6 + 0.4 * overshoot(open);
      let transform = `translate(${C} ${C}) scale(${n(s, 4)}) translate(${-C} ${-C})`;
      const j = letterPetals.indexOf(i);
      if (j >= 0 && arrivalAt !== null) {
        const t = ms - arrivalAt;
        const left = t >= j * 120;
        const regrow = left ? clamp((t - 900 - j * 140) / 650) : 1;
        if (regrow < 1) {
          transform += ` translate(${unfoldPivot[0]} ${unfoldPivot[1]}) rotate(${n(-70 * (1 - easeOut(regrow)), 1)}) scale(${n(Math.max(overshoot(regrow), 0.001), 4)}) translate(${-unfoldPivot[0]} ${-unfoldPivot[1]})`;
        }
      }
      p.motion.setAttribute("transform", transform);
    });
    logo.setAttribute("transform", `translate(${n(type.x)} ${n(type.y)}) scale(${n(type.h / logotypeHeight, 5)})`);
    logo.style.opacity = String(type.opacity);
  }

  function tick(now: number) {
    if (!start) start = now;
    const ms = now - start;
    // Arrivée de « sowd » : au plus tôt si la page est chargée, à la fin de la rentrée de la tige sinon, ou attente.
    if (arrivalAt === null && !waiting) {
      const retractEnd = T.retractDelay + T.retract;
      if (ms >= T.arrivalDelay && ms < retractEnd && callbacks.isLoaded()) arrivalAt = T.arrivalDelay;
      else if (ms >= retractEnd) {
        if (callbacks.isLoaded()) arrivalAt = retractEnd;
        else waiting = true;
      }
    }
    render(ms);
    if (waiting) {
      frame = 0;
      callbacks.onWait({ x: window.innerWidth / 2, y: window.innerHeight / 2, size: introLogoSize() });
      return;
    }
    if (!landed) frame = requestAnimationFrame(tick);
  }


  return {
    start() {
      frame = requestAnimationFrame(tick);
    },
    /** Fin d'une boucle d'attente, page chargée : la suite reprend. */
    resume() {
      if (!waiting) return;
      waiting = false;
      arrivalAt = performance.now() - start;
      resumedAt = arrivalAt;
      frame = requestAnimationFrame(tick);
    },
    destroy() {
      cancelAnimationFrame(frame);
    },
  };
}
