"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

/*
 * Curseur texte — principe réutilisable (demandé par l'utilisateur, absent de Figma en tant que composant).
 * Au survol à la souris de la zone visée, le curseur est masqué et remplacé par un texte
 * en captionText/regular (choisi par l'utilisateur), sans ombre, qui s'inverse selon le fond (texte blanc en mix-blend-mode difference :
 * noir sur fond clair, blanc sur fond sombre, teinte inversée sur un fond coloré).
 * Le début du texte est calé sur le curseur et le texte s'étend vers la droite ; s'il sortirait de l'écran,
 * il part du curseur vers la gauche (règle de l'utilisateur).
 * Placement « above » (liens dans un texte, demande de l'utilisateur) : le texte se pose au-dessus de la ligne
 * survolée, pour ne pas masquer le texte, centré sur le curseur en horizontal (gardé dans l'écran).
 * Placement « center » (icône, demande de l'utilisateur) : le contenu est centré sur la pointe du curseur.
 * Le contenu peut être un texte ou un élément (ex. une Icon), qui prend la même couleur adaptative.
 * Sans effet au toucher (pas de curseur). En plein écran, le texte est rendu dans l'élément en plein écran.
 *
 * useCursorLabel : à poser sur un élément existant (gestionnaires, classe, texte à rendre) ;
 * CursorLabel : enveloppe prête à l'emploi.
 */

/** Masque le curseur sur la zone et ses enfants. */
export const cursorHidden = "[&,&_*]:cursor-none";

export type CursorLabelPlacement = "cursor" | "above" | "center";

export function useCursorLabel(label: ReactNode, placement: CursorLabelPlacement = "cursor") {
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  /* Début du texte sur le curseur, centré verticalement sur sa pointe (above : posé sur le haut de la ligne).
     S'il sortirait de l'écran à droite, il part du curseur vers la gauche : sa fin est calée sur le curseur. */
  const place = () => {
    const el = labelRef.current;
    if (!el) return;
    const { x, y } = position.current;
    const width = el.offsetWidth;
    const screen = document.documentElement.clientWidth;
    if (placement === "center") {
      el.style.setProperty("transform", `translate(${x}px, ${y}px) translate(-50%, -50%)`);
      return;
    }
    if (placement === "above") {
      const left = Math.min(Math.max(0, x - width / 2), screen - width);
      el.style.setProperty("transform", `translate(${left}px, ${y}px) translateY(-100%)`);
      return;
    }
    const overflows = x + width > screen;
    el.style.setProperty("transform", `translate(${overflows ? x - width : x}px, ${y}px) translateY(-50%)`);
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    let y = event.clientY;
    if (placement === "above") {
      // Ligne survolée : un lien sur plusieurs lignes a une boîte par ligne.
      const lines = Array.from((event.currentTarget as Element).getClientRects());
      const line = lines.find((rect) => event.clientY >= rect.top && event.clientY <= rect.bottom) ?? lines[0];
      if (line) y = line.top;
    }
    position.current = { x: event.clientX, y };
    if (!visible) setVisible(true);
    place();
  };

  /* Sortie toujours écoutée, même sans texte : un texte qui disparaît pendant le survol (bouton désactivé) puis
     revient ne doit pas réapparaître figé à l'ancienne position une fois le curseur parti. */
  const leave = () => setVisible(false);
  const handlers = label
    ? { onPointerEnter: move, onPointerMove: move, onPointerLeave: leave }
    : { onPointerLeave: leave };

  const node =
    label && visible
      ? createPortal(
          <span
            ref={(el) => {
              labelRef.current = el;
              place();
            }}
            aria-hidden
            className="type-caption-regular pointer-events-none fixed top-0 left-0 z-50 flex whitespace-nowrap text-text-neutral-white mix-blend-difference"
          >
            {label}
          </span>,
          // En plein écran, seul l'élément affiché en plein écran est visible : le texte y est rendu.
          document.fullscreenElement ?? document.body,
        )
      : null;

  return { handlers, className: label ? cursorHidden : "", node };
}

export type CursorLabelProps = {
  /** Texte qui remplace le curseur. */
  label: string;
  children: ReactNode;
  className?: string;
};

export function CursorLabel({ label, children, className = "" }: CursorLabelProps) {
  const cursor = useCursorLabel(label);
  return (
    <div className={`${cursor.className} ${className}`} {...cursor.handlers}>
      {children}
      {cursor.node}
    </div>
  );
}
