"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { commun } from "@/content/texts";
import { Icon } from "../Icon";
import { ProjetHubContainer } from "../ProjetHubContainer";
import { OthersCarousel } from "./OthersCarousel";

/*
 * Autres projets en bas d'une page projet — composant Figma « othersProject » (fichier portfolio, node 5763:30632).
 * Variantes Figma : Default (desktop, la tablette le suit) et Variant2 (mobile).
 *
 * Trois cartes projetHubContainer layout « autres » (règle de l'utilisateur) : le projet nouveau toujours,
 * en 1re position (au milieu en mobile), puis deux projets tirés au hasard parmi les autres ;
 * le projet de la page n'est jamais proposé (s'il est lui-même le nouveau, trois projets tirés au hasard).
 * Le tirage se fait dans le navigateur après l'affichage (la page est générée à l'avance) :
 * le premier affichage montre les projets suivants de la liste, puis le tirage les remplace.
 *
 * Mobile : carrousel infini au doigt (OthersCarousel), le projet nouveau au centre au départ.
 */

export type OtherProject = {
  slug: string;
  title: string;
  year: string;
  image: string;
  href: string;
  isNew: boolean;
  /** Faux : « Bientôt disponible », carte non cliquable. */
  available: boolean;
};

export type OthersProjectsProps = {
  projects: OtherProject[];
  /** Projet de la page, exclu des cartes. */
  currentSlug: string;
  className?: string;
};

const COUNT = 3;

function pick(projects: OtherProject[], currentSlug: string, random: boolean) {
  const candidates = projects.filter((project) => project.slug !== currentSlug);
  const featured = candidates.find((project) => project.isNew);
  const rest = candidates.filter((project) => project !== featured);
  if (random) {
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
  }
  return [...(featured ? [featured] : []), ...rest].slice(0, COUNT);
}

export function OthersProjects({ projects, currentSlug, className = "" }: OthersProjectsProps) {
  const [cards, setCards] = useState(() => pick(projects, currentSlug, false));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tirage au hasard seulement côté navigateur (page statique)
    setCards(pick(projects, currentSlug, true));
  }, [projects, currentSlug]);

  return (
    <section className={`flex w-full flex-col gap-lg px-md pt-lg text-text-neutral-white tablet:px-lg ${className}`}>
      {/* Section Header */}
      <div className="flex w-full items-center gap-lg">
        <h2 className="type-h4">{commun.autres_projets_titre}</h2>
        <Icon name="ArrowUpRight" size="var(--icon-lg)" className="text-shape-neutral-white" />
      </div>

      {/* Project Cards — mobile : carrousel (Variant2). */}
      <div className="w-full tablet:hidden">
        <OthersCarousel cards={cards} />
      </div>

      {/* Project Cards — tablette et desktop : trois cartes côte à côte (Default). */}
      <div className="hidden w-full gap-lg tablet:flex">
        {cards.map((project) => (
          <ProjetHubContainer
            key={project.slug}
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
                sizes="33vw"
                className="object-cover"
              />
            }
            className="flex-1"
          />
        ))}
      </div>

      <span aria-hidden className="w-full shrink-0 border-t border-shape-neutral-white" />
    </section>
  );
}
