import { commun } from "@/content/texts";
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
        <p className="type-body-accentuation">{commun.contacter_titre}</p>
      </div>

      <div className="flex w-full flex-col">
        <TextualButton
          variant="secondary"
          color="black"
          icon="ArrowUpRight"
          iconPosition="right"
          href="https://www.linkedin.com/in/tom-lamy-145005174/"
        >
          {commun.contacter_linkedin}
        </TextualButton>
        <TextualButton
          variant="secondary"
          color="black"
          icon="ArrowUpRight"
          iconPosition="right"
          href="https://www.instagram.com/sowd.design/"
        >
          {commun.contacter_instagram}
        </TextualButton>
        <TextualButton
          variant="secondary"
          color="black"
          icon="ArrowUpRight"
          iconPosition="right"
          href={`mailto:${commun.contacter_email}`}
        >
          {commun.contacter_email}
        </TextualButton>

        {/* Numéro (calque « number ») : lien d'appel en mobile uniquement, simple texte en tablette et desktop. */}
        <a
          href={`tel:${commun.contacter_telephone.replace(/[^\d+]/g, "")}`}
          className="flex h-(--button-size-sm) w-full items-center justify-center gap-xs tablet:pointer-events-none tablet:cursor-default"
        >
          <span className="flex w-full items-center justify-between">
            {/* Hauteur fixe 24px (valeur fixe dans Figma, sans variable), comme le label de textualButton. */}
            <span className="type-caption-regular h-6 w-full text-left">{commun.contacter_telephone}</span>
          </span>
        </a>
      </div>
    </div>
  );
}
