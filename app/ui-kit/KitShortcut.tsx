"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { isSlowLoading, replayIntro, toggleSlowLoading } from "@/components/ui/SiteIntro";
import { openSummaryEvent } from "./KitSummary";

/*
 * Raccourcis de développement (chargés par app/layout.tsx sous NODE_ENV=development, absents du build final).
 * Flottants en bas à gauche, au-dessus de l'indicateur Next.js (« N ») :
 * - hors UI kit : chargement lent simulé (sablier, rechargement de la page ; sablier qui coule quand il est actif),
 *   rejouer l'intro du site, puis flèche gauche vers /ui-kit ;
 * - dans l'UI kit : livre ouvert, ouvre le sommaire.
 * Masqués, « N » compris, tant que le pointeur ne s'approche pas à moins de REVEAL_EDGE px du bord gauche de
 * l'écran ou ne survole pas l'un d'eux (demande de l'utilisateur) ; au toucher, un appui près du bord les affiche.
 * Textes au curseur (validés par l'utilisateur) : « UI kit », « Sommaire », « Intro »,
 * « Chargement lent » / « Chargement normal ».
 */
const REVEAL_EDGE = 44;
const noSubscription = () => () => {};

/* Indicateur Next.js : rendu dans le shadow DOM de <nextjs-portal> (hôte en display: contents, sans effet d'opacité),
   masqué par une feuille de style posée dans ce shadow DOM. */
const portalStyle = `:host > * { transition: opacity var(--motion-duration-base) var(--motion-ease-out); }
:host([data-dev-hidden]) > * { opacity: 0 !important; pointer-events: none !important; }`;
function hidePortal(hidden: boolean) {
  const portal = document.querySelector("nextjs-portal");
  const root = portal?.shadowRoot;
  if (!portal || !root) return;
  if (!root.querySelector("style[data-dev-tools]")) {
    const style = document.createElement("style");
    style.setAttribute("data-dev-tools", "");
    style.textContent = portalStyle;
    root.appendChild(style);
  }
  portal.toggleAttribute("data-dev-hidden", hidden);
}

export function KitShortcut() {
  const inKit = usePathname() === "/ui-kit";
  const [shown, setShown] = useState(false);
  /* Lu dans sessionStorage (le bouton recharge la page : pas d'abonnement nécessaire). */
  const slow = useSyncExternalStore(noSubscription, isSlowLoading, () => false);

  useEffect(() => {
    const update = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      setShown(event.clientX <= REVEAL_EDGE || !!target?.closest("[data-dev-tools], nextjs-portal"));
    };
    window.addEventListener("pointermove", update, { passive: true });
    window.addEventListener("pointerdown", update, { passive: true });
    return () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerdown", update);
    };
  }, []);

  // L'indicateur peut apparaître après le montage : réappliqué à chaque changement et une fois installé.
  useEffect(() => {
    hidePortal(!shown);
    const timer = window.setTimeout(() => hidePortal(!shown), 1000);
    return () => window.clearTimeout(timer);
  }, [shown]);

  return (
    <div
      data-dev-tools
      className={`fixed bottom-[calc(var(--spacing-xxl)+var(--spacing-lg))] left-md z-50 flex flex-col gap-sm transition-opacity duration-(--motion-duration-base) ease-(--motion-ease-out) ${
        shown ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
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
        <>
          <IconButton
            icon={slow ? "HourglassMedium" : "Hourglass"}
            label={slow ? "Couper le chargement lent simulé" : "Simuler un chargement lent"}
            cursorLabel={slow ? "Chargement normal" : "Chargement lent"}
            variant="primary"
            color="brand"
            aria-pressed={slow}
            onClick={toggleSlowLoading}
          />
          <IconButton
            icon="Flower"
            label="Rejouer l'intro du site"
            cursorLabel="Intro"
            variant="primary"
            color="brand"
            onClick={replayIntro}
          />
          <IconButton
            icon="ArrowLeft"
            label="Ouvrir l'UI kit"
            cursorLabel="UI kit"
            variant="primary"
            color="brand"
            href="/ui-kit"
          />
        </>
      )}
    </div>
  );
}
