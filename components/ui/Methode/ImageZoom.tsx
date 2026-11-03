"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { commun } from "@/content/texts";
import { useCursorLabel } from "../CursorLabel";

/*
 * Agrandissement d'une image de la méthode (demande de l'utilisateur, sans maquette Figma).
 * L'image s'affiche en grand par-dessus la page, qui reste visible derrière le voile --methode-zoom-veil
 * (dégradé radial de noirs transparents, sombre au centre : choix de l'utilisateur) et un léger flou (--methode-zoom-blur).
 * Taille : l'image grandit à partir de sa taille dans la page, au plus de --methode-zoom-max (×2, choix de
 * l'utilisateur, pour qu'une image en largeur ne soit pas bien plus agrandie que les autres), et sans sortir de
 * la zone libre : sous l'en-tête du site (spacing/sm en dessous, demande de l'utilisateur), marge spacing/lg
 * sur les côtés et en bas.
 * Animation (choix de l'utilisateur) : l'image grandit depuis sa place dans la page et y retourne à la fermeture,
 * le voile apparaît en fondu ; --motion-duration-base, --motion-ease-out. Mouvement réduit : sans animation.
 * Fermeture : clic n'importe où ou Échap, « Fermer » au curseur ; la page ne défile plus derrière.
 */

export type ZoomedImage = { src: string; alt: string; width: number; height: number; origin: HTMLElement };

type Rect = { left: number; top: number; width: number; height: number };

export function ImageZoom({ image, onClosed }: { image: ZoomedImage; onClosed: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  /* Mesure de spacing/sm (écart sous l'en-tête). */
  const gapRef = useRef<HTMLSpanElement>(null);
  const closing = useRef(false);
  const cursor = useCursorLabel(commun.curseur_photos_fermer);
  const [target, setTarget] = useState<Rect | null>(null);
  /* Image déjà chargée dans la page : affichée tout de suite, le temps que la grande version arrive. */
  const preview = image.origin.querySelector("img")?.currentSrc;

  /* Page figée derrière, avant toute mesure : la barre de défilement retirée est remplacée par une marge
     de même largeur, pour que la page ne se décale pas (ni à l'ouverture, ni au retour de l'image). */
  useLayoutEffect(() => {
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.paddingRight;
    };
  }, []);

  /* Place de l'image agrandie : contenue dans l'écran moins les marges. */
  useLayoutEffect(() => {
    const measure = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const style = getComputedStyle(overlay);
      const pad = parseFloat(style.paddingLeft);
      /* Bas de l'en-tête collé en haut de l'écran (s'il y en a un), puis spacing/sm. */
      const below = gapRef.current?.offsetHeight ?? 0;
      const header = Array.from(document.querySelectorAll("header"))
        .map((el) => el.getBoundingClientRect())
        .filter((rect) => rect.top <= 0 && rect.bottom > 0)
        .reduce((bottom, rect) => Math.max(bottom, rect.bottom), 0);
      const top = header > 0 ? header + below : pad;
      const width = overlay.clientWidth - 2 * pad;
      const height = overlay.clientHeight - top - pad;
      /* Taille dans la page (largeur affichée, hauteur selon les proportions). */
      const own = (image.origin.querySelector("img") ?? image.origin).getBoundingClientRect().width;
      const ownHeight = (own * image.height) / image.width;
      const max = parseFloat(getComputedStyle(overlay).getPropertyValue("--methode-zoom-max")) || 1;
      const factor = Math.min(max, width / own, height / ownHeight);
      const w = own * factor;
      const h = ownHeight * factor;
      setTarget({ left: pad + (width - w) / 2, top: top + (height - h) / 2, width: w, height: h });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [image]);

  const options = () => {
    const style = getComputedStyle(document.documentElement);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const value = style.getPropertyValue("--motion-duration-base").trim();
    const duration = value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
    return {
      duration: reduced || !duration ? 0 : duration,
      easing: style.getPropertyValue("--motion-ease-out").trim() || "ease-out",
      fill: "both" as const,
    };
  };

  /* Transformation qui ramène l'image agrandie sur l'image de la page (l'image elle-même, sans sa bordure). */
  const fromOrigin = (rect: Rect) => {
    const source = (image.origin.querySelector("img") ?? image.origin).getBoundingClientRect();
    return `translate(${source.left - rect.left}px, ${source.top - rect.top}px) scale(${source.width / rect.width}, ${source.height / rect.height})`;
  };

  /* Ouverture : l'image de la page est masquée, sa copie grandit depuis sa place. */
  const opened = useRef(false);
  useLayoutEffect(() => {
    if (!target || opened.current) return;
    opened.current = true;
    image.origin.style.setProperty("visibility", "hidden");
    const o = options();
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], o);
    imageRef.current?.animate([{ transform: fromOrigin(target) }, { transform: "none" }], o);
  });

  const close = () => {
    if (closing.current || !target) return;
    closing.current = true;
    const o = options();
    overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], o);
    const animation = imageRef.current?.animate([{ transform: "none" }, { transform: fromOrigin(target) }], o);
    const done = () => {
      image.origin.style.removeProperty("visibility");
      onClosed();
    };
    if (animation) animation.finished.then(done, done);
    else done();
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  /* Échap ferme. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      image.origin.style.removeProperty("visibility");
    };
  }, [image]);

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal
      aria-label={image.alt}
      onClick={close}
      {...cursor.handlers}
      className={`fixed inset-0 z-50 bg-(image:--methode-zoom-veil) p-lg backdrop-blur-(--methode-zoom-blur) ${cursor.className}`}
    >
      {target && (
        <div
          ref={imageRef}
          style={{ left: target.left, top: target.top, width: target.width, height: target.height }}
          className="absolute origin-top-left"
        >
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu déjà chargé, sous la grande version
            <img src={preview} alt="" className="absolute inset-0 size-full" />
          )}
          <Image src={image.src} alt={image.alt} fill sizes="100vw" />
        </div>
      )}
      <span ref={gapRef} aria-hidden className="pointer-events-none absolute h-sm w-0" />
      <button type="button" autoFocus aria-label={commun.methode_image_fermer} className="sr-only" />
      {cursor.node}
    </div>,
    document.body,
  );
}
