"use client";

import type { AnimationEvent, CSSProperties } from "react";

/*
 * Logo animé de l'écran du showreel — composant Figma « 01 » (fichier portfolio, node 5730:33008).
 * 16 pétales « Exclude » en répétition radiale (shape/neutral/white), chacun tourne et se déforme autour de son centre
 * (keyframes showreel-logo-* dans theme.css, valeurs et temps du prototype Figma).
 * Phases (demande de l'utilisateur) :
 * - grow : pousse, lente au départ puis qui accélère, enchaînée sans arrêt sur une première phase de boucle
 *   (onGrowEnd à la fin) ;
 * - loop : phase de boucle répétée tant que la vidéo charge (onLoopEnd à la fin de chaque phase) ;
 * - fly : logo complet immobile un court instant (--showreel-logo-rest), puis envol des pétales un à un
 *   (transition C), onFlyEnd quand le dernier a disparu.
 */

export type ShowreelLogoPhase = "grow" | "loop" | "fly";

export type ShowreelLogoProps = {
  phase: ShowreelLogoPhase;
  onGrowEnd?: () => void;
  onLoopEnd?: () => void;
  onFlyEnd?: () => void;
  className?: string;
};

/* Pétale de base (export SVG Figma), placé dans le repère 262 × 262 du logo. */
const petal =
  "M6.62864 0.000676056C6.69087 -0.00404083 6.77248 0.0150901 6.8473 0.0843752L6.95611 0.184814L7.07852 0.270606L7.08062 0.272698C7.08271 0.274157 7.08663 0.276908 7.09108 0.280022C7.10008 0.286318 7.11385 0.295623 7.13188 0.30827C7.16864 0.334057 7.22373 0.37331 7.29614 0.424403C7.44135 0.526868 7.65665 0.678863 7.93016 0.874286C8.47739 1.26528 9.26147 1.83018 10.2036 2.5242C12.0907 3.91428 14.6034 5.8145 17.1203 7.86211C19.6474 9.91798 22.1329 12.0849 23.9889 14.014C24.9194 14.9812 25.6463 15.8436 26.1368 16.5647C26.3805 16.9231 26.5437 17.2138 26.6432 17.4383C26.7465 17.6715 26.7513 17.7639 26.7499 17.7428C27.0846 22.7807 28.7481 35.0613 32.862 43.6696C34.858 48.2208 39.5915 53.4912 43.8591 57.7363C45.694 59.5616 47.4969 61.2469 49.0505 62.6683C45.3541 63.5335 42.0041 62.7124 39.4941 61.6011C38.2236 61.0386 37.1974 60.4146 36.4946 59.9345C36.1448 59.6955 35.8787 59.4939 35.7057 59.358C35.6193 59.2901 35.5552 59.2378 35.5174 59.2063C35.4997 59.1915 35.4873 59.1815 35.4808 59.1759L35.4776 59.1738L35.4745 59.1707L35.0895 58.8317L34.5831 58.7051C23.3635 55.913 14.9212 51.3746 9.07579 45.2128C3.39763 39.0476 0.382526 31.6291 0.0362902 22.8537C-0.275118 14.9572 1.4195 8.11399 5.04882 2.23963C5.5162 1.49345 6.00711 0.766497 6.51983 0.0592654L6.56377 0.0174159C6.5769 0.0102816 6.59853 0.00303476 6.62864 0.000676056Z";
const petalOffset = "translate(96.175 20.766)";
const center = 130.672;
const count = 16;

const petalAnimation: Record<ShowreelLogoPhase, string> = {
  grow: "animate-showreel-logo-grow",
  loop: "animate-showreel-logo-loop",
  fly: "",
};

export function ShowreelLogo({ phase, onGrowEnd, onLoopEnd, onFlyEnd, className = "" }: ShowreelLogoProps) {
  // Évènements du premier pétale (fin de la pousse, d'une phase de boucle) et du dernier envolé.
  const onAnimationEnd = (event: AnimationEvent<SVGSVGElement>) => {
    const index = (event.target as SVGElement).dataset.petal;
    if (event.animationName === "showreel-logo-rotate-grow" && index === "0") onGrowEnd?.();
    if (event.animationName === "showreel-logo-fly" && index === String(count - 1)) onFlyEnd?.();
  };
  const onAnimationIteration = (event: AnimationEvent<SVGSVGElement>) => {
    const index = (event.target as SVGElement).dataset.petal;
    if (event.animationName === "showreel-logo-rotate-loop" && index === "0") onLoopEnd?.();
  };

  return (
    <svg
      aria-hidden
      viewBox="0 0 262 262"
      // Sans découpe : les pétales qui s'envolent peuvent sortir du cadre du logo.
      className={`overflow-visible fill-shape-neutral-white ${className}`}
      onAnimationEnd={onAnimationEnd}
      onAnimationIteration={onAnimationIteration}
    >
      {Array.from({ length: count }, (_, index) => (
        <g key={index} transform={`rotate(${(index * 360) / count} ${center} ${center})`}>
          <g
            data-petal={index}
            className={phase === "fly" ? "origin-center animate-showreel-logo-fly [transform-box:fill-box]" : ""}
            style={
              phase === "fly"
                ? ({
                    animationDelay: `calc(var(--showreel-logo-rest) + var(--showreel-logo-fly-stagger) * ${index})`,
                  } as CSSProperties)
                : undefined
            }
          >
            <g transform={petalOffset}>
              <path
                data-petal={index}
                d={petal}
                className={`origin-center [transform-box:fill-box] ${petalAnimation[phase]}`}
              />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
