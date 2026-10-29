import { TextualButton } from "../TextualButton";

/*
 * Bloc « Me contacter » — composant Figma « meContacterContent » (fichier portfolio, node 5036:45405).
 * La variante Figma « device » passe par les modes des tokens (breakpoints), pas par une prop.
 */

export type MeContacterContentProps = {
  className?: string;
};

export function MeContacterContent({ className = "" }: MeContacterContentProps) {
  return (
    <div className={`flex w-full flex-col gap-sm text-text-neutral-black tablet:gap-lg ${className}`}>
      <div className="flex w-full items-center gap-sm">
        <p className="type-body-accentuation">Me contacter :</p>
      </div>

      <div className="flex w-full flex-col">
        <TextualButton
          variant="secondary"
          color="black"
          icon="ArrowUpRight"
          iconPosition="right"
          href="https://www.linkedin.com/in/tom-lamy-145005174/"
        >
          LinkedIn
        </TextualButton>
        <TextualButton
          variant="secondary"
          color="black"
          icon="ArrowUpRight"
          iconPosition="right"
          href="https://www.instagram.com/sowd.design/"
        >
          Instagram
        </TextualButton>
        <TextualButton
          variant="secondary"
          color="black"
          icon="ArrowUpRight"
          iconPosition="right"
          href="mailto:sowd.design@gmail.com"
        >
          sowd.design@gmail.com
        </TextualButton>

        {/* Numéro (calque « number ») : lien d'appel en mobile uniquement, simple texte en tablette et desktop. */}
        <a
          href="tel:0666047921"
          className="flex h-(--button-size-sm) w-full items-center justify-center gap-xs tablet:pointer-events-none tablet:cursor-default"
        >
          <span className="flex w-full items-center justify-between">
            {/* Hauteur fixe 24px (valeur fixe dans Figma, sans variable), comme le label de textualButton. */}
            <span className="type-caption-regular h-6 w-full text-left">06.66.04.79.21</span>
          </span>
        </a>
      </div>
    </div>
  );
}
