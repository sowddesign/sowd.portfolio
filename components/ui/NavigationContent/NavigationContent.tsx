"use client";

import { commun } from "@/content/texts";
import { NavigationButton } from "../NavigationButton";
import { pageHrefs, useActivePage, type PageKey } from "../navigation";

/*
 * Bloc « Naviguer » — composant Figma « navigationContent » (fichier portfolio, node 5036:45564).
 * La variante Figma « device » passe par les modes des tokens (breakpoints), pas par une prop.
 * Accueil, Projets et À propos passent en color="active" sur leur page.
 */

export type NavigationContentProps = {
  /** Force la page active (UI kit) ; par défaut, déduite de l'URL. */
  activePage?: PageKey;
  /** Titre « Naviguer : » ; masqué dans le menu de pageHeader (calque Title masqué dans Figma). */
  showTitle?: boolean;
  className?: string;
};

export function NavigationContent({ activePage, showTitle = true, className = "" }: NavigationContentProps) {
  const active = useActivePage(activePage);
  const colorFor = (page: PageKey) => (active === page ? "active" : "black");

  return (
    <div className={`flex w-full flex-col gap-lg text-text-neutral-black ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-sm">
          <p className="type-body-accentuation">{commun.naviguer_titre}</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-lg">
        <div className="flex w-full flex-col gap-sm">
          <NavigationButton size="lg" color={colorFor("home")} href={pageHrefs.home}>
            {commun.naviguer_accueil}
          </NavigationButton>
          <NavigationButton size="md" href="/#showreel">
            {commun.naviguer_showreel}
          </NavigationButton>
          <NavigationButton size="md" href="/#ux-process">
            {commun.naviguer_demarche_ux}
          </NavigationButton>
        </div>
        <NavigationButton size="lg" color={colorFor("projects")} href={pageHrefs.projects}>
          {commun.naviguer_projets}
        </NavigationButton>
        <NavigationButton size="lg" color={colorFor("about")} href={pageHrefs.about}>
          {commun.naviguer_a_propos}
        </NavigationButton>
      </div>
    </div>
  );
}
