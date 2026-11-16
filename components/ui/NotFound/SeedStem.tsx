"use client";

import { useEffect, useRef, type RefObject } from "react";
import { introPlantScale, stemBase, stemPath, stemPoint } from "../SiteIntro";
import { tokenDuration } from "../token-duration";

/*
 * Graine de la page 404 (Figma : ellipse shape/brand/brand, centrée en bas de l'écran, à moitié hors champ).
 * Demandes de l'utilisateur : on attrape la graine et on tire du sol la tige de l'intro (sans feuilles) qui suit le
 * curseur ; lâchée loin du trou, elle revient à la vitesse de rentrée de l'intro (--site-intro-retract-duration,
 * même courbe) ; lâchée près du trou (--not-found-drop-tolerance), elle glisse jusqu'à son centre puis s'y enfonce
 * (--not-found-sink-duration), la tige reste plantée, puis onPlant — seulement au relâchement, jamais automatiquement.
 * Tige : forme de l'intro, étirée du pied (graine au repos) jusqu'au curseur, épaisseur de l'intro (introPlantScale).
 */

const stemTip = stemPoint(1);
/** Longueur et angle de la tige de l'intro, repère plante. */
const stemLength = Math.hypot(stemTip[0] - stemBase[0], stemTip[1] - stemBase[1]);
const stemAngle = (Math.atan2(stemTip[1] - stemBase[1], stemTip[0] - stemBase[0]) * 180) / Math.PI;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

type Point = readonly [number, number];
const centerOf = (box: DOMRect): Point => [box.left + box.width / 2, box.top + box.height / 2];

export function SeedStem({
  target,
  label,
  onGrab,
  onMiss,
  onPlant,
  className = "",
}: {
  /** Trou : son centre reçoit la graine. */
  target: RefObject<HTMLElement | null>;
  label: string;
  /** Graine attrapée. */
  onGrab?: () => void;
  /** Graine lâchée loin du trou. */
  onMiss?: () => void;
  /** Graine enfoncée dans le trou. */
  onPlant?: () => void;
  /** Classes de la tige (fondu). */
  className?: string;
}) {
  const stemRef = useRef<SVGPathElement>(null);
  const seedRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onGrab, onMiss, onPlant });
  useEffect(() => {
    callbacks.current = { onGrab, onMiss, onPlant };
  });

  useEffect(() => {
    const stem = stemRef.current;
    const seed = seedRef.current;
    if (!stem || !seed) return;

    const root = document.documentElement;
    /** Pointe de la tige (centre de la graine) ; null = au repos, au pied. */
    let tip: Point | null = null;
    let state: "rest" | "drag" | "return" | "sink" | "planted" = "rest";
    let frame = 0;

    const base = (): Point => [window.innerWidth / 2, window.innerHeight];
    const holeCenter = () => {
      const hole = target.current;
      return hole ? centerOf(hole.getBoundingClientRect()) : null;
    };

    const draw = () => {
      const [bx, by] = base();
      const [x, y] = tip ?? [bx, by];
      seed.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      const length = Math.hypot(x - bx, y - by);
      if (length < 0.5) {
        stem.style.visibility = "hidden";
        return;
      }
      const angle = (Math.atan2(y - by, x - bx) * 180) / Math.PI;
      stem.style.visibility = "visible";
      stem.setAttribute(
        "transform",
        `translate(${bx} ${by}) rotate(${angle}) scale(${length / stemLength} ${introPlantScale()}) rotate(${-stemAngle}) translate(${-stemBase[0]} ${-stemBase[1]})`,
      );
    };

    /** Déplace la pointe de sa position vers to() (relu à chaque image), courbe de l'intro. */
    const tween = (to: () => Point, duration: number, done: () => void) => {
      const from = tip ?? base();
      const start = performance.now();
      const step = (now: number) => {
        const t = easeOut(Math.min(1, (now - start) / duration));
        const [cx, cy] = to();
        tip = [from[0] + (cx - from[0]) * t, from[1] + (cy - from[1]) * t];
        draw();
        if (t < 1) frame = requestAnimationFrame(step);
        else done();
      };
      frame = requestAnimationFrame(step);
    };

    const onDown = (event: PointerEvent) => {
      if (state === "sink" || state === "planted") return;
      cancelAnimationFrame(frame);
      seed.setPointerCapture(event.pointerId);
      state = "drag";
      tip = [event.clientX, event.clientY];
      draw();
      callbacks.current.onGrab?.();
    };
    const onMove = (event: PointerEvent) => {
      if (state !== "drag") return;
      tip = [event.clientX, event.clientY];
      draw();
    };
    const onUp = (event: PointerEvent) => {
      if (state !== "drag") return;
      const hole = holeCenter();
      const tolerance = parseFloat(getComputedStyle(root).getPropertyValue("--not-found-drop-tolerance")) || 0;
      if (hole && Math.hypot(event.clientX - hole[0], event.clientY - hole[1]) <= tolerance) {
        // Dans le trou : la graine glisse jusqu'au centre, puis s'y enfonce.
        state = "sink";
        const duration = tokenDuration(root, "--not-found-sink-duration");
        tween(() => holeCenter() ?? hole, duration, () => {
          seed.style.scale = "0";
          window.setTimeout(() => {
            state = "planted";
            callbacks.current.onPlant?.();
          }, duration);
        });
        return;
      }
      state = "return";
      callbacks.current.onMiss?.();
      tween(base, tokenDuration(root, "--site-intro-retract-duration"), () => {
        tip = null;
        state = "rest";
        draw();
      });
    };
    const onResize = () => {
      if (state === "planted" || state === "sink") tip = holeCenter() ?? tip;
      draw();
    };

    draw();
    seed.addEventListener("pointerdown", onDown);
    seed.addEventListener("pointermove", onMove);
    seed.addEventListener("pointerup", onUp);
    seed.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      seed.removeEventListener("pointerdown", onDown);
      seed.removeEventListener("pointermove", onMove);
      seed.removeEventListener("pointerup", onUp);
      seed.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [target]);

  return (
    <>
      <svg aria-hidden className={`pointer-events-none fixed inset-0 size-full fill-shape-brand-brand ${className}`}>
        <path ref={stemRef} d={stemPath} visibility="hidden" />
      </svg>
      <div
        ref={seedRef}
        role="img"
        aria-label={label}
        className="fixed top-0 left-0 size-(--not-found-seed-size) cursor-grab touch-none rounded-full bg-shape-brand-brand transition-[scale] duration-(--not-found-sink-duration) ease-(--motion-ease-out) active:cursor-grabbing"
      />
    </>
  );
}
