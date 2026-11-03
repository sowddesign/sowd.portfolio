import type { MethodeIntroContent } from "@/lib/methode";
import { ScrollHint } from "./ScrollHint";

/*
 * Méthode, page d'introduction — composant Figma « methode » (fichier portfolio, node 4302:10399),
 * variante pageSelected=page00 (desktop). Remplit son parent. Textes : content/methode/<étape>/00.md.
 * Fond background/neutral/white, trait du haut, marges spacing/sm (deux niveaux comme dans Figma).
 * Titre : le libellé (captionSwiss/regular) ouvre le titre H3 sur la même ligne, le titre continue dessous
 * en un seul bloc (demande de l'utilisateur). Largeur du libellé : 94 dans Figma, sans variable (--p-number-94).
 * La flèche ArrowLeft masquée dans Figma est retirée (décision de l'utilisateur).
 */

export function MethodeIntro({ content }: { content: MethodeIntroContent }) {
  return (
    <div className="flex size-full flex-col bg-background-neutral-white text-text-neutral-black">
      <span aria-hidden className="block h-px w-full shrink-0 bg-shape-neutral-black" />
      <div className="flex min-h-0 flex-1 flex-col p-sm">
        <div className="flex flex-1 flex-col justify-between p-sm">
          <div className="flex flex-col gap-xxl">
            <h2 className="type-h3">
              <span className="type-swiss-regular inline-block w-(--p-number-94) translate-y-[calc((var(--typography-line-height-h3)-var(--typography-line-height-caption))/2)] align-top">{content.label}</span>
              {content.title}
            </h2>
            <p className="type-body-regular text-pretty">{content.text}</p>
          </div>
          <ScrollHint>{content.hint}</ScrollHint>
        </div>
      </div>
    </div>
  );
}
