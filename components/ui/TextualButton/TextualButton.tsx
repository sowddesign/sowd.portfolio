import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../Icon";
import {
  buttonTones,
  colorTransition,
  disabledButtonTones,
  type ButtonColor,
  type ButtonDisabledColor,
  type ButtonVariant,
} from "../button-tones";

/*
 * Bouton texte — composant Figma « textualButton » (fichier portfolio, node 4287:4656).
 */

export type TextualButtonVariant = ButtonVariant;
export type TextualButtonColor = ButtonColor;

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
        color: ButtonDisabledColor;
      }
  );

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
    ? disabledButtonTones[variant][color as ButtonDisabledColor]
    : buttonTones[variant][color];
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

      {/* Trait du bas (couleur fixe) ; la barre animée est ancrée dessus pour le recouvrir quelle que soit la hauteur du contenu. */}
      {isSecondary && (
        <span aria-hidden className="relative h-px w-full shrink-0">
          <span className={`absolute inset-0 ${tone.divider}`} />
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
