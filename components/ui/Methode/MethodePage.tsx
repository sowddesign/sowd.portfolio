"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { commun } from "@/content/texts";
import type { MdLine } from "@/lib/markdown";
import type { MethodeBlock, MethodeDefinitionGroup, MethodeElement, MethodePageContent } from "@/lib/methode";
import { HeaderImage } from "../HeaderImage";
import { IconButton } from "../IconButton";
import { RichLines } from "../RichText";
import { TextualButton } from "../TextualButton";
import { ImageLightboxGroup } from "../ImageLightbox";
import { MethodePartView, methodeDivider as divider, methodeSpacing } from "./MethodeBody";
import { MethodeProjectIntro } from "./MethodeProjectIntro";

/*
 * Méthode, modèle de page — frame Figma « methode 01 » (fichier content, node 6291:11332), desktop et mobile.
 * Textes et images : content/methode/pages/<page>.md et content/methode/projets/<projet>.md.
 * Variantes Figma → props : device → device ; la page choisie → le fichier lu (content).
 *
 * Desktop : remplit son parent (conteneur de 830 de haut en usage) et son contenu défile à l'intérieur,
 * avec la barre de défilement discrète (8 de large, choix de l'utilisateur).
 *   Traits du haut et du bas ; image d'en-tête (hauteur --header-image-height-desktop : bas aligné sur celui
 *   de la 3e tuile de la liste, demande de l'utilisateur ; mobile : --header-image-height) et trait ;
 *   « En quelques mots » (headings/H4, puis groupes de paragraphes captionText : groupes à spacing/lg,
 *   paragraphes à spacing/sm) ; trait ; « Utilisation dans un projet » (headings/H4, introduction au projet,
 *   parties séparées par un trait) ; trait ; boutons secondary black (projet) et primary brand (étape suivante).
 *   Écarts spacing/xxl entre blocs, marges spacing/lg ; sous les boutons spacing/xxl (sans l'écart de textContainer, demande de l'utilisateur).
 * Mobile : la page défile normalement ; « En quelques mots » et « Utilisation dans un projet » en accordéon
 *   (ouvertes à l'arrivée et refermables chacune ; une partie déjà lue arrive fermée, comme l'introduction au projet,
 *   demande de l'utilisateur), titres headings/H4, iconButton tertiary black
 *   CaretDown pour ouvrir / CaretUp pour fermer, sans texte au curseur (pas de curseur en tactile) ; une partie lue
 *   jusqu'en bas et fermée affiche Check à la place du CaretDown (comme les tuiles des pages), gardé le temps
 *   de la visite pour cette page (demandes de l'utilisateur).
 *   Écarts spacing/xl (en-tête → contenu, contenu → trait, trait → partie suivante), marges spacing/md ;
 *   groupes de « En quelques mots » à spacing/md, paragraphes à spacing/xs. Sous l'accordéon : boutons du projet
 *   et de l'étape suivante côte à côte (gouttière spacing/md, textes courts du mobile).
 *
 * Agrandissement (desktop et mobile, demande de l'utilisateur) : un clic sur une image l'affiche en grand
 * par-dessus la page (ImageLightbox, carrousel des images de la page), « Agrandir » au curseur.
 *
 * Progression de lecture (onProgressChange, de 0 à 1, pour la ProgressBar de navSideTiles) :
 *   desktop : défilement du contenu ;
 *   mobile : chaque partie compte selon la longueur de son texte (demande de l'utilisateur),
 *   lue en défilant la page pendant qu'elle est ouverte ; une partie déjà lue compte entière ;
 *   la progression atteinte dans une partie est gardée quand elle se referme.
 */

export type MethodePageProps = {
  content: MethodePageContent;
  /** Propriété Figma « device ». */
  device?: "desktop" | "mobile";
  onProgressChange?: (progress: number) => void;
  /** Bouton « Voir la prochaine étape ». */
  onNext?: () => void;
  className?: string;
};

/**
 * « En quelques mots » : groupes de paragraphes, ou liste numérotée (frame Figma « methode03 », node 6297:14105) :
 * titre body/accentuation, éléments numérotés (numéro body/accentuation, texte captionText/regular, écart spacing/sm) ;
 * desktop : deux colonnes, écarts spacing/lg (titre → liste, rangées, gouttière) ; mobile : une colonne, écarts spacing/md.
 */
function Definition({ groups, mobile }: { groups: MethodeDefinitionGroup[]; mobile: boolean }) {
  const spacing = methodeSpacing(mobile);
  return (
    <div className={`flex flex-col ${spacing.sub}`}>
      {groups.map((group, i) =>
        group.kind === "text" ? (
          <div key={i} className={`flex flex-col ${spacing.line}`}>
            {group.lines.map((line, j) => (
              <p key={j} className="type-caption-regular text-pretty">
                <RichLines lines={[line]} linkCursorLabel={commun.curseur_voir_projet} />
              </p>
            ))}
          </div>
        ) : (
          <div key={i} className={`flex flex-col ${spacing.sub}`}>
            {group.title && (
              <p className="type-body-accentuation text-pretty">
                <RichLines lines={[group.title]} size="body" />
              </p>
            )}
            <ol className={mobile ? `flex flex-col ${spacing.sub}` : "grid grid-cols-2 gap-lg"}>
              {group.items.map(({ number, line }) => (
                <li key={number} className="flex items-start gap-sm">
                  <span className="type-body-accentuation w-(--p-number-20) shrink-0">{number}</span>
                  <p className="type-caption-regular min-w-0 flex-1 text-pretty">
                    <RichLines lines={[line]} linkCursorLabel={commun.curseur_voir_projet} />
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ),
      )}
    </div>
  );
}

/** Nombre de caractères d'un texte, pour répartir la progression mobile entre les deux parties. */
const lengthOf = (lines: MdLine[]) => lines.reduce((sum, line) => sum + line.reduce((n, part) => n + part.text.length, 0), 0);

const definitionLength = (group: MethodeDefinitionGroup) =>
  group.kind === "text"
    ? lengthOf(group.lines)
    : lengthOf([...(group.title ? [group.title] : []), ...group.items.map((item) => item.line)]);

function elementLength(item: MethodeElement): number {
  switch (item.kind) {
    case "subtitle":
      return lengthOf([item.line]);
    case "text":
    case "caption":
      return lengthOf(item.lines);
    case "numbered":
      return item.items.reduce((sum, { paragraphs }) => sum + lengthOf(paragraphs), 0);
    case "bullets":
      return lengthOf(item.items);
    case "figure":
      return item.value.length + lengthOf([item.label]);
    case "titled":
      return lengthOf([item.title, ...item.lines]);
    case "audio":
      return item.caption.length;
    case "image":
      return 0;
  }
}

const blocksLength = (blocks: MethodeBlock[]) =>
  blocks.reduce(
    (sum, rows) => sum + rows.reduce((n, row) => n + row.columns.flat().reduce((m, item) => m + elementLength(item), 0), 0),
    0,
  );

/** Part de « En quelques mots » dans la page (le reste revient à « Utilisation dans un projet »). */
function definitionShare(content: MethodePageContent) {
  const definition = content.definition.reduce((sum, group) => sum + definitionLength(group), 0);
  const projet =
    (content.intro ? content.intro.title.length + blocksLength(content.intro.blocks) : 0) +
    content.parts.reduce(
      (sum, part) =>
        sum +
        (part.title ? lengthOf([part.title]) : 0) +
        part.subparts.reduce((n, sub) => n + (sub.title ? lengthOf([sub.title]) : 0) + blocksLength(sub.blocks), 0),
      0,
    );
  return definition + projet > 0 ? definition / (definition + projet) : 0.5;
}

/**
 * Lecture d'un élément dans la page : part de sa hauteur apparue à l'écran par le bas
 * (0 quand son haut entre par le bas de l'écran, 1 quand son bas apparaît).
 */
function readOf(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.height > 0 ? progressOf(window.innerHeight - rect.top, rect.height) : 0;
}

/**
 * Avancée (0 à 1) sur une distance. À moins d'un pixel de la fin, c'est terminé : avec les traits arrondis au pixel
 * d'écran (--divider-width), le défilement peut s'arrêter à une fraction de pixel avant le bout.
 */
function progressOf(position: number, distance: number) {
  return position >= distance - 1 ? 1 : Math.min(1, Math.max(0, position / distance));
}

type Part = "definition" | "projet";

/* Parties lues jusqu'en bas (mobile) : gardées le temps de la visite (sessionStorage), par page. */
const partKey = (slug: string, part: Part) => `methode-partie-lue:${slug}:${part}`;

function storedParts(slug: string) {
  try {
    return (["definition", "projet"] as const).filter((part) => sessionStorage.getItem(partKey(slug, part)) === "1").join(" ");
  } catch {
    return "";
  }
}

const noSubscription = () => () => {};

function AccordionPart({
  title,
  open,
  read,
  onToggle,
  children,
  contentRef,
}: {
  title: string;
  open: boolean;
  /** Lue jusqu'en bas : fermée, Check à la place du CaretDown. */
  read: boolean;
  onToggle: () => void;
  children: ReactNode;
  contentRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="flex flex-col gap-xl px-md">
      <div className="flex cursor-pointer items-center justify-between" onClick={onToggle}>
        <h3 className="type-h4 min-w-0 flex-1 text-pretty">{title}</h3>
        {/* Fermée et lue : Check à la place du CaretDown, comme les tuiles des pages (demande de l'utilisateur). */}
        <IconButton
          icon={open ? "CaretUp" : read ? "Check" : "CaretDown"}
          label={`${open ? commun.methode_fermer : commun.methode_ouvrir} ${title}`}
          cursorLabel={null}
          variant="tertiary"
          color="black"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        />
      </div>
      {open && <div ref={contentRef}>{children}</div>}
    </div>
  );
}

export function MethodePage({
  content,
  device = "desktop",
  onProgressChange,
  onNext,
  className = "",
}: MethodePageProps) {
  const mobile = device === "mobile";
  const { slug } = content;
  const scrollRef = useRef<HTMLDivElement>(null);
  /* Mobile : les deux parties arrivent ouvertes et se ferment chacune ; une partie déjà lue (plus tôt dans la visite)
     arrive fermée, comme l'introduction au projet (demande de l'utilisateur). */
  const [override, setOverride] = useState<Partial<Record<Part, boolean>>>({});
  const parts = useRef<Record<Part, HTMLDivElement | null>>({ definition: null, projet: null });
  const read = useRef<Record<Part, number>>({ definition: 0, projet: 0 });
  const share = definitionShare(content);
  const stored = useSyncExternalStore(noSubscription, () => storedParts(content.slug), () => "");
  const [readHere, setReadHere] = useState<Part[]>([]);
  const readBefore = (part: Part) => stored.split(" ").includes(part);
  const isRead = (part: Part) => readHere.includes(part) || readBefore(part);
  const isOpen = (part: Part) => override[part] ?? !(readBefore(part) && !readHere.includes(part));
  const openParts = (["definition", "projet"] as const).filter(isOpen).join(" ");
  const report = useRef(onProgressChange);
  useEffect(() => {
    report.current = onProgressChange;
  });

  /* Desktop : défilement du contenu. */
  useEffect(() => {
    const el = scrollRef.current;
    if (mobile || !el) return;
    const measure = () => {
      const distance = el.scrollHeight - el.clientHeight;
      report.current?.(distance > 0 ? progressOf(el.scrollTop, distance) : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [mobile]);

  /* Mobile : lecture des parties ouvertes, chacune selon la longueur de son texte ; une partie déjà lue compte entière. */
  useEffect(() => {
    if (!mobile) return;
    const open = openParts ? (openParts.split(" ") as Part[]) : [];
    for (const part of storedParts(slug).split(" ")) if (part) read.current[part as Part] = 1;
    let frame = 0;
    const measure = () => {
      frame = 0;
      for (const part of open) {
        const el = parts.current[part];
        if (!el || el.getClientRects().length === 0 || el.closest("[inert]")) continue;
        read.current[part] = Math.max(read.current[part], readOf(el));
        if (read.current[part] >= 1) {
          try {
            sessionStorage.setItem(partKey(slug, part), "1");
          } catch {}
          setReadHere((parts) => (parts.includes(part) ? parts : [...parts, part]));
        }
      }
      report.current?.(read.current.definition * share + read.current.projet * (1 - share));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [mobile, openParts, share, slug]);

  /*
   * Boutons de navigation : si le texte de l'un d'eux ne tient pas sur une ligne à côté de son icône,
   * les deux boutons perdent leur icône (demande de l'utilisateur).
   */
  const navRef = useRef<HTMLDivElement>(null);
  const iconSpace = useRef(0);
  const [compactNav, setCompactNav] = useState(false);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const texts = [...nav.querySelectorAll<HTMLElement>(".type-caption-regular")];
      const icon = nav.querySelector<HTMLElement>("[style*='--icon-url']");
      if (icon) iconSpace.current = icon.getBoundingClientRect().width + parseFloat(getComputedStyle(icon.parentElement!).columnGap);
      const tight = texts.some((text) => {
        // Largeur du texte sur une ligne, mesurée sur une copie invisible.
        const probe = text.cloneNode(true) as HTMLElement;
        probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;width:auto;height:auto;flex:none";
        text.parentElement!.append(probe);
        const needed = probe.getBoundingClientRect().width;
        probe.remove();
        const available = text.getBoundingClientRect().width - (icon ? 0 : iconSpace.current);
        return needed > available;
      });
      setCompactNav(tight);
    };
    // ResizeObserver mesure aussi au premier affichage.
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [mobile]);

  const header = (
    <div className="flex w-full flex-col">
      <div className={`w-full ${mobile ? "h-(--header-image-height)" : "h-(--header-image-height-desktop)"}`}>
        <HeaderImage
          keywords={content.header.keywords}
          image={content.header.image}
          background={content.header.background}
          layout={mobile ? "mobile" : "desktop"}
          placement={content.header.placement}
          texts={content.header.texts}
        />
      </div>
      {divider}
    </div>
  );

  /* « Utilisation dans un projet » : introduction au projet puis parties, séparées par un trait. */
  const projet = (
    <ImageLightboxGroup>
      <div className={`flex flex-col ${methodeSpacing(mobile).part}`}>
        {content.intro && <MethodeProjectIntro intro={content.intro} mobile={mobile} scrollRoot={mobile ? undefined : scrollRef} />}
        {content.parts.map((part, i) => (
          <Fragment key={i}>
            {(i > 0 || content.intro) && divider}
            <MethodePartView part={part} mobile={mobile} zoomable />
          </Fragment>
        ))}
      </div>
    </ImageLightboxGroup>
  );

  const projectButton = (
    <TextualButton
      variant="secondary"
      color="black"
      icon={compactNav ? undefined : "ArrowUpRight"}
      iconPosition="right"
      href={content.project.href}
      // Projet pas encore accessible (« off » dans content/projects/ordre.yaml) : bouton grisé (demande de l'utilisateur).
      disabled={!content.project.available}
    >
      {mobile ? content.project.labelMobile : content.project.label}
    </TextualButton>
  );
  const nextButton = (
    <TextualButton
      variant="primary"
      color="brand"
      icon={compactNav ? undefined : "ArrowRight"}
      iconPosition="right"
      onClick={onNext}
    >
      {mobile ? commun.methode_etape_suivante_mobile : commun.methode_etape_suivante}
    </TextualButton>
  );

  if (mobile) {
    const toggle = (part: Part) => setOverride((current) => ({ ...current, [part]: !isOpen(part) }));
    return (
      <div className={`flex w-full flex-col text-text-neutral-black ${className}`}>
        <div className="flex flex-col gap-xxl pb-xxl">
          {header}
          <div className="flex flex-col gap-xl">
            <AccordionPart
              title={commun.methode_definition_titre}
              open={isOpen("definition")}
              read={isRead("definition")}
              onToggle={() => toggle("definition")}
              contentRef={(el) => {
                parts.current.definition = el;
              }}
            >
              <Definition groups={content.definition} mobile />
            </AccordionPart>
            {divider}
            <AccordionPart
              title={commun.methode_projet_titre}
              open={isOpen("projet")}
              read={isRead("projet")}
              onToggle={() => toggle("projet")}
              contentRef={(el) => {
                parts.current.projet = el;
              }}
            >
              {projet}
            </AccordionPart>
            {divider}
            <div ref={navRef} className="grid grid-cols-2 gap-x-md px-md">
              {projectButton}
              {nextButton}
            </div>
          </div>
        </div>
        {divider}
      </div>
    );
  }

  return (
    <div className={`flex size-full flex-col text-text-neutral-black ${className}`}>
      {divider}
      <div
        ref={scrollRef}
        tabIndex={0}
        className="scroll-bar-discreet min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain outline-none"
      >
        <div className="flex flex-col gap-xxl pb-xxl">
          {header}
          <div className="flex flex-col gap-xxl px-lg">
            <h3 className="type-h4 text-pretty">{commun.methode_definition_titre}</h3>
            <Definition groups={content.definition} mobile={false} />
          </div>
          {divider}
          <div className="flex flex-col gap-xxl px-lg">
            <h3 className="type-h4 text-pretty">{commun.methode_projet_titre}</h3>
            {projet}
          </div>
          {divider}
          <div ref={navRef} className="grid grid-cols-2 gap-x-lg px-lg">
            {projectButton}
            {nextButton}
          </div>
        </div>
      </div>
      {divider}
    </div>
  );
}
