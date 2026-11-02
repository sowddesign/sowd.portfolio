import { commun } from "@/content/texts";
import Link from "next/link";
import { Icon } from "../Icon";

/*
 * Message vers la démarche UX — composant Figma « messageContainer » (fichier portfolio, node 4187:20393).
 * La variante Figma « device » passe par les breakpoints, pas par une prop (seul le padding horizontal change ;
 * la taille du texte H4 suit déjà les breakpoints).
 * Tout le bloc (textes et flèche) est un lien vers l'ancre Démarche UX.
 * Ombre dropshadow/low sur le groupe texte + flèche ; au survol elle disparaît en fondu
 * (--motion-duration-fast, --motion-ease-out ; choix de l'utilisateur, pas d'état dans Figma).
 */

export type MessageContainerProps = {
  className?: string;
};

export function MessageContainer({ className = "" }: MessageContainerProps) {
  return (
    <div className={`flex w-full flex-col items-center justify-end gap-sm px-md py-sm tablet:px-lg ${className}`}>
      <Link
        href="/#ux-process"
        className="flex w-full items-end gap-sm [filter:var(--dropshadow-low-filter)] transition-[filter] duration-(--motion-duration-fast) ease-(--motion-ease-out) hover:[filter:none] motion-reduce:transition-none"
      >
        <span className="type-h4 flex flex-col justify-center gap-xxs whitespace-nowrap">
          <span className="text-text-neutral-white">{commun.message_curieux}</span>
          <span className="text-text-brand-brand">{commun.message_decouvre}</span>
        </span>
        <Icon name="ArrowBendRightDown" size="var(--icon-md)" className="text-shape-brand-brand" />
      </Link>
    </div>
  );
}
