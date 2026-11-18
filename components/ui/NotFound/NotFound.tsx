"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { reducedMotionQuery } from "../use-media-query";
import { commun, introuvable } from "@/content/texts";
import { Icon } from "../Icon";
import { Logomark } from "../LogoButton";
import { TextualButton } from "../TextualButton";
import { playPlantSequence } from "./plant-sequence";
import { HiddenShapes } from "./HiddenShapes";
import { HiddenStem } from "./HiddenStem";
import { digitFourPath, digitFourViewBox } from "./digit-four";
import { notFoundScale } from "./token-px";

/*
 * Page 404 — Figma « Frame 1000005344 » (fichier portfolio, node 5843:21876), desktop, tests.
 * « 4 » + logo (toUseLogo) + « 4 » centrés ; dessous, titre, texte, bouton vers l'accueil et indice ;
 * tige cachée sous le logo, qui se dessine au survol (HiddenStem).
 * Graine à tirer jusqu'au trou du logo (SeedStem) : mise de côté (demande de l'utilisateur), on y reviendra peut-être.
 * Tige entièrement découverte : fondu des textes, du bouton, de la tige et du trou ; les « 4 » deviennent des feuilles qui
 * rentrent en spirale dans le logo, qui tourne (plant-sequence). Mouvement réduit : les « 4 » disparaissent d'un coup.
 * À venir (demandes de l'utilisateur) : page de peinture à la place de la 404 (sans adresse propre), signature,
 * liquide qui remplit les « 4 » puis renvoie à l'accueil.
 */

/* « 4 » vectoriel (digit-four), à la taille de l'écran (--not-found-scale). */
function DigitFour({ ref }: { ref: (el: HTMLSpanElement | null) => void }) {
  return (
    <span ref={ref} aria-hidden className="relative block shrink-0">
      <svg
        viewBox={digitFourViewBox}
        className="block h-[calc(var(--not-found-digit-height)*var(--not-found-scale))] w-auto fill-text-brand-brand"
      >
        <path d={digitFourPath} />
      </svg>
    </span>
  );
}

export function NotFound() {
  /* Réduction de la page à la taille de l'écran (demande de l'utilisateur) : « 4 », logo, tige et formes cachées. */
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => setScale(notFoundScale());
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  const logoRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const leavesRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  /** Séquence après la graine enfoncée : planted (fondu, feuilles, logo qui tourne), done (fin). */
  const [phase, setPhase] = useState<"play" | "planted" | "done">("play");
  const done = phase === "done";
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
    <div
      style={{ "--not-found-scale": scale } as CSSProperties}
      className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-(--background-neutral-black) p-lg"
    >
      {/* Formes cachées tout derrière (demande de l'utilisateur) : le 404 et les textes, positionnés après, passent devant. */}
      <HiddenShapes textRef={textRef} scale={scale} />
      {/* « 404 » décoratif (aria-hidden sur les chiffres et le logo) ; le bouton du centre reste accessible. */}
      <div className="relative flex w-full items-center justify-center gap-lg">
        <DigitFour ref={(el) => void (digitRefs.current[0] = el)} />
        <div className="relative shrink-0">
          <div
            ref={logoRef}
            aria-hidden
            className="relative flex size-[calc(var(--not-found-logo-size)*var(--not-found-scale))] items-center justify-center"
          >
            <Logomark className="size-full text-shape-brand-brand" />
          </div>
          {/* Fleur plantée : le centre du logo devient un bouton primary en ellipse (demande de l'utilisateur),
              vers l'éditeur de la page secrète. */}
          <div
            className={`absolute top-1/2 left-1/2 size-[calc(var(--not-found-editor-button-size)*var(--not-found-scale))] -translate-1/2 transition-opacity duration-(--not-found-fade-duration) ease-(--motion-ease-out) ${
              done ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* Couleurs (demande de l'utilisateur) : fond somber et texte blanc au repos, survol et clic du primary
                brand. Un mot puis l'icône PaintBrush en dessous, centrés (choix de l'utilisateur). */}
            <TextualButton
              href={commun.methode_bonus_page_secrete_lien}
              className={[
                "h-full! rounded-full [&_.type-caption-regular]:h-auto [&_.type-caption-regular]:text-center",
                "bg-background-buttons-brand-somber! text-text-neutral-white!",
                "hover:bg-background-buttons-brand-bright! hover:text-text-neutral-black!",
                "active:bg-background-buttons-neutral-black! active:text-text-brand-bright!",
              ].join(" ")}
            >
              <span className="flex flex-col items-center gap-xs">
                {introuvable.acceder_editeur}
                <Icon name="PaintBrush" size="var(--icon-md)" />
              </span>
            </TextualButton>
          </div>
          {/* Tige cachée hors du logo, pour ne pas tourner avec lui pendant la séquence. */}
          <HiddenStem
            onComplete={plant}
            scale={scale}
            className="top-[calc(var(--not-found-stem-top)*var(--not-found-scale))] left-1/2"
          />
        </div>
        <DigitFour ref={(el) => void (digitRefs.current[1] = el)} />
      </div>

      {/* Bloc « Page introuvable » à spacing/lg (24 px) du bord gauche et du bas de l'écran (demande de l'utilisateur). */}
      <div ref={textRef} className={`absolute bottom-lg left-lg flex flex-col items-start gap-lg ${fade}`}>
        <div className="flex flex-col items-start gap-sm">
          <h1 className="type-body-accentuation text-text-brand-brand">{introuvable.entete_titre}</h1>
          <p className="type-caption-regular text-text-neutral-white">{introuvable.entete_texte}</p>
        </div>
        <TextualButton href="/" icon="ArrowUpRight" iconPosition="right" className="w-(--not-found-button-width)!">
          {introuvable.retour_accueil}
        </TextualButton>
        {/* Indice à la largeur du bouton (demande de l'utilisateur) : il passe à la ligne au besoin. */}
        <p className="type-caption-small-italic w-(--not-found-button-width) text-faded-white-40">{introuvable.indice}</p>
      </div>

      {/* Fleur plantée : seul le bouton vers l'accueil reste, en tertiary, à la place du bloc (demande de l'utilisateur). */}
      <div
        className={`absolute bottom-lg left-lg transition-opacity duration-(--not-found-fade-duration) ease-(--motion-ease-out) ${
          done ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <TextualButton
          href="/"
          variant="tertiary"
          icon="ArrowUpRight"
          iconPosition="right"
          className="w-(--not-found-button-width)!"
        >
          {introuvable.retour_accueil}
        </TextualButton>
      </div>

      <svg ref={leavesRef} aria-hidden className="pointer-events-none fixed inset-0 size-full fill-shape-brand-brand" />
    </div>
  );
}
