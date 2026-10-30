import { commun } from "@/content/texts";
import { Icon } from "../Icon";
import { MeContacterContent } from "../MeContacterContent";
import { NavigationContent } from "../NavigationContent";
import { NamedStylized } from "./NamedStylized";

/*
 * Pied de page — composant Figma « navigationContainer » (fichier portfolio, node 5036:43858).
 * Les deux rangées suivent la grille « adaptativeGrid » (grid-layout : colonnes, gouttière et marges
 * latérales = --grid-spacing). En mobile, la navigation passe avant « Me contacter ».
 */

export type NavigationContainerProps = {
  className?: string;
};

export function NavigationContainer({ className = "" }: NavigationContainerProps) {
  return (
    <div className={`flex w-full flex-col gap-lg pb-xxl ${className}`}>
      {/* footerContent */}
      <div className="grid-layout gap-y-lg">
        <MeContacterContent className="order-2 col-span-4 tablet:order-none tablet:col-span-3" />
        <NavigationContent className="order-1 col-span-4 tablet:order-none tablet:col-span-5 desktop:col-span-9" />
      </div>

      {/* designedFooter */}
      <div className="grid-layout text-text-neutral-black">
        <div className="col-span-2 flex items-end tablet:col-start-4">
          <div className="flex gap-xxs">
            <div className="flex">
              <span className="type-swiss-small-regular">{commun.pied_signature}</span>
              <Icon name="Copyright" size="var(--icon-xs)" className="text-shape-neutral-black" />
            </div>
            <span className="type-swiss-small-regular">{commun.pied_annee}</span>
          </div>
        </div>

        <div className="col-span-2 col-start-3 flex items-end justify-end gap-sm tablet:col-start-7 desktop:col-start-11">
          {/* whitespace-pre : conserve le double espace de Figma (« design  par »). */}
          <span className="type-swiss-small-regular whitespace-pre">{commun.pied_design_par}</span>
          <NamedStylized className="text-shape-neutral-black" />
        </div>
      </div>
    </div>
  );
}
