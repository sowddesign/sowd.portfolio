"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { ProjetHubContainer } from "../ProjetHubContainer";
import { tokenDuration } from "../token-duration";
import { reducedMotionQuery, useMediaQuery } from "../use-media-query";
import type { OtherProject } from "./OthersProjects";

/*
 * Carrousel mobile des autres projets (Figma othersProject Variant2, décisions de l'utilisateur) :
 * - carte centrale de --others-projects-card-mobile (75 % de l'écran), écart spacing/sm, hauteur
 *   --others-projects-card-height-mobile ; les deux voisines restent toujours visibles, rognées par le cadre
 *   (Figma : découpe à l'intérieur des marges de la section) ;
 * - infini : les cartes tournent en boucle (le projet nouveau au centre au départ) ;
 * - au doigt seulement, sans défilement automatique : le carrousel suit le doigt, puis la carte la plus proche
 *   se cale au centre (--motion-duration-base, --motion-ease-out) ; au-delà de --others-projects-swipe-threshold
 *   (part de la largeur d'une carte), on passe à la carte voisine ;
 * - un appui sans glisser ouvre le projet ; le défilement vertical de la page reste possible (touch-action pan-y).
 * Mouvement réduit : la carte se cale sans animation.
 *
 * Cinq emplacements rendus (-2 à 2) : les deux extrêmes, hors du cadre, préparent l'arrivée d'une carte pendant
 * le glissé ; ils sont inertes (ni focus ni lecteur d'écran). Clé = position absolue dans la boucle : une carte
 * garde son élément quand la boucle avance, rien ne se recharge.
 */

const SLOTS = [-2, -1, 0, 1, 2];

const mod = (value: number, n: number) => ((value % n) + n) % n;

function cssNumber(element: Element, name: string) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  if (value.endsWith("rem")) return parseFloat(value) * parseFloat(getComputedStyle(document.documentElement).fontSize);
  return parseFloat(value);
}

type Drag = { id: number; x: number; y: number; axis: "x" | "y" | null };

export function OthersCarousel({ cards }: { cards: OtherProject[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery(reducedMotionQuery);
  /** Position absolue de la carte centrale dans la boucle. */
  const [index, setIndex] = useState(0);
  /** Décalage du rail en pixels (doigt ou calage). */
  const [offset, setOffset] = useState(0);
  /** Calage en cours : carte visée (-1, 0 ou 1 par rapport au centre). */
  const [settling, setSettling] = useState<number | null>(null);
  const drag = useRef<Drag | null>(null);
  const swiped = useRef(false);
  const n = cards.length;

  /** Distance entre deux cartes (largeur d'une carte + écart). */
  const step = () => {
    const root = rootRef.current;
    const center = root?.querySelector<HTMLElement>('[data-slot="0"]');
    const next = root?.querySelector<HTMLElement>('[data-slot="1"]');
    return center && next ? next.offsetLeft - center.offsetLeft : 0;
  };

  const timer = useRef(0);
  const finish = (target: number) => {
    window.clearTimeout(timer.current);
    setIndex((value) => value + target);
    setOffset(0);
    setSettling(null);
  };

  const settle = (target: number) => {
    const to = -target * step();
    if (reduced || to === offset || !rootRef.current) return finish(target);
    setSettling(target);
    setOffset(to);
    // Secours si transitionend n'arrive pas (onglet masqué pendant le calage) : fin à la durée du calage.
    timer.current = window.setTimeout(() => finish(target), tokenDuration(rootRef.current, "--motion-duration-base"));
  };

  const onPointerDown = (event: PointerEvent) => {
    if (settling !== null || n < 2) return;
    swiped.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.axis === null) {
      const slop = cssNumber(event.currentTarget, "--others-projects-drag-slop");
      if (Math.max(Math.abs(dx), Math.abs(dy)) < slop) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (current.axis === "x") {
        swiped.current = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {}
      }
    }
    if (current.axis === "x") setOffset(dx);
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    if (current.axis !== "x") return;
    const threshold = step() * cssNumber(event.currentTarget, "--others-projects-swipe-threshold");
    const dx = event.type === "pointercancel" ? 0 : event.clientX - current.x;
    settle(dx < -threshold ? 1 : dx > threshold ? -1 : 0);
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      // Un glissé n'ouvre pas le projet sous le doigt.
      onClickCapture={(event) => {
        if (!swiped.current) return;
        event.preventDefault();
        event.stopPropagation();
        swiped.current = false;
      }}
      onDragStart={(event) => event.preventDefault()}
      className="relative h-(--others-projects-card-height-mobile) w-full touch-pan-y overflow-hidden select-none [--projet-hub-autres-height:var(--others-projects-card-height-mobile)]"
    >
      <div
        className={`absolute inset-0 ${
          settling !== null ? "transition-transform duration-(--motion-duration-base) ease-(--motion-ease-out)" : ""
        }`}
        style={{ transform: `translateX(${offset}px)` }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && settling !== null) finish(settling);
        }}
      >
        {SLOTS.map((slot) => {
          const position = index + slot;
          const project = cards[mod(position, n)];
          return (
            <div
              key={position}
              data-slot={slot}
              inert={Math.abs(slot) > 1}
              className="absolute top-0 h-full w-(--others-projects-card-mobile)"
              style={{
                left: `calc(50% - var(--others-projects-card-mobile) / 2 + ${slot} * (var(--others-projects-card-mobile) + var(--spacing-sm)))`,
              }}
            >
              <ProjetHubContainer
                layout="autres"
                title={project.title}
                year={project.year}
                isNew={project.isNew}
                href={project.href}
                available={project.available}
                image={
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="75vw"
                    draggable={false}
                    className="object-cover"
                  />
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
