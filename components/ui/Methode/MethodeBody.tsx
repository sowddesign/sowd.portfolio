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
 * Éléments : titre body/accentuation, texte body/regular (demande de l'utilisateur, au lieu de captionText/regular ;
 * 71 caractères par ligne au plus, --methode-text-max-width), élément numéroté (numéro body/accentuation sur 20 px,
 * valeur sans variable voulue par l'utilisateur ; Figma : 21), liste à puces (retrait spacing/lg), image bordée
 * border/neutral/black 1 px intérieur et coins corner/xs (image d'un élément numéroté : sans bordure, affichée à la moitié
 * de la taille du fichier, exporté à 2×, agrandie de --methode-numbered-image-scale), légende captionText/small/italic,
 * gros chiffre extra/datavizHugeNumber et son libellé body/regular (demandes de l'utilisateur ; Figma : captionText/small/regular).
 * Texte ou paragraphe d'élément numéroté en « {petit} texte » : captionText/regular (demande de l'utilisateur). Liens vers un projet : « Voir le projet » au curseur.
 * Repris de la frame Figma « methode 8 » (entretien utilisateur, node 6297:12939) : extrait audio (audioManager) ;
 * titre body/accentuation (au lieu de captionText/accentuation, demande de l'utilisateur) et son texte (« Ce qu'on en retient : »), titre → texte spacing/sm / spacing/xs,
 * écart au-dessus spacing/lg / spacing/md.
 * Repris de la frame Figma « methode 10 » (triangulation, node 6297:13595) : image sans bordure ni coins
 * (« {sans cadre} »), recadrage propre au mobile et à la tablette petite (« ![texte](desktop | mobile) »), colonne de droite au-dessus
 * en mobile (« || inverse »).
 * Repris de la frame Figma « methode 11 » (problématique, node 6322:4694) : notes d'un élément numéroté
 * (« > texte » sous « 1. texte », captionText/small/italic), écart paragraphe → notes spacing/xs / spacing/xxs ;
 * légende à côté d'un élément numéroté, empilée en mobile : écart spacing/md.
 * Repris de la frame Figma « methode 07 » (synthèse des recherches, node 6322:4697) : page intégrée (« @ adresse | titre »,
 * livre Heyzine) et image coupée en deux en mobile (« {mobile en deux} »).
 * Repris de la frame Figma « methode 09 » (scénarios d'usage, node 6328:6409) : mention posée sur l'image
 * (« {mention: texte} »).
 * Repris de la frame Figma « methode 16 » (arborescence, node 6328:6410) : extraits empilés en mobile
 * (« desktop | extrait-1 + extrait-2 ») et éléments numérotés par lettre (« a. texte »).
 * Images servies telles qu'exportées (unoptimized, demande de l'utilisateur) : fichiers WebP déjà à 2× la taille
 * affichée, aussi nets qu'à l'agrandissement (les versions réduites de Next étaient trop petites et recompressées).
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
  number: string;
  note: string;
  /** Écart texte body → texte caption (« {petit} ») d'un élément numéroté (demande de l'utilisateur). */
  smallTop: string;
  /** Note « {petit} » sous une puce : écart au-dessus (collée au texte) et en dessous (avant la puce suivante),
      choix de l'utilisateur. */
  bulletNoteTop: string;
  bulletNoteBottom: string;
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
  number: "gap-sm",
  note: "gap-xs",
  smallTop: "mt-xs",
  bulletNoteTop: "mt-xxs",
  bulletNoteBottom: "mb-sm",
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
  number: "gap-xs",
  note: "gap-xxs",
  smallTop: "mt-xxs",
  bulletNoteTop: "mt-none",
  bulletNoteBottom: "mb-xs",
};

export const methodeSpacing = (mobile: boolean) => (mobile ? mobileSpacing : desktopSpacing);

export const methodeDivider = <span aria-hidden className="block w-full shrink-0 border-t border-shape-neutral-black" />;

/**
 * Image en pleine largeur de sa colonne (bordée, sauf « {sans cadre} » ; recadrage mobile s'il existe),
 * ou image d'un élément numéroté (numbered : sans bordure, à la moitié de la taille du fichier).
 */
function ZoomableImage({
  image,
  zoomable,
  mobile,
  numbered = false,
  className = "",
}: {
  image: MethodeImage;
  zoomable: boolean;
  mobile: boolean;
  numbered?: boolean;
  className?: string;
}) {
  /* Recadrage mobile : aussi affiché en tablette petite (≤ 1080 px, demande de l'utilisateur) ; le recadrage desktop
     à partir de la grande tablette. Le carrousel d'agrandissement ne prend que l'image visible. */
  if (!mobile && image.mobile && !numbered) {
    return (
      <>
        <ZoomableImage image={image} zoomable={zoomable} mobile className={`tablet-lg:hidden ${className}`} />
        <ZoomableImage
          image={{ ...image, mobile: undefined }}
          zoomable={zoomable}
          mobile={false}
          className={`hidden tablet-lg:block ${className}`}
        />
      </>
    );
  }
  /* Extraits empilés en mobile et tablette petite (« desktop.webp | extrait-1.webp + extrait-2.webp », frame Figma
     « methode 16 ») : l'un sous l'autre, écart spacing/xs ; agrandis ensemble (image desktop entière). */
  if (mobile && image.mobileParts && !numbered) {
    const parts = (
      <div data-lightbox-visual className={`flex flex-col gap-xs ${zoomable ? "" : className}`}>
        {image.mobileParts.map((part, i) => (
          <Image
            key={part.src}
            src={part.src}
            alt={i === 0 ? image.alt : ""}
            width={part.width}
            height={part.height}
            unoptimized
            className={`h-auto w-full ${image.framed ? "rounded-xs border border-border-neutral-black" : ""}`}
          />
        ))}
      </div>
    );
    return zoomable ? (
      <ZoomTrigger src={image.src} alt={image.alt} width={image.width} height={image.height} className={`block w-full ${className}`}>
        {parts}
      </ZoomTrigger>
    ) : (
      parts
    );
  }
  /* « {mobile en deux} » (frame Figma « methode 07 ») : en mobile et en tablette petite, moitié gauche puis moitié
     droite du même fichier, l'une sous l'autre (écart spacing/xs), chacune bordée ; agrandies ensemble. */
  if (image.split && !numbered) {
    if (!mobile) {
      return (
        <>
          <ZoomableImage image={image} zoomable={zoomable} mobile className={`tablet-lg:hidden ${className}`} />
          <ZoomableImage
            image={{ ...image, split: undefined }}
            zoomable={zoomable}
            mobile={false}
            className={`hidden tablet-lg:block ${className}`}
          />
        </>
      );
    }
    const halves = (
      <div data-lightbox-visual className={`flex flex-col gap-xs ${zoomable ? "" : className}`}>
        {(["object-left", "object-right"] as const).map((side) => (
          <Image
            key={side}
            src={image.src}
            alt={side === "object-left" ? image.alt : ""}
            width={image.width}
            height={image.height}
            unoptimized
            style={{ aspectRatio: `${image.width / 2} / ${image.height}` }}
            className={`h-auto w-full object-cover ${side} ${
              image.framed ? "rounded-xs border border-border-neutral-black" : ""
            }`}
          />
        ))}
      </div>
    );
    return zoomable ? (
      <ZoomTrigger src={image.src} alt={image.alt} width={image.width} height={image.height} className={`block w-full ${className}`}>
        {halves}
      </ZoomTrigger>
    ) : (
      halves
    );
  }
  const { src, width, height } = (mobile && image.mobile) || image;
  const visual = (
    <Image
      src={src}
      alt={image.alt}
      width={numbered ? width / 2 : width}
      height={numbered ? height / 2 : height}
      unoptimized
      data-lightbox-visual
      /* Élément numéroté : moitié de la taille du fichier (exporté à 2×), agrandie de --methode-numbered-image-scale. */
      style={numbered ? { width: `calc(${width / 2 / 16}rem * var(--methode-numbered-image-scale))` } : undefined}
      className={`${
        numbered
          ? "block h-auto max-w-full"
          : image.framed
            ? "h-auto w-full rounded-xs border border-border-neutral-black"
            : "h-auto w-full"
      } ${zoomable || image.mention ? "" : className}`}
    />
  );
  /* « {mention: …} » (frame Figma « methode 09 ») : texte posé sur l'image, en bas à droite, sans marge comme dans
     Figma, captionText/small/italic couleur faded/black/60%. */
  const content = image.mention ? (
    <span className={`relative block ${zoomable ? "" : className}`}>
      {visual}
      <span className="type-caption-small-italic absolute right-0 bottom-0 whitespace-nowrap text-faded-black-60">
        {image.mention}
      </span>
    </span>
  ) : (
    visual
  );
  return zoomable ? (
    <ZoomTrigger
      src={src}
      alt={image.alt}
      width={width}
      height={height}
      className={numbered ? `block w-fit max-w-full ${className}` : `block w-full ${className}`}
    >
      {content}
    </ZoomTrigger>
  ) : (
    content
  );
}

/** Texte courant : body/regular, ou captionText/regular en « {petit} texte » (demande de l'utilisateur). */
function TextLines({ lines, small = false }: { lines: MdLine[]; small?: boolean }) {
  return (
    <p className={`${small ? "type-caption-regular" : "type-body-regular"} max-w-(--methode-text-max-width) text-pretty`}>
      <RichLines lines={lines} size={small ? "caption" : "body"} linkCursorLabel={commun.curseur_voir_projet} />
    </p>
  );
}

function Paragraphs({ lines, small, spacing }: { lines: MdLine[]; small?: number[]; spacing: Spacing }) {
  return (
    <div className="flex min-w-0 flex-col">
      {lines.map((line, i) => {
        const isSmall = small?.includes(i) ?? false;
        // Texte body suivi d'un texte caption : écart réduit (smallTop) ; sinon l'écart habituel (lineTop).
        const top = i === 0 ? "" : isSmall && !small?.includes(i - 1) ? spacing.smallTop : spacing.lineTop;
        return (
          <div key={i} className={top}>
            <TextLines lines={[line]} small={isSmall} />
          </div>
        );
      })}
    </div>
  );
}

function Element({
  item,
  zoomable,
  mobile,
  spacing,
}: {
  item: MethodeElement;
  zoomable: boolean;
  mobile: boolean;
  spacing: Spacing;
}) {
  switch (item.kind) {
    case "subtitle":
      return (
        <p className="type-body-accentuation text-pretty">
          <RichLines lines={[item.line]} size="body" linkCursorLabel={commun.curseur_voir_projet} />
        </p>
      );
    case "text":
      return <TextLines lines={item.lines} small={item.small} />;
    case "paragraphs":
      return <Paragraphs lines={item.lines} small={item.smallLines} spacing={spacing} />;
    case "caption":
      return (
        <p className="type-caption-small-italic text-pretty whitespace-pre-wrap">
          <RichLines lines={item.lines} linkCursorLabel={commun.curseur_voir_projet} />
        </p>
      );
    case "numbered":
      return (
        <ol className={`flex flex-col ${spacing.line}`}>
          {item.items.map(({ number, image, paragraphs, smallParagraphs, notes }) => {
            const numberNode = <span className="type-body-accentuation w-(--p-number-20) shrink-0">{number}</span>;
            return image ? (
              <li key={number} className={`flex flex-col ${spacing.line}`}>
                <div className={`flex items-start ${spacing.number}`}>
                  {numberNode}
                  <ZoomableImage image={image} zoomable={zoomable} mobile={mobile} numbered />
                </div>
                {paragraphs.length > 0 && <Paragraphs lines={paragraphs} small={smallParagraphs} spacing={spacing} />}
              </li>
            ) : (
              <li key={number} className={`flex items-start ${spacing.number}`}>
                {numberNode}
                <div className={`flex min-w-0 flex-1 flex-col ${spacing.note}`}>
                  <Paragraphs lines={paragraphs} small={smallParagraphs} spacing={spacing} />
                  {notes?.map((line, i) => (
                    <p key={i} className="type-caption-small-italic text-pretty">
                      <RichLines lines={[line]} linkCursorLabel={commun.curseur_voir_projet} />
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      );
    case "bullets":
      return (
        <ul className="type-body-regular list-disc ps-lg text-pretty">
          {item.items.map((line, i) => (
            <li
              key={i}
              className={`max-w-(--methode-text-max-width) ${item.captions?.[i] ? spacing.bulletNoteBottom : ""}`}
            >
              <RichLines lines={[line]} size="body" linkCursorLabel={commun.curseur_voir_projet} />
              {/* Caption « {petit} » collée sous la puce, plus loin de la puce suivante (choix de l'utilisateur). */}
              {item.captions?.[i] && (
                <div className={spacing.bulletNoteTop}>
                  <TextLines lines={[item.captions[i]]} small />
                </div>
              )}
            </li>
          ))}
        </ul>
      );
    case "audio":
      return <AudioManager src={item.src} caption={item.caption} />;
    case "titled":
      /* Titre suivi d'un texte et de sa caption (« {petit} ») : écart titre → texte réduit (spacing/xs, mobile
         spacing/xxs, demande de l'utilisateur, Priorisation & backlog) ; sinon l'écart habituel. */
      return (
        <div className={`flex flex-col ${item.smallLines?.length ? spacing.note : spacing.line}`}>
          <p className="type-body-accentuation max-w-(--methode-text-max-width) text-pretty">
            <RichLines lines={[item.title]} size="body" linkCursorLabel={commun.curseur_voir_projet} />
          </p>
          {item.smallLines?.length ? (
            <Paragraphs lines={item.lines} small={item.smallLines} spacing={spacing} />
          ) : (
            <p className="type-body-regular max-w-(--methode-text-max-width) text-pretty">
              <RichLines lines={item.lines} size="body" linkCursorLabel={commun.curseur_voir_projet} />
            </p>
          )}
        </div>
      );
    case "image":
      return <ZoomableImage image={item} zoomable={zoomable} mobile={mobile} />;
    case "embed":
      /* Livre Heyzine (frame Figma « methode 07 ») : pleine largeur, bordure border/neutral/black et coins corner/xs
         (demande de l'utilisateur) ; 16:9 comme le code d'intégration, 4:5 en mobile pour faciliter la lecture
         (choix de l'utilisateur).
         Prototype Figma (embed.figma.com) : barre d'outils du haut masquée, le cadre décalé vers le haut de
         --embed-figma-toolbar-height dans un conteneur qui coupe ce qui dépasse (demande de l'utilisateur). */
      if (item.src.startsWith("https://embed.figma.com/")) {
        return (
          <div
            className={`w-full overflow-hidden rounded-xs border border-border-neutral-black ${mobile ? "aspect-4/5" : "aspect-video"}`}
          >
            <iframe
              src={item.src}
              title={item.title}
              allow="autoplay; fullscreen; clipboard-write"
              allowFullScreen
              loading="lazy"
              className="-mt-(--embed-figma-toolbar-height) block h-[calc(100%+var(--embed-figma-toolbar-height))] w-full"
            />
          </div>
        );
      }
      return (
        <iframe
          src={item.src}
          title={item.title}
          allow="autoplay; fullscreen; clipboard-write"
          allowFullScreen
          loading="lazy"
          className={`block w-full rounded-xs border border-border-neutral-black ${mobile ? "aspect-4/5" : "aspect-video"}`}
        />
      );
    case "figure":
      return (
        <div className={`flex flex-col ${spacing.line}`}>
          <p className="type-extra-dataviz">{item.value}</p>
          <p className="type-body-regular max-w-(--methode-text-max-width) text-pretty">
            <RichLines lines={[item.label]} size="body" />
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
  mobile,
  spacing,
  className = "",
  lastAtEnd = false,
}: {
  items: MethodeElement[];
  zoomable: boolean;
  mobile: boolean;
  spacing: Spacing;
  className?: string;
  /** Dernier élément calé en bas de la colonne (« || légende en bas »), écart minimal gardé en marge intérieure. */
  lastAtEnd?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      {items.map((item, i) => {
        const top =
          i === 0
            ? ""
            : item.kind === "titled"
              ? spacing.subTop
              : isImage(items[i - 1]) && isImage(item)
                ? spacing.imageTop
                : spacing.lineTop;
        const atEnd = lastAtEnd && i > 0 && i === items.length - 1;
        return (
        <div key={i} className={atEnd ? `mt-auto ${top.replace(/^mt-/, "pt-")}` : top}>
          <Element item={item} zoomable={zoomable} mobile={mobile} spacing={spacing} />
        </div>
        );
      })}
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
  if (row.columns.length === 1) {
    return <Column items={row.columns[0]} zoomable={zoomable} mobile={mobile} spacing={spacing} />;
  }
  const figures = row.columns.every((column) => column.length > 0 && column.every((item) => item.kind === "figure"));
  /* « || légende en bas » en mobile : colonne de gauche, puis la légende (dernier élément de droite) juste dessous,
     puis le reste de la colonne de droite (choix de l'utilisateur, design system). */
  if (mobile && !figures && row.captionEnd && row.columns[1].at(-1)?.kind === "caption") {
    const [left, right] = row.columns;
    const caption = right.slice(-1);
    const rest = right.slice(0, -1);
    return (
      <div className={`flex flex-col ${alone ? spacing.stack : spacing.line}`}>
        <div className={`flex flex-col ${spacing.line}`}>
          <Column items={left} zoomable={zoomable} mobile={mobile} spacing={spacing} />
          <Column items={caption} zoomable={zoomable} mobile={mobile} spacing={spacing} />
        </div>
        {rest.length > 0 && <Column items={rest} zoomable={zoomable} mobile={mobile} spacing={spacing} />}
      </div>
    );
  }
  if (mobile && !figures) {
    // Empilées (« || inverse » : colonne de droite d'abord) : deux images → écart des images ; légende → écart des
    // rangées ; rangée seule dans son bloc → écart des blocs.
    const [first, second] = row.reverseMobile ? [row.columns[1], row.columns[0]] : row.columns;
    const gap =
      isImage(first.at(-1)) && isImage(second[0])
        ? spacing.image
        : second[0]?.kind === "caption" && first.at(-1)?.kind !== "numbered"
          ? spacing.line
          : alone
            ? spacing.stack
            : spacing.line;
    return (
      <div className={`flex flex-col ${gap}`}>
        {first.length > 0 && <Column items={first} zoomable={zoomable} mobile={mobile} spacing={spacing} />}
        {second.length > 0 && <Column items={second} zoomable={zoomable} mobile={mobile} spacing={spacing} />}
      </div>
    );
  }
  const [left, right] = row.columns;
  return (
    <div className={`grid grid-cols-2 ${mobile ? "gap-x-md" : "gap-x-lg"}`}>
      <Column items={left} zoomable={zoomable} mobile={mobile} spacing={spacing} />
      <Column
        items={right}
        zoomable={zoomable}
        mobile={mobile}
        spacing={spacing}
        className={row.alignEnd ? "self-end" : ""}
        lastAtEnd={row.captionEnd}
      />
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
