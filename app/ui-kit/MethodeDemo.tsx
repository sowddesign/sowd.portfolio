"use client";

import { useState } from "react";
import { MethodeIntro, MethodePage } from "@/components/ui/Methode";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { MethodeIntroContent, MethodePageContent } from "@/lib/methode";

/*
 * Démo UI kit : desktop dans un conteneur de 830 de haut, sur la moitié de la largeur de la page (marges 24) ;
 * mobile sur 402 de large (maquette). La barre au-dessus suit la progression de lecture.
 */
export function MethodeDemo({ intro, page }: { intro: MethodeIntroContent; page: MethodePageContent }) {
  const [desktop, setDesktop] = useState(0);
  const [mobile, setMobile] = useState(0);

  return (
    <div className="flex flex-col gap-xxl">
      <div className="flex gap-lg px-lg">
        <div className="h-[830px] min-w-0 flex-1">
          <MethodeIntro content={intro} />
        </div>
        <div className="flex h-[830px] min-w-0 flex-1 flex-col gap-md">
          <ProgressBar color="brand" value={desktop} aria-label="Lecture de la page" />
          <div className="min-h-0 flex-1">
            <MethodePage content={page} onProgressChange={setDesktop} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-md px-lg">
        <div className="sticky top-0 z-10 w-full max-w-[402px] bg-background-neutral-white py-sm">
          <ProgressBar color="brand" value={mobile} aria-label="Lecture de la page" />
        </div>
        <div className="w-full max-w-[402px]">
          <MethodePage content={page} device="mobile" onProgressChange={setMobile} />
        </div>
      </div>
    </div>
  );
}
