"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { commun } from "@/content/texts";
import { useCursorLabel } from "../CursorLabel";
import { IconButton } from "../IconButton";
import { tokenDuration } from "../token-duration";

/*
 * Agrandissement des images d'une page (pages projets et méthode, demandes de l'utilisateur, sans maquette Figma),
 * à la façon de la vue photo de la page À propos (PhotosViewer) :
 * - ImageLightboxGroup entoure le contenu d'une page ; chaque image agrandissable est une ZoomTrigger
 *   (« Agrandir » au curseur). Au clic, toutes les images visibles du groupe forment le carrousel, dans l'ordre
 *   de la page, à partir de celle cliquée ;
 * - la page reste visible derrière le voile --methode-zoom-veil et le flou --methode-zoom-blur ;
 * - taille : chaque image grandit à partir de sa taille dans la page, au plus de --methode-zoom-max (×2), sans sortir
 *   de la zone libre (sous l'en-tête du site + spacing/sm, marge spacing/lg sur les côtés et en bas) ; image entière ;
 * - ouverture : l'image grandit depuis sa place dans la page ; fermeture : l'image affichée retourne à sa place ;
 *   le voile apparaît et disparaît en fondu (--motion-duration-base, --motion-ease-out) ;
 * - chevrons au milieu des bords de l'image, « Fermer » dans son coin haut droit (boutons tertiary), couleur qui
 *   s'adapte au fond comme le texte au curseur (blanc en mix-blend-mode difference) ;
 * - passage d'une image à l'autre, en boucle (chevrons ; au doigt, l'image suit le doigt et change au-delà de
 *   SWIPE_THRESHOLD de la largeur, comme À propos) : fondu enchaîné avec un léger décalage (spacing/sm) dans le sens
 *   de la navigation, chaque image à sa taille (choix de l'utilisateur, --motion-duration-base, --motion-ease-out) ;
 * - fermeture : bouton, clic sur le voile hors de l'image (« Fermer » au curseur) ou Échap ; la page ne défile plus
 *   derrière ; flèches gauche et droite du clavier : image précédente et suivante.
 * Mouvement réduit : sans animation.
 */

export type LightboxImage = {
  src: string;
  alt: string;
  /** Dimensions de l'image ; lues sur le fichier si absentes. */
  width?: number;
  height?: number;
  /** Élément de la page d'où l'image grandit et où elle retourne. */
  origin: HTMLElement;
};

/** Part de la largeur à dépasser au glisser pour changer d'image (même valeur que la vue photo d'À propos). */
const SWIPE_THRESHOLD = 0.2;
/** Mouvement minimal avant de décider entre glisser et défiler (même valeur que la vue photo d'À propos). */
const DRAG_SLOP = 4;

type Rect = { left: number; top: number; width: number; height: number };
type Zone = Rect & { viewport: number };

const mod = (value: number, n: number) => ((value % n) + n) % n;

/** Partie visible de l'élément d'origine : l'image marquée data-lightbox-visual, sinon l'élément lui-même. */
const visual = (origin: HTMLElement) => origin.querySelector<HTMLElement>("[data-lightbox-visual]") ?? origin;

function motion() {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = tokenDuration(root, "--motion-duration-base");
  return {
    duration: reduced ? 0 : duration,
    easing: getComputedStyle(root).getPropertyValue("--motion-ease-out").trim() || "ease-out",
    fill: "both" as const,
  };
}

/** Appelle done une seule fois à la fin de l'animation, avec un secours à sa durée (onglet masqué : animation figée). */
function whenFinished(animation: Animation, duration: number, done: () => void) {
  let called = false;
  const once = () => {
    if (called) return;
    called = true;
    done();
  };
  animation.finished.then(once, once);
  window.setTimeout(once, duration);
}

function ImageLightbox({ images, start, onClosed }: { images: LightboxImage[]; start: number; onClosed: () => void }) {
  const n = images.length;
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const gapRef = useRef<HTMLSpanElement>(null);
  const veilCursor = useCursorLabel(commun.curseur_photos_fermer);
  /** Position absolue de l'image affichée dans la boucle. */
  const [index, setIndex] = useState(start);
  /** Décalage de l'image au doigt, en px. */
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** Image qui s'efface pendant le passage à la voisine (position absolue, sens, décalage de départ). */
  const [leaving, setLeaving] = useState<{ position: number; step: number; from: number } | null>(null);
  const leavingRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<"opening" | "open" | "closing">("opening");
  const [zone, setZone] = useState<Zone | null>(null);
  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>(() =>
    Object.fromEntries(
      images.filter((image) => image.width && image.height).map((image) => [image.src, { w: image.width!, h: image.height! }]),
    ),
  );
  const drag = useRef<{ id: number; x: number; y: number; horizontal: boolean | null } | null>(null);
  const swiped = useRef(false);
  const current = mod(index, n);

  /* Page figée derrière ; la barre de défilement retirée est remplacée par une marge de même largeur. */
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

  /* Zone libre : sous l'en-tête collé en haut de l'écran (+ spacing/sm), marges spacing/lg. */
  useLayoutEffect(() => {
    const measure = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const pad = parseFloat(getComputedStyle(overlay).paddingLeft);
      const below = gapRef.current?.offsetHeight ?? 0;
      const header = Array.from(document.querySelectorAll("header"))
        .map((el) => el.getBoundingClientRect())
        .filter((rect) => rect.top <= 0 && rect.bottom > 0)
        .reduce((bottom, rect) => Math.max(bottom, rect.bottom), 0);
      const top = header > 0 ? header + below : pad;
      setZone({
        left: pad,
        top,
        width: overlay.clientWidth - 2 * pad,
        height: overlay.clientHeight - top - pad,
        viewport: overlay.clientWidth,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Dimensions manquantes : lues sur le fichier. */
  useEffect(() => {
    let cancelled = false;
    for (const image of images) {
      if (image.width && image.height) continue;
      const probe = new window.Image();
      probe.src = image.src;
      probe
        .decode()
        .then(() => {
          if (!cancelled) setSizes((all) => ({ ...all, [image.src]: { w: probe.naturalWidth, h: probe.naturalHeight } }));
        })
        .catch(() => {
          // Repli : proportions de l'image dans la page.
          const rect = visual(image.origin).getBoundingClientRect();
          if (!cancelled && rect.width) setSizes((all) => ({ ...all, [image.src]: { w: rect.width, h: rect.height } }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [images]);

  /** Place de l'image i agrandie, centrée dans la zone libre. */
  const rectOf = (i: number): Rect | null => {
    const image = images[i];
    const size = sizes[image.src];
    if (!zone || !size) return null;
    const own = visual(image.origin).getBoundingClientRect().width || size.w;
    const ownHeight = (own * size.h) / size.w;
    const max = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--methode-zoom-max")) || 1;
    const factor = Math.min(max, zone.width / own, zone.height / ownHeight);
    const width = own * factor;
    const height = ownHeight * factor;
    return { left: zone.left + (zone.width - width) / 2, top: zone.top + (zone.height - height) / 2, width, height };
  };

  /** Transformation qui ramène l'image agrandie sur sa place dans la page. */
  const fromOrigin = (i: number, rect: Rect) => {
    const source = visual(images[i].origin).getBoundingClientRect();
    return `translate(${source.left - rect.left}px, ${source.top - rect.top}px) scale(${source.width / rect.width}, ${source.height / rect.height})`;
  };

  /* L'image affichée est masquée dans la page (elle en sort et y retourne). */
  useEffect(() => {
    const origin = visual(images[current].origin);
    origin.style.setProperty("visibility", "hidden");
    return () => {
      origin.style.removeProperty("visibility");
    };
  }, [images, current]);

  /* Ouverture : l'image grandit depuis sa place, le voile apparaît en fondu. */
  const currentRect = rectOf(current);
  const opened = useRef(false);
  useLayoutEffect(() => {
    if (opened.current || phase !== "opening" || !currentRect || !boxRef.current) return;
    opened.current = true;
    const o = motion();
    const veil = overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], o);
    const animation = boxRef.current.animate([{ transform: fromOrigin(current, currentRect) }, { transform: "none" }], o);
    // Une fois finies, les animations sont retirées : la boîte reprend son style (décalage au doigt).
    whenFinished(animation, o.duration, () => {
      veil?.cancel();
      animation.cancel();
      setPhase("open");
    });
  });

  const close = () => {
    if (phase !== "open" || leaving) return;
    const rect = rectOf(current);
    if (!rect || !boxRef.current) return onClosed();
    setPhase("closing");
    const o = motion();
    overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], o);
    const animation = boxRef.current.animate([{ transform: "none" }, { transform: fromOrigin(current, rect) }], o);
    whenFinished(animation, o.duration, onClosed);
  };
  const closeRef = useRef(close);
  const goRef = useRef<(step: number) => void>(() => {});
  useEffect(() => {
    closeRef.current = close;
  });
  /* Clavier : Échap ferme, flèches gauche et droite changent d'image (demande de l'utilisateur). */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      else if (event.key === "ArrowLeft") goRef.current(-1);
      else if (event.key === "ArrowRight") goRef.current(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Passe à l'image voisine (step = ±1) : fondu enchaîné et léger décalage (spacing/sm) dans le sens de la
      navigation ; from = décalage de l'image au doigt au moment du passage. */
  const go = (step: number, from = 0) => {
    if (phase !== "open" || leaving || n < 2) return;
    setLeaving({ position: index, step, from });
    setIndex((value) => value + step);
    setOffset(0);
  };
  useEffect(() => {
    goRef.current = go;
  });

  /* Animation du passage : l'image sortante s'efface en continuant dans le sens de la navigation, l'entrante
     apparaît en venant du même côté. --motion-duration-base, --motion-ease-out. */
  useLayoutEffect(() => {
    if (!leaving) return;
    const o = motion();
    const shift = gapRef.current?.offsetHeight ?? 0;
    const out = leavingRef.current?.animate(
      [
        { opacity: 1, transform: `translateX(${leaving.from}px)` },
        { opacity: 0, transform: `translateX(${leaving.from - leaving.step * shift}px)` },
      ],
      o,
    );
    const enter = boxRef.current?.animate(
      [
        { opacity: 0, transform: `translateX(${leaving.step * shift}px)` },
        { opacity: 1, transform: "none" },
      ],
      o,
    );
    const done = () => {
      enter?.cancel();
      setLeaving(null);
    };
    if (out) whenFinished(out, o.duration, done);
    else done();
  }, [leaving]);

  /* Glisser au doigt (tactile et stylet ; la souris garde les chevrons). */
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || phase !== "open" || leaving || n < 2) return;
    swiped.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: null };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (start.horizontal === null) {
      if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return;
      start.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!start.horizontal) {
        drag.current = null;
        return;
      }
      swiped.current = true;
      setDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}
    }
    setOffset(dx);
  };
  const onPointerEnd = (event: PointerEvent) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    drag.current = null;
    if (!start.horizontal) return;
    setDragging(false);
    const dx = event.type === "pointercancel" ? 0 : event.clientX - start.x;
    const threshold = (zone?.viewport ?? 0) * SWIPE_THRESHOLD;
    if (Math.abs(dx) > threshold) go(dx < 0 ? 1 : -1, dx);
    // En deçà du seuil, l'image revient en place (transition de la boîte).
    else setOffset(0);
  };

  const preview = (i: number) => images[i].origin.querySelector("img")?.currentSrc;
  /* Boutons : couleur adaptée au fond, comme le texte au curseur. */
  const adaptive = "mix-blend-difference";

  /** Image agrandie à la position absolue donnée ; la courante porte les boutons. */
  const renderBox = (position: number, isCurrent: boolean) => {
    const i = mod(position, n);
    const rect = rectOf(i);
    if (!rect) return null;
    const style: CSSProperties = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      transform: isCurrent ? `translateX(${offset}px)` : `translateX(${leaving?.from ?? 0}px)`,
    };
    return (
      <div
        key={position}
        ref={isCurrent ? boxRef : leavingRef}
        inert={!isCurrent}
        style={style}
        className={`absolute origin-top-left ${isCurrent ? "" : "pointer-events-none"} ${
          isCurrent && !dragging ? "transition-transform duration-(--motion-duration-base) ease-(--motion-ease-out)" : ""
        }`}
      >
        {preview(i) && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu déjà chargé, sous la grande version
          <img src={preview(i)} alt="" draggable={false} className="absolute inset-0 size-full object-contain" />
        )}
        <Image src={images[i].src} alt={images[i].alt} fill sizes="100vw" draggable={false} className="object-contain" />
        {isCurrent && phase === "open" && (
          <>
            {n > 1 && (
              <>
                <IconButton
                  icon="CaretLeft"
                  label={commun.photos_precedente}
                  cursorLabel={commun.curseur_photos_precedente}
                  variant="tertiary"
                  color="white"
                  onClick={() => go(-1)}
                  className={`absolute! top-1/2 left-0 -translate-y-1/2 ${adaptive}`}
                />
                <IconButton
                  icon="CaretRight"
                  label={commun.photos_suivante}
                  cursorLabel={commun.curseur_photos_suivante}
                  variant="tertiary"
                  color="white"
                  onClick={() => go(1)}
                  className={`absolute! top-1/2 right-0 -translate-y-1/2 ${adaptive}`}
                />
              </>
            )}
            <IconButton
              icon="X"
              label={commun.methode_image_fermer}
              cursorLabel={commun.curseur_photos_fermer}
              variant="tertiary"
              color="white"
              onClick={close}
              className={`absolute! top-0 right-0 ${adaptive}`}
            />
          </>
        )}
      </div>
    );
  };

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal
      aria-label={images[current].alt || commun.methode_agrandir}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className="fixed inset-0 z-50 touch-pan-y p-lg select-none"
    >
      {/* Voile : clic hors de l'image = fermeture. */}
      <div
        aria-hidden
        onClick={() => {
          if (swiped.current) {
            swiped.current = false;
            return;
          }
          close();
        }}
        {...veilCursor.handlers}
        className={`absolute inset-0 bg-(image:--methode-zoom-veil) backdrop-blur-(--methode-zoom-blur) ${veilCursor.className}`}
      />

      {zone && leaving && renderBox(leaving.position, false)}
      {zone && renderBox(index, true)}

      <span ref={gapRef} aria-hidden className="pointer-events-none absolute h-sm w-0" />
      {veilCursor.node}
    </div>,
    document.body,
  );
}

const LightboxContext = createContext<((trigger: HTMLElement) => void) | null>(null);

const number = (value?: string) => (value ? Number(value) || undefined : undefined);

/** Entoure le contenu d'une page : ses ZoomTrigger visibles forment le carrousel d'agrandissement. */
export function ImageLightboxGroup({ children, className = "contents" }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ images: LightboxImage[]; start: number } | null>(null);

  const open = useCallback((trigger: HTMLElement) => {
    const triggers = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-lightbox-src]") ?? []).filter(
      (el) => el.getClientRects().length > 0,
    );
    const images = triggers.map((el) => ({
      src: el.dataset.lightboxSrc!,
      alt: el.dataset.lightboxAlt ?? "",
      width: number(el.dataset.lightboxWidth),
      height: number(el.dataset.lightboxHeight),
      origin: el,
    }));
    if (images.length) setState({ images, start: Math.max(0, triggers.indexOf(trigger)) });
  }, []);

  return (
    <LightboxContext value={open}>
      <div ref={rootRef} className={className}>
        {children}
      </div>
      {state && <ImageLightbox images={state.images} start={state.start} onClosed={() => setState(null)} />}
    </LightboxContext>
  );
}

export type ZoomTriggerProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Image agrandissable au clic (« Agrandir » au curseur), dans un ImageLightboxGroup ; hors groupe, simple cadre.
 * L'image grandit depuis l'élément marqué data-lightbox-visual s'il y en a un, sinon depuis ce cadre.
 */
export function ZoomTrigger({ src, alt = "", width, height, className = "", style, children }: ZoomTriggerProps) {
  const open = useContext(LightboxContext);
  const cursor = useCursorLabel(open ? commun.curseur_agrandir : undefined);
  if (!open)
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  return (
    <button
      type="button"
      aria-label={alt ? `${commun.methode_agrandir} : ${alt}` : commun.methode_agrandir}
      data-lightbox-src={src}
      data-lightbox-alt={alt}
      data-lightbox-width={width}
      data-lightbox-height={height}
      onClick={(event) => open(event.currentTarget)}
      {...cursor.handlers}
      style={style}
      className={`cursor-pointer text-left ${cursor.className} ${className}`}
    >
      {children}
      {cursor.node}
    </button>
  );
}
