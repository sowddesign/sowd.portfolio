"use client";

import { useState } from "react";
import { AlertMessage, type AlertMessageType } from "@/components/ui/AlertMessage";

/* Démo UI kit : les trois types ; « Rejouer » relance une alerte fermée (décompte compris). */
const demos: { type: AlertMessageType; text: string; timed: boolean }[] = [
  { type: "progress", text: "Action en cours (sans décompte)", timed: false },
  { type: "progress", text: "Message neutre (avec décompte)", timed: true },
  { type: "validate", text: "Action réussie (avec décompte)", timed: true },
  { type: "error", text: "Échec (fermeture à la croix)", timed: false },
];

export function AlertMessageDemo() {
  const [runs, setRuns] = useState(() => demos.map(() => 0));
  const [open, setOpen] = useState(() => demos.map(() => true));
  const set = (index: number, value: boolean) => setOpen((current) => current.map((old, i) => (i === index ? value : old)));

  return (
    <div className="flex flex-col gap-lg px-(--grid-spacing)">
      {demos.map((demo, index) =>
        open[index] ? (
          <AlertMessage key={`alert-${index}-${runs[index]}`} {...demo} onClose={() => set(index, false)} />
        ) : (
          <button
            key={`replay-${index}`}
            type="button"
            className="type-body-regular h-(--button-size-sm) cursor-pointer text-left underline"
            onClick={() => {
              setRuns((current) => current.map((old, i) => (i === index ? old + 1 : old)));
              set(index, true);
            }}
          >
            Rejouer : {demo.text}
          </button>
        ),
      )}
    </div>
  );
}
