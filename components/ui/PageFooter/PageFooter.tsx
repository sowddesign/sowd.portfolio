import { FooterSeparation } from "../FooterSeparation";
import { NavigationContainer } from "../NavigationContainer";

/*
 * Pied de page du site — composant Figma « pageFooter » (fichier portfolio, node 5507:25646).
 * Assemblage : footerSeparation puis navigationContainer, écart spacing/lg ; hauteur en hug.
 * Fond background/buttons/neutral/white (variable liée dans Figma).
 * La variante Figma « device » passe par les breakpoints des composants assemblés, pas par une prop.
 */

export type PageFooterProps = {
  className?: string;
};

export function PageFooter({ className = "" }: PageFooterProps) {
  return (
    <footer className={`flex w-full flex-col gap-lg bg-background-buttons-neutral-white ${className}`}>
      <FooterSeparation />
      <NavigationContainer />
    </footer>
  );
}
