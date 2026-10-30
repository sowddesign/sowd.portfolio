"use client";

import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { commun } from "@/content/texts";
import { Icon, type IconName } from "../Icon";
import { IconButton } from "../IconButton";

/*
 * Champ de formulaire — composant Figma « textField » (fichier portfolio, node 4440:1477).
 * Variantes Figma → props : type (textField | textArea).
 * États Figma → comportement :
 *   default : vide et sans focus, le titre est dans le champ (body/regular) ;
 *   entered : focus, le titre est au-dessus (captionText/small/accentuation), curseur natif blanc ;
 *   filled  : rempli sans focus, le titre reste au-dessus.
 * Un champ quitté vide revient à default.
 *
 * Changement de place du titre (choisi par l'utilisateur) : le titre s'efface puis réapparaît
 * à sa nouvelle place, avec un léger glissement dans le sens du mouvement
 * (--motion-menu-offset), --motion-duration-fast pour chaque phase, --motion-ease-out.
 * S'il passe à la ligne au-dessus du champ, il pousse le champ vers le bas.
 *
 * Croix (IconAfter) : efface la saisie. Pendant la saisie, le focus reste dans le champ.
 * Infobulle native « Supprimer » après un survol prolongé.
 */

/* Survol prolongé avant l'infobulle de la croix — valeur en attente de validation (pas encore de token). */
const TOOLTIP_DELAY = 3000;

/* textField : champ sur plusieurs lignes au besoin (textarea), le clavier mobile suit le type de saisie. */
const inputModes = { text: "text", email: "email", tel: "tel" } as const;

/* Le titre qui part s'efface tout de suite, celui qui arrive attend la fin de cette disparition. */
const titleMotion =
  "transition-[opacity,translate] duration-(--motion-duration-fast) ease-(--motion-ease-out) motion-reduce:transition-none";
const titleIn = "opacity-100 translate-y-0 delay-(--motion-duration-fast)";
const titleOut = "pointer-events-none absolute inset-x-0 top-0 opacity-0 delay-0";

export type TextFieldProps = {
  /** Propriété Figma « type ». */
  type?: "textField" | "textArea";
  /** Titre du champ (propriété Figma « titleText »). */
  label: string;
  /** Astérisque après le titre et champ obligatoire (propriété Figma « obligatoire »). */
  required?: boolean;
  /** Texte sous le trait (propriétés Figma « détails » et « detailsText ») ; absent = masqué. */
  details?: string;
  /** Icône avant le texte (propriété Figma « iconBefore »). */
  iconBefore?: boolean;
  /** Icône interchangeable (propriété Figma « iconBeforeSelect »). */
  icon?: IconName;
  /** Croix qui efface la saisie (propriété Figma « IconAfter ») ; "filled" : seulement quand le champ contient du texte. */
  iconAfter?: boolean | "filled";
  /** textField seulement : type de saisie (clavier adapté sur mobile). Pas une variante Figma.
   *  Le texte saisi passe à la ligne au bord droit, comme le titre. */
  inputType?: "text" | "email" | "tel";
  /** Vérification de la saisie. Un champ rempli et invalide, une fois quitté, passe en erreur (état provisoire,
   *  absent de Figma) : texte saisi en text/brand/dark (même couleur que les tokens « darkest »), icône « ! » en shape/brand/darkest. */
  isValid?: (value: string) => boolean;
  name?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function TextField({
  type = "textField",
  label,
  required = false,
  details,
  iconBefore = true,
  icon = "ArrowRight",
  iconAfter = true,
  inputType = "text",
  isValid,
  name,
  defaultValue = "",
  onValueChange,
  className = "",
}: TextFieldProps) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const raised = focused || value !== "";
  const error = !focused && value !== "" && isValid !== undefined && !isValid(value);

  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const tooltipTimer = useRef<number | undefined>(undefined);

  const update = (next: string) => {
    setValue(next);
    onValueChange?.(next);
  };

  /* Pendant la saisie, la croix ne prend pas le focus : l'utilisateur peut continuer à écrire. */
  const keepFocus = (event: MouseEvent) => {
    if (focused) event.preventDefault();
  };

  const focusField = (event: MouseEvent) => {
    if (!(event.target as Element).closest("button")) fieldRef.current?.focus();
  };

  const showTooltipLater = () => {
    window.clearTimeout(tooltipTimer.current);
    tooltipTimer.current = window.setTimeout(() => setTooltip(true), TOOLTIP_DELAY);
  };
  const hideTooltip = () => {
    window.clearTimeout(tooltipTimer.current);
    setTooltip(false);
  };

  const fieldProps = {
    ref: fieldRef,
    id,
    name,
    value,
    required,
    "aria-label": label,
    "aria-invalid": error || undefined,
    onChange: (event: { target: { value: string } }) => update(event.target.value),
    onFocus: () => setFocused(true),
    rows: 1,
    onBlur: () => setFocused(false),
    className: [
      "type-body-regular caret-text-neutral-white bg-transparent outline-none",
      error ? "text-text-brand-dark" : "text-text-neutral-white",
      raised ? "w-full" : "absolute inset-0 opacity-0",
      "resize-none [field-sizing:content]",
      type === "textArea" ? "grow" : "",
    ].join(" "),
  };

  /* textField : une seule valeur, sans retour à la ligne manuel ; Entrée envoie le formulaire comme un champ classique. */
  const singleLine = {
    inputMode: inputModes[inputType],
    enterKeyHint: "next" as const,
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    },
    onChange: (event: { target: { value: string } }) => update(event.target.value.replace(/[\r\n]+/g, " ")),
  };

  const titleText = (
    <>
      {label}
      {required && "*"}
    </>
  );

  return (
    <div className={`relative flex w-full flex-col ${className}`}>
      {/* Titre au-dessus (entered, filled) : -16 px au-dessus du champ comme dans Figma (valeur sans variable).
          La marge basse annule l'empiètement sur une ligne : au-delà, le titre pousse le champ vers le bas.
          Masqué, il sort du flux et attend un peu plus bas (il monte en apparaissant, descend en disparaissant). */}
      <span
        aria-hidden
        className={[
          "type-caption-small-accentuation -mt-[1rem] -mb-[calc(var(--typography-line-height-caption)_-_1rem)] text-left text-text-neutral-white",
          titleMotion,
          raised ? titleIn : `${titleOut} translate-y-(--motion-menu-offset)`,
        ].join(" ")}
      >
        {titleText}
      </span>

      {/* Container — un clic n'importe où (hors croix) place le curseur dans le champ. */}
      <div className="flex cursor-text flex-col gap-none" onClick={focusField}>
        {/* Horizontal Container */}
        <div className="flex flex-col gap-sm pt-none pr-none pb-none pl-sm">
          {/* textContainer — textArea : hauteur minimale Figma 217 px (240 px avec trait et détails), sans variable. */}
          <div className={`flex items-start gap-sm ${type === "textArea" ? "min-h-[13.5625rem]" : ""}`}>
            {iconBefore && (
              <span className="flex shrink-0 py-sm">
                <Icon
                  name={error ? "ExclamationMark" : icon}
                  size="var(--icon-md)"
                  className={error ? "text-shape-brand-darkest" : "text-shape-neutral-white"}
                />
              </span>
            )}

            {/* titleContainer (default) ou Input Text (entered, filled) */}
            <div className="relative flex min-w-0 flex-1 flex-col self-stretch pt-xs">
              {type === "textArea" ? <textarea {...fieldProps} /> : <textarea {...fieldProps} {...singleLine} />}
              {/* Titre dans le champ (default). Masqué, il sort du flux et attend un peu plus haut
                  (il monte en disparaissant, descend en réapparaissant). */}
              <span
                aria-hidden
                className={[
                  "type-body-regular text-left text-text-neutral-white",
                  titleMotion,
                  raised ? `${titleOut} pt-xs -translate-y-(--motion-menu-offset)` : titleIn,
                ].join(" ")}
              >
                {titleText}
              </span>
            </div>

            {(iconAfter === true || (iconAfter === "filled" && value !== "")) && (
              <span className="flex shrink-0 pt-exs">
                <IconButton
                  icon="X"
                  label={commun.champ_supprimer}
                  title={tooltip ? commun.champ_supprimer : undefined}
                  color="black"
                  onMouseDown={keepFocus}
                  onMouseEnter={showTooltipLater}
                  onMouseLeave={hideTooltip}
                  onClick={() => update("")}
                />
              </span>
            )}
          </div>
        </div>

        {/* dividerBar */}
        <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />

        {details && <p className="type-caption-small-italic text-left text-text-neutral-white">{details}</p>}
      </div>
    </div>
  );
}
