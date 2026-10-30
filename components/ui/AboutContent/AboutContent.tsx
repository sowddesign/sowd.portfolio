import type { MdBlock } from "@/lib/markdown";
import { RichLines } from "../RichText";

/*
 * Présentation de la page À propos — composant Figma « About Content » (fichier portfolio, node 5553:26386).
 * La variante « device » passe par les breakpoints. Texte body/regular blanc, mots en couleur et italique
 * venant du markdown (content/pages/a-propos/presentation.md).
 *
 * Mobile : marges spacing/md, haut et bas spacing/lg ; blocs et paragraphes séparés de spacing/sm.
 * Tablette : grille de 8 colonnes, texte sur les colonnes 3 à 6. Desktop : grille de 12, colonnes 5 à 8.
 * Tablette et desktop : haut et bas spacing/xxl, blocs séparés de spacing/xxl, paragraphes de 24px (spacing/lg).
 */

export type AboutContentProps = {
  blocks: MdBlock[];
  className?: string;
};

export function AboutContent({ blocks, className = "" }: AboutContentProps) {
  return (
    <section
      className={[
        "w-full px-md py-lg text-text-neutral-white type-body-regular",
        "tablet:grid tablet:grid-cols-8 tablet:gap-x-lg tablet:px-lg tablet:py-xxl desktop:grid-cols-12",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-sm tablet:col-span-4 tablet:col-start-3 tablet:gap-xxl desktop:col-start-5">
        {blocks.map((block, i) => (
          <div key={i} className="flex flex-col gap-sm tablet:gap-lg">
            {block.map((paragraph, j) =>
              paragraph.kind === "text" ? (
                <p key={j}>
                  <RichLines lines={paragraph.lines} size="body" />
                </p>
              ) : (
                <ol key={j} className="flex flex-col gap-sm">
                  {paragraph.items.map((item) => (
                    <li key={item.number} className="flex gap-sm">
                      <span className="shrink-0">{item.number}</span>
                      <span className="flex-1">
                        <RichLines lines={item.lines} size="body" />
                      </span>
                    </li>
                  ))}
                </ol>
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
