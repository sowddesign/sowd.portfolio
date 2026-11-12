import Image from "next/image";
import { commun } from "@/content/texts";
import type { MdLine } from "@/lib/markdown";
import type { MethodeBlock, MethodeElement, MethodeImage, MethodePart, MethodeRow } from "@/lib/methode";
import { AudioManager } from "../AudioManager";
import { ZoomTrigger } from "../ImageLightbox";
import { RichLines } from "../RichText";

/*
 * Contenu « Utilisation dans un projet » des pages de la méthode (texte des fichiers content/methode/…, voir lib/methode.ts).
 * Repris de la frame Figma « methode 01 » (fichier content, node 6291:11332), desktop / mobile :
 *   parties (titre headings/subheading) séparées par un trait, écarts spacing/xxl / spacing/xl ;
 *   titre de partie → sous-parties et entre sous-parties : spacing/xxl / spacing/xl ;
 *   sous-titre (body/accentuation) → blocs et entre blocs : spacing/lg / spacing/md ;
 *   rangées d'un bloc et éléments d'une colonne : spacing/sm / spacing/xs ;
 *   deux images l'une sous l'autre : spacing/lg / spacing/md ;
 *   légende sous une image : spacing/sm / spacing/xs ; légende à côté : gouttière des colonnes spacing/lg / spacing/md
 *     (règle de l'utilisateur).
 *   Deux colonnes égales (gouttière spacing/lg) en desktop ; en mobile empilées : spacing/md quand la rangée est seule
 *   dans son bloc, spacing/xs sinon ; deux colonnes de gros chiffres restent côte à côte (gouttière spacing/md).
 * Éléments : titre body/accentuation, texte captionText/regular, élément numéroté (numéro body/accentuation sur 20 px,
 * valeur sans variable voulue par l'utilisateur ; Figma : 21), liste à puces (retrait spacing/lg), image bordée
 * border/neutral/black 1 px intérieur et coins corner/xs (image d'un élément numéroté : sans bordure, affichée à la moitié
 * de la taille du fichier, exporté à 2×), légende captionText/small/italic, gros chiffre extra/datavizHugeNumber et son
 * libellé captionText/small/regular. Liens vers un projet : « Voir le projet » au curseur.
 * Repris de la frame Figma « methode 8 » (entretien utilisateur, node 6297:12939) : extrait audio (audioManager) ;
 * titre captionText/accentuation et son texte (« Ce qu'on en retient : »), titre → texte spacing/sm / spacing/xs,
 * écart au-dessus spacing/lg / spacing/md.
 * Images agrandissables (zoomable) : ZoomTrigger, agrandissement dans l'ImageLightboxGroup de MethodePage.
 */

type Spacing = {
  part: string;
  sub: string;
  line: string;
  image: string;
  lineTop: string;
  imageTop: string;
  subTop: string;
  stack: string;
};

const desktopSpacing: Spacing = {
  part: "gap-xxl",
  sub: "gap-lg",
  line: "gap-sm",
  image: "gap-lg",
  lineTop: "mt-sm",
  imageTop: "mt-lg",
  subTop: "mt-lg",
  stack: "gap-md",
};
const mobileSpacing: Spacing = {
  part: "gap-xl",
  sub: "gap-md",
  line: "gap-xs",
  image: "gap-md",
  lineTop: "mt-xs",
  imageTop: "mt-md",
  subTop: "mt-md",
  stack: "gap-md",
};

export const methodeSpacing = (mobile: boolean) => (mobile ? mobileSpacing : desktopSpacing);

export const methodeDivider = <span aria-hidden className="block w-full shrink-0 border-t border-shape-neutral-black" />;

function ZoomableImage({
  image,
  zoomable,
  framed,
  className = "",
}: {
  image: MethodeImage;
  zoomable: boolean;
  framed: boolean;
  className?: string;
}) {
  const visual = (
    <Image
      src={image.src}
      alt={image.alt}
      width={framed ? image.width : image.width / 2}
      height={framed ? image.height : image.height / 2}
      sizes={framed ? "(width > 1300px) 25vw, (width > 740px) 50vw, 100vw" : undefined}
      data-lightbox-visual
      className={framed ? "h-auto w-full rounded-xs border border-border-neutral-black" : "block max-w-full"}
    />
  );
  return zoomable ? (
    <ZoomTrigger
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className={framed ? `block w-full ${className}` : `block w-fit max-w-full ${className}`}
    >
      {visual}
    </ZoomTrigger>
  ) : (
    visual
  );
}

function Paragraphs({ lines, spacing }: { lines: MdLine[]; spacing: Spacing }) {
  return (
    <div className={`flex min-w-0 flex-col ${spacing.line}`}>
      {lines.map((line, i) => (
        <p key={i} className="type-caption-regular text-pretty">
          <RichLines lines={[line]} linkCursorLabel={commun.curseur_voir_projet} />
        </p>
      ))}
    </div>
  );
}

function Element({ item, zoomable, spacing }: { item: MethodeElement; zoomable: boolean; spacing: Spacing }) {
  switch (item.kind) {
    case "subtitle":
      return (
        <p className="type-body-accentuation text-pretty">
          <RichLines lines={[item.line]} size="body" linkCursorLabel={commun.curseur_voir_projet} />
        </p>
      );
    case "text":
      return (
        <p className="type-caption-regular text-pretty">
          <RichLines lines={item.lines} linkCursorLabel={commun.curseur_voir_projet} />
        </p>
      );
    case "caption":
      return (
        <p className="type-caption-small-italic text-pretty whitespace-pre-wrap">
          <RichLines lines={item.lines} linkCursorLabel={commun.curseur_voir_projet} />
        </p>
      );
    case "numbered":
      return (
        <ol className={`flex flex-col ${spacing.line}`}>
          {item.items.map(({ number, image, paragraphs }) => {
            const numberNode = <span className="type-body-accentuation w-(--p-number-20) shrink-0">{number}</span>;
            return image ? (
              <li key={number} className={`flex flex-col ${spacing.line}`}>
                <div className="flex items-start gap-sm">
                  {numberNode}
                  <ZoomableImage image={image} zoomable={zoomable} framed={false} />
                </div>
                {paragraphs.length > 0 && <Paragraphs lines={paragraphs} spacing={spacing} />}
              </li>
            ) : (
              <li key={number} className="flex items-start gap-sm">
                {numberNode}
                <div className="min-w-0 flex-1">
                  <Paragraphs lines={paragraphs} spacing={spacing} />
                </div>
              </li>
            );
          })}
        </ol>
      );
    case "bullets":
      return (
        <ul className="type-caption-regular list-disc ps-lg text-pretty">
          {item.items.map((line, i) => (
            <li key={i}>
              <RichLines lines={[line]} linkCursorLabel={commun.curseur_voir_projet} />
            </li>
          ))}
        </ul>
      );
    case "audio":
      return <AudioManager src={item.src} caption={item.caption} />;
    case "titled":
      return (
        <div className={`flex flex-col ${spacing.line}`}>
          <p className="type-caption-accentuation text-pretty">
            <RichLines lines={[item.title]} linkCursorLabel={commun.curseur_voir_projet} />
          </p>
          <p className="type-caption-regular text-pretty">
            <RichLines lines={item.lines} linkCursorLabel={commun.curseur_voir_projet} />
          </p>
        </div>
      );
    case "image":
      return <ZoomableImage image={item} zoomable={zoomable} framed />;
    case "figure":
      return (
        <div className={`flex flex-col ${spacing.line}`}>
          <p className="type-extra-dataviz">{item.value}</p>
          <p className="type-caption-small-regular text-pretty">
            <RichLines lines={[item.label]} />
          </p>
        </div>
      );
  }
}

/** Écart au-dessus d'un élément selon le précédent : deux images → écart des images, sinon écart des rangées. */
const isImage = (item?: MethodeElement) => item?.kind === "image";

function Column({
  items,
  zoomable,
  spacing,
  className = "",
}: {
  items: MethodeElement[];
  zoomable: boolean;
  spacing: Spacing;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={
            i === 0
              ? ""
              : item.kind === "titled"
                ? spacing.subTop
                : isImage(items[i - 1]) && isImage(item)
                  ? spacing.imageTop
                  : spacing.lineTop
          }
        >
          <Element item={item} zoomable={zoomable} spacing={spacing} />
        </div>
      ))}
    </div>
  );
}

function Row({
  row,
  alone,
  mobile,
  zoomable,
  spacing,
}: {
  row: MethodeRow;
  alone: boolean;
  mobile: boolean;
  zoomable: boolean;
  spacing: Spacing;
}) {
  if (row.columns.length === 1) return <Column items={row.columns[0]} zoomable={zoomable} spacing={spacing} />;
  const [left, right] = row.columns;
  const figures = row.columns.every((column) => column.length > 0 && column.every((item) => item.kind === "figure"));
  if (mobile && !figures) {
    // Empilées : deux images → écart des images ; légende → écart des rangées ; rangée seule dans son bloc → écart des blocs.
    const gap =
      isImage(left.at(-1)) && isImage(right[0])
        ? spacing.image
        : right[0]?.kind === "caption"
          ? spacing.line
          : alone
            ? spacing.stack
            : spacing.line;
    return (
      <div className={`flex flex-col ${gap}`}>
        {left.length > 0 && <Column items={left} zoomable={zoomable} spacing={spacing} />}
        {right.length > 0 && <Column items={right} zoomable={zoomable} spacing={spacing} />}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-2 ${mobile ? "gap-x-md" : "gap-x-lg"}`}>
      <Column items={left} zoomable={zoomable} spacing={spacing} />
      <Column items={right} zoomable={zoomable} spacing={spacing} className={row.alignEnd ? "self-end" : ""} />
    </div>
  );
}

/** Blocs (sous-partie, introduction au projet) : écart des blocs entre eux, écart des rangées dans un bloc. */
export function MethodeBlocks({
  blocks,
  mobile = false,
  zoomable = false,
}: {
  blocks: MethodeBlock[];
  mobile?: boolean;
  zoomable?: boolean;
}) {
  const spacing = methodeSpacing(mobile);
  return (
    <div className={`flex flex-col ${spacing.sub}`}>
      {blocks.map((rows, i) => (
        <div key={i} className={`flex flex-col ${spacing.line}`}>
          {rows.map((row, j) => (
            <Row key={j} row={row} alone={rows.length === 1} mobile={mobile} zoomable={zoomable} spacing={spacing} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Une partie : titre, puis sous-parties (sous-titre facultatif et blocs). */
export function MethodePartView({
  part,
  mobile = false,
  zoomable = false,
}: {
  part: MethodePart;
  mobile?: boolean;
  zoomable?: boolean;
}) {
  const spacing = methodeSpacing(mobile);
  return (
    <div className={`flex flex-col ${spacing.part}`}>
      {part.title && (
        <h4 className="type-subheading text-pretty">
          <RichLines lines={[part.title]} size="body" />
        </h4>
      )}
      {part.subparts.map((sub, i) => (
        <div key={i} className={`flex flex-col ${spacing.sub}`}>
          {sub.title && (
            <h5 className="type-body-accentuation text-pretty">
              <RichLines lines={[sub.title]} size="body" />
            </h5>
          )}
          <MethodeBlocks blocks={sub.blocks} mobile={mobile} zoomable={zoomable} />
        </div>
      ))}
    </div>
  );
}
