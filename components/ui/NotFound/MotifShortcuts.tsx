"use client";

import { useEffect, useState, type ReactNode } from "react";
import { introuvable } from "@/content/texts";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { tokenDuration } from "../token-duration";
import { reducedMotionQuery } from "../use-media-query";

/*
 * Raccourcis de l'éditeur de dessin (demandes de l'utilisateur) : en bas à gauche de la zone de dessin, à spacing/lg
 * du séparateur, 3 par 3 en carrousel : toutes les --not-found-editor-shortcuts-interval, les 3 lignes glissent vers
 * la gauche et se rangent derrière le séparateur de la colonne d'outils, puis les suivantes en ressortent
 * (--not-found-editor-options-duration, --motion-ease-out, comme les options d'outil). Arrêt au survol (le temps de
 * lire, validé par l'utilisateur). Texte captionText/regular en faded/white/40, blanc au survol, ombre dropshadow/mid (lisible sur un fond clair).
 * Au survol, une croix (tertiary, en haut à droite du bloc) ferme les aides.
 * « {mod} » dans un texte : Ctrl, ou l'icône Command sur Mac.
 */

const PER_PAGE = 3;

const shortcuts = [
  introuvable.editeur_raccourci_1,
  introuvable.editeur_raccourci_2,
  introuvable.editeur_raccourci_3,
  introuvable.editeur_raccourci_4,
  introuvable.editeur_raccourci_9,
  introuvable.editeur_raccourci_5,
  introuvable.editeur_raccourci_6,
  introuvable.editeur_raccourci_7,
  introuvable.editeur_raccourci_8,
];
const pages = Math.ceil(shortcuts.length / PER_PAGE);

/** Texte d'un raccourci : « {mod} » remplacé par Ctrl ou, sur Mac, l'icône Command. */
function line(text: string, mac: boolean): ReactNode {
  return text.split("{mod}").map((part, i) => (
    <span key={i}>
      {i > 0 &&
        (mac ? (
          <Icon
            name="Command"
            size="var(--icon-sm)"
            label={introuvable.editeur_touche_cmd}
            className="align-[-0.125em]"
          />
        ) : (
          introuvable.editeur_touche_ctrl
        ))}
      {part}
    </span>
  ));
}

export function MotifShortcuts({ onClose }: { onClose: () => void }) {
  const [mac] = useState(() => /Mac|iPhone|iPad/.test(navigator.platform));
  const [page, setPage] = useState(0);
  /** in : affichées ; out : rangées derrière le séparateur (sortie, puis changement de page). */
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [hover, setHover] = useState(false);

  // Toutes les --not-found-editor-shortcuts-interval, hors survol : les lignes se rangent.
  useEffect(() => {
    if (hover || phase !== "in" || pages < 2) return;
    const root = document.documentElement;
    const timer = setTimeout(
      () => {
        if (window.matchMedia(reducedMotionQuery).matches) setPage((p) => (p + 1) % pages);
        else setPhase("out");
      },
      tokenDuration(root, "--not-found-editor-shortcuts-interval"),
    );
    return () => clearTimeout(timer);
  }, [hover, phase, page]);

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 overflow-visible pl-lg [clip-path:inset(-100vh_-100vw_-100vh_0)]">
      <div
        role="note"
        aria-label={introuvable.editeur_aides}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || phase !== "out") return;
          // Rangées : page suivante, puis elle ressort (deux images : départ derrière le séparateur).
          setPage((p) => (p + 1) % pages);
          requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
        }}
        className={[
          "group pointer-events-auto flex items-start gap-sm text-faded-white-40 transition-[color,translate] hover:text-text-neutral-white focus-within:text-text-neutral-white",
          "duration-(--not-found-editor-options-duration) ease-(--motion-ease-out) motion-reduce:transition-none",
          phase === "in" ? "translate-none" : "-translate-x-[calc(100%+var(--spacing-lg)+var(--spacing-xs))]",
        ].join(" ")}
      >
        <ul className="flex flex-col gap-xs py-sm [text-shadow:var(--dropshadow-mid-text)]">
          {shortcuts.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map((text) => (
            <li key={text} className="type-caption-regular">
              {line(text, mac)}
            </li>
          ))}
        </ul>
        <IconButton
          icon="X"
          label={introuvable.editeur_aides_fermer}
          cursorLabel={introuvable.editeur_aides_fermer}
          variant="tertiary"
          color="white"
          iconShadow
          onClick={onClose}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
    </div>
  );
}
