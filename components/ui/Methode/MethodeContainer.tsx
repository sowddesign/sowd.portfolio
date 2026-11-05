"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { commun } from "@/content/texts";
import type { MethodeIntroContent, MethodePageContent, MethodePageEntry, MethodeStep } from "@/lib/methode";
import { IconButton } from "../IconButton";
import { NavSideMenus } from "../NavSideMenus";
import type { NavSideTileLayout } from "../NavSideTiles";
import { TextualButton } from "../TextualButton";
import { tabletQuery, useMediaQuery } from "../use-media-query";
import { MethodeIntro } from "./MethodeIntro";
import { MethodePage } from "./MethodePage";

/*
 * Méthode, conteneur des étapes — composant Figma « methodeContainer » (fichier portfolio, node 4284:4168).
 * Étapes et pages : content/methode/ordre.yaml (getMethode). Variantes Figma → props :
 *   device → largeur d'écran : mobile sous le seuil tablette (740), desktop au-delà ;
 *            l'affichage tablette suit la liste des pages : quand ses tuiles passent en réduit,
 *            l'en-tête passe en disposition tablette (décision de l'utilisateur, à l'essai) ;
 *   etape  → étape affichée (state).
 *
 * Desktop et tablette : hauteur --methode-container-height.
 *   En-tête : à gauche description (captionSwiss/regular) et titre H3 suivi du numéro (captionSwiss/small/regular),
 *   à droite boutons « précédente » et « suivante » (textualButton tertiary black, désactivés aux extrémités),
 *   qui mènent à l'introduction de l'étape voisine (décision de l'utilisateur).
 *   Contenu : liste des pages (navSideMenus), trait, puis introduction (aucune page choisie) ou page choisie.
 *   Desktop : deux moitiés. La colonne de la liste rétrécit avec l'écran (colonne du numéro, puis Main text)
 *   jusqu'au passage en réduit ; la mesure se fait toujours à la largeur d'une moitié pour pouvoir en revenir.
 *   Tablette : description au-dessus du titre, liste réduite, la page prend le reste.
 *   Introduction : au premier cran de défilement vers le bas, elle remonte lentement d'un peu (fausse résistance,
 *   sur --methode-pull-delay, comme s'il fallait deux crans) en laissant voir le haut de la page 01,
 *   puis glisse d'elle-même jusqu'à la page 01 ; à l'arrivée, le défilement de la page est bloqué
 *   --methode-pull-lock pour que l'élan de la molette ne la fasse pas défiler tout de suite
 *   (demande de l'utilisateur ; --methode-pull-resistance et --methode-pull-delay à l'essai,
 *   --motion-duration-base, --motion-ease-out). Remonter pendant l'attente annule. Mouvement réduit : passage direct.
 * Mobile : étapes en accordéon (une seule ouverte, décision de l'utilisateur), iconButton tertiary black Plus / X
 *   (Figma : brand, black demandé par l'utilisateur),
 *   sans texte au curseur (tactile). Étape ouverte : liste des pages ; la page choisie s'ouvre sous sa tuile
 *   et repousse les suivantes (variante Figma 01Demo). La ligne de l'étape ouverte puis la tuile choisie restent
 *   collées sous l'en-tête du site (--page-header-height) ; choisir une tuile ramène en haut de celle-ci,
 *   sans animation (demandes de l'utilisateur).
 * Desktop et tablette : choisir une tuile (clic ou glisse depuis l'introduction) cale le haut du conteneur
 *   sous l'en-tête du site, défilement doux natif (demande de l'utilisateur).
 * Progression de lecture : gardée par page (la plus grande valeur atteinte), affichée dans les tuiles.
 */

const divider = <span aria-hidden className="block w-full shrink-0 border-t border-shape-neutral-black" />;

/** Titre H3 de l'étape suivi de son numéro entre parenthèses (Figma : Hug, sur une ligne). */
function StepTitle({ step }: { step: MethodeStep }) {
  return (
    <div className="flex items-start">
      <h2 className="type-h3 whitespace-nowrap">{step.title}</h2>
      <p className="type-swiss-small-regular whitespace-nowrap">({step.number})</p>
    </div>
  );
}

function useProgress() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const update = (slug: string, value: number) =>
    setProgress((all) => (value > (all[slug] ?? 0) ? { ...all, [slug]: value } : all));
  const stepsOf = (pages: MethodePageEntry[]) =>
    pages.map((page) => ({
      number: page.number,
      label: page.label,
      progress: progress[page.slug] ?? 0,
    }));
  return { update, stepsOf };
}

export type MethodeContainerProps = {
  steps: MethodeStep[];
  className?: string;
};

export function MethodeContainer({ steps, className = "" }: MethodeContainerProps) {
  const desktop = useMediaQuery(tabletQuery);
  return desktop ? (
    <MethodeContainerDesktop steps={steps} className={className} />
  ) : (
    <MethodeContainerMobile steps={steps} className={className} />
  );
}

function MethodeContainerDesktop({ steps, className }: MethodeContainerProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [layout, setLayout] = useState<NavSideTileLayout>("desktop");
  /* Largeur d'une moitié (desktop), pour mesurer la liste même quand elle est réduite. */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [half, setHalf] = useState<number>();
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const divider = body.children[1] as HTMLElement;
    const observer = new ResizeObserver(() => setHalf((body.clientWidth - divider.offsetWidth) / 2));
    observer.observe(body);
    return () => observer.disconnect();
  }, []);
  const { update, stepsOf } = useProgress();
  /* Arrivée sur la page 01 depuis l'introduction : défilement bloqué jusqu'à cet instant. */
  const pageRef = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  useEffect(() => {
    const column = pageRef.current;
    if (!column) return;
    const onWheel = (event: WheelEvent) => {
      if (performance.now() < lockUntil.current) event.preventDefault();
    };
    column.addEventListener("wheel", onWheel, {
      capture: true,
      passive: false,
    });
    return () => column.removeEventListener("wheel", onWheel, { capture: true });
  }, []);
  /* Tuile choisie (clic ou glisse depuis l'introduction) : le haut du conteneur se cale sous l'en-tête
     du site, défilement doux natif (demande de l'utilisateur) ; mouvement réduit : passage direct. */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (selected === null || !root) return;
    const top = root.getBoundingClientRect().top + window.scrollY - cssNumber("--page-header-height");
    if (Math.abs(window.scrollY - top) < 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "instant" : "smooth" });
  }, [selected, current]);
  const step = steps[current];
  const tablet = layout === "reduced";
  const page = selected === null ? null : step.pages[selected];

  const goToStep = (index: number) => {
    setCurrent(index);
    setSelected(null);
  };
  const next = () => {
    if (selected !== null && selected < step.pages.length - 1) setSelected(selected + 1);
    else if (current < steps.length - 1) goToStep(current + 1);
  };

  return (
    <div
      ref={rootRef}
      className={`flex h-(--methode-container-height) w-full flex-col bg-background-neutral-white text-text-neutral-black ${className}`}
    >
      <div className="flex w-full items-end">
        {tablet ? (
          <div className="flex shrink-0 flex-col gap-xxs px-lg py-sm">
            <p className="type-swiss-regular whitespace-nowrap">{step.description}</p>
            <StepTitle step={step} />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-between self-stretch px-lg py-sm">
            <div className="flex flex-col justify-end self-stretch py-sm">
              <p className="type-swiss-regular whitespace-nowrap">{step.description}</p>
            </div>
            <StepTitle step={step} />
          </div>
        )}
        <div className={`flex min-w-0 flex-1 items-end gap-sm self-stretch py-sm ${tablet ? "" : "px-lg"}`}>
          {/* Boutons à la largeur de leur contenu (Figma : Hug). */}
          <div className="shrink-0">
            {current === 0 ? (
              <TextualButton variant="tertiary" color="black" icon="ArrowLeft" disabled>
                {commun.methode_precedente}
              </TextualButton>
            ) : (
              <TextualButton variant="tertiary" color="black" icon="ArrowLeft" onClick={() => goToStep(current - 1)}>
                {commun.methode_precedente}
              </TextualButton>
            )}
          </div>
          <div className="shrink-0">
            {current === steps.length - 1 ? (
              <TextualButton variant="tertiary" color="black" icon="ArrowRight" iconPosition="right" disabled>
                {commun.methode_suivante}
              </TextualButton>
            ) : (
              <TextualButton
                variant="tertiary"
                color="black"
                icon="ArrowRight"
                iconPosition="right"
                onClick={() => goToStep(current + 1)}
              >
                {commun.methode_suivante}
              </TextualButton>
            )}
          </div>
        </div>
      </div>
      <div ref={bodyRef} className="flex min-h-0 w-full flex-1">
        <div className={`flex min-w-0 flex-col ${tablet ? "shrink-0" : "flex-1"}`}>
          <NavSideMenus
            key={step.number}
            steps={stepsOf(step.pages)}
            selected={selected}
            onSelectedChange={setSelected}
            measureWidth={half}
            onLayoutChange={setLayout}
            className="grow"
          />
        </div>
        <span aria-hidden className="block shrink-0 border-l border-shape-neutral-black" />
        <div ref={pageRef} className="min-w-0 flex-1">
          {page
            ? page.content && (
                <MethodePage
                  key={page.slug}
                  content={page.content}
                  onProgressChange={(value) => update(page.slug, value)}
                  onNext={next}
                />
              )
            : step.intro && (
                <IntroPull
                  key={step.number}
                  intro={step.intro}
                  nextPage={step.pages[0]?.content ?? null}
                  onLand={() => {
                    lockUntil.current = performance.now() + cssDuration("--methode-pull-lock");
                    setSelected(0);
                  }}
                />
              )}
        </div>
      </div>
    </div>
  );
}

function MethodeContainerMobile({ steps, className }: MethodeContainerProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const { update, stepsOf } = useProgress();
  const rootRef = useRef<HTMLDivElement>(null);
  /* Hauteur de la ligne de l'étape ouverte : la tuile choisie se colle juste dessous. */
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(0);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(() => setRowHeight(row.offsetHeight));
    observer.observe(row);
    return () => observer.disconnect();
  }, [open]);
  const stickyTop = `calc(var(--page-header-height, 0px) + ${rowHeight}px)`;

  /* Tuile choisie : ramenée en haut, sous l'en-tête et la ligne de l'étape (l'ancienne page refermée
     a pu raccourcir la page au-dessus). */
  useLayoutEffect(() => {
    if (selected === null) return;
    const tile = rootRef.current?.querySelector<HTMLElement>("[data-selected-tile]");
    if (!tile) return;
    const header = cssNumber("--page-header-height");
    const row = rowRef.current?.offsetHeight ?? 0;
    window.scrollTo({
      top: tile.getBoundingClientRect().top + window.scrollY - header - row,
      behavior: "instant",
    });
  }, [selected, open]);

  const toggle = (index: number) => {
    setOpen((current) => (current === index ? null : index));
    setSelected(null);
  };

  return (
    <div
      ref={rootRef}
      className={`flex w-full flex-col bg-background-neutral-white text-text-neutral-black ${className}`}
    >
      {steps.map((step, i) => {
        const isOpen = open === i;
        const page = isOpen && selected !== null ? step.pages[selected] : null;
        const next = () => {
          if (selected !== null && selected < step.pages.length - 1) setSelected(selected + 1);
          else if (i < steps.length - 1) toggle(i + 1);
        };
        return (
          <div key={step.number} className="flex flex-col">
            <div
              ref={isOpen ? rowRef : undefined}
              className={isOpen ? "sticky top-(--page-header-height,0px) z-2 bg-background-neutral-white" : ""}
            >
              <div className="flex cursor-pointer items-center gap-md px-md" onClick={() => toggle(i)}>
                <div className="flex min-w-0 flex-1 flex-col gap-xs py-sm">
                  <StepTitle step={step} />
                  <p className="type-swiss-regular">{step.description}</p>
                </div>
                <IconButton
                  icon={isOpen ? "X" : "Plus"}
                  label={`${isOpen ? commun.methode_fermer : commun.methode_ouvrir} ${step.title}`}
                  cursorLabel={null}
                  variant="tertiary"
                  color="black"
                  aria-expanded={isOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(i);
                  }}
                />
              </div>
              {divider}
            </div>
            {isOpen && (
              <NavSideMenus
                steps={stepsOf(step.pages)}
                selected={selected}
                onSelectedChange={setSelected}
                mobile
                stickyTop={stickyTop}
                panel={
                  page?.content && (
                    <MethodePage
                      key={page.slug}
                      content={page.content}
                      device="mobile"
                      onProgressChange={(value) => update(page.slug, value)}
                      onNext={next}
                    />
                  )
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Réglage numérique lu dans un token CSS (ex. « 120px », « 0.4 », « 200ms »). */
function cssNumber(name: string) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
}

/** Durée lue dans un token CSS, en ms (le CSS compilé peut l'écrire en secondes, ex. « .3s »). */
function cssDuration(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value.endsWith("ms") ? parseFloat(value) : (parseFloat(value) || 0) * 1000;
}

/**
 * Introduction d'une étape (desktop) qui s'étire vers la page 01 quand on continue de défiler vers le bas.
 * Défilement capturé tant qu'on tire vers le bas ou que l'introduction est déjà étirée.
 * Le déplacement est appliqué directement au style (suit la molette sans rendu React).
 */
function IntroPull({
  intro,
  nextPage,
  onLand,
}: {
  intro: MethodeIntroContent;
  nextPage: MethodePageContent | null;
  onLand: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const land = useRef(onLand);
  useEffect(() => {
    land.current = onLand;
  });

  useEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track || !nextPage) return;
    let pull = 0;
    let landing = false;
    /* Durée de la transition : remontée lente (résistance), puis glisse et retour à --motion-duration-base. */
    const move = (value: string, duration: string | null) => {
      track.style.transition = duration ? `transform ${duration} var(--motion-ease-out)` : "none";
      track.style.transform = value;
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== track) return;
      if (landing) return land.current();
      /* Fin de la remontée : glisse jusqu'à la page 01, sans attendre d'autre cran. */
      if (pull > 0) {
        landing = true;
        move("translateY(-100%)", "var(--motion-duration-base)");
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (landing) return event.preventDefault();
      /* Remonter pendant la remontée : l'introduction revient et rien ne se passe. */
      if (event.deltaY <= 0) {
        if (pull === 0) return;
        event.preventDefault();
        pull = 0;
        return move("translateY(0)", "var(--motion-duration-base)");
      }
      event.preventDefault();
      if (pull > 0) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        landing = true;
        return land.current();
      }
      /* Premier cran : remontée lente (un cran de molette, 100 au plus, réduit par la résistance). */
      pull = Math.min(event.deltaY, 100) * cssNumber("--methode-pull-resistance");
      move(`translateY(${-pull}px)`, "var(--methode-pull-delay)");
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    track.addEventListener("transitionend", onEnd);
    return () => {
      frame.removeEventListener("wheel", onWheel);
      track.removeEventListener("transitionend", onEnd);
    };
  }, [nextPage]);

  return (
    <div ref={frameRef} className="relative size-full overflow-hidden">
      {/* Trait du haut fixe pendant la glisse, sous les boutons « précédente » et « suivante » (demande de l'utilisateur) :
          les traits de l'introduction et de la page passent dessous. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-1 block border-t border-shape-neutral-black" />
      <div ref={trackRef} className="flex size-full flex-col">
        <div className="size-full shrink-0">
          <MethodeIntro content={intro} />
        </div>
        {nextPage && (
          <div aria-hidden inert className="pointer-events-none size-full shrink-0">
            <MethodePage content={nextPage} />
          </div>
        )}
      </div>
    </div>
  );
}
