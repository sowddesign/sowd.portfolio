"use client";

import { useState } from "react";
import { NavSideMenus, type BonusText } from "@/components/ui/NavSideMenus";
import type { NavSideStep } from "@/components/ui/NavSideTiles";
import { TextualButton } from "@/components/ui/TextualButton";

/* Démo UI kit : cadre de hauteur fixe (la tuile vide prend la place restante), redimensionnable en largeur.
   Toutes les pages lues : la tuile Bonus remplace le compteur ; propositions d'animation du texte à comparer (remplissage : liquide qui monte). */
const initialSteps: NavSideStep[] = [
  { number: "01", label: "Comprendre le besoin", progress: 1 },
  { number: "02", label: "Explorer les pistes", progress: 1 },
  { number: "03", label: "Définir le problème", progress: 1 },
  { number: "04", label: "Prototyper", progress: 1 },
  { number: "05", label: "Tester auprès des utilisateurs", progress: 0.6 },
];

const texts: { value: BonusText; label: string }[] = [
  { value: "fondu", label: "Fondu enchaîné" },
  { value: "montee", label: "Montée décalée" },
  { value: "revele", label: "Révélé par le remplissage" },
];

export function NavSideMenusDemo() {
  const [steps, setSteps] = useState(initialSteps);
  const [selected, setSelected] = useState<number | null>(4);
  const [bonusSelected, setBonusSelected] = useState(false);
  const [text, setText] = useState<BonusText>("revele");
  const [run, setRun] = useState(0);

  const read = () =>
    setSteps((all) =>
      all.map((step, i) => (i === selected ? { ...step, progress: Math.min(1, step.progress + 0.2) } : step)),
    );
  const replay = () => {
    setSteps(initialSteps);
    setSelected(4);
    setBonusSelected(false);
    setRun((count) => count + 1);
  };
  const select = "type-caption-regular border border-border-neutral-black bg-background-neutral-white px-xs py-xxs";

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-end gap-md">
        <label className="flex flex-col gap-xxs">
          <span className="type-caption-regular">Texte</span>
          <select className={select} value={text} onChange={(event) => setText(event.target.value as BonusText)}>
            {texts.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="w-auto">
          <TextualButton onClick={replay} color="black" variant="secondary">
            Rejouer (05 à 60 %)
          </TextualButton>
        </div>
      </div>
      <TextualButton onClick={read} color="black">
        Lire 20 % de l&apos;étape sélectionnée
      </TextualButton>
      <div className="flex h-[80vh] w-1/2 resize-x flex-col overflow-auto bg-background-neutral-white">
        <NavSideMenus
          key={run}
          steps={steps}
          selected={selected}
          onSelectedChange={(index) => {
            setBonusSelected(false);
            setSelected(index);
          }}
          bonus
          bonusSelected={bonusSelected}
          onBonusToggle={() => {
            setSelected(null);
            setBonusSelected((open) => !open);
          }}
          bonusText={text}
          className="grow"
        />
      </div>
    </div>
  );
}
