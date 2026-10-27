import type { ButtonHTMLAttributes } from "react";
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
 * Bouton icône — composant Figma « iconButton (new) » (fichier portfolio, node 5061:26772).
 */

export type IconButtonVariant = ButtonVariant;
export type IconButtonColor = ButtonColor;

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "disabled" | "children"> & {
  /** Icône interchangeable (propriété Figma « iconSelect »). */
  icon: IconName;
  /** Texte accessible : le bouton n'a pas de texte visible. */
  label: string;
  /** Propriété Figma « style ». */
  variant?: IconButtonVariant;
};

export type IconButtonProps = BaseProps &
  (
    | { disabled?: false; color?: IconButtonColor }
    | {
        /** Désactivé : color="black" sur fond clair, color="white" sur fond sombre. */
        disabled: true;
        color: ButtonDisabledColor;
      }
  );

/*
 * Contour animé (secondary) : 4 traits de 2px tracés l'un après l'autre
 * (bas → droite → haut → gauche), 400 ms au total (2 × --motion-duration-base), linéaire.
 * --border-trace va de 0 à 4 ; chaque trait affiche sa part (0 à 1), ce qui permet
 * de repartir en arrière à la même vitesse depuis n'importe quel point.
 * Chaque trait inclut son coin de départ et s'arrête 2px avant le coin suivant :
 * les coins ne sont jamais couverts deux fois, aucun bout de trait ne dépasse du contour.
 */
const traceSides = [
  "bottom-0 left-0 h-0.5 w-[calc(100%-0.125rem)] origin-left [scale:clamp(0,var(--border-trace),1)_1]",
  "right-0 bottom-0 h-[calc(100%-0.125rem)] w-0.5 origin-bottom [scale:1_clamp(0,calc(var(--border-trace)_-_1),1)]",
  "top-0 right-0 h-0.5 w-[calc(100%-0.125rem)] origin-right [scale:clamp(0,calc(var(--border-trace)_-_2),1)_1]",
  "top-0 left-0 h-[calc(100%-0.125rem)] w-0.5 origin-top [scale:1_clamp(0,calc(var(--border-trace)_-_3),1)]",
];

export function IconButton({
  icon,
  label,
  variant = "primary",
  color = "brand",
  disabled = false,
  className = "",
  type = "button",
  ...rest
}: IconButtonProps) {
  const tone = disabled
    ? disabledButtonTones[variant][color as ButtonDisabledColor]
    : buttonTones[variant][color];

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      className={[
        "group relative flex size-(--button-size-sm) shrink-0 items-center justify-center",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        colorTransition,
        tone.root,
        className,
      ].join(" ")}
      {...rest}
    >
      <Icon name={icon} size="var(--icon-md)" className={`${colorTransition} ${tone.icon}`} />

      {/* Contour 1px intérieur (secondary), même cadre que le tracé animé pour qu'il le recouvre exactement. */}
      {tone.border && <span aria-hidden className={`pointer-events-none absolute inset-0 border ${tone.border}`} />}

      {tone.bar && (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0",
            "transition-[--border-trace] duration-[calc(var(--motion-duration-base)*2)] ease-(--motion-ease-linear)",
            "group-hover:[--border-trace:4] group-active:[--border-trace:4]",
          ].join(" ")}
        >
          {traceSides.map((side) => (
            <span key={side} className={`absolute ${side} ${tone.bar}`} />
          ))}
        </span>
      )}
    </button>
  );
}
