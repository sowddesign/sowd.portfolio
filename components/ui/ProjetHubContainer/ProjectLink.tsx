"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { commun } from "@/content/texts";
import { useCursorLabel } from "../CursorLabel";

/*
 * Zone de la carte projet qui mène au projet (photo, texte) : texte au curseur « Voir le projet » à la souris
 * (demande de l'utilisateur) ; au toucher, un appui ouvre le projet.
 * focusable=false : zone en double du bouton « Voir le projet », retirée de l'ordre de tabulation.
 * available=false (projet « off » dans ordre.yaml) : zone non cliquable, « Bientôt disponible » au curseur.
 */
export function ProjectLink({
  href,
  focusable = true,
  available = true,
  className = "",
  children,
}: {
  href: string;
  focusable?: boolean;
  available?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const cursor = useCursorLabel(available ? commun.curseur_voir_projet : commun.curseur_bientot);
  if (!available)
    return (
      <div className={`${cursor.className} ${className}`} {...cursor.handlers}>
        {children}
        {cursor.node}
      </div>
    );
  return (
    <Link
      href={href}
      tabIndex={focusable ? undefined : -1}
      className={`${cursor.className} ${className}`}
      {...cursor.handlers}
    >
      {children}
      {cursor.node}
    </Link>
  );
}
