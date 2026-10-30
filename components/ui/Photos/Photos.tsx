"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PhotosViewer } from "../PhotosViewer";
import { reducedMotionQuery, touchQuery, useMediaQuery } from "../use-media-query";
import { PressHint } from "./PressHint";

/*
 * Photos — composant Figma « photos » (fichier portfolio, node 4440:8739) : en code, ce composant est la mosaïque
 * façon mockup (sans maquette Figma de la mosaïque) ; la vue photo (PhotosViewer) reprend la frame Figma.
 * Les photos de content/photos/ordre.yaml (lues par lib/photos.ts) sont posées en rangées sur un plan incliné,
 * recadré par le composant, comme une planche de présentation.
 *
 * Animation : le plan remonte en continu et chaque rangée glisse horizontalement, une vers la gauche,
 * la suivante vers la droite. Rangées et photos sont répétées deux fois pour boucler sans saut.
 * Le mouvement est piloté image par image (requestAnimationFrame) : la vitesse varie en douceur
 * (lissage sur --motion-duration-base), sans le retour en arrière que provoque le changement de vitesse
 * d'une animation CSS. Au survol de la mosaïque, il ralentit sans s'arrêter (HOVER_RATE) ; au survol d'une photo,
 * les autres passent en noir et blanc (fondu --motion-duration-base / --motion-ease-out, comme les tuiles projet).
 * Mouvement réduit : mosaïque immobile, ouverture et fermeture sans animation.
 * Tactile : pas de survol (ni ralenti ni noir et blanc, réservés à la souris) ; un appui ou un appui long
 * (LONG_PRESS, sans menu du navigateur) ouvre la photo. Provisoire : l'appui long proposera plus tard plusieurs actions.
 * Consigne animée « Appuie » en bas à gauche de la mosaïque, sur tactile uniquement (PressHint).
 *
 * Clic sur une photo : la mosaïque s'arrête et la photo cliquée grandit depuis sa place (position, taille,
 * inclinaison, coins) jusqu'à remplir le cadre, puis la vue photo (PhotosViewer, à partir de cette photo)
 * prend le relais. Fermeture : la photo affichée revient se poser sur sa tuile visible la plus proche du centre,
 * puis la mosaïque repart en accélérant progressivement sur RESUME_DURATION (accélération puis décélération douces).
 * Durée 2 × --motion-duration-base, courbe --motion-ease-out (essai).
 *
 * Valeurs d'essai, à valider (aucune ne vient de Figma) : ROTATION, CARD_WIDTH, RISE_DURATION, SLIDE_DURATION,
 * HOVER_RATE, durée d'ouverture ; écart --spacing-md, fond background/neutral/black,
 * format de la frame Figma « photos » (437 × 240). Coins des photos --radius-xs (2, choix validé).
 */

/** Inclinaison de la mosaïque. */
const ROTATION = "-15deg";
/** Largeur d'une photo, en % de la largeur du composant. */
const CARD_WIDTH = 45;
/** Côté du plan incliné, en % de la largeur du composant : assez grand pour couvrir le cadre une fois incliné. */
const PLANE_SIZE = 200;
/** Rangées et photos par rangée d'un motif : un motif doit couvrir le plan (le motif est répété deux fois). */
const ROWS = 8;
const COLUMNS = 5;
/** Durée (ms) pour remonter d'un motif complet, et pour qu'une rangée glisse d'un motif complet. */
const RISE_DURATION = 120_000;
const SLIDE_DURATION = 90_000;
/** Vitesse au survol de la mosaïque (1 = vitesse normale). */
const HOVER_RATE = 0.3;
/** Durée (ms) d'un appui long tactile, celle des systèmes mobiles. */
const LONG_PRESS = 500;
/** Durée (ms) de la reprise de vitesse après la fermeture d'une photo (choix validé : 1,5 s). */
const RESUME_DURATION = 1500;

export type Photo = {
  /** Chemin public de l'image, ex. /photos/photo-01.png. */
  src: string;
  /** Texte affiché au survol et lu par les lecteurs d'écran. */
  description: string;
  /** Couleur des boutons de la vue photo (chevrons, fermeture) sur cette photo, selon son fond. */
  buttonColor: "black" | "white";
};

export type PhotosProps = {
  photos: Photo[];
  /** Attribut sizes de next/image, selon la largeur d'une photo à l'écran. */
  sizes?: string;
  className?: string;
};

type Phase = "mosaic" | "opening" | "photo" | "closing";

/** Position et taille d'une tuile dans le composant (avant inclinaison), et ses coins. */
type Frame = { left: number; top: number; width: number; height: number; rotate: string; radius: string };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Durée d'un token (ex. « 200ms ») lue sur l'élément. */
function tokenDuration(element: Element, token: string) {
  return parseFloat(getComputedStyle(element).getPropertyValue(token)) || 0;
}

export function Photos({ photos, sizes = "45vw", className = "" }: PhotosProps) {
  const count = photos.length;
  const [phase, setPhase] = useState<Phase>("mosaic");
  /** Photo ouverte au départ de la vue photo, puis photo visée dans le carrousel. */
  const [start, setStart] = useState(0);
  const [viewed, setViewed] = useState(0);
  /** Nombre d'ouvertures : remonte le carrousel à chaque ouverture, pour repartir de la photo cliquée. */
  const [openings, setOpenings] = useState(0);
  /** Photo affichée par la tuile qui grandit (ou rétrécit). */
  const [ghostIndex, setGhostIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const touch = useMediaQuery(touchQuery);
  const reducedMotionPreferred = useMediaQuery(reducedMotionQuery);

  const root = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const motion = useRef({ speed: 1, target: 1, rise: 0, slide: 0, resumeStart: 0 });
  /** Tuile de départ ou d'arrivée de l'animation, et sa position. */
  const flight = useRef<{ tile: HTMLElement; frame: Frame } | null>(null);
  /** Appui long tactile en cours sur une tuile. */
  const press = useRef(0);

  // Vitesse visée : normale, ralentie au survol, à l'arrêt hors de la mosaïque.
  useEffect(() => {
    motion.current.target = phase !== "mosaic" ? 0 : hovered ? HOVER_RATE : 1;
  }, [phase, hovered]);

  // Défilement image par image : la vitesse rejoint la vitesse visée en douceur, la position avance sans saut.
  useEffect(() => {
    const element = plane.current;
    if (!element || reducedMotion()) return;
    const column = element.querySelector<HTMLElement>("[data-rise]");
    const rows = [...element.querySelectorAll<HTMLElement>("[data-slide]")];
    const smoothing = tokenDuration(element, "--motion-duration-base") || 1;
    const state = motion.current;
    let last = performance.now();
    let id = 0;

    const frame = (now: number) => {
      const elapsed = Math.min(now - last, 100);
      last = now;
      if (state.resumeStart) {
        if (state.resumeStart < 0) state.resumeStart = now; // -1 : reprise demandée, départ à cette image.
        // Reprise après fermeture : de l'arrêt à la vitesse visée, courbe douce au départ comme à l'arrivée.
        const t = Math.min(Math.max((now - state.resumeStart) / RESUME_DURATION, 0), 1);
        state.speed = state.target * t * t * (3 - 2 * t);
        if (t === 1) state.resumeStart = 0;
      } else {
        state.speed += (state.target - state.speed) * (1 - Math.exp(-elapsed / smoothing));
      }
      state.rise = (state.rise + (elapsed / RISE_DURATION) * state.speed) % 1;
      state.slide = (state.slide + (elapsed / SLIDE_DURATION) * state.speed) % 1;
      // Un motif complet = la moitié du contenu répété (-50 %).
      if (column) column.style.translate = `0 ${-state.rise * 50}%`;
      for (const row of rows) {
        const x = row.dataset.slide === "left" ? -state.slide * 50 : (state.slide - 1) * 50;
        row.style.translate = `${x}% 0`;
      }
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []);

  /** Position d'une tuile dans le composant : centre de sa boîte, taille avant inclinaison. */
  const frameOf = (tile: HTMLElement): Frame => {
    const box = root.current!.getBoundingClientRect();
    const rect = tile.getBoundingClientRect();
    const width = tile.offsetWidth;
    const height = tile.offsetHeight;
    return {
      left: rect.left + rect.width / 2 - box.left - width / 2,
      top: rect.top + rect.height / 2 - box.top - height / 2,
      width,
      height,
      rotate: ROTATION,
      radius: getComputedStyle(tile).borderRadius,
    };
  };

  const open = (index: number, tile: HTMLElement) => {
    window.clearTimeout(press.current);
    if (phase !== "mosaic") return;
    motion.current.speed = 0;
    setOpenings((n) => n + 1);
    setStart(index);
    setViewed(index);
    if (reducedMotion()) {
      setPhase("photo");
      return;
    }
    flight.current = { tile, frame: frameOf(tile) };
    tile.style.visibility = "hidden";
    setGhostIndex(index);
    setPhase("opening");
  };

  const close = () => {
    const element = root.current!;
    const box = element.getBoundingClientRect();
    // Tuile visible de la photo affichée, la plus proche du centre du cadre.
    const tiles = [...element.querySelectorAll<HTMLElement>(`[data-tile="${viewed}"]`)]
      .map((tile) => ({ tile, rect: tile.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > box.left && rect.left < box.right && rect.bottom > box.top && rect.top < box.bottom)
      .map(({ tile, rect }) => ({
        tile,
        distance: Math.hypot(rect.left + rect.width / 2 - (box.left + box.width / 2), rect.top + rect.height / 2 - (box.top + box.height / 2)),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (reducedMotion() || tiles.length === 0) {
      motion.current.resumeStart = -1;
      setPhase("mosaic");
      return;
    }
    const { tile } = tiles[0];
    flight.current = { tile, frame: frameOf(tile) };
    tile.style.visibility = "hidden";
    setGhostIndex(viewed);
    setPhase("closing");
  };

  // Photo qui grandit (ouverture) ou rétrécit (fermeture) entre sa tuile et le cadre entier.
  useLayoutEffect(() => {
    const element = ghost.current;
    const current = flight.current;
    if (!element || !current || (phase !== "opening" && phase !== "closing")) return;

    const { width, height } = root.current!.getBoundingClientRect();
    const tile = current.frame;
    const full = { left: 0, top: 0, width, height, rotate: "0deg", radius: "0px" };
    const toKeyframe = (f: Frame) => ({
      left: `${f.left}px`,
      top: `${f.top}px`,
      width: `${f.width}px`,
      height: `${f.height}px`,
      rotate: f.rotate,
      borderRadius: f.radius,
    });
    const keyframes = phase === "opening" ? [toKeyframe(tile), toKeyframe(full)] : [toKeyframe(full), toKeyframe(tile)];
    const animation = element.animate(keyframes, {
      duration: tokenDuration(element, "--motion-duration-base") * 2,
      easing: getComputedStyle(element).getPropertyValue("--motion-ease-out").trim() || "ease-out",
      fill: "both",
    });
    const done = () => {
      window.clearTimeout(fallback);
      current.tile.style.visibility = "";
      flight.current = null;
      if (phase === "closing") motion.current.resumeStart = performance.now();
      setPhase(phase === "opening" ? "photo" : "mosaic");
    };
    // Filet de sécurité si « finish » n'arrive pas (onglet en arrière-plan…) : la vue ne reste pas bloquée.
    const fallback = window.setTimeout(done, Number(animation.effect?.getTiming().duration ?? 0) + 100);
    animation.addEventListener("finish", done);
    return () => {
      window.clearTimeout(fallback);
      animation.removeEventListener("finish", done);
    };
  }, [phase]);

  if (count === 0) return null;

  const grid = { "--card-width": `${CARD_WIDTH}cqw`, "--plane-size": `${PLANE_SIZE}cqw` } as CSSProperties;
  // Première apparition de chaque photo dans le premier motif : seule tuile lue et atteignable au clavier.
  const firstTiles = new Set<number>();
  const rowShift = Math.max(1, Math.floor(count / 2));
  const flying = phase === "opening" || phase === "closing";

  return (
    <div ref={root} style={grid} className={`@container group/mosaic relative size-full overflow-clip bg-background-neutral-black ${className}`}>
      <div inert={phase !== "mosaic"} className={`absolute inset-0 ${phase === "photo" ? "invisible" : ""}`}>
        <div
          ref={plane}
          style={{ rotate: ROTATION }}
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={(event) => event.pointerType === "mouse" && setHovered(false)}
          className="absolute top-1/2 left-1/2 size-(--plane-size) -translate-1/2"
        >
          <div data-rise>
            {Array.from({ length: ROWS * 2 }, (_, row) => (
              <div key={row} className="pb-md">
                <div data-slide={row % 2 ? "right" : "left"} className="flex w-max">
                  {Array.from({ length: COLUMNS * 2 }, (_, column) => {
                    // Même photo à la même place dans chaque répétition du motif, pour boucler sans saut ;
                    // chaque rangée décale la liste de moitié pour que deux photos voisines diffèrent.
                    const index = ((row % ROWS) * rowShift + (column % COLUMNS)) % count;
                    const photo = photos[index];
                    const first = row < ROWS && column < COLUMNS && !firstTiles.has(index);
                    if (first) firstTiles.add(index);
                    return (
                      <div key={column} className="pe-md">
                        <button
                          type="button"
                          data-tile={index}
                          title={photo.description}
                          aria-label={photo.description}
                          aria-hidden={!first}
                          tabIndex={first ? 0 : -1}
                          onClick={(event) => open(index, event.currentTarget)}
                          onPointerDown={(event) => {
                            if (event.pointerType === "mouse") return;
                            const tile = event.currentTarget;
                            press.current = window.setTimeout(() => open(index, tile), LONG_PRESS);
                          }}
                          onPointerUp={() => window.clearTimeout(press.current)}
                          onPointerCancel={() => window.clearTimeout(press.current)}
                          onPointerLeave={() => window.clearTimeout(press.current)}
                          // Pas de menu du navigateur à l'appui long : la photo s'ouvre à la place.
                          onContextMenu={(event) => event.preventDefault()}
                          className="relative block aspect-[437/240] w-(--card-width) cursor-pointer overflow-clip rounded-xs transition-[filter] duration-(--motion-duration-base) ease-(--motion-ease-out) select-none [-webkit-touch-callout:none] [@media(hover:hover)]:group-has-[[data-tile]:hover]/mosaic:not-hover:grayscale"
                        >
                          <Image src={photo.src} alt="" fill sizes={sizes} draggable={false} className="object-cover select-none" />
                          <span aria-hidden className="pointer-events-none absolute inset-0 bg-extra-screeneffect" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div inert={phase !== "photo"} className={`absolute inset-0 ${phase === "photo" ? "" : "invisible"}`}>
        <PhotosViewer key={openings} photos={photos} start={start} onChange={setViewed} onClose={close} sizes="100vw" />
      </div>

      {touch && phase === "mosaic" && <PressHint animated={!reducedMotionPreferred} />}

      {flying && (
        <div ref={ghost} aria-hidden className="pointer-events-none absolute overflow-clip">
          <Image src={photos[ghostIndex].src} alt="" fill sizes="100vw" className="object-cover" />
          <span className="absolute inset-0 bg-extra-screeneffect" />
        </div>
      )}
    </div>
  );
}
