/*
 * Lien dans un texte — styles Figma captionText/hyperlien et body/hyperlien :
 * soulignement border/brand/bright, 1,5px, décalage 2,3px, sans passer sur les jambages (skip ink).
 *
 * Micro-interactions (choisies par l'utilisateur, pas d'état dans Figma) :
 * - survol : un second trait border/brand/somber se trace de gauche à droite par-dessus
 *   (--motion-duration-base, --motion-ease-out, comme le tracé des boutons secondary) et repart en arrière ;
 * - appui : texte text/brand/dark et traits border/brand/darkest (fondu --motion-duration-fast) ;
 * - lien déjà visité : texte text/brand/dark et trait border/brand/darkest
 *   (les navigateurs n'autorisent que des changements de couleur sur :visited).
 * Le second trait est une copie du texte (data-text) transparente et soulignée,
 * pour suivre exactement le soulignement du lien, jambages compris.
 */

export type HyperLinkProps = {
  href: string;
  /** Texte du lien (texte seul : il est recopié pour tracer le second trait). */
  children: string;
  /** Taille du texte autour : captionText ou body. */
  size?: "caption" | "body";
  className?: string;
};

export function HyperLink({ href, children, size = "caption", className = "" }: HyperLinkProps) {
  const external = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-text={children}
      className={[
        "relative",
        size === "caption" ? "type-caption-hyperlien" : "type-body-hyperlien",
        "transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-out) motion-reduce:transition-none",
        "visited:text-text-brand-dark visited:decoration-border-brand-darkest",
        "active:text-text-brand-dark active:decoration-border-brand-darkest",
        // Second trait : copie transparente du texte, révélée de gauche à droite au survol.
        // leading-[normal] : la copie garde la ligne de base du lien (boîte du lien = hauteur normale de la police).
        "after:pointer-events-none after:absolute after:inset-0 after:leading-[normal] after:whitespace-nowrap after:text-transparent after:content-[attr(data-text)]",
        "after:underline after:decoration-border-brand-somber after:[text-decoration-thickness:var(--hyperlink-thickness)] after:[text-underline-offset:var(--hyperlink-offset)]",
        // Masque prolongé vers le bas (-100%) : le soulignement est dessiné sous la boîte du texte.
        "after:[clip-path:inset(0_100%_-100%_0)] hover:after:[clip-path:inset(0_0_-100%_0)] active:after:decoration-border-brand-darkest",
        "after:transition-[clip-path,text-decoration-color] after:duration-(--motion-duration-base) after:ease-(--motion-ease-out) motion-reduce:after:transition-none",
        className,
      ].join(" ")}
    >
      {children}
    </a>
  );
}
