import type { FaqBlock, FaqItem } from "@/lib/faq";
import { RichLines } from "../RichText";
import { InfosContent, InfosContentGroup } from "../InfosContent";

/*
 * Foire aux questions — composant Figma « faqContainer » (fichier portfolio, node 4539:12453).
 * La variante Figma « device » passe par les breakpoints (variante tablet pour toute la tablette) ;
 * « open » n'est pas une prop : en mobile les questions sont fermées (accordéon d'infosContent),
 * en tablette et desktop les réponses sont toujours visibles.
 * Titre, puis ligne de titre infosContent heading et une ligne infosContent par question ;
 * le nombre entre parenthèses est celui des questions.
 */

export type FaqContainerProps = {
  title: string;
  items: FaqItem[];
  className?: string;
};

function Divider() {
  return <span aria-hidden className="block h-px w-full shrink-0 bg-shape-neutral-black" />;
}

/** Réponse : blocs séparés de spacing/md, paragraphes d'un bloc séparés de spacing/xs. */
function Answer({ blocks }: { blocks: FaqBlock[] }) {
  return blocks.map((block, i) => (
    <div key={i} className="flex flex-col gap-xs">
      {block.map((paragraph, j) =>
        paragraph.kind === "text" ? (
          <p key={j}>
            <RichLines lines={paragraph.lines} />
          </p>
        ) : (
          <ol key={j} className="flex flex-col gap-sm">
            {paragraph.items.map((item) => (
              <li key={item.number} className="flex gap-sm">
                {/* Numéro centré sur la hauteur de la première ligne de texte (en haut si le texte passe sur plusieurs lignes). */}
                <span className="flex h-(--typography-line-height-caption) shrink-0 items-center type-body-accentuation">
                  {item.number}
                </span>
                <span className="flex-1">
                  <RichLines lines={item.lines} />
                </span>
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  ));
}

export function FaqContainer({ title, items, className = "" }: FaqContainerProps) {
  return (
    <section className={`flex w-full flex-col bg-background-neutral-white text-text-neutral-black ${className}`}>
      {/* Studio Information */}
      <div className="flex w-full flex-col gap-sm tablet:gap-lg">
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-sm p-lg">
            <h2 className="type-h4">{title}</h2>
            <span className="type-body-regular">({String(items.length).padStart(2, "0")})</span>
          </div>
          <Divider />
        </div>

        {/* Studio FAQ Content */}
        <div className="flex w-full flex-col">
          <InfosContent type="heading" />
          <InfosContentGroup>
            {items.map((item) => (
              <InfosContent key={item.slug} questionN={item.number} questionText={item.question} double={item.double}>
                <Answer blocks={item.answer} />
              </InfosContent>
            ))}
          </InfosContentGroup>
        </div>
      </div>
      <Divider />
    </section>
  );
}
