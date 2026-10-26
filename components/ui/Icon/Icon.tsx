import type { CSSProperties } from "react";
import type { IconName } from "./icon-names";

export type IconProps = {
  /** Nom du fichier SVG dans public/icons, sans extension. */
  name: IconName;
  /** Taille en px (nombre) ou toute valeur CSS. */
  size?: number | string;
  /** Texte accessible. Sans label, l'icône est décorative et masquée aux lecteurs d'écran. */
  label?: string;
  className?: string;
};

/**
 * Icône du design system. Prend la couleur du texte courant (currentColor) :
 * on la colore avec une classe text-*, ex. <Icon name="ArrowRight" className="text-shape-brand-brand" />.
 */
export function Icon({ name, size = 24, label, className = "" }: IconProps) {
  const style = {
    "--icon-url": `url(/icons/${name}.svg)`,
    width: size,
    height: size,
  } as CSSProperties;

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 bg-current [mask:var(--icon-url)_center/contain_no-repeat] ${className}`}
      style={style}
    />
  );
}
