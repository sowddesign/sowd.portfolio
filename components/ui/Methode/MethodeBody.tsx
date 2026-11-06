import Image from "next/image";
import { commun } from "@/content/texts";
import type { MethodeElement, MethodeRow, MethodeSection } from "@/lib/methode";
import { ZoomTrigger } from "../ImageLightbox";
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
 * Images agrandissables (zoomable) : ZoomTrigger, agrandissement dans l'ImageLightboxGroup de MethodePage.
 */

function Element({ item, zoomable }: { item: MethodeElement; zoomable: boolean }) {
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
          data-lightbox-visual
          className="h-auto w-full border border-border-neutral-black"
        />
      );
      return zoomable ? (
        <ZoomTrigger src={item.src} alt={item.alt} width={item.width} height={item.height} className="block w-full">
          {image}
        </ZoomTrigger>
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
  zoomable = false,
  className = "",
}: {
  items: MethodeElement[];
  zoomable?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-sm ${className}`}>
      {items.map((item, i) => (
        <Element key={i} item={item} zoomable={zoomable} />
      ))}
    </div>
  );
}

function Row({ row, mobile, zoomable }: { row: MethodeRow; mobile: boolean; zoomable: boolean }) {
  if (row.columns.length === 1) return <Column items={row.columns[0]} zoomable={zoomable} />;
  const [left, right] = row.columns;
  const figures = row.columns.every((column) => column.length > 0 && column.every((item) => item.kind === "figure"));
  if (mobile && !figures) {
    return (
      <div className="flex flex-col gap-lg">
        {left.length > 0 && <Column items={left} zoomable={zoomable} />}
        {right.length > 0 && <Column items={right} zoomable={zoomable} />}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-2 ${mobile ? "gap-x-md" : "gap-x-lg"}`}>
      <Column items={left} zoomable={zoomable} />
      <Column items={right} zoomable={zoomable} className={row.alignEnd ? "self-end" : ""} />
    </div>
  );
}

export function MethodeBody({
  sections,
  mobile = false,
  zoomable = false,
}: {
  sections: MethodeSection[];
  mobile?: boolean;
  zoomable?: boolean;
}) {
  return sections.map((section, i) => (
    <div key={i} className="flex flex-col gap-lg">
      {section.title && (
        <h4 className="type-body-accentuation text-pretty">
          <RichLines lines={[section.title]} size="body" />
        </h4>
      )}
      {section.rows.map((row, j) => (
        <Row key={j} row={row} mobile={mobile} zoomable={zoomable} />
      ))}
    </div>
  ));
}
