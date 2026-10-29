import { FooterSavoirPlus } from "../FooterSavoirPlus";
import { FooterVisual } from "../FooterVisual";

/*
 * Pied de page complet — composant Figma « footerSeparation » (fichier portfolio, node 5036:64259).
 * Assemblage : footerSavoirplus, footerVisual puis un dividerBar shape/neutral/black.
 * Hauteur en hug du contenu ; marge haute spacing/lg.
 * La variante Figma « device » passe par les breakpoints des composants assemblés, pas par une prop.
 */

export type FooterSeparationProps = {
  className?: string;
};

export function FooterSeparation({ className = "" }: FooterSeparationProps) {
  return (
    <div className={`flex w-full flex-col bg-background-neutral-black pt-lg ${className}`}>
      <FooterSavoirPlus />
      <FooterVisual />
      <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-black" />
    </div>
  );
}
