import { useId } from "react";
import { gridBarMotif01Paths, gridBarMotif12Paths } from "./grid-bar-paths";

/*
 * Tuile de grille — composant Figma « gridBar » (fichier portfolio, node 4214:5871), style=upToDown.
 * Remplit son parent (largeur d'une colonne, hauteur en fill). Dégradé vertical d'une couleur vers #000000 à 0 %,
 * calculé comme Figma : couleur et opacité interpolées séparément (sans prémultiplication), si bien que le dégradé
 * passe par des tons assombris. Le navigateur prémultiplie l'alpha (la couleur s'efface sans s'assombrir, tuiles claires
 * presque invisibles sur fond clair) : arrêts intermédiaires recalculés pour reproduire le rendu Figma. Les variantes 01 et 12 ajoutent un motif de taille fixe, centré, rogné par la tuile.
 * Composant décoratif : masqué aux lecteurs d'écran.
 */

export type GridBarNumber = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";

export type GridBarProps = { className?: string } & (
  | { state?: "default"; number?: GridBarNumber }
  | { state: "hovered"; number: GridBarNumber }
);

/** Couleur de départ du dégradé (variable Figma color/…, primitive : les variables --color-* du thème sont inlinées). */
const gradientFrom: Record<GridBarNumber, string> = {
  "01": "--p-color-neutral-0",
  "02": "--p-color-brand-50",
  "03": "--p-color-brand-100",
  "04": "--p-color-brand-200",
  "05": "--p-color-brand-300",
  "06": "--p-color-brand-400",
  "07": "--p-color-brand-500",
  "08": "--p-color-brand-600",
  "09": "--p-color-brand-700",
  "10": "--p-color-brand-800",
  "11": "--p-color-brand-900",
  "12": "--p-color-neutral-1000",
};

/* Arrêts du dégradé « Figma » : à t, couleur mélangée vers le noir de t et opacité 1 − t. */
const figmaSteps = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const figmaGradient = (color: string) =>
  `linear-gradient(to bottom, ${figmaSteps
    .map((t) => {
      const keep = Math.round((1 - t) * 1000) / 10;
      return `rgb(from color-mix(in srgb, var(${color}) ${keep}%, black) r g b / ${keep}%) ${t * 100}%`;
    })
    .join(", ")})`;

/* Motifs : dimensions, opacité du calque et axe du dégradé blanc → transparent, relevés dans Figma. */
const motifs = {
  "01": {
    paths: gridBarMotif01Paths,
    width: 93.24,
    height: 526.92,
    opacity: 0.4,
    gradient: { x1: 47, y1: -187.081, x2: 47, y2: 733.919 },
  },
  "12": {
    paths: gridBarMotif12Paths,
    width: 93.24,
    height: 429.24,
    opacity: 0.25,
    gradient: { x1: -33.1047, y1: 212.863, x2: 129.869, y2: 212.863 },
  },
} as const;

function GridBarMotif({ number }: { number: keyof typeof motifs }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `grid-bar-motif-${uid}`;
  const motif = motifs[number];
  return (
    <svg
      width={motif.width}
      height={motif.height}
      viewBox={`0 0 ${motif.width} ${motif.height}`}
      fill="none"
      className="absolute top-1/2 left-1/2 -translate-1/2"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" {...motif.gradient}>
          <stop stopColor="var(--color-neutral-0)" />
          <stop offset="1" stopColor="var(--color-neutral-0)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g opacity={motif.opacity} fill={`url(#${gradientId})`}>
        {motif.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

const fade = "transition-opacity duration-(--motion-duration-fast) ease-(--motion-ease-out) motion-reduce:transition-none";

/*
 * Avec un number, le calque hovered reste monté et passe de transparent à opaque en fondu
 * (--motion-duration-fast, --motion-ease-out) quand state change ; sans number, la tuile est l'état default (00).
 */
export function GridBar({ className = "", state = "default", number }: GridBarProps) {
  return (
    <div aria-hidden className={`pointer-events-none relative size-full overflow-hidden ${className}`}>
      {number && (
        <div
          style={{ backgroundImage: figmaGradient(gradientFrom[number]) }}
          className={`absolute inset-0 ${fade} ${
            state === "hovered" ? "opacity-100" : "opacity-0"
          }`}
        >
          {(number === "01" || number === "12") && <GridBarMotif number={number} />}
        </div>
      )}
    </div>
  );
}
