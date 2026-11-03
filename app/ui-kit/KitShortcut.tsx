"use client";

import { usePathname } from "next/navigation";
import { IconButton } from "@/components/ui/IconButton";
import { openSummaryEvent } from "./KitSummary";

/*
 * Raccourci vers l'UI kit, en développement seulement (chargé par app/layout.tsx sous NODE_ENV=development,
 * absent du build final). Flottant en bas à gauche, au-dessus de l'indicateur Next.js (« N »).
 * Hors UI kit : flèche gauche, ouvre /ui-kit. Dans l'UI kit : livre ouvert, ouvre le sommaire.
 * Textes au curseur (validés par l'utilisateur) : « UI kit » et « Sommaire ».
 */
export function KitShortcut() {
  const inKit = usePathname() === "/ui-kit";
  return (
    <div className="fixed bottom-[calc(var(--spacing-xxl)+var(--spacing-lg))] left-md z-50">
      {inKit ? (
        <IconButton
          icon="BookOpen"
          label="Ouvrir le sommaire de l'UI kit"
          cursorLabel="Sommaire"
          variant="primary"
          color="brand"
          onClick={(event) =>
            window.dispatchEvent(new CustomEvent(openSummaryEvent, { detail: event.currentTarget }))
          }
        />
      ) : (
        <IconButton
          icon="ArrowLeft"
          label="Ouvrir l'UI kit"
          cursorLabel="UI kit"
          variant="primary"
          color="brand"
          href="/ui-kit"
        />
      )}
    </div>
  );
}
