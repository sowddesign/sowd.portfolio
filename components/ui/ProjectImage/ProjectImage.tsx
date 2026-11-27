import Image from "next/image";
import type { CSSProperties } from "react";
import { ZoomTrigger } from "../ImageLightbox";

/*
 * Image dans une page projet : cadre aux coins corner/xs (nouvelle façon d'afficher les images dans les pages,
 * choix de l'utilisateur) et recadrage repris de Figma, par appareil (mobile et tablette, une colonne, puis desktop) :
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
  /** Fond de cadre en desktop (Figma : seconde image en « Fill » sous l'image). */
  desktopBackground?: string;
  sizes?: string;
  /** Seuil du cadrage desktop : desktop (1300px) ou project-desktop (seuil de la mise en page 4 colonnes). */
  breakpoint?: "desktop" | "project";
  className?: string;
};

/** Position et taille de l'image dans son cadre, en % du cadre. */
function placement(framing: ImageFraming) {
  if (framing.mode !== "crop") return { w: "100%", h: "100%", l: "0%", t: "0%" };
  const [sx, sy, tx, ty] = framing.crop;
  return { w: `${100 / sx}%`, h: `${100 / sy}%`, l: `${(-tx / sx) * 100}%`, t: `${(-ty / sy) * 100}%` };
}

const fitClass = { fit: "object-contain", fill: "object-cover", crop: "object-cover" } as const;

/* Classes du cadrage desktop pour chaque seuil, écrites en entier pour que Tailwind les trouve. */
const wide = {
  desktop: {
    fit: { fit: "desktop:object-contain", fill: "desktop:object-cover", crop: "desktop:object-cover" },
    frame: "desktop:max-w-full desktop:aspect-(--frame-ratio-d)",
    bg: "desktop:bg-(image:--frame-bg-d) desktop:bg-cover desktop:bg-center",
    img: "desktop:top-(--img-t-d) desktop:left-(--img-l-d) desktop:h-(--img-h-d) desktop:w-(--img-w-d)",
  },
  project: {
    fit: { fit: "project-desktop:object-contain", fill: "project-desktop:object-cover", crop: "project-desktop:object-cover" },
    frame: "project-desktop:max-w-full project-desktop:aspect-(--frame-ratio-d)",
    bg: "project-desktop:bg-(image:--frame-bg-d) project-desktop:bg-cover project-desktop:bg-center",
    img: "project-desktop:top-(--img-t-d) project-desktop:left-(--img-l-d) project-desktop:h-(--img-h-d) project-desktop:w-(--img-w-d)",
  },
} as const;

export function ProjectImage({
  src,
  alt = "",
  mobile,
  desktop,
  desktopBackground,
  sizes = "(width > 1300px) 33vw, 100vw",
  breakpoint = "desktop",
  className = "",
}: ProjectImageProps) {
  const w = wide[breakpoint];
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
      className={`relative block w-full max-w-(--project-media-max-width) overflow-hidden rounded-xs aspect-(--frame-ratio-m) ${w.frame} ${
        desktopBackground ? w.bg : ""
      } ${className}`}
    >
      <div className={`absolute top-(--img-t-m) left-(--img-l-m) h-(--img-h-m) w-(--img-w-m) ${w.img}`}>
        <Image src={src} alt={alt} fill quality={90} sizes={sizes} className={`${fitClass[mobile.mode]} ${w.fit[desktop.mode]}`} />
      </div>
    </ZoomTrigger>
  );
}
