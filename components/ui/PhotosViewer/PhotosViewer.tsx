"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type TransitionEvent } from "react";
import { IconButton } from "../IconButton";
import { commun } from "@/content/texts";
import type { Photo } from "../Photos";

/*
 * Vue photo du composant Photos (Figma « photos », fichier portfolio, node 4440:8739) : carrousel d'une photo à la fois,
 * ouvert au clic sur une photo de la mosaïque. Ses calques et boutons reprennent les variantes Figma « n » (01, 02…),
 * qui ne sont pas des props : chaque variante est une photo de content/photos/ordre.yaml (lue par lib/photos.ts).
 * Le composant remplit son parent.
 *
 * Description : infobulle native du navigateur au survol de la photo (title) et texte alternatif.
 * Provisoire : un effet de survol dédié la remplacera.
 *
 * Passage d'une photo à l'autre (choix validé, sans maquette Figma) : glissement horizontal
 * --motion-duration-base / --motion-ease-out, coupé si le mouvement est réduit.
 * Navigation en boucle : la piste porte une copie de la dernière photo avant la première et de la première après
 * la dernière ; une fois le glissement vers une copie terminé, la piste saute sans animation sur la vraie photo.
 * Boutons tertiary (choix validé), couleur (black / white) propre à chaque photo, « bouton » dans ordre.yaml ; avec onClose, bouton de
 * fermeture tertiary en haut à droite, sans espacement (choix validé).
 * Gestes : chevrons ; glisser au doigt (la photo suit le doigt). Pas de scroll dans la photo (choix validé) :
 * sur ordinateur, seuls les chevrons changent de photo.
 * Au relâcher, la photo change si le geste dépasse SWIPE_THRESHOLD de la largeur, sinon elle revient en place.
 *
 * Calques Figma : photo (object-cover) puis voile extra/backgroundColor/hoverVisual/screeneffect, sans coins arrondis.
 * Pour des coins arrondis, le conteneur parent les applique avec overflow-clip : il recadre les photos.
 */

export type PhotosViewerProps = {
  photos: Photo[];
  /** Index de la photo affichée au départ. */
  start?: number;
  /** Ferme la vue photo : affiche le bouton icône (tertiary) en haut à droite. */
  onClose?: () => void;
  /** Appelé avec l'index de la photo visée, au départ puis à chaque changement. */
  onChange?: (index: number) => void;
  /** Attribut sizes de next/image, selon la largeur du conteneur. */
  sizes?: string;
  className?: string;
};

/** Part de la largeur à dépasser au glisser pour changer de photo. */
const SWIPE_THRESHOLD = 0.2;

const slide = "transition-[translate] duration-(--motion-duration-base) ease-(--motion-ease-out) motion-reduce:transition-none";

export function PhotosViewer({ photos, start = 0, onClose, onChange, sizes = "100vw", className = "" }: PhotosViewerProps) {
  const count = photos.length;
  /** Position dans la piste : 0 = copie de la dernière, 1 à count = photos, count + 1 = copie de la première. */
  const [position, setPosition] = useState(start + 1);
  /** Décalage en px pendant un glisser (la piste suit le doigt). */
  const [offset, setOffset] = useState(0);
  /** Vrai pendant un geste ou un saut de boucle : pas de transition. */
  const [still, setStill] = useState(false);
  const moving = useRef(false);
  const fallback = useRef(0);
  const positionRef = useRef(position);
  const frame = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number; horizontal: boolean | null } | null>(null);

  const go = (step: number) => {
    if (moving.current || count < 2) return;
    setOffset(0);
    // Mouvement réduit : pas de transition (donc pas de transitionend), la boucle se règle tout de suite.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPosition((p) => ((p - 1 + step + count) % count) + 1);
      return;
    }
    moving.current = true;
    setStill(false);
    setPosition((p) => p + step);
    // Filet de sécurité si transitionend n'arrive pas (onglet en arrière-plan…) : le carrousel ne reste pas bloqué.
    const duration = parseFloat(getComputedStyle(frame.current?.firstElementChild ?? document.body).transitionDuration) || 0;
    window.clearTimeout(fallback.current);
    fallback.current = window.setTimeout(finish, duration * 1000 + 100);
  };

  /** Fin du glissement : débloque, et saute sans animation de la copie de bord vers la vraie photo. */
  const finish = () => {
    window.clearTimeout(fallback.current);
    moving.current = false;
    const p = positionRef.current;
    if (p === 0 || p === count + 1) {
      setStill(true);
      setPosition(p === 0 ? count : 1);
    }
  };

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  /** Fin d'un geste : change de photo au-delà du seuil, sinon revient en place. */
  const release = (distance: number) => {
    const width = frame.current?.clientWidth ?? 1;
    if (Math.abs(distance) > width * SWIPE_THRESHOLD) {
      go(distance < 0 ? 1 : -1);
    } else {
      setStill(false);
      setOffset(0);
    }
  };

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && moving.current) finish();
  };

  // Après un saut de boucle, réactive la transition une fois la nouvelle position affichée.
  useEffect(() => {
    if (!still || pointer.current) return;
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setStill(false));
    });
    return () => cancelAnimationFrame(id);
  }, [still, position]);

  // Glisser au doigt (tactile et stylet ; la souris garde les chevrons).
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || moving.current || count < 2) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: null };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Le premier mouvement décide : horizontal = carrousel, vertical = défilement de la page.
    if (start.horizontal === null) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      start.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!start.horizontal) {
        pointer.current = null;
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setStill(true);
    setOffset(dx);
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    if (start.horizontal) release(event.clientX - start.x);
  };

  // Index de la photo visée (une copie de bord vaut la photo qu'elle copie).
  const index = count ? (((position - 1) % count) + count) % count : 0;
  useEffect(() => {
    onChange?.(index);
  }, [index, onChange]);

  if (count === 0) return null;

  // Piste avec les copies de bord pour la boucle.
  const track = count > 1 ? [photos[count - 1], ...photos, photos[0]] : photos;
  const shown = count > 1 ? position : 0;
  // Couleur des boutons : celle de la photo visée.
  const buttonColor = photos[index].buttonColor;

  return (
    <div
      ref={frame}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className={`relative flex size-full touch-pan-y flex-col items-center justify-center overflow-clip ${className}`}
    >
      <div
        onTransitionEnd={onTransitionEnd}
        style={{ translate: `calc(${-shown * 100}% + ${offset}px) 0` }}
        className={`absolute inset-0 flex ${still ? "" : slide}`}
      >
        {track.map((photo, i) => (
          <div
            key={`${i}-${photo.src}`}
            title={photo.description}
            aria-hidden={i !== shown}
            className="relative h-full w-full shrink-0"
          >
            <Image src={photo.src} alt={photo.description} fill sizes={sizes} draggable={false} className="object-cover select-none" />
          </div>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-extra-screeneffect" />

      <div className="relative flex w-full items-center justify-between">
        <IconButton icon="CaretLeft" label={commun.photos_precedente} variant="tertiary" color={buttonColor} onClick={() => go(-1)} />
        <IconButton icon="CaretRight" label={commun.photos_suivante} variant="tertiary" color={buttonColor} onClick={() => go(1)} />
      </div>

      {onClose && (
        <IconButton icon="X" label={commun.photos_fermer} variant="tertiary" color={buttonColor} onClick={onClose} className="absolute! top-0 right-0" />
      )}
    </div>
  );
}
