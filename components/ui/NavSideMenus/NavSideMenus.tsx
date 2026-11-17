"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { commun } from "@/content/texts";
import {
  BonusTileContent,
  NavSideBonusTile,
  NavSideTileEmpty,
  NavSideTiles,
  bonusTileHeight,
  reducedTileWidth,
  type NavSideTileLayout,
  type NavSideTilesProps,
} from "../NavSideTiles";
import { ProgressBar } from "../ProgressBar";
import { tokenDuration } from "../token-duration";

/*
 * Menu latéral des étapes — composant Figma « navSideMenus » (fichier portfolio, node 4293:5409).
 * Variantes Figma → props :
 *   device       → affichage retenu par NavSideTiles (souris : desktop ou réduit ; tactile : mobile) ;
 *   pageSelected → selected (index de l'étape, null pour « none ») ; bonusSelected pour la page « Bonus » (finish).
 * Structure : trait, tuiles, compteur « Terminés », trait, puis en desktop une tuile vide qui prend la place restante.
 * Compteur : étapes terminées / nombre d'étapes. En affichage réduit, il devient « 0/7 » seul,
 * avec l'espacement des tuiles carrées (décision de l'utilisateur). Hauteur de la tuile Bonus, pour qu'elle prenne
 * sa place sans agrandir le bloc (demande de l'utilisateur ; avant : 56).
 *
 * Tuile « Bonus » (bonus, node 5851:30891) : cachée tant que toutes les pages ne sont pas lues, elle remplace
 * alors le compteur (demande de l'utilisateur). Arrivée à 5/5 pendant la visite : la goutte de la dernière tuile arrive
 * sur son Check (et le Check se trace, --nav-side-tile-drop-trace), puis le compteur se remplit de la couleur de la tuile
 * Bonus (background/brand/darkest, décision de l'utilisateur), le liquide passant sur l'ancien texte,
 * et le texte de la tuile arrive par-dessus (demande de l'utilisateur).
 * Déjà terminée à l'affichage (autre visite, autre étape) : la tuile est là directement, sans animation.
 * Mouvement réduit : la tuile apparaît directement. Mobile : la page Bonus (bonusPanel) s'ouvre sous la tuile, qui reste
 * collée à stickyTop avec son trait tant que la page défile, comme les autres tuiles (choix de l'utilisateur).
 *
 * Remplissage (choix de l'utilisateur, les autres propositions sont retirées) : liquide de la ProgressBar qui monte du bas,
 * bord du haut ondulant, ressort --progress-bar-catch-up.
 * Texte, BONUS_TEXT (choix de l'utilisateur : « revele ») :
 *   « fondu » (fondu enchaîné, --motion-duration-base, --motion-ease-out),
 *                 « montee » (l'ancien texte monte et s'efface, le nouveau monte de --motion-menu-offset,
 *                 numéro puis texte décalés de --motion-menu-stagger, comme le menu),
 *                 « revele » (le nouveau texte est découvert par le remplissage, au fur et à mesure).
 */

export type BonusText = "fondu" | "montee" | "revele";

export const BONUS_TEXT: BonusText = "revele";

export type NavSideMenusProps = Omit<NavSideTilesProps, "frame"> & {
  /** L'étape a une page « Bonus » : la tuile remplace le compteur une fois toutes les pages lues. */
  bonus?: boolean;
  bonusSelected?: boolean;
  onBonusToggle?: () => void;
  /** Mobile : page Bonus ouverte sous la tuile Bonus (comme panel sous la tuile sélectionnée). */
  bonusPanel?: ReactNode;
  /** Propositions d'animation du texte (UI kit) ; par défaut BONUS_TEXT. */
  bonusText?: BonusText;
};

const separator = "block shrink-0 border-t border-shape-neutral-black";

/** Textes du compteur (« Terminés » et « 3/5 »), sans le fond. */
function CounterContent({
  count,
  layout,
}: {
  count: string;
  layout: NavSideTileLayout;
}) {
  const reduced = layout === "reduced";
  return reduced ? (
    <>
      <p className="sr-only">{commun.methode_terminees}</p>
      <p className="type-body-regular">{count}</p>
    </>
  ) : (
    <>
      <p className="type-body-italic">{commun.methode_terminees}</p>
      <div className="flex grow items-center gap-sm">
        <p className="type-body-regular grow text-right">{count}</p>
      </div>
    </>
  );
}

const counterLayout = (layout: NavSideTileLayout) =>
  layout === "reduced"
    ? `${reducedTileWidth} justify-center`
    : `w-full gap-lg ${layout === "mobile" ? "px-md" : "px-lg"}`;

function FinishedCounter({
  finished,
  total,
  layout,
}: {
  finished: number;
  total: number;
  layout: NavSideTileLayout;
}) {
  return (
    <div
      className={`flex ${bonusTileHeight(layout)} shrink-0 items-center rounded-l-xs bg-background-brand-bright py-sm text-text-neutral-black ${counterLayout(layout)}`}
    >
      <CounterContent count={`${finished}/${total}`} layout={layout} />
    </div>
  );
}

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Passage du compteur à la tuile Bonus : remplissage, puis texte (même hauteur que la tuile). onDone à la fin, la vraie tuile prend
 * alors la place (même rendu).
 */
function BonusReveal({
  total,
  layout,
  numberWidth,
  textMode,
  onDone,
}: {
  total: number;
  layout: NavSideTileLayout;
  numberWidth?: number;
  textMode: BonusText;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const oldRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  /* filling : le remplissage avance ; text : le texte change. */
  const [stage, setStage] = useState<"start" | "filling" | "text">("start");
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  const reveal = textMode === "revele";

  /* Texte découvert par le remplissage : nouveau texte coupé à la part remplie, ancien texte à la part vide. */
  const clip = (fraction: number) => {
    if (!reveal) return;
    const filled = `${(1 - fraction) * 100}%`;
    const empty = `${fraction * 100}%`;
    if (newRef.current) newRef.current.style.clipPath = `inset(${filled} 0 0 0)`;
    if (oldRef.current) oldRef.current.style.clipPath = `inset(0 0 ${empty} 0)`;
  };

  useEffect(() => {
    clip(0);
    /* Une image affichée à vide avant de lancer le remplissage (sinon la barre se monterait déjà pleine). */
    /* Mouvement réduit : la tuile directement. */
    const frame = requestAnimationFrame(() =>
      reduceMotion() ? done.current() : setStage("filling"),
    );
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Texte : fin après --motion-duration-base (et le décalage du menu pour « montee »). */
  useEffect(() => {
    const root = rootRef.current;
    if (stage !== "text" || !root) return;
    clip(1);
    const wait =
      tokenDuration(root, "--motion-duration-base") +
      (textMode === "montee"
        ? tokenDuration(root, "--motion-menu-stagger")
        : 0);
    const timer = window.setTimeout(() => done.current(), wait);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, textMode]);

  const text = stage === "text";
  const ease = "duration-(--motion-duration-base) ease-(--motion-ease-out)";
  /* Ancien texte : s'efface (fondu), monte et s'efface (montee) ; découvert : coupé par le remplissage. */
  const oldText =
    textMode === "fondu"
      ? `transition-opacity ${ease} ${text ? "opacity-0" : ""}`
      : textMode === "montee"
        ? `transition-[translate,opacity] ${ease} ${text ? "-translate-y-(--motion-menu-offset) opacity-0" : ""}`
        : "";
  const newText =
    textMode === "fondu"
      ? `transition-opacity ${ease} ${text ? "opacity-100" : "opacity-0"}`
      : textMode === "montee"
        ? `*:transition-[translate,opacity] *:duration-(--motion-duration-base) *:ease-(--motion-ease-out) [&>*:nth-child(2)]:delay-(--motion-menu-stagger) ${
            text
              ? "*:translate-y-0 *:opacity-100"
              : "*:translate-y-(--motion-menu-offset) *:opacity-0"
          }`
        : "";

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`relative shrink-0 overflow-hidden rounded-l-xs bg-background-brand-bright text-text-neutral-black ${bonusTileHeight(
        layout,
      )} ${layout === "reduced" ? reducedTileWidth : "w-full"}`}
    >
      {/* Ancien texte sous le liquide, nouveau texte au-dessus (demande de l'utilisateur). */}
      <div
        ref={oldRef}
        className={`absolute inset-0 flex items-center py-sm ${counterLayout(layout)} ${oldText}`}
      >
        <CounterContent count={`${total}/${total}`} layout={layout} />
      </div>
      <div className="absolute inset-0">
        <ProgressBar
          color="darkest"
          fillParent
          vertical
          value={stage === "start" ? 0 : 1}
          onDraw={clip}
          onFilled={() => setStage("text")}
          aria-hidden
        />
      </div>
      <div ref={newRef} className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <BonusTileContent
          layout={layout}
          number={commun.methode_bonus}
          label={commun.methode_bonus_texte}
          numberWidth={numberWidth}
          className={newText}
        />
      </div>
    </div>
  );
}

type BonusStage = "counter" | "waiting" | "reveal" | "bonus";

/**
 * Compteur ou tuile Bonus. Déjà terminé au premier affichage : tuile directement. Terminé pendant la visite :
 * attente de la goutte de la tuile sélectionnée (si c'est elle qui vient de finir), puis BonusReveal.
 */
function BonusSlot({
  finished,
  total,
  layout,
  numberWidth,
  completions,
  waitForDrop,
  selected,
  onToggle,
  textMode,
}: {
  finished: number;
  total: number;
  layout: NavSideTileLayout;
  numberWidth?: number;
  completions: number;
  waitForDrop: boolean;
  selected: boolean;
  onToggle?: () => void;
  textMode: BonusText;
}) {
  const complete = total > 0 && finished >= total;
  const [stage, setStage] = useState<BonusStage>(
    complete ? "bonus" : "counter",
  );
  const [wasComplete, setWasComplete] = useState(complete);
  const [completionsAtArm, setCompletionsAtArm] = useState(completions);
  if (complete !== wasComplete) {
    setWasComplete(complete);
    if (complete && stage === "counter") {
      setCompletionsAtArm(completions);
      setStage(waitForDrop ? "waiting" : "reveal");
    }
  }

  /* Goutte arrivée : le Check se trace (--nav-side-tile-drop-trace), puis le remplissage commence. */
  const slotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stage !== "waiting" || completions === completionsAtArm) return;
    const trace = slotRef.current
      ? tokenDuration(slotRef.current, "--nav-side-tile-drop-trace")
      : 0;
    const timer = window.setTimeout(() => setStage("reveal"), trace);
    return () => window.clearTimeout(timer);
  }, [stage, completions, completionsAtArm]);

  return (
    <div ref={slotRef} className="contents">
      {stage === "bonus" ? (
        <NavSideBonusTile
          number={commun.methode_bonus}
          label={commun.methode_bonus_texte}
          layout={layout}
          selected={selected}
          numberWidth={numberWidth}
          onToggle={onToggle}
        />
      ) : stage === "reveal" ? (
        <BonusReveal
          total={total}
          layout={layout}
          numberWidth={numberWidth}
          textMode={textMode}
          onDone={() => setStage("bonus")}
        />
      ) : (
        <FinishedCounter finished={finished} total={total} layout={layout} />
      )}
    </div>
  );
}

/**
 * Tuile Bonus (ou compteur) et son trait, puis la page Bonus ouverte dessous (mobile). Ouverte : la tuile et son trait
 * restent collés à stickyTop ; data-selected-tile pour que methodeContainer ramène la tuile en haut à l'ouverture.
 */
function BonusBlock({
  children,
  line,
  open,
  selected,
  stickyTop,
  panel,
}: {
  children: ReactNode;
  line: ReactNode;
  open: boolean;
  selected: boolean;
  stickyTop?: string;
  panel?: ReactNode;
}) {
  const sticky = open && stickyTop !== undefined;
  return (
    <div data-selected-tile={selected || undefined} className="flex flex-col">
      <div
        style={sticky ? { top: stickyTop } : undefined}
        className={`flex flex-col ${sticky ? "sticky z-1" : ""}`}
      >
        {children}
        {line}
      </div>
      {open && panel}
    </div>
  );
}

export function NavSideMenus({
  className = "",
  bonus = false,
  bonusSelected = false,
  onBonusToggle,
  bonusPanel,
  bonusText = BONUS_TEXT,
  ...props
}: NavSideMenusProps) {
  const selectedStep =
    props.selected === null ? undefined : props.steps[props.selected];
  return (
    <NavSideTiles
      {...props}
      className={className}
      frame={(tiles, { layout, finished, numberWidth, completions }) => {
        const width = layout === "reduced" ? reducedTileWidth : "w-full";
        return (
          <>
            <span aria-hidden className={`${separator} ${width}`} />
            {tiles}
            {bonus ? (
              <BonusBlock
                open={bonusSelected && Boolean(bonusPanel)}
                selected={bonusSelected}
                stickyTop={props.stickyTop}
                line={<span aria-hidden className={`${separator} ${width}`} />}
                panel={bonusPanel}
              >
                <BonusSlot
                  finished={finished}
                  total={props.steps.length}
                  layout={layout}
                  numberWidth={numberWidth}
                  completions={completions}
                  /* La tuile sélectionnée vient de finir : sa goutte saute d'abord jusqu'au Check. */
                  waitForDrop={Boolean(
                    selectedStep && selectedStep.progress >= 1,
                  )}
                  selected={bonusSelected}
                  onToggle={onBonusToggle}
                  textMode={bonusText}
                />
              </BonusBlock>
            ) : (
              <>
                <FinishedCounter
                  finished={finished}
                  total={props.steps.length}
                  layout={layout}
                />
                <span aria-hidden className={`${separator} ${width}`} />
              </>
            )}
            {layout !== "mobile" && (
              <NavSideTileEmpty layout={layout} className="grow" />
            )}
          </>
        );
      }}
    />
  );
}
