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
  /** project : taille du texte des pages projet en 4 colonnes (body, caption en tablette). */
  size?: "caption" | "body" | "project";
  /** Texte au curseur des liens internes (ex. « Voir le projet »). */
  linkCursorLabel?: string;
  /** Fond sous le texte : adapte l'état « déjà visité » des liens. */
  background?: "light" | "dark";
  /** Liens ouverts dans un nouvel onglet (liens des fiches méthode, demande de l'utilisateur). */
  newTab?: boolean;
};

/** Gras : graisse typography/weight/paragraph/accentuation. */
const bold = "[font-weight:var(--typography-weight-paragraph-accentuation)]";

export function RichLines({ lines, size = "caption", linkCursorLabel, background = "light", newTab = false }: RichLinesProps) {
  const italic =
    size === "caption"
      ? "type-caption-italic"
      : size === "project"
        ? "type-body-italic project-desktop:type-caption-italic project-wide:type-body-italic"
        : "type-body-italic";

  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line.map(({ text, href, color, italic: isItalic, bold: isBold }, j) =>
        href ? (
          <HyperLink
            key={j}
            href={href}
            size={size}
            background={background}
            newTab={newTab}
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
