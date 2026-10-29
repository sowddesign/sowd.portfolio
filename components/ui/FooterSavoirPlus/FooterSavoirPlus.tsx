import { TextualButton } from "../TextualButton";
import { pageHrefs } from "../pages";

/*
 * Bloc « Tu veux en savoir plus ? » du pied de page — composant Figma « footerSavoirplus »
 * (fichier portfolio, node 4966:24084).
 * La variante Figma « device » passe par les breakpoints, pas par une prop.
 * Mobile : pas de trait en bas du bloc (un visuel suit).
 */

export type FooterSavoirPlusProps = {
  className?: string;
};

export function FooterSavoirPlus({ className = "" }: FooterSavoirPlusProps) {
  return (
    <div className={`flex w-full flex-col bg-background-neutral-black ${className}`}>
      {/* Contact prompt heading */}
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center justify-between px-md py-lg tablet:px-lg">
          <div className="flex w-full items-center gap-sm">
            <p className="type-body-accentuation text-text-neutral-white">Tu veux en savoir plus ?</p>
          </div>
        </div>
        <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />
      </div>

      {/* buttonRow : colonne en mobile, grille de 3 colonnes en tablette et desktop. */}
      <div className="flex w-full flex-col gap-lg px-md py-lg tablet:grid tablet:grid-cols-3 tablet:px-lg">
        <TextualButton
          variant="primary"
          color="brand"
          icon="DownloadSimple"
          iconPosition="right"
          href="/cv/Tom_Lamy_Designer_CV.pdf"
          download="Tom_Lamy_Designer_CV.pdf"
        >
          Télécharger mon CV
        </TextualButton>
        <TextualButton variant="secondary" color="white" icon="ArrowRight" iconPosition="right" href="/#ux-process">
          Voir ma démarche UX
        </TextualButton>
        <TextualButton variant="tertiary" color="white" icon="ArrowRight" iconPosition="right" href={pageHrefs.contact}>
          Me contacter
        </TextualButton>
      </div>

      <span aria-hidden className="hidden h-px w-full shrink-0 bg-shape-neutral-white tablet:block" />
    </div>
  );
}
