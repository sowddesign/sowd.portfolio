"use client";

import { useEffect, useRef } from "react";
import { introuvable } from "@/content/texts";
import { TextualButton } from "../TextualButton";

/*
 * Pop-up « Quitter l'éditeur ? » : un lien du site (logo, menu) cliqué alors qu'un dessin est en cours (demande de
 * l'utilisateur). Même modèle que la fenêtre « Ton dessin » (MotifCard), choix de l'utilisateur : voile (dégradé radial),
 * fenêtre blanche, titre headings/H4 (plus petit que H3, demande de l'utilisateur) sous un trait, texte, bande du bas (trait, blanc autour des boutons) :
 * « Quitter sans garder » (tertiary black, à l'essai) et « Continuer mon dessin » (primary brand), en deux colonnes à partir de la
 * tablette, empilés en mobile (« Continuer » en premier). Échap, clic en dehors : on reste.
 * Largeur --not-found-editor-leave-width (valeur d'essai). Fermer l'onglet ou recharger : fenêtre native du navigateur
 * (MotifEditor, beforeunload).
 */

export function MotifLeave({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const stayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stayRef.current?.querySelector("button")?.focus();
    const key = (event: KeyboardEvent) => event.key === "Escape" && onStay();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onStay]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[radial-gradient(var(--shape-neutral-black),var(--faded-black-60))] p-(--grid-spacing) tablet:p-lg"
      onClick={(event) => event.target === event.currentTarget && onStay()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="motif-leave-title"
        className="flex w-(--not-found-editor-leave-width) max-w-full flex-col bg-background-buttons-neutral-white text-text-neutral-black"
      >
        <h2 id="motif-leave-title" className="type-h4 px-md py-sm tablet:px-lg">
          {introuvable.editeur_quitter_titre}
        </h2>
        <div aria-hidden className="h-(--divider-width) bg-shape-neutral-black" />
        <p className="type-body-regular p-md text-pretty tablet:p-lg">{introuvable.editeur_quitter_texte}</p>
        <div aria-hidden className="h-(--divider-width) bg-shape-neutral-black" />
        <div className="grid grid-cols-1 gap-md p-md tablet:grid-cols-2 tablet:gap-x-lg tablet:p-lg">
          <TextualButton variant="tertiary" color="black" onClick={onLeave} className="order-2 tablet:order-1">
            {introuvable.editeur_quitter_partir}
          </TextualButton>
          <div ref={stayRef} className="order-1 tablet:order-2">
            <TextualButton color="brand" icon="ArrowRight" iconPosition="right" onClick={onStay} className="w-full!">
              {introuvable.editeur_quitter_rester}
            </TextualButton>
          </div>
        </div>
      </div>
    </div>
  );
}
