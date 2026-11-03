"use client";

import { useRef, useState, type Ref } from "react";
import { CursorLabel } from "../CursorLabel";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { ProgressBar } from "../ProgressBar";
import { colorTransition } from "../button-tones";
import { CheckTrace } from "./CheckTrace";
import { CompletionDrop } from "./CompletionDrop";

/*
 * Tuile de navigation latérale — composant Figma « navSidetTiles » (fichier portfolio, node 4067:7051).
 * Variantes Figma → props :
 *   device   → layout : desktop (souris), mobile (tactile), reduced (tuile carrée « tablet ») ;
 *   selected → selected ;
 *   finished → déduit de progress (étape terminée à 100 %) ;
 *   state    → hovered = :hover ; empty = NavSideTileEmpty.
 * Barre : ProgressBar « houle » qui suit la lecture ; elle garde sa position quand l'étape est désélectionnée.
 * Icônes : ArrowRight (indication au survol), X (désélection), Check (terminée), Plus (ouvrir, mobile).
 * La tuile entière sélectionne ou désélectionne l'étape ; Plus et X en mobile font de même.
 *
 * Accomplissement (animation C2) : quand l'étape sélectionnée atteint 100 %, la tuile garde son aspect
 * « en cours » jusqu'à ce que la barre soit pleine, puis une goutte saute jusqu'au Check (CompletionDrop).
 * À l'arrivée, barre, texte et icônes passent au whitish et le Check se trace (CheckTrace).
 */

type Phase = "idle" | "waiting" | "flying" | "landed";

export type NavSideTileLayout = "desktop" | "mobile" | "reduced";

export type NavSideTileProps = {
  /** Propriété Figma « number ». */
  number: string;
  /** Propriété Figma « tilesText » (Main text). */
  label: string;
  selected?: boolean;
  /** Progression de lecture de l'étape, de 0 à 1. */
  progress?: number;
  layout?: NavSideTileLayout;
  /** Main text sur plusieurs lignes (mobile, quand il ne tient plus sur une ligne). */
  wrap?: boolean;
  onToggle?: () => void;
  /** Copie de mesure (NavSideTiles) : contenu le plus large, sans interaction. */
  measure?: boolean;
  /** Largeur commune de la colonne du numéro, mesurée par NavSideTiles pour aligner les tuiles. */
  numberWidth?: number;
  containerRef?: Ref<HTMLDivElement>;
};

/* Hauteur d'une tuile : marges du conteneur, contenu (button-size/sm), barre et trait. */
export const tileHeight =
  "h-[calc(var(--spacing-sm)*2+var(--button-size-sm)+var(--progress-bar-height)+1px)]";
/* Tuile réduite : carrée. */
export const reducedTileWidth =
  "w-[calc(var(--spacing-sm)*2+var(--button-size-sm)+var(--progress-bar-height)+1px)]";

export function NavSideTile({
  number,
  label,
  selected = false,
  progress = 0,
  layout = "desktop",
  wrap = false,
  onToggle,
  measure = false,
  numberWidth,
  containerRef,
}: NavSideTileProps) {
  const finished = progress >= 1;
  const reduced = layout === "reduced";
  const mobile = layout === "mobile";

  /* Accomplissement : lancé quand l'étape sélectionnée passe à 100 % pendant qu'elle est affichée avec un Check. */
  const [phase, setPhase] = useState<Phase>("idle");
  const [wasFinished, setWasFinished] = useState(finished);
  if (finished !== wasFinished) {
    setWasFinished(finished);
    if (finished && selected && !measure) setPhase("waiting");
  }
  if (phase !== "idle" && (!selected || !finished)) setPhase("idle");
  const checkRef = useRef<SVGSVGElement>(null);

  /* Aspect « terminée » : tout de suite, ou à l'arrivée de la goutte. */
  const done = finished && (phase === "idle" || phase === "landed");

  const text = selected
    ? `type-body-accentuation ${done ? "text-text-brand-whitish" : "text-text-neutral-white"}`
    : "type-body-regular text-text-neutral-black";
  const icon = selected ? (done ? "text-shape-brand-whitish" : "text-shape-neutral-white") : "text-shape-neutral-black";
  const background = selected
    ? "bg-background-neutral-black"
    : finished
      ? "bg-background-brand-mid hover:bg-background-brand-bright"
      : "hover:bg-faded-black-5";

  /* Visible au survol seulement (toujours visible dans la copie de mesure). */
  const onHover = measure ? "flex" : "hidden group-hover:flex";
  const hoverIcon = (
    <span className={`${onHover} shrink-0`}>
      <Icon name={selected ? "X" : "ArrowRight"} size="var(--icon-lg)" className={`${colorTransition} ${icon}`} />
    </span>
  );

  /* Réduite : numéro puis icône du survol à sa droite. Terminée : le Check remplace le numéro,
     qui revient au survol. Les deux calques se superposent pour que le Check garde sa place (arrivée de la goutte). */
  const content = reduced ? (
    <div ref={containerRef} className="grid flex-1 place-items-center py-sm">
      <div className={`flex items-center gap-xs [grid-area:1/1] ${done ? "invisible group-hover:visible" : ""}`}>
        <p className={`${colorTransition} ${text} text-center`}>{number}</p>
        {hoverIcon}
      </div>
      {finished && (
        <CheckTrace
          ref={checkRef}
          drawn={done}
          className={`${colorTransition} ${icon} [grid-area:1/1] ${done ? "group-hover:invisible" : ""}`}
        />
      )}
    </div>
  ) : (
    <div
      ref={containerRef}
      className={`flex items-center gap-lg py-sm ${mobile ? "px-md" : "px-lg"} ${measure ? "overflow-hidden" : ""}`}
    >
      <p
        style={numberWidth !== undefined ? { width: numberWidth } : undefined}
        className={`${colorTransition} ${text} ${
          numberWidth !== undefined
            ? "shrink-0"
            : `min-w-[3ch] shrink ${
                mobile ? "basis-(--nav-side-tile-number-max-mobile)" : "basis-(--nav-side-tile-number-max-desktop)"
              }`
        }`}
      >
        {number}
      </p>
      <div
        className={`flex grow items-center gap-sm ${
          wrap ? "min-h-(--button-size-sm) min-w-0 shrink" : "h-(--button-size-sm) shrink-0"
        }`}
      >
        {/* En mobile, la flèche et la croix de gauche n'apparaissent que sur une étape terminée. */}
        {(!mobile || done) && hoverIcon}
        <p className={`${colorTransition} ${text} grow ${wrap ? "min-w-0" : "whitespace-nowrap"}`}>{label}</p>
        {/* Mesure desktop : place du Check réservée sur toutes les tuiles (une étape peut se terminer).
            Pendant l'accomplissement, le Check est en place mais caché jusqu'à l'arrivée de la goutte. */}
        {(finished || (measure && !mobile)) && (
          <CheckTrace ref={checkRef} drawn={done || measure} className={`${colorTransition} ${icon}`} />
        )}
        {mobile && !finished && (
          <span className={`pointer-events-auto ${selected ? onHover : "flex"}`}>
            <IconButton
              icon={selected ? "X" : "Plus"}
              label={selected ? `Fermer ${label}` : `Ouvrir ${label}`}
              cursorLabel={null}
              variant="tertiary"
              color={selected ? "white" : "black"}
              onClick={onToggle}
              tabIndex={-1}
            />
          </span>
        )}
      </div>
    </div>
  );

  /* Même barre sélectionnée ou non : elle reste où elle en était et ne se remplit pas de nouveau.
     Non sélectionnée, elle garde la progression atteinte (demande de l'utilisateur), en shape/neutral/black. */
  const bar = (
    <ProgressBar
      color={selected ? (done ? "whitish" : "brand") : "black"}
      value={progress}
      onFilled={() => setPhase((current) => (current === "waiting" ? "flying" : current))}
    />
  );

  const toggle = (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${number} ${label}`}
      onClick={onToggle}
      className="absolute inset-0 cursor-pointer"
    />
  );

  return (
    <div
      className={`group relative flex flex-col ${colorTransition} ${background} ${
        reduced ? `${reducedTileWidth} ${tileHeight}` : "w-full"
      }`}
    >
      {/* Réduite : bouton et Main text au curseur limités au carré au-dessus de la barre (décision de l'utilisateur). */}
      {!measure &&
        (reduced ? (
          <CursorLabel
            label={label}
            className="absolute inset-x-0 top-0 bottom-[calc(var(--progress-bar-height)+1px)]"
          >
            {toggle}
          </CursorLabel>
        ) : (
          toggle
        ))}
      <div className={`pointer-events-none relative flex flex-1 flex-col`}>{content}</div>
      {bar}
      <span aria-hidden className="block h-px w-full shrink-0 bg-shape-neutral-black" />
      {phase === "flying" && <CompletionDrop targetRef={checkRef} onLand={() => setPhase("landed")} />}
    </div>
  );
}

/** État Figma « empty » : garde la place d'une tuile, à utiliser seulement si besoin. */
export function NavSideTileEmpty({ layout = "desktop", className = "" }: { layout?: NavSideTileLayout; className?: string }) {
  return (
    <div aria-hidden className={`${tileHeight} ${layout === "reduced" ? reducedTileWidth : "w-full"} ${className}`} />
  );
}
