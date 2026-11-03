"use client";

import { useState } from "react";
import { NavSideMenus } from "@/components/ui/NavSideMenus";
import type { NavSideStep } from "@/components/ui/NavSideTiles";
import { TextualButton } from "@/components/ui/TextualButton";

/* Démo UI kit : cadre de hauteur fixe (la tuile vide prend la place restante), redimensionnable en largeur. */
const initialSteps: NavSideStep[] = [
  { number: "01", label: "Comprendre le besoin", progress: 1 },
  { number: "02", label: "Explorer les pistes", progress: 0.4 },
  { number: "03", label: "Définir le problème", progress: 0 },
  { number: "04", label: "Prototyper", progress: 0 },
  { number: "05", label: "Tester auprès des utilisateurs", progress: 0 },
  { number: "06", label: "Itérer", progress: 0 },
  { number: "07", label: "Livrer", progress: 0 },
];

export function NavSideMenusDemo() {
  const [steps, setSteps] = useState(initialSteps);
  const [selected, setSelected] = useState<number | null>(1);

  const read = () =>
    setSteps((all) =>
      all.map((step, i) => (i === selected ? { ...step, progress: Math.min(1, step.progress + 0.2) } : step)),
    );

  return (
    <div className="flex flex-col gap-md">
      <TextualButton onClick={read} color="black">
        Lire 20 % de l&apos;étape sélectionnée
      </TextualButton>
      <div className="flex h-[80vh] w-1/2 resize-x flex-col overflow-auto bg-background-neutral-white">
        <NavSideMenus steps={steps} selected={selected} onSelectedChange={setSelected} className="grow" />
      </div>
    </div>
  );
}
