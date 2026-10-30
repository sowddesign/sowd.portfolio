/*
 * Titre de page ou de section — composant Figma « pageHead » (fichier portfolio, nodes 5038:21685 et 5038:22045).
 * Propriété Figma « type » → prop type ; « titleText » → title ; « detailsText » → details (H2 seulement).
 * La variante « device » passe par les breakpoints. Un trait blanc ferme le bloc.
 *
 * H1 : titre seul. H2 : petit texte de détail au-dessus du titre.
 * Dans headPage Container, l'instance n'a pas de trait (divider={false}) et nomme la page (headingLevel="h1").
 */

export type PageHeadProps = {
  type?: "H1" | "H2";
  title: string;
  /** Texte au-dessus du titre en H2, ex. « Découvrir : ». */
  details?: string;
  /** Balise du titre en H2 : h1 quand il nomme la page (style H2 inchangé). */
  headingLevel?: "h1" | "h2";
  /** Trait blanc sous le bloc (masqué dans l'instance de headPage Container). */
  divider?: boolean;
  className?: string;
};

export function PageHead({ type = "H1", title, details, headingLevel = "h2", divider = true, className = "" }: PageHeadProps) {
  const Heading = headingLevel;
  return (
    <div className={`flex w-full flex-col text-text-neutral-white ${className}`}>
      {type === "H1" ? (
        <div className="flex w-full items-center px-md py-sm tablet:p-lg desktop:py-xl">
          <h1 className="type-h1 min-w-0 flex-1">{title}</h1>
        </div>
      ) : (
        <div className="flex w-full flex-col items-start justify-end gap-xxs px-md pt-lg pb-sm tablet:gap-xs tablet:px-lg tablet:pt-xxl">
          {/* whitespace-pre : conserve les doubles espaces des libellés Figma (ex. « En  découvrir : »). */}
          {details && <p className="type-swiss-regular whitespace-pre">{details}</p>}
          <Heading className="type-h2">{title}</Heading>
        </div>
      )}
      {divider && <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />}
    </div>
  );
}
