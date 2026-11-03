import type { MdLine, TextColor } from "@/lib/markdown";
import { HyperLink } from "../HyperLink";

/*
 * Rendu des lignes du markdown simplifié (lib/markdown.ts) : liens, couleurs, italique et gras.
 * La taille (caption ou body) choisit le style de l'italique et des liens ; la couleur de base vient du parent.
 */

/** [texte]{couleur} → token text/* du projet. */
const colorClasses: Record<TextColor, string> = {
  brand: "text-text-brand-brand",
  whitish: "text-text-brand-whitish",
  bright: "text-text-brand-bright",
  dark: "text-text-brand-dark",
  somber: "text-text-brand-somber",
  white: "text-text-neutral-white",
  black: "text-text-neutral-black",
};

export type RichLinesProps = {
  lines: MdLine[];
  size?: "caption" | "body";
  /** Texte au curseur des liens internes (ex. « Voir le projet »). */
  linkCursorLabel?: string;
};

/** Gras : graisse typography/weight/paragraph/accentuation. */
const bold = "[font-weight:var(--typography-weight-paragraph-accentuation)]";

export function RichLines({ lines, size = "caption", linkCursorLabel }: RichLinesProps) {
  const italic = size === "caption" ? "type-caption-italic" : "type-body-italic";

  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line.map(({ text, href, color, italic: isItalic, bold: isBold }, j) =>
        href ? (
          <HyperLink
            key={j}
            href={href}
            size={size}
            cursorLabel={/^https?:\/\//.test(href) ? undefined : linkCursorLabel}
          >
            {text}
          </HyperLink>
        ) : (
          <span key={j} className={[color ? colorClasses[color] : "", isItalic ? italic : "", isBold ? bold : ""].join(" ").trim() || undefined}>
            {text}
          </span>
        ),
      )}
    </span>
  ));
}
