"use client";

import { useRef } from "react";
import { ProgressBar, useReadingProgress } from "@/components/ui/ProgressBar";

/* Démo UI kit : les quatre couleurs suivent la lecture d'un article fictif, sans retour arrière. */
export function ProgressBarDemo() {
  const articleRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(articleRef);
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-col">
        <div className="bg-background-neutral-white py-md">
          <ProgressBar color="black" value={progress} aria-label="Lecture de l'article" />
        </div>
        <div className="flex flex-col gap-md bg-background-neutral-black py-md">
          <ProgressBar color="white" value={progress} aria-label="Lecture de l'article" />
          <ProgressBar color="brand" value={progress} aria-label="Lecture de l'article" />
          <ProgressBar color="whitish" value={progress} aria-label="Lecture de l'article" />
        </div>
      </div>
      <div ref={articleRef} className="flex flex-col gap-md px-(--grid-spacing) py-xxl">
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i} className="type-body-regular">
            Paragraphe {i + 1} de l&apos;article de démonstration. Fais défiler pour remplir les barres ; en remontant,
            elles gardent la progression atteinte.
          </p>
        ))}
      </div>
    </div>
  );
}
