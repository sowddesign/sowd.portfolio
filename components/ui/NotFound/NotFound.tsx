"use client";

import { useRef, useState } from "react";
import { reducedMotionQuery } from "../use-media-query";
import { introuvable } from "@/content/texts";
import { Logomark } from "../LogoButton";
import { TextualButton } from "../TextualButton";
import { playPlantSequence } from "./plant-sequence";
import { SeedStem } from "./SeedStem";

/*
 * Page 404 — Figma « Frame 1000005344 » (fichier portfolio, node 5843:21876), desktop, tests.
 * « 4 » + logo (toUseLogo) + « 4 » centrés ; dessous, titre, texte, bouton vers l'accueil et indice ;
 * graine en bas de l'écran à tirer jusqu'au logo (SeedStem).
 * Trou (Figma node 5843:22086, shape/neutral/black) : apparaît quand on attrape la graine, disparaît si elle est
 * lâchée loin ; la graine s'y enfonce si elle est lâchée près.
 * Graine enfoncée : fondu des textes, du bouton, de la tige et du trou ; les « 4 » deviennent des feuilles qui
 * rentrent en spirale dans le logo, qui tourne (plant-sequence). Mouvement réduit : les « 4 » disparaissent d'un coup.
 * À venir (demandes de l'utilisateur) : page de peinture à la place de la 404 (sans adresse propre), signature,
 * liquide qui remplit les « 4 » puis renvoie à l'accueil.
 */

const digitClass =
  "shrink-0 font-[family-name:var(--typography-font-h2h4)] font-(--typography-weight-heading-h2h4) text-(length:--not-found-digit-size) leading-(--not-found-digit-line-height) tracking-(--typography-letter-spacing-default) whitespace-nowrap text-text-brand-brand";

export function NotFound() {
  const holeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const leavesRef = useRef<SVGSVGElement>(null);
  const [holeShown, setHoleShown] = useState(false);
  /** Séquence après la graine enfoncée : planted (fondu, feuilles, logo qui tourne), done (fin). */
  const [phase, setPhase] = useState<"play" | "planted" | "done">("play");
  const fade = `transition-opacity duration-(--not-found-fade-duration) ease-(--motion-ease-out) ${
    phase === "play" ? "opacity-100" : "pointer-events-none opacity-0"
  }`;

  const plant = () => {
    setPhase("planted");
    const logo = logoRef.current;
    const svg = leavesRef.current;
    const digits = digitRefs.current.filter((d): d is HTMLSpanElement => d !== null);
    if (window.matchMedia(reducedMotionQuery).matches || !logo || !svg) {
      digits.forEach((d) => (d.style.opacity = "0"));
      setPhase("done");
      return;
    }
    playPlantSequence(svg, { digits, logo }, () => setPhase("done"));
  };

  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-(--background-neutral-black) p-lg">
      <div className="flex w-full items-center justify-center gap-lg" aria-hidden>
        <span ref={(el) => void (digitRefs.current[0] = el)} className={digitClass}>
          4
        </span>
        <div ref={logoRef} className="relative flex size-(--not-found-logo-size) shrink-0 items-center justify-center">
          <Logomark className="size-full text-shape-brand-brand" />
          <div
            ref={holeRef}
            className={`absolute top-(--not-found-hole-top) left-1/2 size-(--not-found-hole-size) -translate-1/2 rounded-full bg-shape-neutral-black transition-opacity duration-(--motion-duration-base) ease-(--motion-ease-out) ${
              holeShown && phase === "play" ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        <span ref={(el) => void (digitRefs.current[1] = el)} className={digitClass}>
          4
        </span>
      </div>

      <div className={`flex w-full flex-col items-start gap-lg ${fade}`}>
        <div className="flex flex-col items-start gap-sm">
          <h1 className="type-body-accentuation text-text-brand-brand">{introuvable.entete_titre}</h1>
          <p className="type-caption-regular text-text-neutral-white">{introuvable.entete_texte}</p>
        </div>
        <TextualButton href="/" icon="ArrowUpRight" iconPosition="right" className="w-(--not-found-button-width)!">
          {introuvable.retour_accueil}
        </TextualButton>
        <p className="type-caption-small-italic text-faded-white-40">{introuvable.indice}</p>
      </div>

      <SeedStem
        target={holeRef}
        label={introuvable.graine}
        onGrab={() => setHoleShown(true)}
        onMiss={() => setHoleShown(false)}
        onPlant={plant}
        className={fade}
      />
      <svg ref={leavesRef} aria-hidden className="pointer-events-none fixed inset-0 size-full fill-shape-brand-brand" />
    </div>
  );
}
