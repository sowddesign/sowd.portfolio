import Image from "next/image";
import type { ReactNode } from "react";
import { commun } from "@/content/texts";
import type { MethodeElement, MethodeRow, MethodeSection } from "@/lib/methode";
import { useCursorLabel } from "../CursorLabel";
import { RichLines } from "../RichText";

/*
 * Contenu « Utilisation dans un projet » des pages de la méthode (texte des fichiers content/methode/…, voir lib/methode.ts).
 * Repris de la variante Figma page01 :
 *   parties : titre body/accentuation, rangées espacées de spacing/lg ;
 *   rangées : deux colonnes égales (gouttière spacing/lg) en desktop, empilées en mobile
 *     (sauf une rangée de gros chiffres, côte à côte avec une gouttière spacing/md, comme dans Figma) ;
 *   colonnes : éléments espacés de spacing/sm.
 * Éléments : sous-titre captionText/accentuation, texte captionText/regular, liste numérotée (numéro body/accentuation
 * sur 20 px, valeur Figma sans variable voulue), liste à puces (retrait spacing/lg), image bordée border/neutral/black
 * à ses propres proportions, légende captionText/small/italic, gros chiffre extra/datavizHugeNumber et son libellé
 * captionText/small/regular. Liens vers un projet : « Voir le projet » au curseur.
 * Images cliquables : onImageClick ouvre l'agrandissement (MethodePage), « Agrandir » au curseur.
 */

type ImageClick = (src: string, origin: HTMLElement) => void;

/** Image qui s'agrandit au clic, avec « Agrandir » au curseur. */
function ZoomableImage({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: (origin: HTMLElement) => void;
  children: ReactNode;
}) {
  const cursor = useCursorLabel(commun.curseur_agrandir);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => onClick(event.currentTarget)}
      {...cursor.handlers}
      className={`block w-full cursor-pointer ${cursor.className}`}
    >
      {children}
      {cursor.node}
    </button>
  );
}

function Element({ item, onImageClick }: { item: MethodeElement; onImageClick?: ImageClick }) {
  switch (item.kind) {
    case "subtitle":
      return (
        <p className="type-caption-accentuation text-pretty">
          <RichLines lines={[item.line]} linkCursorLabel={commun.curseur_voir_projet} />
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
        <ol className="flex flex-col gap-sm">
          {item.items.map(({ number, line }) => (
            <li key={number} className="flex items-baseline gap-sm">
              <span className="type-body-accentuation w-(--p-number-20) shrink-0">{number}</span>
              <span className="type-caption-regular min-w-0 flex-1 text-pretty">
                <RichLines lines={[line]} linkCursorLabel={commun.curseur_voir_projet} />
              </span>
            </li>
          ))}
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
    case "image": {
      const image = (
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          sizes="(width > 1300px) 25vw, (width > 740px) 50vw, 100vw"
          className="h-auto w-full border border-border-neutral-black"
        />
      );
      return onImageClick ? (
        <ZoomableImage
          label={`${commun.methode_agrandir} : ${item.alt}`}
          onClick={(origin) => onImageClick(item.src, origin)}>
          {image}
        </ZoomableImage>
      ) : (
        image
      );
    }
    case "figure":
      return (
        <div className="flex flex-col gap-sm">
          <p className="type-extra-dataviz">{item.value}</p>
          <p className="type-caption-small-regular text-pretty">
            <RichLines lines={[item.label]} />
          </p>
        </div>
      );
  }
}

function Column({
  items,
  onImageClick,
  className = "",
}: {
  items: MethodeElement[];
  onImageClick?: ImageClick;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-sm ${className}`}>
      {items.map((item, i) => (
        <Element key={i} item={item} onImageClick={onImageClick} />
      ))}
    </div>
  );
}

function Row({ row, mobile, onImageClick }: { row: MethodeRow; mobile: boolean; onImageClick?: ImageClick }) {
  if (row.columns.length === 1) return <Column items={row.columns[0]} onImageClick={onImageClick} />;
  const [left, right] = row.columns;
  const figures = row.columns.every((column) => column.length > 0 && column.every((item) => item.kind === "figure"));
  if (mobile && !figures) {
    return (
      <div className="flex flex-col gap-lg">
        {left.length > 0 && <Column items={left} onImageClick={onImageClick} />}
        {right.length > 0 && <Column items={right} onImageClick={onImageClick} />}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-2 ${mobile ? "gap-x-md" : "gap-x-lg"}`}>
      <Column items={left} onImageClick={onImageClick} />
      <Column items={right} onImageClick={onImageClick} className={row.alignEnd ? "self-end" : ""} />
    </div>
  );
}

export function MethodeBody({
  sections,
  mobile = false,
  onImageClick,
}: {
  sections: MethodeSection[];
  mobile?: boolean;
  onImageClick?: ImageClick;
}) {
  return sections.map((section, i) => (
    <div key={i} className="flex flex-col gap-lg">
      {section.title && (
        <h4 className="type-body-accentuation text-pretty">
          <RichLines lines={[section.title]} size="body" />
        </h4>
      )}
      {section.rows.map((row, j) => (
        <Row key={j} row={row} mobile={mobile} onImageClick={onImageClick} />
      ))}
    </div>
  ));
}
