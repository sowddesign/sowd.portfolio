import Link from "next/link";
import { colorTransition } from "../button-tones";
import { Logomark } from "./Logomark";
import { Logotype } from "./Logotype";

/*
 * Bouton logo — composant Figma « logoButton » (fichier portfolio, section pageHeader 5030:42743).
 * États Figma → CSS : hovered = :hover (toUseLogo/logotype somber), pressed = :active (bright).
 * Lien vers l'accueil.
 */

export type LogoButtonProps = {
  className?: string;
};

export function LogoButton({ className = "" }: LogoButtonProps) {
  return (
    <Link
      href="/"
      aria-label="sowd design — accueil"
      className={[
        "flex h-(--button-size-sm) w-full cursor-pointer items-center gap-sm p-none",
        "text-shape-neutral-black hover:text-shape-brand-somber active:text-shape-brand-bright",
        colorTransition,
        className,
      ].join(" ")}
    >
      <Logomark className="size-(--icon-lg)" />
      {/* Hauteur fixe 24px (valeur fixe dans Figma, sans variable), largeur selon les proportions du SVG. */}
      <Logotype className="h-6 w-auto" />
    </Link>
  );
}
