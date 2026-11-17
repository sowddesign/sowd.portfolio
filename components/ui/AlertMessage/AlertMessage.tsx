"use client";

import { useEffect, useRef, useState, type ReactNode, type TransitionEventHandler } from "react";
import { Icon, type IconName } from "../Icon";
import { IconButton } from "../IconButton";
import { ProgressBar } from "../ProgressBar";
import { tokenDuration } from "../token-duration";

/*
 * Message d'alerte — composant Figma « alertMessages » (fichier portfolio, node 5863:32487).
 * Variantes Figma → props :
 *   type        → type : progress (action en cours ou message neutre), validate (réussite), error (échec) ;
 *   alertText   → text ;
 *   progressIcon / validateIcon / errorIcon → icon (par défaut PaperPlaneTilt, Check, Prohibit) ;
 *   progressBar → timed (progress et validate seulement).
 * Barre du haut (décision de l'utilisateur) : temps restant avant la fermeture. Pleine au départ, elle se vide
 * de droite à gauche pendant --alert-message-duration, puis l'alerte se ferme (onClose).
 * Barre : ProgressBar (liquide au bord ondulant) en marche arrière (backward), demande de l'utilisateur : le bord droit
 * suit le temps restant et ballotte en reculant.
 * Fond de la barre : faded/black/20 (essai demandé par l'utilisateur, absent de Figma).
 * Sans timed (action en cours), la barre reste pleine et l'alerte reste tant que dure l'action.
 * error : pas de barre, fermeture seulement par la croix.
 * Croix : iconButton tertiary X, noire (progress, validate) ou blanche (error) ; curseur « Fermer ».
 */

export type AlertMessageType = "progress" | "validate" | "error";

export type AlertMessageProps = {
  /** Propriété Figma « type ». */
  type: AlertMessageType;
  /** Propriété Figma « alertText » (peut contenir un lien, ex. adresse e-mail). */
  text: ReactNode;
  /** Petite ligne sous le texte, en captionText/italic (demande de l'utilisateur, absente de Figma). */
  details?: ReactNode;
  /** Icône interchangeable (propriétés Figma « progressIcon », « validateIcon », « errorIcon »). */
  icon?: IconName;
  /** Fermeture automatique après --alert-message-duration, décomptée par la barre (progress et validate). */
  timed?: boolean;
  onClose: () => void;
  /** Fin d'une transition de l'alerte (apparition ou disparition gérée par le parent). */
  onTransitionEnd?: TransitionEventHandler<HTMLDivElement>;
  className?: string;
};

const tones: Record<AlertMessageType, { background: string; text: string; icon: IconName; close: "black" | "white" }> = {
  progress: {
    background: "bg-background-buttons-brand-whitish",
    text: "text-text-neutral-black",
    icon: "PaperPlaneTilt",
    close: "black",
  },
  validate: {
    background: "bg-background-buttons-brand-bright",
    text: "text-text-neutral-black",
    icon: "Check",
    close: "black",
  },
  error: {
    background: "bg-background-buttons-brand-darkest",
    text: "text-text-neutral-white",
    icon: "Prohibit",
    close: "white",
  },
};

export function AlertMessage({
  type,
  text,
  details,
  icon,
  timed = false,
  onClose,
  onTransitionEnd,
  className = "",
}: AlertMessageProps) {
  const tone = tones[type];
  const hasBar = type !== "error";
  const counting = hasBar && timed;

  const rootRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* Décompte : part restante de 1 à 0, mise à jour à chaque image, puis l'alerte se ferme. */
  const [remaining, setRemaining] = useState(1);
  useEffect(() => {
    if (!counting || !rootRef.current) return;
    const duration = tokenDuration(rootRef.current, "--alert-message-duration");
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      setRemaining(Math.max(0, 1 - (now - start) / duration));
      if (now - start < duration) frame = requestAnimationFrame(tick);
    });
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      setRemaining(1);
    };
    /* Pas de text dans les dépendances : un texte avec lien est un nouvel élément React à chaque rendu du parent,
       ce qui relançait le décompte (barre qui revenait pleine, « clignotement »). Nouveau décompte : changement de type. */
  }, [counting, type]);

  return (
    <div
      ref={rootRef}
      role={type === "error" ? "alert" : "status"}
      onTransitionEnd={onTransitionEnd}
      className={`flex w-full flex-col shadow-bold ${tone.background} ${className}`}
    >
      {hasBar && (
        <div className="w-full bg-faded-black-20">
          <ProgressBar color="black" value={counting ? remaining : 1} backward aria-hidden />
        </div>
      )}
      <div className="flex items-center gap-lg px-lg py-sm">
        {/* Hauteur Figma button-size/sm au minimum ; l'alerte grandit avec son contenu (texte long, details). */}
        <div className="flex min-h-(--button-size-sm) min-w-0 flex-1 items-center gap-sm">
          <Icon name={icon ?? tone.icon} size="var(--icon-lg)" className={tone.text} />
          <div className={`flex min-w-0 flex-1 flex-col text-pretty ${tone.text}`}>
            <p className="type-body-regular">{text}</p>
            {details && <p className="type-caption-italic">{details}</p>}
          </div>
        </div>
        <IconButton icon="X" label="Fermer" cursorLabel="Fermer" variant="tertiary" color={tone.close} onClick={onClose} />
      </div>
    </div>
  );
}
