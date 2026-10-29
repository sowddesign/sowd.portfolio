"use client";

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
          <p className="type-body-accentuation">Naviguer :</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-lg">
        <div className="flex w-full flex-col gap-sm">
          <NavigationButton size="lg" color={colorFor("home")} href={pageHrefs.home}>
            Accueil
          </NavigationButton>
          <NavigationButton size="md" href="/#showreel">
            Showreel
          </NavigationButton>
          <NavigationButton size="md" href="/#ux-process">
            Démarche UX
          </NavigationButton>
        </div>
        <NavigationButton size="lg" color={colorFor("projects")} href={pageHrefs.projects}>
          Projets
        </NavigationButton>
        <NavigationButton size="lg" color={colorFor("about")} href={pageHrefs.about}>
          À propos
        </NavigationButton>
      </div>
    </div>
  );
}
