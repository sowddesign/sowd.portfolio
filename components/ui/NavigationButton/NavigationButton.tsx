import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { buttonTones, colorTransition } from "../button-tones";

/*
 * Grand bouton texte — composant Figma « navigationButton » (fichier portfolio, node 4989:54377).
 * La variante Figma « device » passe par les modes des tokens (breakpoints), pas par une prop.
 * Mêmes couleurs que textualButton secondary (black / active).
 * Avec href : rendu en lien (next/link), même apparence.
 */

export type NavigationButtonSize = "lg" | "md";
export type NavigationButtonColor = "black" | "active";

type BaseProps = {
  /** Texte du bouton (propriété Figma « label »). */
  children: ReactNode;
  /** Propriété Figma « size ». */
  size?: NavigationButtonSize;
  /** Propriété Figma « color ». */
  color?: NavigationButtonColor;
  className?: string;
};

export type NavigationButtonProps = BaseProps &
  (
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "children" | "className">)
    | { href: string }
  );

const sizes: Record<NavigationButtonSize, { root: string; label: string }> = {
  lg: { root: "h-(--button-size-lg)", label: "type-button-lg" },
  md: { root: "h-(--button-size-md)", label: "type-button-md" },
};

export function NavigationButton({ children, size = "lg", color = "black", className = "", ...rest }: NavigationButtonProps) {
  const tone = buttonTones.secondary[color];
  const rootClassName = [
    "group relative flex w-full cursor-pointer flex-col items-center justify-between",
    sizes[size].root,
    colorTransition,
    tone.root,
    className,
  ].join(" ");

  const content = (
    <>
      {/* Réserve de 1px en haut, symétrique du trait du bas (calque « spacing » Figma, séparateur masqué). */}
      <span aria-hidden className="h-px w-full shrink-0" />

      <span className="flex w-full items-center px-none">
        <span className={`${sizes[size].label} min-w-0 flex-1 text-left`}>{children}</span>
      </span>

      {/* Trait du bas (dividerBar), couleur fixe. */}
      <span aria-hidden className={`h-px w-full shrink-0 ${tone.divider}`} />

      {/* Barre animée (animationButton/textualButtonHovered) : 2px ancrés en bas, recouvre le trait.
          Largeur animée (0 → 100 %) comme dans Figma : un scale déformerait l'épaisseur pendant la transition. */}
      <span
        aria-hidden
        className={[
          "absolute bottom-0 left-0 h-0.5 w-0",
          "transition-[width] duration-(--motion-duration-base) ease-(--motion-ease-out)",
          "group-hover:w-full group-active:w-full",
          tone.bar,
        ].join(" ")}
      />
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} className={rootClassName}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest;
  return (
    <button type={type} className={rootClassName} {...buttonProps}>
      {content}
    </button>
  );
}
