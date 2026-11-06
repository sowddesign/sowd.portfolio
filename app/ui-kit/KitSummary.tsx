"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { commun } from "@/content/texts";
import { useCursorLabel } from "@/components/ui/CursorLabel";
import { NavigationButton } from "@/components/ui/NavigationButton";

/*
 * Sommaire de l'UI kit (outil interne, sans maquette Figma) : bouton navButton en haut de page.
 * Il s'ouvre comme l'agrandissement d'image de la méthode (ImageLightbox) : voile --methode-zoom-veil et flou,
 * panneau qui grandit depuis le bouton sous l'en-tête (spacing/sm en dessous), marges spacing/lg ;
 * --motion-duration-base, --motion-ease-out ; mouvement réduit : sans animation.
 * Fermeture : clic sur le voile ou Échap, « Fermer » au curseur. Un lien ferme le sommaire puis amène
 * le titre du composant juste sous l'en-tête.
 */

export type KitSummaryGroup = { title: string; items: { id: string; label: string }[] };

/** Événement qui ouvre le sommaire depuis un autre bouton (KitShortcut) ; detail : élément d'où il grandit. */
export const openSummaryEvent = "ui-kit:open-summary";

function motion() {
  const style = getComputedStyle(document.documentElement);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const value = style.getPropertyValue("--motion-duration-base").trim();
  const duration = value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
  return {
    duration: reduced || !duration ? 0 : duration,
    easing: style.getPropertyValue("--motion-ease-out").trim() || "ease-out",
    fill: "both" as const,
  };
}

/* Bas de l'en-tête collé en haut de l'écran (0 s'il n'y en a pas). */
function headerBottom() {
  return Array.from(document.querySelectorAll("header"))
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.top <= 0 && rect.bottom > 0)
    .reduce((bottom, rect) => Math.max(bottom, rect.bottom), 0);
}

function SummaryOverlay({
  groups,
  origin,
  onClosed,
}: {
  groups: KitSummaryGroup[];
  origin: HTMLElement;
  onClosed: (target?: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLSpanElement>(null);
  const closing = useRef(false);
  const cursor = useCursorLabel(commun.curseur_photos_fermer);
  const [top, setTop] = useState<number | null>(null);

  /* Page figée derrière, barre de défilement remplacée par une marge (comme ImageLightbox). */
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

  useLayoutEffect(() => {
    const measure = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const pad = parseFloat(getComputedStyle(overlay).paddingLeft);
      const header = headerBottom();
      setTop(header > 0 ? header + (gapRef.current?.offsetHeight ?? 0) : pad);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Transformation qui ramène le panneau sur le bouton Sommaire. */
  const fromOrigin = () => {
    const panel = panelRef.current!.getBoundingClientRect();
    const source = origin.getBoundingClientRect();
    return `translate(${source.left - panel.left}px, ${source.top - panel.top}px) scale(${source.width / panel.width}, ${source.height / panel.height})`;
  };

  const opened = useRef(false);
  useLayoutEffect(() => {
    if (top === null || opened.current || !panelRef.current) return;
    opened.current = true;
    const o = motion();
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], o);
    panelRef.current.animate([{ transform: fromOrigin() }, { transform: "none" }], o);
  });

  const close = (target?: string) => {
    if (closing.current) return;
    closing.current = true;
    const o = motion();
    overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], o);
    const animation = panelRef.current?.animate([{ transform: "none" }, { transform: fromOrigin() }], o);
    const done = () => onClosed(target);
    if (animation) animation.finished.then(done, done);
    else done();
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal
      aria-label="Sommaire"
      onClick={() => close()}
      {...cursor.handlers}
      className={`fixed inset-0 z-50 bg-(image:--methode-zoom-veil) p-lg backdrop-blur-(--methode-zoom-blur) ${cursor.className}`}
    >
      {top !== null && (
        <div
          ref={panelRef}
          style={{ top }}
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-x-lg bottom-lg origin-top-left cursor-auto overflow-y-auto bg-background-neutral-white p-lg text-text-neutral-black"
        >
          <nav className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-xl">
            {groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-xs">
                <h2 className="type-body-accentuation">{group.title}</h2>
                {/* Textes du sommaire en body/accentuation (demande de l'utilisateur), à la place de button/md. */}
                {group.items.map((item) => (
                  <NavigationButton key={item.id} size="md" onClick={() => close(item.id)}>
                    <span className="type-body-accentuation">{item.label}</span>
                  </NavigationButton>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
      <span ref={gapRef} aria-hidden className="pointer-events-none absolute h-sm w-0" />
      {cursor.node}
    </div>,
    document.body,
  );
}

export function KitSummary({ groups }: { groups: KitSummaryGroup[] }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);

  const [target, setTarget] = useState<string>();

  /* Ouverture depuis le raccourci flottant : le panneau grandit depuis ce bouton. */
  useEffect(() => {
    const onOpen = (event: Event) => setOrigin((event as CustomEvent<HTMLElement>).detail);
    window.addEventListener(openSummaryEvent, onOpen);
    return () => window.removeEventListener(openSummaryEvent, onOpen);
  }, []);
  const onClosed = (id?: string) => {
    setOrigin(null);
    setTarget(id);
  };

  /* Après la fermeture (page de nouveau défilable) : titre du composant amené juste sous l'en-tête,
     adresse mise à jour pour pouvoir y revenir. */
  useEffect(() => {
    if (origin || !target) return;
    const heading = document.getElementById(target);
    if (heading) {
      window.scrollTo({ top: heading.getBoundingClientRect().top + window.scrollY - headerBottom() });
      history.replaceState(null, "", `#${target}`);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cible consommée une seule fois
    setTarget(undefined);
  }, [origin, target]);

  return (
    <div ref={buttonRef} className="px-(--grid-spacing)">
      <NavigationButton
        aria-haspopup="dialog"
        aria-expanded={origin !== null}
        onClick={() => setOrigin(buttonRef.current)}
      >
        Sommaire
      </NavigationButton>
      {origin && <SummaryOverlay groups={groups} origin={origin} onClosed={onClosed} />}
    </div>
  );
}
