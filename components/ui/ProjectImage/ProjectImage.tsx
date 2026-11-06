import Image from "next/image";
import type { CSSProperties } from "react";
import { ZoomTrigger } from "../ImageLightbox";

/*
 * Image dans une page projet : cadre aux coins corner/xs (nouvelle façon d'afficher les images dans les pages,
 * choix de l'utilisateur) et recadrage repris de Figma, par appareil (mobile, puis tablette et desktop) :
 *   fit  → l'image entière dans le cadre (Figma « Fit », object-contain) ;
 *   fill → l'image couvre le cadre (Figma « Fill », object-cover) ;
 *   crop → la zone choisie dans Figma (« Crop » : part visible [sx, sy] de l'image et décalage [tx, ty],
 *          en fractions de l'image), reproduite en agrandissant et décalant l'image dans le cadre.
 * Le cadre garde les proportions du cadre Figma (ratio largeur / hauteur), pour que le recadrage reste le même
 * quelle que soit la largeur de la colonne.
 * Dans un ImageLightboxGroup (pages projets), un clic agrandit l'image entière (ZoomTrigger, « Agrandir » au curseur).
 */

export type ImageFraming =
  | { mode: "fit" | "fill"; ratio: string }
  | { mode: "crop"; ratio: string; crop: [sx: number, sy: number, tx: number, ty: number] };

export type ProjectImageProps = {
  src: string;
  alt?: string;
  mobile: ImageFraming;
  desktop: ImageFraming;
  /** Fond de cadre en tablette et desktop (Figma : seconde image en « Fill » sous l'image). */
  desktopBackground?: string;
  sizes?: string;
  className?: string;
};

/** Position et taille de l'image dans son cadre, en % du cadre. */
function placement(framing: ImageFraming) {
  if (framing.mode !== "crop") return { w: "100%", h: "100%", l: "0%", t: "0%" };
  const [sx, sy, tx, ty] = framing.crop;
  return { w: `${100 / sx}%`, h: `${100 / sy}%`, l: `${(-tx / sx) * 100}%`, t: `${(-ty / sy) * 100}%` };
}

const fitClass = { fit: "object-contain", fill: "object-cover", crop: "object-cover" } as const;
const desktopFitClass = { fit: "tablet:object-contain", fill: "tablet:object-cover", crop: "tablet:object-cover" } as const;

export function ProjectImage({
  src,
  alt = "",
  mobile,
  desktop,
  desktopBackground,
  sizes = "(width > 740px) 33vw, 100vw",
  className = "",
}: ProjectImageProps) {
  const m = placement(mobile);
  const d = placement(desktop);
  const style = {
    "--frame-ratio-m": mobile.ratio,
    "--frame-ratio-d": desktop.ratio,
    "--img-w-m": m.w,
    "--img-h-m": m.h,
    "--img-l-m": m.l,
    "--img-t-m": m.t,
    "--img-w-d": d.w,
    "--img-h-d": d.h,
    "--img-l-d": d.l,
    "--img-t-d": d.t,
    ...(desktopBackground ? { "--frame-bg-d": `url(${desktopBackground})` } : {}),
  } as CSSProperties;

  /* Cadre agrandissable au clic dans un ImageLightboxGroup (l'image entière s'affiche en grand). */
  return (
    <ZoomTrigger
      src={src}
      alt={alt}
      style={style}
      className={`relative block w-full overflow-hidden rounded-xs aspect-(--frame-ratio-m) tablet:aspect-(--frame-ratio-d) ${
        desktopBackground ? "tablet:bg-(image:--frame-bg-d) tablet:bg-cover tablet:bg-center" : ""
      } ${className}`}
    >
      <div className="absolute top-(--img-t-m) left-(--img-l-m) h-(--img-h-m) w-(--img-w-m) tablet:top-(--img-t-d) tablet:left-(--img-l-d) tablet:h-(--img-h-d) tablet:w-(--img-w-d)">
        <Image src={src} alt={alt} fill quality={90} sizes={sizes} className={`${fitClass[mobile.mode]} ${desktopFitClass[desktop.mode]}`} />
      </div>
    </ZoomTrigger>
  );
}
