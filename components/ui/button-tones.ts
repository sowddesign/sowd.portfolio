/*
 * Couleurs partagées par les boutons du design system (textualButton, iconButton).
 * Les deux composants Figma utilisent les mêmes variables pour une même variante.
 * États Figma → CSS : hovered = :hover, pressed = :active, disabled = attribut disabled.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonColor = "brand" | "white" | "black" | "active";
/** Disabled : black sur fond clair, white sur fond sombre. */
export type ButtonDisabledColor = "black" | "white";

export type ButtonTone = {
  /** Fond et couleur du texte du bouton, avec hover:/active:. */
  root: string;
  /** Couleur de l'icône (tokens shape/*), avec group-hover:/group-active:. */
  icon: string;
  /** Trait de 1px sous le bouton textuel (secondary), couleur fixe. */
  divider?: string;
  /** Contour de 1px du bouton icône (secondary), couleur fixe. */
  border?: string;
  /** Couleur de l'animation au survol (secondary). */
  bar?: string;
};

export const buttonTones: Record<ButtonVariant, Record<ButtonColor, ButtonTone>> = {
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
      divider: "bg-shape-brand-brand",
      border: "border-border-brand-brand",
      bar: "bg-shape-neutral-black",
    },
    white: {
      root: "text-text-neutral-white hover:text-text-brand-whitish active:text-text-brand-dark",
      icon: "text-shape-neutral-white group-hover:text-shape-brand-whitish group-active:text-shape-brand-darkest",
      divider: "bg-shape-neutral-white",
      border: "border-border-neutral-white",
      bar: "bg-shape-brand-darkest",
    },
    black: {
      root: "text-text-neutral-black hover:text-text-brand-bright active:text-text-brand-somber",
      icon: "text-shape-neutral-black group-hover:text-shape-brand-bright group-active:text-shape-brand-somber",
      divider: "bg-shape-neutral-black",
      border: "border-border-neutral-black",
      bar: "bg-shape-brand-somber",
    },
    active: {
      root: "text-text-brand-dark hover:text-text-brand-bright active:text-text-brand-somber",
      icon: "text-shape-brand-darkest group-hover:text-shape-brand-bright group-active:text-shape-brand-somber",
      divider: "bg-shape-brand-darkest",
      border: "border-border-brand-darkest",
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

export const disabledButtonTones: Record<ButtonVariant, Record<ButtonDisabledColor, ButtonTone>> = {
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
      border: "border-border-neutral-disabled-light",
    },
    white: {
      root: "text-text-neutral-disabled-dark",
      icon: "text-shape-neutral-disabled-dark",
      divider: "bg-shape-neutral-disabled-dark",
      border: "border-border-neutral-disabled-dark",
    },
  },
  tertiary: {
    black: { root: "text-text-neutral-disabled-light", icon: "text-shape-neutral-disabled-light" },
    white: { root: "text-text-neutral-disabled-dark", icon: "text-shape-neutral-disabled-dark" },
  },
};

export const colorTransition = "transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-out)";
