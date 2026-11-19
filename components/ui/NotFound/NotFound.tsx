"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { reducedMotionQuery } from "../use-media-query";
import { commun, introuvable } from "@/content/texts";
import { Icon } from "../Icon";
import { Logomark } from "../LogoButton";
import { TextualButton } from "../TextualButton";
import { playPlantSequence } from "./plant-sequence";
import { HiddenShapes, useLayoutShapes } from "./HiddenShapes";
import { HiddenStem } from "./HiddenStem";
import { digitFourPath, digitFourViewBox } from "./digit-four";
import { notFoundLayout, type NotFoundLayout } from "./token-px";

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
  /* Placement selon l'écran (desktop, tablette ou mobile en portrait) et taille proportionnelle à l'écran
     (demandes de l'utilisateur) : « 4 », logo, tige et formes cachées. */
  const [layout, setLayout] = useState<NotFoundLayout | null>(null);
  const scale = layout?.logoScale ?? 1;
  const shapes = useLayoutShapes(layout);
  useEffect(() => {
    const update = () =>
      setLayout((old) => {
        const next = notFoundLayout();
        return old &&
          old.name === next.name &&
          old.scale === next.scale &&
          old.logoScale === next.logoScale &&
          old.scaleX === next.scaleX &&
          old.scaleY === next.scaleY &&
          old.rowOffset === next.rowOffset
          ? old
          : next;
      });
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
  const leftDigitRef = useRef<HTMLSpanElement | null>(null);
  /** Séquence après la graine enfoncée : planted (fondu, feuilles, logo qui tourne), done (fin). */
  const [phase, setPhase] = useState<"play" | "planted" | "done">("play");
  const done = phase === "done";
  const corner = layout?.name === "mobile" ? "bottom-md left-md" : "bottom-lg left-lg";
  /* Mobile : « Accueil » seul, sans flèche, bouton à la largeur du texte (demandes de l'utilisateur). */
  const mobile = layout?.name === "mobile";
  const homeLabel = mobile ? introuvable.retour_accueil_court : introuvable.retour_accueil;
  const homeIcon = mobile ? undefined : "ArrowUpRight";
  const homeWidth = mobile ? "w-fit!" : "w-(--not-found-button-width)!";
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
      /* Écran tactile : appui maintenu et déplacement du doigt pour découvrir (demande de l'utilisateur) ; la page ne
         défile pas et le doigt ne sélectionne pas de texte, pour que le déplacement soit suivi en continu. */
      className={`relative flex min-h-dvh flex-1 touch-none flex-col items-center justify-center overflow-hidden bg-(--background-neutral-black) p-lg select-none ${
        layout ? "" : "invisible"
      }`}
    >
      {/* Formes cachées tout derrière (demande de l'utilisateur) : le 404 et les textes, positionnés après, passent devant. */}
      {layout && shapes && <HiddenShapes textRef={textRef} digitRef={leftDigitRef} layout={layout} shapes={shapes} />}
      {/* « 404 » décoratif (aria-hidden sur les chiffres et le logo) ; le bouton du centre reste accessible. */}
      {/* Placements portrait : 404 remonté de --not-found-<placement>-row-offset depuis le centre. */}
      <div
        className="relative flex w-full items-center justify-center gap-lg"
        style={{ transform: layout?.rowOffset ? `translateY(${layout.rowOffset}px)` : undefined }}
      >
        <DigitFour
          ref={(el) => {
            digitRefs.current[0] = el;
            leftDigitRef.current = el;
          }}
        />
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
              {/* Mobile : pinceau seul (choix de l'utilisateur), le mot reste lu par les lecteurs d'écran. */}
              <span className="flex flex-col items-center gap-xs">
                <span className={layout?.name === "mobile" ? "sr-only" : ""}>{introuvable.acceder_editeur}</span>
                <Icon name="PaintBrush" size="var(--icon-md)" />
              </span>
            </TextualButton>
          </div>
          {/* Tige cachée hors du logo, pour ne pas tourner avec lui pendant la séquence. */}
          {layout && shapes?.stem && (
            <HiddenStem
              shape={shapes.stem}
              onComplete={plant}
              scale={1}
              className="top-[calc(var(--not-found-stem-top)*var(--not-found-scale))] left-1/2"
            />
          )}
        </div>
        <DigitFour ref={(el) => void (digitRefs.current[1] = el)} />
      </div>

      {/* Bloc « Page introuvable » à spacing/lg (24 px) du bord gauche et du bas de l'écran (demande de l'utilisateur),
          spacing/md (16 px) en mobile comme les autres pages mobiles. */}
      <div ref={textRef} className={`absolute flex flex-col items-start gap-lg ${corner} ${fade}`}>
        <div className="flex flex-col items-start gap-sm">
          <h1 className="type-body-accentuation text-text-brand-brand">{introuvable.entete_titre}</h1>
          <p className="type-caption-regular text-text-neutral-white">{introuvable.entete_texte}</p>
        </div>
        <TextualButton href="/" icon={homeIcon} iconPosition="right" className={homeWidth}>
          {homeLabel}
        </TextualButton>
        {/* Indice à la largeur du bouton (demande de l'utilisateur) : il passe à la ligne au besoin. */}
        <p className="type-caption-small-italic w-(--not-found-button-width) text-faded-white-40">{introuvable.indice}</p>
      </div>

      {/* Fleur plantée : seul le bouton vers l'accueil reste, en tertiary, à la place du bloc (demande de l'utilisateur). */}
      <div
        className={`absolute ${corner} transition-opacity duration-(--not-found-fade-duration) ease-(--motion-ease-out) ${
          done ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <TextualButton
          href="/"
          variant="tertiary"
          icon={homeIcon}
          iconPosition="right"
          className={homeWidth}
        >
          {homeLabel}
        </TextualButton>
      </div>

      <svg ref={leavesRef} aria-hidden className="pointer-events-none fixed inset-0 size-full fill-shape-brand-brand" />
    </div>
  );
}
