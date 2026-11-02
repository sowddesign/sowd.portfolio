"use client";

import { useId, type Ref } from "react";

/*
 * Icône Check (public/icons/Check.svg, même tracé) qui peut se dessiner trait par trait.
 * Un masque suit la ligne médiane du Check : drawn=false le cache, le passage à true le trace
 * (--nav-side-tile-drop-trace, --motion-ease-out). Monté avec drawn=true, il s'affiche sans animation.
 */

const checkPath =
  "M28.5301 9.52997L12.5301 25.53C12.3895 25.6704 12.1988 25.7493 12.0001 25.7493C11.8013 25.7493 11.6107 25.6704 11.4701 25.53L4.47009 18.53C4.33761 18.3878 4.26549 18.1997 4.26892 18.0054C4.27234 17.8111 4.35106 17.6258 4.48847 17.4883C4.62588 17.3509 4.81127 17.2722 5.00557 17.2688C5.19987 17.2654 5.38792 17.3375 5.53009 17.47L12.0001 23.9387L27.4701 8.46997C27.6123 8.33749 27.8003 8.26537 27.9946 8.26879C28.1889 8.27222 28.3743 8.35093 28.5117 8.48835C28.6491 8.62576 28.7278 8.81115 28.7313 9.00545C28.7347 9.19975 28.6626 9.38779 28.5301 9.52997Z";

/** Début du trait (pointe gauche du Check), en fraction de la boîte 32 × 32 : point d'arrivée de la goutte. */
export const checkStart = { x: 5 / 32, y: 18 / 32 };

export function CheckTrace({
  drawn,
  className = "",
  ref,
}: {
  drawn: boolean;
  className?: string;
  ref?: Ref<SVGSVGElement>;
}) {
  const maskId = `check-trace-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 32 32" className={`size-(--icon-lg) shrink-0 ${className}`}>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
        <path
          d="M5 18L12 25L28 9"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={drawn ? 0 : 1}
          className={drawn ? "transition-[stroke-dashoffset] duration-(--nav-side-tile-drop-trace) ease-(--motion-ease-out) motion-reduce:transition-none" : ""}
        />
      </mask>
      <path d={checkPath} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
