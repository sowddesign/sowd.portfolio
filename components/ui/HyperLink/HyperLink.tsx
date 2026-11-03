"use client";

import { useLayoutEffect, useRef } from "react";
import { useCursorLabel } from "../CursorLabel";

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
 * Lien sur plusieurs lignes (demande de l'utilisateur) : la copie est faite mot par mot, et chaque mot se trace
 * à son tour (délai et durée selon sa largeur, mesurés) : le trait va au bout de la ligne puis continue sur la suivante.
 * Avec plusieurs mots, le tracé est régulier (linéaire) pour rester continu d'un mot à l'autre.
 * Texte au curseur facultatif (cursorLabel), ex. « Voir le projet » sur un lien vers un projet, posé au-dessus de la ligne.
 */

export type HyperLinkProps = {
  href: string;
  /** Texte du lien (texte seul : il est recopié pour tracer le second trait). */
  children: string;
  /** Taille du texte autour : captionText ou body. */
  size?: "caption" | "body";
  /** Texte qui remplace le curseur au survol (CursorLabel). */
  cursorLabel?: string;
  className?: string;
};

export function HyperLink({ href, children, size = "caption", cursorLabel, className = "" }: HyperLinkProps) {
  const external = /^https?:\/\//.test(href);
  const cursor = useCursorLabel(cursorLabel, "above");
  const linkRef = useRef<HTMLAnchorElement>(null);
  /* Mots avec leur espace de fin (l'espace est tracé avec le mot qui le précède). */
  const words = children.match(/\S+\s*/g) ?? [children];

  /* Part de chaque mot dans le tracé : délai à l'aller (gauche → droite) et au retour (droite → gauche), durée. */
  useLayoutEffect(() => {
    const link = linkRef.current;
    if (!link || words.length < 2) return;
    const measure = () => {
      const spans = Array.from(link.querySelectorAll<HTMLElement>("[data-text]"));
      const widths = spans.map((span) => span.getBoundingClientRect().width);
      const total = widths.reduce((sum, width) => sum + width, 0) || 1;
      let before = 0;
      spans.forEach((span, i) => {
        const share = widths[i] / total;
        span.style.setProperty("--trace-in", String(before / total));
        span.style.setProperty("--trace-out", String(1 - (before + widths[i]) / total));
        span.style.setProperty("--trace-share", String(share));
        before += widths[i];
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(link);
    return () => observer.disconnect();
  }, [words.length, children]);

  const multiple = words.length > 1;

  return (
    <a
      ref={linkRef}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...cursor.handlers}
      className={[
        "group/link",
        size === "caption" ? "type-caption-hyperlien" : "type-body-hyperlien",
        "transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-out) motion-reduce:transition-none",
        "visited:text-text-brand-dark visited:decoration-border-brand-darkest",
        "active:text-text-brand-dark active:decoration-border-brand-darkest",
        cursor.className,
        className,
      ].join(" ")}
    >
      {words.map((word, i) => (
        <span
          key={i}
          data-text={word}
          className={[
            "relative",
            // Second trait : copie transparente du mot, révélée de gauche à droite au survol.
            // leading-[normal] : la copie garde la ligne de base du lien (boîte = hauteur normale de la police).
            "after:pointer-events-none after:absolute after:inset-0 after:leading-[normal] after:whitespace-pre after:text-transparent after:content-[attr(data-text)]",
            "after:underline after:decoration-border-brand-somber after:[text-decoration-thickness:var(--hyperlink-thickness)] after:[text-underline-offset:var(--hyperlink-offset)]",
            // Masque prolongé vers le bas (-100%) : le soulignement est dessiné sous la boîte du texte.
            "after:[clip-path:inset(0_100%_-100%_0)] group-hover/link:after:[clip-path:inset(0_0_-100%_0)] group-active/link:after:decoration-border-brand-darkest",
            "after:transition-[clip-path,text-decoration-color] motion-reduce:after:transition-none",
            multiple
              ? "after:ease-linear after:duration-[calc(var(--motion-duration-base)*var(--trace-share,1))] after:delay-[calc(var(--motion-duration-base)*var(--trace-out,0))] group-hover/link:after:delay-[calc(var(--motion-duration-base)*var(--trace-in,0))]"
              : "after:duration-(--motion-duration-base) after:ease-(--motion-ease-out)",
          ].join(" ")}
        >
          {word}
        </span>
      ))}
      {cursor.node}
    </a>
  );
}
