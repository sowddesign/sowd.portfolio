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
 * Sans effet au toucher (pas de curseur).
 *
 * useCursorLabel : à poser sur un élément existant (gestionnaires, classe, texte à rendre) ;
 * CursorLabel : enveloppe prête à l'emploi.
 */

/** Masque le curseur sur la zone et ses enfants. */
export const cursorHidden = "[&,&_*]:cursor-none";

export function useCursorLabel(label: string | undefined) {
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  /* Début du texte sur le curseur, centré verticalement sur sa pointe.
     S'il sortirait de l'écran à droite, il part du curseur vers la gauche : sa fin est calée sur le curseur. */
  const place = () => {
    const el = labelRef.current;
    if (!el) return;
    const { x, y } = position.current;
    const overflows = x + el.offsetWidth > document.documentElement.clientWidth;
    el.style.setProperty("transform", `translate(${overflows ? x - el.offsetWidth : x}px, ${y}px) translateY(-50%)`);
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    position.current = { x: event.clientX, y: event.clientY };
    if (!visible) setVisible(true);
    place();
  };

  const handlers = label
    ? { onPointerEnter: move, onPointerMove: move, onPointerLeave: () => setVisible(false) }
    : {};

  const node =
    label && visible
      ? createPortal(
          <span
            ref={(el) => {
              labelRef.current = el;
              place();
            }}
            aria-hidden
            className="type-caption-regular pointer-events-none fixed top-0 left-0 z-50 whitespace-nowrap text-text-neutral-white mix-blend-difference"
          >
            {label}
          </span>,
          document.body,
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
