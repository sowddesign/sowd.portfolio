"use client";

import {
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type TransitionEvent,
} from "react";
import { useCursorLabel } from "../CursorLabel";
import { Icon } from "../Icon";
import { buttonTones, colorTransition } from "../button-tones";
import { commun } from "@/content/texts";

/*
 * Volume de la vidéo — composant Figma « timeManager » (fichier portfolio, node 5718:32045).
 * Variantes Figma → props et état :
 * - deactivate (yes | no) = muted : son coupé, icône SpeakerSlashFill en shape/brand/darkest ;
 * - level (shut | low | high) = déduit de volume (décision de l'utilisateur) : 0 → shut, jusqu'à 50 % → low, au-delà → high ;
 * - state (default | hovered) = interne : le survol de l'icône ouvre la barre (hovered), le survol et toutes les
 *   interactions de la barre la gardent ouverte ; au-delà de 12 px autour de la barre, retour à default.
 * Hovered : icône tournée d'un quart de tour (Figma rotation 90), barre verticale flottante au-dessus du bouton,
 * sans décaler la mise en page. Fond de la barre faded/white/40 % (limite maximale), remplissage shape/neutral/white,
 * ou shape/brand/darkest quand le son est coupé (niveau conservé).
 * Poignée de réglage : rond de 12 × 12 (décision de l'utilisateur, absente de Figma), couleurs de
 * iconButton white / tertiary (default, hover, pressed), posée en haut du remplissage.
 * Tailles (décisions de l'utilisateur, Figma : icône icon/xs, barre 24 × 1) : icône icon/md, barre 64 × 4.
 * Clic sur l'icône : coupe le son, ou le remet au niveau conservé. Régler la barre à la souris remet le son.
 * Icône : couleurs d'iconButton tertiary au survol et à l'appui (white, ou active quand le son est coupé), demande de l'utilisateur.
 * Mobile : la barre ne s'ouvre pas, le volume est géré par le système.
 * Ouverture (variante « graine » choisie par l'utilisateur) : l'icône tourne, la poignée gonfle au pied de la barre,
 * puis la tige pousse et la soulève jusqu'au niveau (tokens --time-manager-*, keyframes dans theme.css).
 * En hovered, l'icône est toujours SpeakerNoneFill (SpeakerSlashFill si le son est coupé). Fermeture « ondes »
 * (demande de l'utilisateur, à reporter dans Figma) : la barre rentre dans le haut-parleur, l'icône revient droite,
 * puis les ondes du niveau en ressortent une à une. Mouvement réduit : ouverture et fermeture sans animation.
 * Curseur texte (décision de l'utilisateur) : « Couper le son » / « Remettre le son » (content/commun.md).
 */

export type TimeManagerLevel = "shut" | "low" | "high";

export type TimeManagerProps = {
  /** Volume, de 0 à 1 (conservé quand le son est coupé). */
  volume: number;
  /** Propriété Figma « deactivate » : son coupé. */
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
  /** Masque le texte du curseur (contrôles vidéo inactifs). */
  hideCursorLabel?: boolean;
  className?: string;
};

/* Étapes de la fermeture « ondes », après la fin du survol. */
type ClosingPhase = "idle" | "shrinking" | "turning" | "waves";

/* Ondes qui ressortent selon le niveau (tracés de SpeakerHighFill découpés). */
const waves: Record<TimeManagerLevel, ("SpeakerWaveInnerFillCustom" | "SpeakerWaveOuterFillCustom")[]> = {
  shut: [],
  low: ["SpeakerWaveInnerFillCustom"],
  high: ["SpeakerWaveInnerFillCustom", "SpeakerWaveOuterFillCustom"],
};

/** Propriété Figma « level » d'après le volume. */
export function getTimeManagerLevel(volume: number): TimeManagerLevel {
  if (volume <= 0) return "shut";
  return volume <= 0.5 ? "low" : "high";
}

const icons = {
  shut: "SpeakerNoneFill",
  low: "SpeakerLowFill",
  high: "SpeakerHighFill",
} as const;

/* Couleurs de la poignée : celles de l'icône de iconButton white / tertiary. */
const handleTone = buttonTones.tertiary.white;

/* Pas des flèches du clavier sur la barre. */
const keyboardStep = 0.1;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function TimeManager({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  hideCursorLabel = false,
  className = "",
}: TimeManagerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const wavesDone = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = hovered || focused;

  // Fermeture « ondes » : démarre quand la barre se ferme (mouvement réduit : fermeture directe).
  const [phase, setPhase] = useState<ClosingPhase>("idle");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase(!open && !reduced ? "shrinking" : "idle");
  }

  const label = muted ? commun.video_remettre_son : commun.video_couper_son;
  const cursor = useCursorLabel(
    hideCursorLabel ? undefined : muted ? commun.curseur_remettre_son : commun.curseur_couper_son,
  );
  const level = getTimeManagerLevel(volume);
  const value = clamp(volume);
  const barShown = open || phase === "shrinking";
  const turned = open || phase === "shrinking";
  const speakerOnly = open || phase !== "idle";
  // Son coupé : icône barrée, y compris en hovered (demande de l'utilisateur).
  const icon = muted ? "SpeakerSlashFill" : speakerOnly ? "SpeakerNoneFill" : icons[level];
  const waveIcons = phase === "waves" ? waves[level] : [];
  // Couleurs d'iconButton tertiary (repos, survol, appui) : white, ou active (shape/brand/darkest) son coupé.
  const iconColor = `${colorTransition} ${(muted ? buttonTones.tertiary.active : buttonTones.tertiary.white).icon}`;

  // Icône revenue droite : les ondes sortent (son coupé ou volume nul : fermeture terminée).
  const onTurnEnd = (event: TransitionEvent<HTMLSpanElement>) => {
    if (phase !== "turning" || event.propertyName !== "rotate") return;
    wavesDone.current = 0;
    setPhase(!muted && waves[level].length > 0 ? "waves" : "idle");
  };

  const onWaveEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.animationName !== "time-manager-wave") return;
    wavesDone.current += 1;
    if (wavesDone.current >= waveIcons.length) setPhase("idle");
  };

  const setFromPointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    onVolumeChange(clamp((rect.bottom - clientY) / rect.height));
    // Régler la barre à la souris remet le son (décision de l'utilisateur).
    if (muted) onMutedChange(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.clientY);
  };

  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragging.current) setFromPointer(event.clientY);
  };

  const onPointerUp = (event: PointerEvent<HTMLSpanElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    // Relâché hors du bouton et de la zone de la barre : retour à default.
    const under = document.elementFromPoint(event.clientX, event.clientY);
    if (!under || !rootRef.current?.contains(under)) setHovered(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const steps: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 };
    if (event.key in steps) onVolumeChange(clamp(value + steps[event.key] * keyboardStep));
    else if (event.key === "Home") onVolumeChange(0);
    else if (event.key === "End") onVolumeChange(1);
    else return;
    event.preventDefault();
  };

  // Clavier : la barre s'ouvre aussi au focus visible (pas au toucher).
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(":focus-visible")) setFocused(true);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <div
      ref={rootRef}
      className={`relative flex shrink-0 ${className}`}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => !dragging.current && setHovered(false)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={muted}
        onClick={() => onMutedChange(!muted)}
        // Au-dessus de la zone de la barre, qui le chevauche : le clic sur l'icône coupe ou remet le son.
        className={`group relative z-1 flex cursor-pointer items-center justify-center p-xs ${cursor.className}`}
        {...cursor.handlers}
      >
        {/* Quart de tour animé à l'ouverture ; au retour, animé seulement pendant la fermeture « ondes ». */}
        <span
          onTransitionEnd={onTurnEnd}
          onAnimationEnd={onWaveEnd}
          className={[
            "relative flex",
            turned ? "-rotate-90" : "",
            turned || phase === "turning"
              ? "transition-[rotate] duration-(--time-manager-turn-duration) ease-(--motion-ease-out) motion-reduce:transition-none"
              : "",
          ].join(" ")}
        >
          <Icon name={icon} size="var(--icon-md)" className={iconColor} />
          {/* Ondes : sortent du haut-parleur (x = 20 sur 32 dans le SVG) l'une après l'autre. */}
          {waveIcons.map((wave, index) => (
            <span
              key={wave}
              className="absolute inset-0 flex origin-[62.5%_50%] animate-time-manager-wave"
              style={{ animationDelay: `calc(var(--time-manager-wave-stagger) * ${index})` }}
            >
              <Icon name={wave} size="var(--icon-md)" className={iconColor} />
            </span>
          ))}
        </span>
        {cursor.node}
      </button>

      {barShown && (
        // Zone de la barre : la barre plus 12 px tout autour ; elle garde l'état hovered et reçoit le réglage.
        <span
          role="slider"
          tabIndex={0}
          aria-label={commun.video_volume}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value * 100)}
          aria-valuetext={`${Math.round(value * 100)} %${muted ? `, ${commun.video_son_coupe}` : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className={[
            "group absolute left-1/2 flex -translate-x-1/2 cursor-pointer touch-none p-(--time-manager-hover-zone) outline-none",
            "bottom-[calc(100%-var(--time-manager-bar-overlap)-var(--time-manager-hover-zone))]",
            open ? "" : "pointer-events-none",
          ].join(" ")}
        >
          <span ref={trackRef} className="relative h-(--time-manager-bar-length) w-(--time-manager-bar-thickness)">
            {/* Tige : pousse depuis le bouton une fois la graine gonflée ; rentre dans le haut-parleur à la
                fermeture « ondes ». */}
            <span
              onAnimationEnd={(event) => event.animationName === "time-manager-shrink" && setPhase("turning")}
              className={[
                "absolute inset-0 origin-bottom overflow-clip rounded-xs bg-faded-white-40",
                open
                  ? "animate-time-manager-grow [animation-delay:calc(var(--time-manager-turn-duration)+var(--time-manager-seed-duration))] motion-reduce:animate-none"
                  : "animate-time-manager-shrink",
              ].join(" ")}
            >
              <span
                className={`absolute inset-x-0 bottom-0 rounded-xs ${muted ? "bg-shape-brand-darkest" : "bg-shape-neutral-white"}`}
                style={{ height: `${value * 100}%` }}
              />
            </span>
            {/* Poignée de réglage : rond centré sur le haut du remplissage, couleurs de iconButton white / tertiary
                (survol et appui de la zone de la barre). Ouverture : gonfle au pied de la barre une fois l'icône
                tournée, puis monte avec la tige. Montée et descente en translate (point d'accroche, au niveau),
                gonflement en scale (rond) : animations fluides, sans recalcul de mise en page. */}
            <span
              aria-hidden
              className={[
                "absolute left-1/2",
                open
                  ? "animate-time-manager-rise [animation-delay:calc(var(--time-manager-turn-duration)+var(--time-manager-seed-duration))] motion-reduce:animate-none"
                  : "animate-time-manager-sink",
              ].join(" ")}
              style={{ bottom: `${value * 100}%`, "--time-manager-level": value } as CSSProperties}
            >
              <span
                className={[
                  "absolute bottom-0 left-0 size-(--time-manager-handle-size) -translate-x-1/2 translate-y-1/2 rounded-rounded bg-current",
                  colorTransition,
                  handleTone.icon,
                  open
                    ? "animate-time-manager-seed [animation-delay:var(--time-manager-turn-duration)] motion-reduce:animate-none"
                    : "animate-time-manager-vanish",
                ].join(" ")}
              />
            </span>
          </span>
        </span>
      )}
    </div>
  );
}
