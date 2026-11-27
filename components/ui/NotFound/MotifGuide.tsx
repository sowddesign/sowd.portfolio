"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { introuvable } from "@/content/texts";
import { colorTransition } from "../button-tones";
import { TextualButton } from "../TextualButton";
import { tabletQuery, useMediaQuery } from "../use-media-query";

/*
 * Guide de découverte de l'éditeur de dessin (aperçu C choisi par l'utilisateur, sans maquette Figma : valeurs d'essai,
 * à revoir avec l'utilisateur). Affiché à la première ouverture de l'éditeur, en 3 étapes :
 *  1. Pinceau (bouton de la colonne d'outils) ;
 *  2. Couleur et Taille (deux boutons de la colonne) ;
 *  3. Copier le lien, Télécharger en PNG et Valider le dessin (en-tête).
 * Les éléments présentés portent data-guide="<étape>" dans l'éditeur ; le cadre (contour brand, à spacing/xs autour) les
 * entoure tous, le reste de l'écran est voilé (--not-found-editor-guide-veil) et ne réagit pas.
 * Carte (fond blanc, ombre dropshadow/mid, marges spacing/lg) : à spacing/lg à droite du cadre (étapes 1-2), ou dessous,
 * alignée à droite (étape 3, en-tête). Mobile (mêmes étapes, demande de l'utilisateur) : étapes 1-2 dans la barre
 * d'outils du bas, ramenées dans l'écran si la barre a défilé, carte au-dessus du cadre ; étape 3 sur « Terminer » ;
 * carte alignée sur la marge droite de la grille, jamais plus large que l'écran moins ses marges. « Étape n / 3 », titre, texte, suivi d'étapes en pastilles, « Passer » (secondary
 * black) et « Suivant » (primary brand ; « Commencer à dessiner » à la dernière étape). Échap = Passer.
 */

const steps = [
  { title: introuvable.editeur_guide_1_titre, text: introuvable.editeur_guide_1_texte, side: "right" },
  { title: introuvable.editeur_guide_2_titre, text: introuvable.editeur_guide_2_texte, side: "right" },
  { title: introuvable.editeur_guide_3_titre, text: introuvable.editeur_guide_3_texte, side: "bottom" },
] as const;

type Box = { left: number; top: number; right: number; bottom: number };

/** Rectangle qui entoure tous les éléments de l'étape (data-guide). */
function measure(step: number, reveal: boolean): Box | null {
  const targets = [...document.querySelectorAll<HTMLElement>(`[data-guide~="${step + 1}"]`)];
  if (!targets.length) return null;
  // Barre d'outils mobile défilante : éléments de l'étape ramenés dans l'écran.
  if (reveal) targets.forEach((el) => el.scrollIntoView({ block: "nearest", inline: "center" }));
  return targets
    .map((el) => el.getBoundingClientRect())
    .reduce<Box>(
      (box, r) => ({
        left: Math.min(box.left, r.left),
        top: Math.min(box.top, r.top),
        right: Math.max(box.right, r.right),
        bottom: Math.max(box.bottom, r.bottom),
      }),
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    );
}

export function MotifGuide({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const last = step === steps.length - 1;
  const { title, text, side } = steps[step];
  const wide = useMediaQuery(tabletQuery);

  useLayoutEffect(() => {
    const update = (reveal = false) => setBox(measure(step, reveal));
    update(true);
    const resize = () => update();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [step]);

  // Bouton principal au clavier à chaque étape ; Échap = Passer.
  useEffect(() => {
    nextRef.current?.querySelector("button")?.focus();
  }, [step]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  if (!box) return null;
  const move = "duration-(--not-found-editor-guide-duration) ease-(--motion-ease-out) motion-reduce:transition-none";

  return (
    <div
      className="absolute inset-0 z-4 overflow-hidden"
      role="dialog"
      aria-modal
      aria-label={introuvable.editeur_guide}
    >
      {/* Cadre : contour brand ; le voile est son ombre, sur tout l'écran (le reste ne réagit pas). Gardé dans l'écran :
          collé au bord quand l'élément l'est (en-tête). */}
      <div
        aria-hidden
        className={`pointer-events-none absolute border-(length:--divider-width) border-shape-brand-brand shadow-[0_0_0_100vmax_var(--not-found-editor-guide-veil)] transition-[left,top,width,height] ${move}`}
        style={{
          left: `max(0px, calc(${box.left}px - var(--spacing-xs)))`,
          top: `max(0px, calc(${box.top}px - var(--spacing-xs)))`,
          width: `calc(${box.right}px + var(--spacing-xs) - max(0px, calc(${box.left}px - var(--spacing-xs))))`,
          height: `calc(${box.bottom}px + var(--spacing-xs) - max(0px, calc(${box.top}px - var(--spacing-xs))))`,
        }}
      />
      <div
        className={`absolute flex w-(--not-found-editor-guide-width) max-w-[calc(100%-2*var(--grid-spacing))] flex-col gap-sm bg-background-neutral-white p-lg text-text-neutral-black shadow-(--dropshadow-mid) transition-[left,top,right] ${move}`}
        style={
          !wide && side === "right"
            ? {
                right: "var(--grid-spacing)",
                bottom: `calc(100% - ${box.top}px + var(--spacing-xs) + var(--spacing-lg))`,
              }
            : !wide
              ? {
                  right: "var(--grid-spacing)",
                  top: `calc(${box.bottom}px + var(--spacing-xs) + var(--spacing-lg))`,
                }
              : side === "right"
                ? {
                    left: `calc(${box.right}px + var(--spacing-xs) + var(--spacing-lg))`,
                    top: `calc(${box.top}px - var(--spacing-xs))`,
                  }
                : {
                    right: `calc(100% - ${box.right}px - var(--spacing-xs))`,
                    top: `calc(${box.bottom}px + var(--spacing-xs) + var(--spacing-lg))`,
                  }
        }
      >
        <p className="type-caption-regular text-text-brand-dark">
          {introuvable.editeur_guide_etape.replace("{n}", String(step + 1)).replace("{total}", String(steps.length))}
        </p>
        <h2 className="type-h4">{title}</h2>
        <p className="type-body-regular text-pretty">{text}</p>
        <div className="flex items-center justify-between gap-md pt-sm">
          {/* Suivi d'étapes en pastilles (choix de l'utilisateur, comme l'indicateur du tournesol mobile) : écart
              spacing/xs ; étape en cours brand, les autres faded/black/20 (fond blanc de la carte). */}
          <div aria-hidden className="flex gap-xs">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`size-(--not-found-editor-guide-dot) rounded-full ${colorTransition} ${i === step ? "bg-shape-brand-brand" : "bg-faded-black-20"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-md">
            {!last && (
              <TextualButton variant="secondary" color="black" onClick={onClose}>
                {introuvable.editeur_guide_passer}
              </TextualButton>
            )}
            <div ref={nextRef}>
              <TextualButton
                icon="ArrowRight"
                iconPosition="right"
                onClick={() => (last ? onClose() : setStep(step + 1))}
              >
                {last ? introuvable.editeur_guide_commencer : introuvable.editeur_guide_suivant}
              </TextualButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
