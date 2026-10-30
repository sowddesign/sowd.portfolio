import { commun } from "@/content/texts";
import type { ReactNode } from "react";
import { IconButton } from "../IconButton";
import { TextualButton } from "../TextualButton";

/*
 * Carte projet de la page hub — composant Figma « projetHubContainer » (fichier portfolio, node 5010:29883).
 * Propriété Figma « layout » → prop layout ; « propNew » → isNew (libellé « Nouveau ») ;
 * « imageSection » → image (slot, couvre son cadre). La variante « device » passe par les breakpoints.
 *
 * default et new : image + titre, type, tags, année et bouton « Voir le projet ».
 *   Image au-dessus, infos en dessous ; en desktop, le type passe à côté de l'année.
 *   new ne diffère qu'en desktop : infos à gauche, image à droite (Figma n'a pas de new mobile/tablette).
 * « Nouveau » (isNew) s'affiche dans tous les layouts : propNew sert aux maquettes Figma.
 * autres : image avec bouton flèche en bas à droite, puis titre et année.
 *
 * Les grilles suivent la grille du site (adaptativeGrid) : gouttière --grid-spacing ;
 * rangée de tags sur 4 colonnes en mobile, 8 en tablette, 6 en desktop (moitié de 12).
 * Visuel en noir et blanc, couleurs révélées au survol (pointeur) ou au toucher (:active) de l'image seule ;
 * sur écran tactile, aussi quand c'est le visuel le plus proche du centre de l'écran (data-centered, posé par CenterReveal).
 * Essai validé sans maquette Figma : fondu --motion-duration-base, courbe --motion-ease-out.
 *
 * Hauteurs des frames Figma (valeurs fixes sans variable, validées par l'utilisateur) :
 * default et new 550px en mobile et 680px à partir de la tablette ; autres 230px.
 */

/** Filtre noir et blanc du visuel, retiré au survol ou au toucher. */
const imageReveal =
  "grayscale transition-[filter] duration-(--motion-duration-base) ease-(--motion-ease-out) hover:grayscale-0 active:grayscale-0 data-centered:grayscale-0";

export type ProjetHubContainerProps = {
  layout?: "default" | "new" | "autres";
  title: string;
  /** Type de projet (propriété Figma « labelType »), ex. « Personnel ». Affiché en layouts default et new. */
  type?: string;
  year: string;
  /** Tags du projet. Affichés en layouts default et new. */
  tags?: string[];
  /** Libellé « Nouveau » (propriété Figma « propNew »). */
  isNew?: boolean;
  /** Visuel du projet : élément qui remplit son cadre, ex. <Image fill className="object-cover" />. */
  image: ReactNode;
  /** Page du projet. */
  href: string;
  className?: string;
};

export function ProjetHubContainer({
  layout = "default",
  title,
  type,
  year,
  tags = [],
  isNew = false,
  image,
  href,
  className = "",
}: ProjetHubContainerProps) {
  const newLabel = isNew && <span className="type-swiss-regular text-text-brand-whitish">{commun.tuile_nouveau}</span>;

  if (layout === "autres") {
    return (
      <article className={`flex h-[230px] w-full flex-col overflow-hidden text-text-neutral-white ${className}`}>
        {/* Image Section */}
        <div className="relative flex min-h-0 w-full flex-1 flex-col items-end justify-end p-sm">
          <div data-reveal className={`absolute inset-0 ${imageReveal}`}>{image}</div>
          <IconButton icon="ArrowRight" label={`${commun.tuile_voir_projet} ${title}`} variant="primary" color="white" href={href} />
        </div>

        {/* infoContainer */}
        <div className="flex w-full items-center justify-between py-sm whitespace-nowrap">
          <div className="flex items-start gap-xs">
            <h2 className="type-h4">{title}</h2>
            {newLabel}
          </div>
          <span className="type-swiss-regular">{year}</span>
        </div>
      </article>
    );
  }

  const isSplit = layout === "new";

  return (
    <article className={`flex h-[550px] w-full flex-col overflow-hidden text-text-neutral-white tablet:h-[680px] ${className}`}>
      {/* Content : une colonne (image puis infos) ; new en desktop : deux colonnes (infos à gauche, image à droite). */}
      <div
        className={`grid min-h-0 w-full flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-y-lg ${
          isSplit ? "desktop:grid-cols-2 desktop:grid-rows-1 desktop:gap-x-(--grid-spacing)" : ""
        }`}
      >
        {/* Image Section */}
        <div data-reveal className={`relative ${imageReveal} ${isSplit ? "desktop:col-start-2 desktop:row-start-1" : ""}`}>{image}</div>

        {/* infoContainer */}
        <div className={`flex flex-col justify-end gap-lg ${isSplit ? "desktop:col-start-1 desktop:row-start-1" : ""}`}>
          {/* Topbar : en desktop, le type passe dans la rangée des tags. */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-start gap-xs whitespace-nowrap">
              <h2 className="type-h3">{title}</h2>
              {newLabel}
            </div>
            {type && <span className="type-swiss-accentuation whitespace-nowrap desktop:hidden">{type}</span>}
          </div>

          {/* Tags Section */}
          <div className="flex w-full flex-col gap-lg">
            {/* Tags Row */}
            <div className="grid w-full grid-cols-4 gap-x-(--grid-spacing) tablet:grid-cols-8 desktop:grid-cols-6">
              <ul className="col-span-3 flex flex-wrap items-center gap-x-md gap-y-xs type-swiss-accentuation tablet:col-span-7 tablet:gap-x-lg desktop:col-span-4">
                {tags.map((tag) => (
                  // whitespace-pre : conserve les doubles espaces des libellés Figma (ex. « UX  researcher »).
                  <li key={tag} className="whitespace-pre">
                    {tag}
                  </li>
                ))}
              </ul>
              <span className="type-swiss-regular text-right desktop:hidden">{year}</span>

              {/* Year separator (desktop) : type - année. */}
              <div className="col-span-2 hidden items-center justify-end gap-sm whitespace-nowrap desktop:flex">
                {type && <span className="type-swiss-accentuation">{type}</span>}
                {type && <span className="type-swiss-regular">-</span>}
                <span className="type-swiss-regular">{year}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex w-full flex-col gap-lg">
              <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />
              <TextualButton variant="primary" color="white" icon="ArrowRight" iconPosition="right" href={href}>
                {commun.tuile_voir_projet}
              </TextualButton>
              <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
