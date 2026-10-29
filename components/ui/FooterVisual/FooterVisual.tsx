"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "../IconButton";
import { edgeCompanions, patternLogos } from "../LogoPattern";
import { TextualButton } from "../TextualButton";
import { PaintHint } from "./PaintHint";
import { PaintReveal, type PaintOverlay } from "./PaintReveal";
import { reducedMotionQuery, touchQuery, useMediaQuery } from "./use-media-query";

/*
 * Visuel de pied de page — composant Figma « footerVisual » (fichier portfolio, node 5036:64225).
 * Fond background/buttons/neutral/black ; chaque logo survolé passe en brand et le reste (PaintReveal).
 * Les logos coupés par le bord gauche ou droit se colorent aussi avec le logo voisin survolé.
 * La variante Figma « device » passe par les breakpoints : la largeur gère l'affichage, l'appareil gère
 * les interactions. Souris / pavé tactile : coloriage au survol, sans consigne. Écran tactile : coloriage
 * en glissant le doigt, consigne animée « Appuie  et  glisse » tant qu'aucun logo n'est coloré (PaintHint).
 *
 * États (logique demandée par l'utilisateur, au-delà des variantes Figma) :
 * - départ (aucun logo coloré) : bouton œil seul, en tertiary white pour attirer moins l'attention ;
 * - en cours (au moins un logo coloré) : œil + bouton reset (iconButton primary black) ;
 * - terminé (dernier logo coloré) : le reset part, l'œil devient le textualButton « Bien joué ! Recommencer » ;
 * - clic sur l'œil : tous les logos en brand, même textualButton avec seulement « Recommencer ».
 * Reset et « Recommencer » remettent tous les logos en noir (retour au départ).
 *
 * Mise en page (Figma) : boutons en colonne alignés à droite (œil en haut, reset en dessous), écart spacing/sm ;
 * marges spacing/lg en haut et en bas, spacing/md sur les côtés en mobile et spacing/lg à partir de la tablette.
 */

type Logo = ReturnType<typeof patternLogos>[number];

// Durée pendant laquelle le coloriage est désactivé après un reset (ms, demandée par l'utilisateur).
const RESET_COOLDOWN = 1000;

export type FooterVisualProps = {
  className?: string;
};

export function FooterVisual({ className = "" }: FooterVisualProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Logos colorés au survol.
  const [painted, setPainted] = useState<ReadonlySet<string>>(() => new Set());
  // Tous les logos affichés via le bouton œil.
  const [revealed, setRevealed] = useState(false);
  const [overlay, setOverlay] = useState<PaintOverlay>({ keys: "all", visible: false, instant: false });
  // Coloriage désactivé juste après un reset (évite de recolorer aussitôt les logos sous le pointeur).
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(cooldownTimer.current), []);
  const touch = useMediaQuery(touchQuery);
  const reducedMotion = useMediaQuery(reducedMotionQuery);

  // Taille de la frame (padding compris) : détermine les logos à placer.
  useEffect(() => {
    const root = frameRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => setSize({ width: root.clientWidth, height: root.clientHeight }));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const logos: Logo[] = useMemo(() => patternLogos(size.width, size.height), [size]);
  // Logos coupés par le bord gauche ou droit : colorés avec leur voisin (zone de survol élargie).
  const companions = useMemo(() => edgeCompanions(logos, size.width), [logos, size.width]);
  const paintedAll = size.width > 0 && logos.every(({ key }) => painted.has(key));
  const done = revealed || paintedAll;
  const started = painted.size > 0;

  const onPaint = useCallback(
    (key: string) =>
      setPainted((prev) => {
        const keys = [key, ...(companions.get(key) ?? [])].filter((k) => !prev.has(k));
        return keys.length ? new Set([...prev, ...keys]) : prev;
      }),
    [companions],
  );
  const reveal = () => {
    setOverlay({ keys: "all", visible: true, instant: false });
    setRevealed(true);
  };
  // Reset : le calque reprend instantanément les logos colorés pendant que le motif repasse en noir
  // sans transition, puis le calque s'efface en fondu.
  const restart = () => {
    setOverlay({ keys: revealed ? "all" : painted, visible: true, instant: true });
    setPainted(new Set());
    setRevealed(false);
    setCooldown(true);
    clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => setCooldown(false), RESET_COOLDOWN);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setOverlay((prev) => ({ ...prev, visible: false, instant: false }))),
    );
  };

  return (
    <div
      ref={frameRef}
      // Hauteur des frames Figma (valeur fixe sans variable) : 170px pour tous les devices.
      // touch-none (écran tactile) : le doigt colore les logos dans toutes les directions (pas de défilement depuis le visuel).
      className={[
        "relative flex h-[170px] w-full flex-col items-end gap-sm overflow-hidden px-md py-lg",
        "bg-background-buttons-neutral-black tablet:px-lg",
        touch && !done ? "touch-none" : "",
        className,
      ].join(" ")}
    >
      <PaintReveal
        frameRef={frameRef}
        logos={logos}
        painted={painted}
        overlay={overlay}
        interactive={!done && !cooldown}
        onPaint={onPaint}
      />

      {touch && !started && !done && <PaintHint animated={!reducedMotion} />}

      {done ? (
        // Largeur ajustée au contenu (le textualButton occupe toute la largeur de son parent).
        <div className="relative">
          <TextualButton variant="primary" color="white" icon="ArrowCounterClockwise" iconPosition="right" onClick={restart}>
            <span className="whitespace-nowrap">{paintedAll && !revealed ? "Bien joué ! Recommencer" : "Recommencer"}</span>
          </TextualButton>
        </div>
      ) : (
        <IconButton
          icon="Eye"
          label="Afficher tous les logos"
          // Tertiary tant qu'aucun logo n'est coloré (attire moins l'attention), primary ensuite (Figma).
          variant={started ? "primary" : "tertiary"}
          color="white"
          className="relative"
          onClick={reveal}
        />
      )}

      {started && !done && (
        <IconButton
          icon="ArrowCounterClockwise"
          label="Remettre les logos en noir"
          variant="primary"
          color="black"
          className="relative"
          onClick={restart}
        />
      )}
    </div>
  );
}
