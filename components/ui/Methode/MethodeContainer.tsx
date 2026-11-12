"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { commun } from "@/content/texts";
import type { MethodeIntroContent, MethodePageContent, MethodePageEntry, MethodeStep } from "@/lib/methode";
import { useCursorLabel } from "../CursorLabel";
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
 *   qui mènent à l'introduction de l'étape voisine (décision de l'utilisateur) ; exception : « suivante » avec une page
 *   ouverte la fait glisser vers la page 01 de l'étape suivante, même mouvement que l'introduction (PageGlide),
 *   comme « Voir la prochaine étape » sur la dernière page d'une étape ;
 *   la liste et l'en-tête changent à l'arrivée (demande de l'utilisateur, à l'essai).
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
 *   (Figma : brand, black demandé par l'utilisateur ; le Plus tourne en X, IconButton « turned »),
 *   sans texte au curseur (tactile). Étape ouverte : liste des pages ; la page choisie s'ouvre sous sa tuile
 *   et repousse les suivantes (variante Figma 01Demo). La tuile choisie reste collée sous l'en-tête du site
 *   (--page-header-height) ; la ligne de l'étape ouverte aussi selon STICKY_STEP_ROW (A/B test) ; choisir une tuile ramène en haut de celle-ci,
 *   défilement doux et court (--motion-duration-base, --motion-ease-out) ; refermer la tuile ouverte ou ouvrir une autre étape ramène au choix de la page,
 *   sans animation (demandes de l'utilisateur).
 * Desktop et tablette : choisir une tuile (clic ou glisse depuis l'introduction) cale le haut du conteneur
 *   sous l'en-tête du site, défilement doux natif (demande de l'utilisateur).
 * Progression de lecture : gardée par page (la plus grande valeur atteinte), affichée dans les tuiles.
 * Lien vers une page de la méthode depuis une autre page du site : /?methode=<nom de la page>
 *   (nom du fichier dans content/methode/pages/, ex. design-system). L'étape et la page s'ouvrent dès l'arrivée,
 *   puis un seul défilement doux mène à la page ouverte (desktop : haut du conteneur sous l'en-tête ; mobile :
 *   tuile choisie sous l'en-tête et la ligne de l'étape), pour un mouvement continu (demande de l'utilisateur).
 */

/** Adresse d'une page de la méthode, ex. methodeHref("design-system") → "/?methode=design-system". */
export function methodeHref(slug: string) {
  return `/?methode=${encodeURIComponent(slug)}`;
}

/** Page visée par l'adresse (?methode=…) : ouverte (étape, page) à l'image suivante, une fois l'affichage
    desktop ou mobile choisi (l'autre affichage, monté un instant, est annulé).
    Renvoie un repère levé au moment de cette ouverture (à baisser par qui le lit). */
function useLinkedPage(steps: MethodeStep[], openPage: (step: number, page: number) => void) {
  const linked = useRef(false);
  const openRef = useRef(openPage);
  useLayoutEffect(() => {
    openRef.current = openPage;
  });
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("methode");
    if (!slug) return;
    const step = steps.findIndex((item) => item.pages.some((page) => page.slug === slug));
    if (step < 0) return;
    const page = steps[step].pages.findIndex((item) => item.slug === slug);
    const frame = requestAnimationFrame(() => {
      linked.current = true;
      openRef.current(step, page);
    });
    return () => cancelAnimationFrame(frame);
  }, [steps]);
  return linked;
}

const divider = <span aria-hidden className="block w-full shrink-0 border-t border-shape-neutral-black" />;

/**
 * Mobile, à l'essai (A/B test, demande de l'utilisateur) : la ligne de l'étape ouverte (ex. « Découvrir ») reste-t-elle
 * collée sous l'en-tête du site ? false : elle défile avec la page, et la tuile choisie se colle seule sous l'en-tête.
 * Repasser à true pour revenir au comportement précédent.
 */
const STICKY_STEP_ROW = false;

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
  /* Texte au curseur des boutons « précédente » et « suivante » : « Étape : » et le nom de l'étape visée
     (demande de l'utilisateur), sur le curseur ; rien sur un bouton désactivé. */
  const stepCursor = (index: number) =>
    steps[index] ? `${commun.curseur_methode_etape} ${steps[index].title}` : undefined;
  const prevCursor = useCursorLabel(stepCursor(current - 1));
  const nextCursor = useCursorLabel(stepCursor(current + 1));
  const page = selected === null ? null : step.pages[selected];

  /* Étape visée par la glisse de la page ouverte vers la page 01 de l'étape suivante (« suivante »). */
  const [glide, setGlide] = useState<number | null>(null);
  const goToStep = (index: number) => {
    setGlide(null);
    setCurrent(index);
    setSelected(null);
  };
  /* « suivante » : page ouverte → glisse vers la page 01 de l'étape suivante ;
     introduction → introduction de l'étape suivante, sans animation (demande de l'utilisateur). */
  const nextStep = () => {
    if (glide !== null) return;
    if (page && steps[current + 1].pages[0]?.content) setGlide(current + 1);
    else goToStep(current + 1);
  };
  useLinkedPage(steps, (stepIndex, pageIndex) => {
    setCurrent(stepIndex);
    setSelected(pageIndex);
  });
  const next = () => {
    if (selected !== null && selected < step.pages.length - 1) setSelected(selected + 1);
    /* Dernière page de l'étape : même glisse que « suivante » vers la page 01 de l'étape suivante
       (demande de l'utilisateur). */
    else if (current < steps.length - 1) nextStep();
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
          <div className={`shrink-0 ${prevCursor.className}`} {...prevCursor.handlers}>
            {prevCursor.node}
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
          <div className={`shrink-0 ${nextCursor.className}`} {...nextCursor.handlers}>
            {nextCursor.node}
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
                onClick={nextStep}
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
          {page ? (
            <PageGlide
              nextPage={glide === null ? null : (steps[glide].pages[0]?.content ?? null)}
              onLand={() => {
                if (glide === null) return;
                lockUntil.current = performance.now() + cssDuration("--methode-pull-lock");
                setGlide(null);
                setCurrent(glide);
                setSelected(0);
              }}
            >
              {page.content && (
                <MethodePage
                  key={page.slug}
                  content={page.content}
                  onProgressChange={(value) => update(page.slug, value)}
                  onNext={next}
                />
              )}
            </PageGlide>
          ) : (
            step.intro && (
                <IntroPull
                  key={step.number}
                  intro={step.intro}
                  nextPage={step.pages[0]?.content ?? null}
                  onLand={() => {
                    lockUntil.current = performance.now() + cssDuration("--methode-pull-lock");
                    setSelected(0);
                  }}
                />
              )
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
  const stickyTop = `calc(var(--page-header-height, 0px) + ${STICKY_STEP_ROW ? rowHeight : 0}px)`;

  /* Ouverture par l'adresse : défilement doux jusqu'à la tuile (au lieu du passage direct d'un choix de tuile). */
  const smoothNextRef = useLinkedPage(steps, (stepIndex, pageIndex) => {
    setOpen(stepIndex);
    setSelected(pageIndex);
  });

  /* Levé quand l'utilisateur referme la tuile ouverte ou passe d'une étape ouverte à une autre :
     le contenu refermé raccourcit la page, qui se retrouverait plus bas (jusqu'au pied de page). */
  const backToRowRef = useRef(false);
  const selectTile = (index: number | null) => {
    backToRowRef.current = index === null;
    setSelected(index);
  };
  /* Levé par « Prochaine étape » : la page suivante s'affiche directement en place, sans défilement visible
     ni clignement (demande de l'utilisateur). */
  const instantNextRef = useRef(false);

  /* Tuile choisie : ramenée en haut, sous l'en-tête et la ligne de l'étape (l'ancienne page refermée
     a pu raccourcir la page au-dessus). */
  useLayoutEffect(() => {
    if (selected === null) {
      /* Tuile refermée ou autre étape ouverte : retour au choix de la page, la ligne de l'étape sous l'en-tête du site
         (demande de l'utilisateur). */
      const block = backToRowRef.current ? rowRef.current?.parentElement : null;
      backToRowRef.current = false;
      instantNextRef.current = false;
      const root = rootRef.current;
      if (root?.hasAttribute("data-instant")) requestAnimationFrame(() => root.removeAttribute("data-instant"));
      if (block) {
        window.scrollTo({
          top: block.getBoundingClientRect().top + window.scrollY - cssNumber("--page-header-height"),
          behavior: "instant",
        });
      }
      return;
    }
    const tile = rootRef.current?.querySelector<HTMLElement>("[data-selected-tile]");
    if (!tile) return;
    const header = cssNumber("--page-header-height");
    const row = STICKY_STEP_ROW ? (rowRef.current?.offsetHeight ?? 0) : 0;
    const top = tile.getBoundingClientRect().top + window.scrollY - header - row;
    const linked = smoothNextRef.current;
    const instant = instantNextRef.current;
    smoothNextRef.current = false;
    instantNextRef.current = false;
    // Avant l'affichage (effet de mise en page) : aucun état intermédiaire visible.
    if (instant) {
      window.scrollTo({ top, behavior: "instant" });
      // Transitions de couleur coupées le temps du changement (sinon la tuile choisie passe du clair au noir).
      const root = rootRef.current;
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => root?.removeAttribute("data-instant"));
      });
      return () => cancelAnimationFrame(frame);
    }
    /* Ouverture par l'adresse : défilement doux natif. Tuile choisie : défilement doux et court
       (--motion-duration-base, --motion-ease-out, demande de l'utilisateur). */
    if (linked) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduce ? "instant" : "smooth" });
    } else {
      return quickScrollTo(top);
    }
  }, [selected, open, smoothNextRef]);

  const toggle = (index: number) => {
    backToRowRef.current = open !== null && open !== index;
    setOpen((current) => (current === index ? null : index));
    setSelected(null);
  };

  return (
    <div
      ref={rootRef}
      className={`flex w-full flex-col bg-background-neutral-white text-text-neutral-black data-instant:**:transition-none ${className}`}
    >
      {steps.map((step, i) => {
        const isOpen = open === i;
        const page = isOpen && selected !== null ? step.pages[selected] : null;
        const next = () => {
          instantNextRef.current = true;
          rootRef.current?.setAttribute("data-instant", "");
          if (selected !== null && selected < step.pages.length - 1) setSelected(selected + 1);
          else if (i < steps.length - 1) toggle(i + 1);
        };
        return (
          <div key={step.number} className="flex flex-col">
            <div
              ref={isOpen ? rowRef : undefined}
              className={
                isOpen && STICKY_STEP_ROW ? "sticky top-(--page-header-height,0px) z-2 bg-background-neutral-white" : ""
              }
            >
              <div className="flex cursor-pointer items-center gap-md px-md" onClick={() => toggle(i)}>
                <div className="flex min-w-0 flex-1 flex-col gap-xs py-sm">
                  <StepTitle step={step} />
                  <p className="type-swiss-regular">{step.description}</p>
                </div>
                <IconButton
                  icon="Plus"
                  turned={isOpen}
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
                onSelectedChange={selectTile}
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

/** Courbe cubic-bezier(x1, y1, x2, y2) lue dans un token CSS : progression (0 à 1) selon le temps (0 à 1). */
function cssEasing(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  const match = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return (t: number) => t;
  const [x1, y1, x2, y2] = match[1].split(",").map(Number);
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (time: number) => {
    // Paramètre de la courbe dont l'abscisse vaut time (dichotomie : la courbe est croissante en x).
    let low = 0;
    let high = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      if (at(x1, x2, mid) < time) low = mid;
      else high = mid;
    }
    return at(y1, y2, (low + high) / 2);
  };
}

/**
 * Défilement de la page jusqu'à top, doux et court : --motion-duration-base, --motion-ease-out
 * (le défilement doux natif est trop long). Interrompu si l'utilisateur fait défiler ; mouvement réduit : direct.
 * Renvoie l'annulation.
 */
function quickScrollTo(top: number) {
  const from = window.scrollY;
  const duration = cssDuration("--motion-duration-base");
  if (Math.abs(top - from) < 1 || duration <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top, behavior: "instant" });
    return () => {};
  }
  const ease = cssEasing("--motion-ease-out");
  const start = performance.now();
  let frame = requestAnimationFrame(function step(now) {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: from + (top - from) * ease(t), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  });
  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  return stop;
}

/** Durée lue dans un token CSS, en ms (le CSS compilé peut l'écrire en secondes, ex. « .3s »). */
function cssDuration(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value.endsWith("ms") ? parseFloat(value) : (parseFloat(value) || 0) * 1000;
}

/**
 * Page ouverte (desktop) qui glisse vers la page 01 de l'étape suivante (« suivante » cliqué) :
 * même mouvement que l'introduction vers sa page 01 (remontée lente sur --methode-pull-delay, puis glisse
 * sur --motion-duration-base), sans attendre la molette. La page ouverte reste montée (sa position de lecture
 * est gardée pendant la glisse) ; la page d'arrivée est ajoutée dessous le temps du mouvement.
 */
function PageGlide({
  children,
  nextPage,
  onLand,
}: {
  children: ReactNode;
  nextPage: MethodePageContent | null;
  onLand: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const land = useRef(onLand);
  useEffect(() => {
    land.current = onLand;
  });

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const move = (value: string, duration: string | null) => {
      track.style.transition = duration ? `transform ${duration} var(--motion-ease-out)` : "none";
      track.style.transform = value;
    };
    if (!nextPage) return move("", null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return land.current();
    let landing = false;
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== track) return;
      if (landing) return land.current();
      landing = true;
      move("translateY(-100%)", "var(--motion-duration-base)");
    };
    /* Remontée lente : un cran de molette (100, plafond de l'introduction) réduit par la résistance.
       Lecture de la mise en page d'abord, pour que la transition parte bien de la position de départ. */
    void track.offsetHeight;
    move(`translateY(${-100 * cssNumber("--methode-pull-resistance")}px)`, "var(--methode-pull-delay)");
    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [nextPage]);

  return (
    <div className="relative size-full overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 z-1 block border-t border-shape-neutral-black" />
      <div ref={trackRef} className="flex size-full flex-col">
        <div className="size-full shrink-0">{children}</div>
        {nextPage && (
          <div aria-hidden inert className="pointer-events-none size-full shrink-0">
            <MethodePage content={nextPage} />
          </div>
        )}
      </div>
    </div>
  );
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
