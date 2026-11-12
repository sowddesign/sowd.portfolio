"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { commun } from "@/content/texts";
import type { MethodeProjectIntro as Intro } from "@/lib/methode";
import { IconButton } from "../IconButton";
import { MethodeBlocks, methodeSpacing } from "./MethodeBody";

/*
 * Introduction au projet cité — frame Figma « methode 01 » (fichier content) : ouverte 6291:11248 (desktop) /
 * 6291:11112 (mobile), fermée 6291:11542.
 *   En-tête : titre headings/subheading (passe à la ligne, demande de l'utilisateur), iconButton tertiary black
 *   CaretUp (ouverte) / CaretDown (fermée), comme l'accordéon mobile ; fermée et déjà lue : Check à la place
 *   du CaretDown (demande de l'utilisateur). Ouverte : contenu (blocs, MethodeBlocks) à spacing/xxl / spacing/xl sous l'en-tête.
 *   Texte au curseur : « Ouvrir » / « Fermer » (desktop) ; aucun en mobile (tactile), comme l'accordéon.
 * Comportement (demande de l'utilisateur) : ouverte par défaut ; lue = défilée jusqu'à son bas. Une fois lue, elle
 * s'affiche fermée (avec Check) sur les pages suivantes qui citent le même projet, le temps de la visite
 * (sessionStorage). Fermée sans être lue : titre seul, et elle se rouvrira sur les pages suivantes.
 */

const storageKey = (slug: string) => `methode-intro-lue:${slug}`;

function storedRead(slug: string) {
  try {
    return sessionStorage.getItem(storageKey(slug)) === "1";
  } catch {
    return false;
  }
}

const noSubscription = () => () => {};

export function MethodeProjectIntro({
  intro,
  mobile = false,
  scrollRoot,
}: {
  intro: Intro;
  mobile?: boolean;
  /** Conteneur qui défile (desktop) ; absent : la page (mobile). */
  scrollRoot?: RefObject<HTMLElement | null>;
}) {
  // Lue lors d'une page précédente (rendu serveur : pas encore lue).
  const readBefore = useSyncExternalStore(noSubscription, () => storedRead(intro.slug), () => false);
  const [readHere, setReadHere] = useState(false);
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? !(readBefore && !readHere);
  const read = readBefore || readHere;
  const end = useRef<HTMLSpanElement>(null);
  const spacing = methodeSpacing(mobile);

  /* Lue quand son bas est atteint en défilant, même d'un coup au-delà (pas dans les aperçus inertes des transitions). */
  useEffect(() => {
    const el = end.current;
    if (!open || readHere || !el || el.closest("[inert]")) return;
    const root = scrollRoot?.current ?? null;
    const target: HTMLElement | Window = root ?? window;
    let frame = 0;
    const check = () => {
      frame = 0;
      if (el.getClientRects().length === 0) return; // pas affichée (mise en page de l'autre appareil)
      const bottom = root ? root.getBoundingClientRect().bottom : window.innerHeight;
      if (el.getBoundingClientRect().top > bottom) return;
      try {
        sessionStorage.setItem(storageKey(intro.slug), "1");
      } catch {}
      setReadHere(true);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [open, readHere, intro.slug, scrollRoot]);

  const toggle = () => setOverride(!open);

  return (
    <div className={`flex flex-col ${spacing.part}`}>
      <div className="flex cursor-pointer items-center justify-between" onClick={toggle}>
        <h4 className="type-subheading min-w-0 flex-1 text-pretty">{intro.title}</h4>
        {/* Fermée et lue : Check à la place du CaretDown, comme les accordéons et les tuiles (demande de l'utilisateur). */}
        <IconButton
          icon={open ? "CaretUp" : read ? "Check" : "CaretDown"}
          label={`${open ? commun.methode_fermer : commun.methode_ouvrir} ${intro.title}`}
          cursorLabel={mobile ? null : open ? commun.curseur_methode_intro_fermer : commun.curseur_methode_intro_ouvrir}
          variant="tertiary"
          color="black"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
        />
      </div>
      {open && (
        <div className="flex flex-col">
          <MethodeBlocks blocks={intro.blocks} mobile={mobile} zoomable />
          <span ref={end} aria-hidden className="block h-0" />
        </div>
      )}
    </div>
  );
}
