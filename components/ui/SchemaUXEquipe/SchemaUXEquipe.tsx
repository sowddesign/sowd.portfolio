"use client";

import Image from "next/image";
import { useState, type PointerEvent } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon/icon-names";
import { Logomark } from "../LogoButton/Logomark";

/*
 * Schéma de l'équipe UX — composant Figma « schémaUXEquipe » (fichier portfolio, node 5763:29549).
 * Propriété Figma « hovered » → état interne (none, leadUX, po, devs, moi) ; « device » passe par les breakpoints
 * propres au schéma (variante schema-equipe:, requête sur la largeur du schéma, voir breakpoints.css) : format mobile
 * jusqu'à 780px de large, desktop au-delà
 * (demande de l'utilisateur). À partir de 740px d'écran, format mobile agrandi
 * (tablet:) : avatars et écart avatar / texte à la valeur desktop (demande de l'utilisateur).
 *
 * Quatre personnes aux coins d'une grille (8 colonnes en desktop, 4 en mobile). Survoler une personne
 * (Figma : « While hovering », dissolve --motion-duration-fast, --motion-ease-out) ou appuyer dessus sur écran tactile
 * (Figma mobile : « While pressing », instantané) colore son rôle en text/brand/brand et affiche, dans la rangée
 * du milieu, ses liens avec les autres (flèche + texte).
 * Avatars en noir et blanc (Figma : saturation -100) ; en couleur pour la personne active et celles avec qui
 * elle travaille (COLORED, identique en desktop et en mobile), même fondu que le texte.
 * Mobile : le logo est posé dans le texte « Alternant UX/UI Designer » (Figma : logo par-dessus des espaces) ;
 * « Tuteur », « Équipe produit », « Moi » et « Équipe développement » y sont masqués, comme dans Figma.
 * Mobile, état moi : PO/PM est aussi coloré (donnée Figma, différente du desktop).
 */

export type SchemaPerson = "leadUX" | "po" | "devs" | "moi";

export type SchemaUXEquipeTexts = {
  lead: string;
  leadLabel: string;
  /** Intitulé court en format réduit (sinon lead). */
  leadShort?: string;
  po: string;
  poLabel: string;
  moi: string;
  moiLabel: string;
  /** Intitulé court quand le libellé « Moi » est affiché au-dessus (format complet), sinon moi. */
  moiShort?: string;
  devs: string;
  devsLabel: string;
  /** Intitulé court en format réduit (sinon devs). */
  devsShort?: string;
  validation: string;
  cadrage: string;
  specificationsDesktop: string;
  specificationsMobile: string;
  retours: string;
  apprentissages: string;
};

export type SchemaUXEquipeProps = {
  texts: SchemaUXEquipeTexts;
  /** Photo de chaque personne (Figma : même image, tournée ou non selon la personne). */
  avatars: Record<SchemaPerson, string>;
  className?: string;
};

const fade =
  "transition-opacity schema-equipe:duration-(--motion-duration-fast) schema-equipe:ease-(--motion-ease-out) duration-0";
const tint =
  "transition-colors schema-equipe:duration-(--motion-duration-fast) schema-equipe:ease-(--motion-ease-out) duration-0";
const saturate =
  "transition-[filter] schema-equipe:duration-(--motion-duration-fast) schema-equipe:ease-(--motion-ease-out) duration-0";

/** Avatars en couleur selon la personne active (Figma : saturation 0, les autres à -100). */
const COLORED: Record<SchemaPerson, SchemaPerson[]> = {
  leadUX: ["leadUX", "moi"],
  po: ["leadUX", "po", "moi"],
  devs: ["leadUX", "moi", "devs"],
  moi: ["leadUX", "po", "moi", "devs"],
};

function Avatar({ src, colored }: { src: string; colored: boolean }) {
  return (
    <span className="relative shrink-0 size-(--schema-equipe-avatar-mobile) tablet:size-(--schema-equipe-avatar-desktop)">
      <Image
        src={src}
        alt=""
        fill
        sizes="80px"
        className={`object-cover ${saturate} ${colored ? "grayscale-0" : "grayscale"}`}
      />
    </span>
  );
}

type AnnotationProps = {
  visible: boolean;
  icon: IconName;
  iconFirst: boolean;
  className: string;
  children: React.ReactNode;
};

function Annotation({
  visible,
  icon,
  iconFirst,
  className,
  children,
}: AnnotationProps) {
  const arrow = (
    <Icon
      name={icon}
      size="var(--icon-lg)"
      className="text-shape-neutral-white"
    />
  );
  return (
    <div
      aria-hidden={!visible}
      className={`row-start-2 flex items-center gap-(--schema-equipe-annotation-space) p-(--schema-equipe-annotation-space) ${fade} ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      } ${className}`}
    >
      {iconFirst && arrow}
      <span className="type-swiss-regular whitespace-nowrap">{children}</span>
      {!iconFirst && arrow}
    </div>
  );
}

export function SchemaUXEquipe({
  texts,
  avatars,
  className = "",
}: SchemaUXEquipeProps) {
  const [active, setActive] = useState<SchemaPerson | null>(null);

  /* Survol à la souris, appui maintenu au doigt ou au stylet. */
  const handlers = (person: SchemaPerson) => ({
    onPointerEnter: (e: PointerEvent) =>
      e.pointerType === "mouse" && setActive(person),
    onPointerLeave: () => setActive(null),
    onPointerDown: (e: PointerEvent) =>
      e.pointerType !== "mouse" && setActive(person),
    onPointerUp: (e: PointerEvent) =>
      e.pointerType !== "mouse" && setActive(null),
    onPointerCancel: () => setActive(null),
  });
  const colored = (person: SchemaPerson) =>
    active !== null && COLORED[active].includes(person);
  const role = (person: SchemaPerson) =>
    `${tint} ${active === person ? "text-text-brand-brand" : ""}`;

  return (
    // Conteneur de la requête schema-equipe : le format suit la largeur du schéma, pas celle de l'écran.
    <div className={`@container/schema-equipe w-full ${className}`}>
      <div
        className={`grid w-full select-none grid-cols-4 grid-rows-[auto_var(--schema-equipe-annotation-row-mobile)_auto] gap-x-sm gap-y-md bg-background-buttons-neutral-black text-text-neutral-white schema-equipe:grid-cols-8 schema-equipe:grid-rows-[repeat(3,var(--schema-equipe-row-height))] schema-equipe:gap-y-sm`}
      >
        {/* Lead UX */}
        <div
          {...handlers("leadUX")}
          className="col-span-2 col-start-1 row-start-1 flex items-center gap-xs schema-equipe:col-span-3 tablet:gap-sm"
        >
          <Avatar src={avatars.leadUX} colored={colored("leadUX")} />
          <div className="flex min-w-0 flex-col gap-xs">
            <span className="type-swiss-regular hidden whitespace-nowrap schema-equipe:inline">
              {texts.leadLabel}
            </span>
            <p
              className={`type-body-accentuation schema-equipe:whitespace-nowrap ${role("leadUX")}`}
            >
              {/* Intitulé court seulement quand la place manque (demande de l'utilisateur) : schéma de moins de 580px, largeur
                  mesurée pour « Lead UX/UI Designer » à côté de son avatar. */}
              <span className="hidden @max-[579px]/schema-equipe:inline">
                {texts.leadShort ?? texts.lead}
              </span>
              <span className="@max-[579px]/schema-equipe:hidden">
                {texts.lead}
              </span>
            </p>
          </div>
        </div>

        {/* PO/PM */}
        <div
          {...handlers("po")}
          className="col-span-2 col-start-3 row-start-1 flex items-center justify-end gap-xs schema-equipe:col-span-3 schema-equipe:col-start-6 tablet:gap-sm"
        >
          <div className="flex flex-col items-end gap-xs">
            <span className="type-swiss-regular hidden whitespace-nowrap schema-equipe:inline">
              {texts.poLabel}
            </span>
            <p
              className={`type-body-accentuation text-right whitespace-nowrap ${role("po")} ${
                active === "moi"
                  ? "[@media(width<=740px)]:text-text-brand-brand"
                  : ""
              }`}
            >
              {texts.po}
            </p>
          </div>
          <Avatar src={avatars.po} colored={colored("po")} />
        </div>

        {/* Moi */}
        <div
          {...handlers("moi")}
          className="col-span-2 col-start-1 row-start-3 flex items-center gap-sm schema-equipe:col-span-3"
        >
          <Avatar src={avatars.moi} colored={colored("moi")} />
          <div className="flex min-w-0 flex-col gap-xs">
            <div className="hidden items-center gap-xs schema-equipe:flex">
              <Logomark className="size-(--schema-equipe-logo-size) text-shape-brand-bright" />
              <span className="type-swiss-accentuation">{texts.moiLabel}</span>
            </div>
            <p
              className={`type-body-accentuation schema-equipe:whitespace-nowrap ${role("moi")}`}
            >
              <Logomark className="mr-xs inline-block size-(--schema-equipe-logo-size) align-middle text-shape-brand-bright schema-equipe:hidden" />
              {/* Quand la place manque : « Moi » au lieu de l'intitulé du poste (demande de l'utilisateur), en dessous de
                  720px (mesuré pour « Alternant UX/UI Designer » face à « Développeurs »). */}
              <span className="hidden @max-[719px]/schema-equipe:inline">
                {/* Sans libellé au-dessus (format réduit) : « Moi » ; avec le libellé « Moi » au-dessus : « UX/UI Designer », pour éviter « Moi » deux fois. */}
                <span className="schema-equipe:hidden">{texts.moiLabel}</span>
                <span className="hidden schema-equipe:inline">
                  {texts.moiShort ?? texts.moi}
                </span>
              </span>
              <span className="@max-[719px]/schema-equipe:hidden">
                {texts.moi}
              </span>
            </p>
          </div>
        </div>

        {/* Développeurs */}
        <div
          {...handlers("devs")}
          className="col-span-2 col-start-3 row-start-3 flex items-center justify-end gap-sm schema-equipe:col-span-3 schema-equipe:col-start-6"
        >
          <div className="flex flex-col items-end gap-xs">
            <span className="type-swiss-regular hidden whitespace-nowrap schema-equipe:inline">
              {texts.devsLabel}
            </span>
            <p
              className={`type-body-accentuation text-right whitespace-nowrap ${role("devs")}`}
            >
              {/* Court en dessous de 470px (mesuré pour « Développeurs »). */}
              <span className="hidden @max-[469px]/schema-equipe:inline">
                {texts.devsShort ?? texts.devs}
              </span>
              <span className="@max-[469px]/schema-equipe:hidden">
                {texts.devs}
              </span>
            </p>
          </div>
          <Avatar src={avatars.devs} colored={colored("devs")} />
        </div>

        {/* Liens entre personnes (rangée du milieu) */}
        <Annotation
          visible={active === "leadUX"}
          icon="ArrowDown"
          iconFirst
          className="col-span-2 col-start-2 justify-center schema-equipe:col-start-4"
        >
          {texts.validation}
        </Annotation>
        <Annotation
          visible={active === "po"}
          icon="ArrowsOutSimple"
          iconFirst={false}
          className="col-span-2 col-start-2 justify-start schema-equipe:col-start-4 schema-equipe:justify-center"
        >
          {texts.cadrage}
        </Annotation>
        <Annotation
          visible={active === "devs"}
          icon="ArrowRight"
          iconFirst={false}
          className="col-span-2 col-start-1 justify-end schema-equipe:col-start-3"
        >
          <span className="schema-equipe:hidden">
            {texts.specificationsMobile}
          </span>
          <span className="hidden schema-equipe:inline">
            {texts.specificationsDesktop}
          </span>
        </Annotation>
        <Annotation
          visible={active === "devs"}
          icon="ArrowLeft"
          iconFirst
          className="col-span-2 col-start-3 justify-start schema-equipe:col-start-5"
        >
          {texts.retours}
        </Annotation>
        <Annotation
          visible={active === "moi"}
          icon="ArrowDown"
          iconFirst={false}
          className="col-span-2 col-start-1 justify-end schema-equipe:col-start-3"
        >
          {texts.apprentissages}
        </Annotation>
        {/* Mobile : seule la flèche vers le bas est gardée (demande de l'utilisateur). */}
        <Annotation
          visible={active === "moi"}
          icon="ArrowDownLeft"
          iconFirst
          className="col-span-2 col-start-3 justify-start not-schema-equipe:hidden schema-equipe:col-start-5"
        >
          {texts.apprentissages}
        </Annotation>
      </div>
    </div>
  );
}
