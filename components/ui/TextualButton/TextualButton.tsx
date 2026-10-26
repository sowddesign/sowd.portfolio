import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../Icon";

/*
 * Bouton texte — composant Figma « textualButton » (fichier portfolio, node 4287:4656).
 * États Figma → CSS : hovered = :hover, pressed = :active, disabled = attribut disabled.
 */

export type TextualButtonVariant = "primary" | "secondary" | "tertiary";
export type TextualButtonColor = "brand" | "white" | "black" | "active";

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "disabled" | "children"> & {
  /** Texte du bouton (propriété Figma « label »). */
  children: ReactNode;
  /** Propriété Figma « style ». */
  variant?: TextualButtonVariant;
  /** Icône interchangeable (propriété Figma « iconSelect »). Sans icône si absent. */
  icon?: IconName;
  /** left : icône avant le texte (iconSide=no) · right : icône poussée à droite (iconSide=yes). */
  iconPosition?: "left" | "right";
};

export type TextualButtonProps = BaseProps &
  (
    | { disabled?: false; color?: TextualButtonColor }
    | {
        /** Désactivé : color="black" sur fond clair, color="white" sur fond sombre. */
        disabled: true;
        color: "black" | "white";
      }
  );

type Tone = {
  /** Fond et couleur du texte du bouton, avec hover:/active:. */
  root: string;
  /** Couleur de l'icône (tokens shape/*), avec group-hover:/group-active:. */
  icon: string;
  /** Trait de 1px sous le bouton (secondary). */
  divider?: string;
  /** Barre animée de 2px au survol (secondary). */
  bar?: string;
};

const tones: Record<TextualButtonVariant, Record<TextualButtonColor, Tone>> = {
  primary: {
    brand: {
      root: "bg-background-buttons-brand-mid text-text-neutral-black hover:bg-background-buttons-brand-bright active:bg-background-buttons-neutral-black active:text-text-brand-bright",
      icon: "text-shape-neutral-black group-active:text-shape-brand-bright",
    },
    white: {
      root: "bg-background-buttons-neutral-white text-text-neutral-black hover:bg-background-buttons-brand-whitish active:bg-background-buttons-brand-darkest active:text-text-neutral-white",
      icon: "text-shape-neutral-black group-active:text-shape-neutral-white",
    },
    black: {
      root: "bg-background-buttons-neutral-black text-text-neutral-white hover:bg-background-buttons-brand-bright hover:text-text-neutral-black active:bg-background-buttons-brand-somber active:text-text-neutral-white",
      icon: "text-shape-neutral-white group-hover:text-shape-neutral-black group-active:text-shape-neutral-white",
    },
    active: {
      root: "bg-background-buttons-brand-darkest text-text-neutral-black hover:bg-background-buttons-brand-bright hover:text-text-brand-somber active:bg-background-buttons-brand-somber active:text-text-brand-whitish",
      icon: "text-shape-neutral-black group-hover:text-shape-brand-somber group-active:text-shape-brand-whitish",
    },
  },
  secondary: {
    brand: {
      root: "text-text-brand-brand hover:text-text-brand-bright active:text-text-neutral-black",
      icon: "text-shape-brand-brand group-hover:text-shape-brand-bright group-active:text-shape-neutral-black",
      divider: "bg-shape-brand-brand group-active:bg-shape-neutral-black",
      bar: "bg-shape-neutral-black",
    },
    white: {
      root: "text-text-neutral-white hover:text-text-brand-whitish active:text-text-brand-dark",
      icon: "text-shape-neutral-white group-hover:text-shape-brand-whitish group-active:text-shape-brand-darkest",
      divider: "bg-shape-neutral-white group-active:bg-shape-brand-darkest",
      bar: "bg-shape-brand-darkest",
    },
    black: {
      root: "text-text-neutral-black hover:text-text-brand-bright active:text-text-brand-somber",
      icon: "text-shape-neutral-black group-hover:text-shape-brand-bright group-active:text-shape-brand-somber",
      divider: "bg-shape-neutral-black group-active:bg-shape-brand-somber",
      bar: "bg-shape-brand-somber",
    },
    active: {
      root: "text-text-brand-dark hover:text-text-brand-bright active:text-text-brand-somber",
      icon: "text-shape-brand-darkest group-hover:text-shape-brand-bright group-active:text-shape-brand-somber",
      divider: "bg-shape-brand-darkest group-active:bg-shape-brand-somber",
      bar: "bg-shape-brand-somber",
    },
  },
  tertiary: {
    brand: {
      root: "text-text-brand-brand hover:text-text-brand-dark active:text-text-neutral-black",
      icon: "text-shape-brand-brand group-hover:text-shape-brand-darkest group-active:text-shape-neutral-black",
    },
    white: {
      root: "text-text-neutral-white hover:text-text-brand-whitish active:text-text-brand-dark",
      icon: "text-shape-neutral-white group-hover:text-shape-brand-whitish group-active:text-shape-brand-darkest",
    },
    black: {
      root: "text-text-neutral-black hover:text-text-brand-bright active:text-text-brand-somber",
      icon: "text-shape-neutral-black group-hover:text-shape-brand-bright group-active:text-shape-brand-somber",
    },
    active: {
      root: "text-text-brand-dark hover:text-text-brand-bright active:text-text-brand-somber",
      icon: "text-shape-brand-darkest group-hover:text-shape-brand-bright group-active:text-shape-brand-somber",
    },
  },
};

const disabledTones: Record<TextualButtonVariant, Record<"black" | "white", Tone>> = {
  primary: {
    black: {
      root: "bg-background-buttons-neutral-disabled-light text-text-neutral-disabled-light",
      icon: "text-shape-neutral-disabled-light",
    },
    white: {
      root: "bg-background-buttons-neutral-disabled-dark text-text-neutral-disabled-dark",
      icon: "text-shape-neutral-disabled-dark",
    },
  },
  secondary: {
    black: {
      root: "text-text-neutral-disabled-light",
      icon: "text-shape-neutral-disabled-light",
      divider: "bg-shape-neutral-disabled-light",
    },
    white: {
      root: "text-text-neutral-disabled-dark",
      icon: "text-shape-neutral-disabled-dark",
      divider: "bg-shape-neutral-disabled-dark",
    },
  },
  tertiary: {
    black: { root: "text-text-neutral-disabled-light", icon: "text-shape-neutral-disabled-light" },
    white: { root: "text-text-neutral-disabled-dark", icon: "text-shape-neutral-disabled-dark" },
  },
};

const colorTransition = "transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-out)";

export function TextualButton({
  children,
  variant = "primary",
  color = "brand",
  icon,
  iconPosition = "left",
  disabled = false,
  className = "",
  type = "button",
  ...rest
}: TextualButtonProps) {
  const tone = disabled
    ? disabledTones[variant][color as "black" | "white"]
    : tones[variant][color];
  const isSecondary = variant === "secondary";

  const iconNode = icon ? (
    <Icon name={icon} size="var(--icon-md)" className={`${colorTransition} ${tone.icon}`} />
  ) : null;

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "group relative flex h-(--button-size-sm) w-full flex-col justify-center gap-xs",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        colorTransition,
        tone.root,
        className,
      ].join(" ")}
      {...rest}
    >
      {/* Secondary : réserve de 1px en haut, symétrique du trait du bas (calque « spacing » Figma). */}
      {isSecondary && <span aria-hidden className="h-px w-full shrink-0" />}

      <span
        className={[
          "flex w-full items-center gap-xs",
          variant === "primary" ? "px-sm" : "",
          iconPosition === "right" ? "justify-between" : "",
        ].join(" ")}
      >
        {iconPosition === "left" && iconNode}
        {/* Hauteur fixe 24px (valeur fixe dans Figma, sans variable), texte aligné en haut. */}
        <span className="type-caption-regular h-6 min-w-0 flex-1 text-left">{children}</span>
        {iconPosition === "right" && iconNode}
      </span>

      {/* Trait du bas ; la barre animée est ancrée dessus pour le recouvrir quelle que soit la hauteur du contenu. */}
      {isSecondary && (
        <span aria-hidden className="relative h-px w-full shrink-0">
          <span className={`absolute inset-0 ${colorTransition} ${tone.divider}`} />
          {tone.bar && (
            <span
              className={[
                "absolute top-0 left-0 h-0.5 w-full origin-left scale-x-0",
                "transition-transform duration-(--motion-duration-base) ease-(--motion-ease-out)",
                "group-hover:scale-x-100 group-active:scale-x-100",
                tone.bar,
              ].join(" ")}
            />
          )}
        </span>
      )}
    </button>
  );
}
