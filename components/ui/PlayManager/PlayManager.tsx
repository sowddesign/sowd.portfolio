"use client";

import type { ButtonHTMLAttributes } from "react";
import { commun } from "@/content/texts";
import { useCursorLabel } from "../CursorLabel";
import { Icon } from "../Icon";
import { buttonTones, colorTransition } from "../button-tones";

/*
 * Lecture / pause de la vidéo — composant Figma « playManager » (fichier portfolio, node 5718:32171).
 * Variante Figma → prop : state (pause | play), l'icône affichée.
 * Bouton icône réduit, propre à la vidéo : iconButton (new) white / tertiary, padding spacing/xs,
 * icône icon/md (décision de l'utilisateur, Figma icon/xs) : 40 × 40 comme tous les boutons du videoManager.
 * Curseur texte (décision de l'utilisateur) : « Pause » sur l'icône pause, « Lecture » sur l'icône play.
 * tone : white (vidéo) ou black (audioManager sur fond blanc : miroir en noir, iconButton black / tertiary, décision de
 * l'utilisateur, absent de Figma).
 */

export type MediaTone = "white" | "black";

export type PlayManagerState = "pause" | "play";

export type PlayManagerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Propriété Figma « state » : icône affichée (pause pendant la lecture, play à l'arrêt). */
  state: PlayManagerState;
  /** Masque le texte du curseur (contrôles vidéo inactifs). */
  hideCursorLabel?: boolean;
  /** Couleur des contrôles : white (vidéo), black (audio). */
  tone?: MediaTone;
  /** Texte accessible (par défaut : celui de la vidéo). */
  label?: string;
};

const content: Record<PlayManagerState, { icon: "PauseFill" | "PlayFill"; label: string; cursor: string }> = {
  pause: { icon: "PauseFill", label: commun.video_pause, cursor: commun.curseur_video_pause },
  play: { icon: "PlayFill", label: commun.video_lecture, cursor: commun.curseur_video_lecture },
};

export function PlayManager({ state, hideCursorLabel = false, label, ...rest }: PlayManagerProps) {
  const { icon, label: videoLabel, cursor } = content[state];
  return (
    <VideoIconButton
      icon={icon}
      label={label ?? videoLabel}
      cursorLabel={hideCursorLabel ? undefined : cursor}
      {...rest}
    />
  );
}

export type VideoIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: "PauseFill" | "PlayFill" | "CornersOut" | "X";
  /** Texte accessible : le bouton n'a pas de texte visible. */
  label: string;
  /** Texte qui remplace le curseur au survol ; undefined : aucun texte (contrôles inactifs). */
  cursorLabel: string | undefined;
  /** Couleur : white (vidéo), black (audio). */
  tone?: MediaTone;
};

/** Bouton icône des contrôles vidéo et audio : iconButton (new) white (ou black) / tertiary en 40 × 40 (padding spacing/xs, icon/md). */
export function VideoIconButton({
  icon,
  label,
  cursorLabel,
  tone = "white",
  className = "",
  type = "button",
  ...rest
}: VideoIconButtonProps) {
  const cursor = useCursorLabel(cursorLabel);
  return (
    <button
      type={type}
      aria-label={label}
      className={["group flex shrink-0 cursor-pointer items-center justify-center p-xs", cursor.className, className].join(
        " ",
      )}
      {...rest}
      {...cursor.handlers}
    >
      <Icon name={icon} size="var(--icon-md)" className={`${colorTransition} ${buttonTones.tertiary[tone].icon}`} />
      {cursor.node}
    </button>
  );
}
