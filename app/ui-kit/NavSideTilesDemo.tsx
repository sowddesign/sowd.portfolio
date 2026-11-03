"use client";

import { useState } from "react";
import { NavSideTileEmpty, NavSideTiles, type NavSideStep } from "@/components/ui/NavSideTiles";
import { TextualButton } from "@/components/ui/TextualButton";

/* Démo UI kit : élargir ou rétrécir le cadre (poignée en bas à droite) pour voir le passage en affichage réduit. */
const initialSteps: NavSideStep[] = [
  { number: "01", label: "Comprendre le besoin", progress: 1 },
  { number: "02", label: "Explorer les pistes", progress: 0.4 },
  { number: "03", label: "Prototyper et tester auprès des utilisateurs", progress: 0 },
  { number: "04", label: "Livrer", progress: 0 },
];

export function NavSideTilesDemo() {
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
      <div className="w-1/2 resize-x overflow-auto bg-background-neutral-white">
        <NavSideTiles steps={steps} selected={selected} onSelectedChange={setSelected} />
        <NavSideTileEmpty />
      </div>
    </div>
  );
}
