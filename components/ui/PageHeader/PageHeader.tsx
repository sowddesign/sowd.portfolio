"use client";

import { commun } from "@/content/texts";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { IconButton } from "../IconButton";
import { LogoButton } from "../LogoButton";
import { MeContacterContent } from "../MeContacterContent";
import { NavigationContent } from "../NavigationContent";
import { TextualButton } from "../TextualButton";
import { pageHrefs, useActivePage, type PageKey } from "../navigation";

/*
 * En-tête de page — composant Figma « pageHeader » (fichier portfolio, section 5030:42743).
 * La variante Figma « device » passe par les breakpoints ; « state » (default / opened) est l'état du menu ;
 * « activePage » est déduite de l'URL (ou forcée par la prop dans le UI kit).
 * Fixé en haut de l'écran sur tous les appareils.
 *
 * Menu (mobile et tablette) : panneau plein écran sous l'en-tête, espace automatique entre les deux blocs.
 * Ouverture : rideau du haut vers le bas (--motion-duration-base), puis les lignes de texte apparaissent
 * une à une à partir de la moitié du rideau (animate-menu-line, décalage --motion-menu-stagger).
 * Fermeture : le rideau remonte sur la même durée et masque le texte.
 */

export type PageHeaderProps = {
  /** Force la page active (UI kit) ; par défaut, déduite de l'URL. */
  activePage?: PageKey;
  className?: string;
};

/** Lignes de texte animées une à une, dans l'ordre du document. */
const menuLines = "p, a, button";

export function PageHeader({ activePage, className = "" }: PageHeaderProps) {
  const active = useActivePage(activePage);
  const colorFor = (page: PageKey) => (active === page ? "active" : "black");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  // Rang de chaque ligne (--line-index), utilisé pour décaler son apparition.
  useEffect(() => {
    menuRef.current
      ?.querySelectorAll<HTMLElement>(menuLines)
      .forEach((line, index) => {
        line.style.setProperty("--line-index", String(index));
      });
  }, []);

  // Menu ouvert : la page ne défile plus (le menu lui-même reste défilable s'il dépasse l'écran).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Un lien du menu referme le menu (y compris les ancres de la page courante).
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a")) setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-10 flex w-full flex-col bg-background-neutral-white ${className}`}
    >
      <div className="grid-layout h-(--button-size-sm) desktop:h-auto">
        {/* Mobile et tablette : bouton menu (List / X) et contact. */}
        <div className="col-span-1 flex items-center desktop:hidden">
          <IconButton
            variant="tertiary"
            color="black"
            icon={open ? "X" : "List"}
            label={open ? commun.menu_fermer : commun.menu_ouvrir}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          />
        </div>
        <div className="col-span-2 col-start-3 tablet:hidden">
          <TextualButton
            variant="tertiary"
            color={colorFor("contact")}
            icon="ArrowRight"
            iconPosition="right"
            href={pageHrefs.contact}
          >
            {commun.entete_contact}
          </TextualButton>
        </div>
        <div className="col-span-2 col-start-7 hidden tablet:block desktop:hidden">
          <TextualButton
            variant="secondary"
            showDivider={false}
            color={colorFor("contact")}
            icon="ArrowRight"
            iconPosition="right"
            href={pageHrefs.contact}
          >
            {commun.entete_contact}
          </TextualButton>
        </div>

        {/* Desktop : logo, pages et contact. */}
        <div className="col-span-2 hidden desktop:block">
          <LogoButton />
        </div>
        <div className="col-start-8 hidden desktop:block">
          <TextualButton
            variant="secondary"
            showDivider={false}
            color={colorFor("home")}
            href={pageHrefs.home}
          >
            {commun.entete_accueil}
          </TextualButton>
        </div>
        <div className="col-start-9 hidden desktop:block">
          <TextualButton
            variant="secondary"
            showDivider={false}
            color={colorFor("projects")}
            href={pageHrefs.projects}
          >
            {commun.entete_projets}
          </TextualButton>
        </div>
        <div className="col-start-10 hidden desktop:block">
          <TextualButton
            variant="secondary"
            showDivider={false}
            color={colorFor("about")}
            href={pageHrefs.about}
          >
            {commun.entete_a_propos}
          </TextualButton>
        </div>
        <div className="col-start-12 hidden desktop:block">
          <TextualButton
            variant="secondary"
            showDivider={false}
            color={colorFor("contact")}
            icon="ArrowRight"
            iconPosition="right"
            href={pageHrefs.contact}
          >
            {commun.entete_contact}
          </TextualButton>
        </div>
      </div>

      {/* dividerBar sous l'en-tête. */}
      <span
        aria-hidden
        className="h-px w-full shrink-0 bg-shape-neutral-black"
      />

      {/* Menu ouvert (mobile et tablette) : toute la hauteur restante de l'écran sous l'en-tête. */}
      <div
        id={menuId}
        ref={menuRef}
        onClick={closeOnLink}
        className={[
          "absolute top-full left-0 flex h-[calc(100dvh-100%)] w-full flex-col overflow-y-auto bg-background-neutral-white pb-md desktop:hidden",
          "transition-[clip-path,visibility] duration-(--motion-duration-base) ease-(--motion-ease-out)",
          open
            ? "visible [clip-path:inset(0)]"
            : "invisible [clip-path:inset(0_0_100%_0)]",
        ].join(" ")}
      >
        <div
          className={[
            "flex flex-1 flex-col justify-between px-(--grid-spacing) tablet:gap-lg",
            open
              ? "[&_:is(p,a,button)]:animate-menu-line [&_:is(p,a,button)]:[animation-delay:calc(var(--motion-duration-base)/2+var(--line-index,0)*var(--motion-menu-stagger))]"
              : "",
          ].join(" ")}
        >
          <NavigationContent activePage={activePage} showTitle={false} />
          <MeContacterContent />
        </div>
      </div>
    </header>
  );
}
