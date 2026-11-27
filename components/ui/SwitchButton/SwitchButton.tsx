"use client";

import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { buttonTones, colorTransition } from "../button-tones";

/*
 * Bouton à interrupteur — composant Figma « switch » (fichier portfolio, 5923:33190, variantes state=off | on),
 * avec son texte comme dans l'en-tête de l'éditeur de dessin (5923:33239) : texte puis switch, à spacing/md.
 * Code : un seul bouton (demande de l'utilisateur), comme un textualButton tertiary white (couleurs du texte au repos,
 * au survol et à l'appui) ; tout le bouton bascule l'interrupteur.
 * Switch : rail --switch-width × --switch-height, arrondi corner/xl, marge intérieure --switch-padding (Figma, en dur).
 *  - off : rail background/buttons/neutral/white, rond shape/brand/brand à gauche ;
 *  - on : rail background/buttons/brand/bright, rond shape/neutral/black à droite.
 * Survol et appui (demande de l'utilisateur : états du bouton, seul le rond change de couleur) : off comme l'icône
 * d'un tertiary brand (darkest, puis black) ; on : somber, puis darkest (le brand bright du tertiary black se
 * confondrait avec le rail).
 * Glissement « gouttelette » (proposition F, choix de l'utilisateur) :
 * le rond part (--switch-knob-duration), une gouttelette de sa couleur (--switch-drop-size) reste en arrière puis le
 * rattrape (--switch-drop-duration) ; un filtre « goo » (flou puis seuil sur l'opacité) les fait fusionner comme deux
 * gouttes. Mouvement réduit : bascule sans glissement.
 */

/** Filtre « goo » : flou (écart type en px) puis seuil d'opacité (alpha × GOO_GAIN + GOO_OFFSET), valeurs de l'aperçu. */
const GOO_BLUR = 2.5;
const GOO_GAIN = 18;
const GOO_OFFSET = -8;

export type SwitchButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children"> & {
  /** Propriété Figma « state » : on (true) | off (false). */
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  /** Fond : dark (texte tertiary white, par défaut) ou light (texte tertiary black, rail éteint noir pour rester
   *  visible : fenêtre « Mon dessin » de l'éditeur, proposition à valider). */
  theme?: "dark" | "light";
};

export function SwitchButton({
  checked,
  onChange,
  children,
  theme = "dark",
  className = "",
  ...rest
}: SwitchButtonProps) {
  const goo = `switch-goo-${useId().replace(/:/g, "")}`;
  // Rond et gouttelette : même couleur, mêmes états.
  const color = checked
    ? "bg-shape-neutral-black group-hover:bg-shape-brand-somber group-active:bg-shape-brand-darkest"
    : "bg-shape-brand-brand group-hover:bg-shape-brand-darkest group-active:bg-shape-neutral-black";
  const shift = checked ? "translate-x-[calc(var(--switch-width)-var(--switch-height))]" : "";
  const colorMotion = "duration-(--switch-color-duration) ease-(--motion-ease-out)";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "group flex h-(--button-size-sm) cursor-pointer items-center gap-md",
        colorTransition,
        buttonTones.tertiary[theme === "light" ? "black" : "white"].root,
        className,
      ].join(" ")}
      {...rest}
    >
      <span className="type-caption-small-regular">{children}</span>
      <span
        aria-hidden
        className={[
          `relative h-(--switch-height) w-(--switch-width) shrink-0 rounded-xl transition-colors ${colorMotion}`,
          checked
            ? "bg-background-buttons-brand-bright"
            : theme === "light"
              ? "bg-background-buttons-neutral-black"
              : "bg-background-buttons-neutral-white",
        ].join(" ")}
      >
        <svg className="absolute size-0">
          <filter id={goo}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={GOO_BLUR} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${GOO_GAIN} ${GOO_OFFSET}`}
            />
          </filter>
        </svg>
        <span className="absolute inset-0" style={{ filter: `url(#${goo})` }}>
          {/* Gouttelette, centrée dans le rail, derrière le rond. */}
          <span
            className={[
              "absolute top-1/2 left-[calc(var(--switch-height)/2)] size-(--switch-drop-size) -translate-1/2 rounded-rounded",
              "transition-[translate,background-color]",
              "[transition-duration:var(--switch-drop-duration),var(--switch-color-duration)] [transition-timing-function:var(--switch-drop-ease),var(--motion-ease-out)]",
              "motion-reduce:transition-none",
              color,
              checked ? "translate-x-[calc(var(--switch-width)-var(--switch-height)-50%)]" : "",
            ].join(" ")}
          />
          <span
            className={[
              "absolute top-(--switch-padding) left-(--switch-padding) size-[calc(var(--switch-height)-2*var(--switch-padding))] rounded-rounded",
              "transition-[translate,background-color]",
              "[transition-duration:var(--switch-knob-duration),var(--switch-color-duration)] [transition-timing-function:var(--switch-knob-ease),var(--motion-ease-out)]",
              "motion-reduce:transition-none",
              color,
              shift,
            ].join(" ")}
          />
        </span>
      </span>
    </button>
  );
}
