import type { MdLine } from "@/lib/markdown";
import { RichLines } from "../RichText";

/*
 * Bloc « Méthode : nom » — composant Figma « headerText » (fichier portfolio, node 4255:5379).
 * Variantes Figma : device (desktop, tablet, mobile) × state (default, hovered — desktop seulement).
 * La variante device passe par les breakpoints ; state passe par la prop hovered, pilotée par le parent
 * (le survol vient du conteneur de la section). hovered : nom en text/brand/brand et description à droite.
 * Tablette avec souris : même état hovered que desktop, description sous le nom (pas de variante Figma).
 * Écran tactile et mobile : jamais de description.
 */

export type HeaderTextProps = {
  /** Petit texte au-dessus du nom, ex. « Méthode : ». */
  label: string;
  /** Nom de la méthode (H2). Mobile et tablette : deux mots sur deux blocs, comme dans Figma. */
  name: string;
  /** Description affichée à l'état hovered. */
  description: MdLine;
  hovered?: boolean;
  /** Couleur des textes au repos : white (défaut) ou black (instance « l'appliquer aux projets » de l'accueil). */
  color?: "white" | "black";
  /** Marges sur les côtés : default (spacing/md, rien en desktop) ou lg (spacing/md en mobile, spacing/lg ensuite :
      instance de l'accueil, demande de l'utilisateur). */
  inset?: "default" | "lg";
  className?: string;
};

const fade =
  "duration-(--motion-duration-fast) ease-(--motion-ease-out) motion-reduce:transition-none";

export function HeaderText({
  label,
  name,
  description,
  hovered = false,
  color = "white",
  inset = "default",
  className = "",
}: HeaderTextProps) {
  const text =
    color === "black" ? "text-text-neutral-black" : "text-text-neutral-white";
  const space = name.indexOf(" ");
  const words =
    space === -1 ? [name] : [name.slice(0, space + 1), name.slice(space + 1)];

  return (
    <div
      className={`grid w-full grid-cols-1 items-center gap-xs ${inset === "lg" ? "px-md tablet:px-lg" : "px-md desktop:px-none"} ${text} desktop:grid-cols-2 ${className}`}
    >
      <div className="flex flex-col justify-center gap-xs">
        <p className="type-swiss-regular">{label}</p>
        {/* Desktop : un seul texte ; mobile et tablette : « double » et « diamant » séparés par spacing/xs.
            Toujours sur une ligne (choix validé). */}
        <h3
          className={`flex gap-xs type-h2 whitespace-nowrap transition-colors desktop:gap-none ${fade} ${hovered ? "text-text-brand-brand" : text}`}
        >
          {words.map((word, i) => (
            <span key={i} className="whitespace-pre">
              {word}
            </span>
          ))}
        </h3>
      </div>
      {/* Desktop : à droite du nom, marge basse spacing/md. Tablette avec souris : sous le nom, sans marge basse
          (choix validé), place réservée pour ne rien décaler. */}
      <div
        aria-hidden={!hovered}
        className={`hidden h-full items-end transition-opacity tablet:[@media(hover:hover)]:flex desktop:px-lg desktop:pb-md ${fade} ${hovered ? "opacity-100" : "opacity-0"}`}
      >
        <p className="type-caption-accentuation">
          <RichLines lines={[description]} />
        </p>
      </div>
    </div>
  );
}
