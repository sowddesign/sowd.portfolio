"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { commun } from "@/content/texts";
import type { MdLine } from "@/lib/markdown";
import type { MethodeElement, MethodePageContent } from "@/lib/methode";
import { HeaderImage } from "../HeaderImage";
import { IconButton } from "../IconButton";
import { RichLines } from "../RichText";
import { TextualButton } from "../TextualButton";
import { ImageZoom, type ZoomedImage } from "./ImageZoom";
import { MethodeBody } from "./MethodeBody";

/*
 * Méthode, modèle de page — composant Figma « methode » (fichier portfolio, node 4302:10399),
 * variantes pageSelected=page01 (desktop et mobile). Textes et images : content/methode/<étape>/<page>.md.
 * Variantes Figma → props : device → device ; etapeSelected et pageSelected → le fichier lu (content).
 *
 * Desktop : remplit son parent (conteneur de 830 de haut en usage) et son contenu défile à l'intérieur,
 * avec la barre de défilement discrète (8 de large, choix de l'utilisateur).
 *   Traits du haut et du bas ; image d'en-tête (hauteur --header-image-height) et trait ;
 *   « En quelques mots » (subheading, deux colonnes captionText/regular) ; trait ;
 *   « Utilisation dans un projet » (MethodeBody) ; trait ; boutons secondary black (projet) et primary brand
 *   (étape suivante). Écarts spacing/xxl entre blocs, marges spacing/lg.
 * Mobile : la page défile normalement ; « En quelques mots » et « Dans mes projets » en accordéon
 *   (une seule partie ouverte à la fois, demande de l'utilisateur), iconButton tertiary black CaretUp / CaretDown
 *   (Figma : brand, black demandé par l'utilisateur),
 *   sans texte au curseur (pas de curseur en tactile). Bouton du projet au bas de « Dans mes projets »,
 *   bouton de l'étape suivante sous l'accordéon.
 *
 * Agrandissement (desktop et mobile, demande de l'utilisateur) : un clic sur une image l'affiche en grand
 * par-dessus la page (ImageZoom), « Agrandir » au curseur.
 *
 * Progression de lecture (onProgressChange, de 0 à 1, pour la ProgressBar de navSideTiles) :
 *   desktop : défilement du contenu ;
 *   mobile : chaque partie compte selon la longueur de son texte (demande de l'utilisateur),
 *   lue en défilant la page pendant qu'elle est ouverte ; « En quelques mots » est ouvert d'office ;
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

const divider = <span aria-hidden className="block h-px w-full shrink-0 bg-shape-neutral-black" />;

function Paragraphs({ paragraphs }: { paragraphs: MdLine[][] }) {
  return paragraphs.map((lines, i) => (
    <p key={i} className="type-caption-regular text-pretty">
      <RichLines lines={lines} linkCursorLabel={commun.curseur_voir_projet} />
    </p>
  ));
}

/** Nombre de caractères d'un texte, pour répartir la progression mobile entre les deux parties. */
const lengthOf = (lines: MdLine[]) => lines.reduce((sum, line) => sum + line.reduce((n, part) => n + part.text.length, 0), 0);

function elementLength(item: MethodeElement): number {
  switch (item.kind) {
    case "subtitle":
      return lengthOf([item.line]);
    case "text":
    case "caption":
      return lengthOf(item.lines);
    case "numbered":
      return lengthOf(item.items.map(({ line }) => line));
    case "bullets":
      return lengthOf(item.items);
    case "figure":
      return item.value.length + lengthOf([item.label]);
    case "image":
      return 0;
  }
}

/** Part de « En quelques mots » dans la page (le reste revient à « Dans mes projets »). */
function definitionShare(content: MethodePageContent) {
  const definition = lengthOf([...content.definition.left, ...content.definition.right].flat());
  const projet = content.sections.reduce(
    (sum, section) =>
      sum +
      (section.title ? lengthOf([section.title]) : 0) +
      section.rows.reduce(
        (rows, row) => rows + row.columns.flat().reduce((items, item) => items + elementLength(item), 0),
        0,
      ),
    0,
  );
  return definition + projet > 0 ? definition / (definition + projet) : 0.5;
}

/** Lecture d'un élément dans la page : 0 quand son haut atteint le haut de l'écran, 1 quand son bas atteint le bas. */
function readOf(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  const value = distance > 0 ? -rect.top / distance : rect.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, value));
}

type Part = "definition" | "projet";

function AccordionPart({
  title,
  open,
  onToggle,
  children,
  contentRef,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  contentRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="flex flex-col px-md">
      <div className="flex cursor-pointer items-center gap-md py-lg" onClick={onToggle}>
        <h3 className="type-subheading min-w-0 flex-1 text-pretty">{title}</h3>
        <IconButton
          icon={open ? "CaretUp" : "CaretDown"}
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
      {open && (
        <div ref={contentRef} className="pb-lg">
          {children}
        </div>
      )}
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Part | null>("definition");
  const parts = useRef<Record<Part, HTMLDivElement | null>>({ definition: null, projet: null });
  const read = useRef<Record<Part, number>>({ definition: 0, projet: 0 });
  const [zoom, setZoom] = useState<ZoomedImage | null>(null);
  const openZoom = (src: string, origin: HTMLElement) => {
    for (const section of content.sections)
      for (const row of section.rows)
        for (const column of row.columns)
          for (const item of column)
            if (item.kind === "image" && item.src === src)
              return setZoom({ src, alt: item.alt, width: item.width, height: item.height, origin });
  };
  const share = definitionShare(content);
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
      report.current?.(distance > 0 ? Math.min(1, el.scrollTop / distance) : 1);
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

  /* Mobile : lecture de la partie ouverte, chaque partie pour moitié. */
  useEffect(() => {
    if (!mobile || !open) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = parts.current[open];
      if (el) read.current[open] = Math.max(read.current[open], readOf(el));
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
  }, [mobile, open, share]);

  const zoomView = zoom && <ImageZoom image={zoom} onClosed={() => setZoom(null)} />;

  const header = (
    <div className="flex w-full flex-col">
      <div className="h-(--header-image-height) w-full">
        <HeaderImage title={content.header.title} keywords={content.header.keywords} image={content.header.image} />
      </div>
      {divider}
    </div>
  );

  const projectButton = (
    <TextualButton variant="secondary" color="black" icon="ArrowUpRight" iconPosition="right" href={content.project.href}>
      {content.project.label}
    </TextualButton>
  );
  const nextButton = (
    <TextualButton variant="primary" color="brand" icon="ArrowRight" iconPosition="right" onClick={onNext}>
      {commun.methode_etape_suivante}
    </TextualButton>
  );

  if (mobile) {
    const toggle = (part: Part) => setOpen((current) => (current === part ? null : part));
    return (
      <div className={`flex w-full flex-col text-text-neutral-black ${className}`}>
        <div className="flex flex-col gap-lg pb-lg">
          {header}
          <div className="flex flex-col gap-lg">
            <div className="flex flex-col">
              <AccordionPart
                title={commun.methode_definition_titre}
                open={open === "definition"}
                onToggle={() => toggle("definition")}
                contentRef={(el) => {
                  parts.current.definition = el;
                }}
              >
                <div className="flex flex-col gap-lg">
                  <div className="flex flex-col gap-xxs">
                    <Paragraphs paragraphs={content.definition.left} />
                  </div>
                  <div className="flex flex-col gap-sm pr-lg">
                    <Paragraphs paragraphs={content.definition.right} />
                  </div>
                </div>
              </AccordionPart>
              {divider}
              <AccordionPart
                title={commun.methode_projet_titre_mobile}
                open={open === "projet"}
                onToggle={() => toggle("projet")}
                contentRef={(el) => {
                  parts.current.projet = el;
                }}
              >
                <div className="flex flex-col gap-xxl">
                  <MethodeBody sections={content.sections} mobile onImageClick={openZoom} />
                  {projectButton}
                </div>
              </AccordionPart>
              {divider}
            </div>
            <div className="flex flex-col px-md">{nextButton}</div>
          </div>
        </div>
        {divider}
        {zoomView}
      </div>
    );
  }

  return (
    <div className={`flex size-full flex-col text-text-neutral-black ${className}`}>
      {divider}
      <div
        ref={scrollRef}
        tabIndex={0}
        className="scroll-bar-discreet min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain pb-lg outline-none"
      >
        <div className="flex flex-col gap-xxl pb-xxl">
          {header}
          <div className="grid grid-cols-2 gap-x-lg gap-y-xxl px-lg">
            <h3 className="type-subheading col-span-2 text-pretty">{commun.methode_definition_titre}</h3>
            <div className="flex flex-col gap-sm">
              <Paragraphs paragraphs={content.definition.left} />
            </div>
            <div className="flex flex-col gap-sm">
              <Paragraphs paragraphs={content.definition.right} />
            </div>
          </div>
          {divider}
          <div className="flex flex-col gap-xxl px-lg">
            <h3 className="type-subheading text-pretty">{commun.methode_projet_titre}</h3>
            <MethodeBody sections={content.sections} onImageClick={openZoom} />
          </div>
          {divider}
          <div className="grid grid-cols-2 gap-x-lg px-lg">
            {projectButton}
            {nextButton}
          </div>
        </div>
      </div>
      {divider}
      {zoomView}
    </div>
  );
}
