"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { commun } from "@/content/texts";
import { parseLine, type MdLine } from "@/lib/markdown";
import { useCursorLabel } from "../CursorLabel";
import { Icon } from "../Icon";
import type { IconName } from "../Icon/icon-names";
import { RichLines } from "../RichText";
import { TextualButton } from "../TextualButton";
import { touchQuery, useMediaQuery } from "../use-media-query";

/*
 * Double diamant sur deux tournesols — composant Figma « doubleFlower » (fichier portfolio, node 4178:18013).
 * Variantes Figma : device (desktop, mobile) × state (default, diamonds, probleme, 01, 02, solution, 03, 04,
 * finishedDiamond, finishedDiamondClicked).
 *
 * - Desktop et tablette avec souris : le survol (ou le focus clavier) d'une zone affiche son état, la sortie revient à
 *   default (ou diamonds avec la prop diamonds). Tablette : report de la grille 10 colonnes sur 8 (choix validé).
 *   Zones 01 à 04 : la forme du demi-tournesol seulement (transparence de son image), pas son rectangle ;
 *   problème et solution : leurs titres. Au survol, le curseur devient une flèche (couleur adaptative du texte curseur)
 *   qui pointe vers le texte de l'étape (demandes de l'utilisateur).
 * - Mobile : parcours pas à pas (Continuer / Retour), scène mobile.
 * - Tablette tactile : parcours mobile (texte et boutons sous la scène), avec la scène desktop.
 *
 * Chaque état est un calque superposé ; le changement d'état est un fondu d'opacité (dissolve Figma).
 * Desktop : hauteur fixe ; visuels et zones de survol sont placés en % d'une scène au format de la maquette, réduite
 * pour tenir en entier (bandes noires). Libellés et textes restent sur la grille de l'écran.
 * Mobile : scène 402 × 515 à taille fixe, centrée.
 * Sans fond : à poser sur un fond noir (fond retiré des variantes Figma à la demande).
 */

type Phase = "probleme" | "01" | "02" | "solution" | "03" | "04";
type Step = "default" | "diamonds" | Phase | "finishedDiamond";
type View = "default" | "diamonds" | Phase;

/** Ordre du parcours mobile (Continuer / Retour) ; c'est aussi l'ordre de tabulation des zones desktop. */
const steps: Step[] = ["default", "diamonds", "probleme", "01", "02", "solution", "03", "04", "finishedDiamond"];
const phases: Phase[] = ["probleme", "01", "02", "solution", "03", "04"];

const fail = (message: string): never => {
  throw new Error(`content/commun.md : ${message}`);
};
const stepTexts: Record<"diamonds" | Phase, MdLine> = {
  diamonds: parseLine(commun.double_texte_diamants, fail),
  probleme: parseLine(commun.double_texte_probleme, fail),
  "01": parseLine(commun.double_texte_01, fail),
  "02": parseLine(commun.double_texte_02, fail),
  solution: parseLine(commun.double_texte_solution, fail),
  "03": parseLine(commun.double_texte_03, fail),
  "04": parseLine(commun.double_texte_04, fail),
};

/* ---------- Géométrie relevée dans Figma ---------- */

/** Cadres de référence des maquettes : desktop 1440 × 721,33, scène mobile 402 × 515. */
type Frame = { width: number; height: number };
const desktopFrame: Frame = { width: 1440, height: 721.33 };
const mobileFrame: Frame = { width: 402, height: 515 };

/** Images (public/double-flower) et leurs dimensions d'origine. */
const images = {
  "desktop-default": [4096, 2052],
  "desktop-diamonds": [4096, 2052],
  "desktop-muted": [4096, 2052],
  "half-probleme": [2636, 2883],
  "half-01": [1360, 2884],
  "half-02": [1308, 2884],
  "half-solution": [2776, 2883],
  "half-03": [1180, 2883],
  "half-04": [1180, 2883],
  "mobile-default": [4096, 2844],
  "mobile-diamonds": [4096, 2844],
  "mobile-sunfw": [3516, 3368],
  "mobile-sunfw-probleme": [3516, 3368],
  "mobile-offsunfw": [3516, 3368],
  "mobile-offsunfw-solution": [3516, 3368],
} as const;
type ImageName = keyof typeof images;

/** x, y, largeur, hauteur dans le cadre de référence. */
type Box = [number, number, number, number];

type Visual = {
  image: ImageName;
  box: Box;
  /** Style d'effet Figma (sunflower/complete ou sunflower/half). */
  shadow?: "complete" | "half";
  /** Remplissage Figma « crop » : transformation [[a, 0, c], [0, d, f]] réduite à [a, c, d, f]. */
  crop?: [number, number, number, number];
};

const desktopVisuals: Record<Phase, Visual> = {
  probleme: { image: "half-probleme", box: [124, -0.83, 659, 721], shadow: "complete" },
  "01": { image: "half-01", box: [123, -0.83, 316, 721], shadow: "half" },
  "02": { image: "half-02", box: [451.4, -0.83, 327, 721], shadow: "half" },
  solution: {
    image: "half-solution",
    box: [694, -1, 624, 721],
    shadow: "complete",
    crop: [0.8988236784934998, 0.11462130397558212, 1, -0.0002316119207534939],
  },
  /* 03 et 04 : pleine hauteur comme 01 et 02 (Figma : y 24, hauteur 673, qui rognait le visuel ; écart validé). */
  "03": { image: "half-03", box: [693, -0.83, 295, 721], shadow: "half" },
  "04": { image: "half-04", box: [1010.8, -0.83, 295, 721], shadow: "half" },
};

/** Zones de survol desktop : rectangles 01 à 04 de la maquette (problème et solution : leurs libellés). */
const desktopZones: Record<"01" | "02" | "03" | "04", Box> = {
  "01": [124, 33, 291.2, 635],
  "02": [451.4, 45, 258.6, 623],
  "03": [732, 72, 256, 596],
  "04": [1010.8, 80, 306.8, 588],
};

/** Flèche au curseur : direction du texte de chaque étape (demande de l'utilisateur). */
const cursorArrows: Record<Phase, IconName> = {
  probleme: "ArrowUp",
  "01": "ArrowUpLeft",
  "02": "ArrowDownLeft",
  solution: "ArrowDown",
  "03": "ArrowUpRight",
  "04": "ArrowDownRight",
};

type FlowerPhase = "01" | "02" | "03" | "04";
const flowerPhases: FlowerPhase[] = ["01", "02", "03", "04"];
/** Masque de transparence d'un demi-tournesol, à l'échelle de sa boîte (1 px = 1 px de maquette). */
type Mask = { data: Uint8ClampedArray; width: number; height: number };

/** Masques des demi-tournesols 01 à 04, chargés depuis leurs images (cadrage « cover » comme à l'affichage). */
function useFlowerMasks(enabled: boolean) {
  const masks = useRef<Partial<Record<FlowerPhase, Mask>>>({});
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    for (const phase of flowerPhases) {
      if (masks.current[phase]) continue;
      const { image, box } = desktopVisuals[phase];
      const [, , boxWidth, boxHeight] = box;
      const img = new window.Image();
      img.src = `/_next/image?url=${encodeURIComponent(`/double-flower/${image}.png`)}&w=640&q=75`;
      img.onload = () => {
        if (cancelled) return;
        const width = Math.round(boxWidth);
        const height = Math.round(boxHeight);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        const scale = Math.max(boxWidth / img.naturalWidth, boxHeight / img.naturalHeight);
        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;
        context.drawImage(img, (boxWidth - drawWidth) / 2, (boxHeight - drawHeight) / 2, drawWidth, drawHeight);
        masks.current[phase] = { data: context.getImageData(0, 0, width, height).data, width, height };
      };
    }
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return masks;
}

const desktopBackground = (view: View): ImageName =>
  view === "default" ? "desktop-default" : view === "diamonds" ? "desktop-diamonds" : "desktop-muted";

/** Calques des états mobiles (offSunfw, sunfw puis visuel de la phase), du dessous vers le dessus. */
const mobileVisuals: Record<Phase, Visual[]> = {
  probleme: [
    { image: "mobile-offsunfw", box: [77, 0, 402, 515] },
    { image: "mobile-sunfw-probleme", box: [0, 0, 402, 515], shadow: "complete" },
  ],
  "01": [
    { image: "mobile-offsunfw", box: [77, 0.33, 402, 482] },
    { image: "mobile-sunfw", box: [0, 0, 402, 515], shadow: "complete" },
    { image: "half-01", box: [-1, 72.33, 192, 443], shadow: "half" },
  ],
  "02": [
    { image: "mobile-offsunfw", box: [77, 0.33, 402, 482] },
    { image: "mobile-sunfw", box: [0, 0, 402, 515], shadow: "complete" },
    { image: "half-02", box: [204, 72.33, 192, 443], shadow: "half" },
  ],
  solution: [
    { image: "mobile-sunfw", box: [-77, 0, 402, 515] },
    { image: "mobile-offsunfw-solution", box: [0, 0, 402, 515], shadow: "complete" },
  ],
  "03": [
    { image: "mobile-sunfw", box: [-77, 0, 402, 515] },
    { image: "mobile-offsunfw", box: [0, 0, 402, 515], shadow: "complete" },
    {
      image: "half-03",
      box: [38, 87, 180, 428],
      shadow: "half",
      crop: [1, 0, 0.9732146263122559, 0.028552532196044922],
    },
  ],
  "04": [
    { image: "mobile-sunfw", box: [-77, 0, 402, 515] },
    { image: "mobile-offsunfw", box: [0, 0, 402, 515], shadow: "complete" },
    {
      image: "half-04",
      box: [231, 87.33, 180, 428],
      shadow: "half",
      crop: [1, 0, 0.9732146263122559, 0.029309745877981186],
    },
  ],
};

/** dividerBar vertical de la variante mobile (shape/neutral/white), sous les visuels. */
const mobileDivider: Box = [200, 0, 1, 504.39];

/* ---------- Outils de placement ---------- */

const percent = (value: number) => `${(value * 100).toFixed(4)}%`;

function boxStyle([x, y, width, height]: Box, frame: Frame): CSSProperties {
  return {
    left: percent(x / frame.width),
    top: percent(y / frame.height),
    width: percent(width / frame.width),
    height: percent(height / frame.height),
  };
}

/** Largeur rendue de l'image dans son cadre (« fill » = couvrir, « crop » = transformation), en px de maquette. */
function renderedWidth({ image, box, crop }: Visual) {
  const [, , width, height] = box;
  if (crop) return width / crop[0];
  const [imageWidth, imageHeight] = images[image];
  return Math.max(width, (height * imageWidth) / imageHeight);
}

const fade =
  "transition-opacity duration-(--motion-duration-fast) ease-(--motion-ease-out) motion-reduce:transition-none";

/** Calque d'un état : visible et lisible seulement quand il est actif. */
function Layer({ active, className = "", children }: { active: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      inert={!active}
      data-layer
      className={`absolute inset-0 ${fade} ${active ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

/** Visuel placé dans un cadre de référence, avec son ombre et son recadrage Figma. */
function PlacedVisual({ visual, frame, sizes }: { visual: Visual; frame: Frame; sizes: string }) {
  const { image, box, shadow, crop } = visual;
  const filter =
    shadow === "complete"
      ? "[filter:var(--double-flower-shadow-complete)]"
      : shadow === "half"
        ? "[filter:var(--double-flower-shadow-half)]"
        : "";
  const src = `/double-flower/${image}.png`;

  return (
    <div className={`absolute ${filter}`} style={boxStyle(box, frame)}>
      <div className="absolute inset-0 overflow-clip">
        {crop ? (
          <div
            className="absolute"
            style={{
              width: percent(1 / crop[0]),
              left: percent(-crop[1] / crop[0]),
              height: percent(1 / crop[2]),
              top: percent(-crop[3] / crop[2]),
            }}
          >
            <Image src={src} alt="" fill sizes={sizes} className="object-fill" />
          </div>
        ) : (
          <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
        )}
      </div>
    </div>
  );
}

/**
 * Scène desktop : cadre 1440 × 721,33 contenu dans le composant (centré, réduit pour tenir en entier).
 * Le composant suit ce format jusqu'à 720 de haut : pas de bandes en dessous, bandes sur les côtés au-delà.
 */
function DesktopStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: `min(100%, calc(var(--double-flower-height) * ${desktopFrame.width / desktopFrame.height}))`,
        aspectRatio: `${desktopFrame.width} / ${desktopFrame.height}`,
      }}
    >
      {children}
    </div>
  );
}

/** Taille d'affichage d'un visuel desktop : sa part de la scène, qui fait au plus la largeur de l'écran. */
const desktopSizes = (width: number) => {
  /* 720 : --double-flower-height ; la scène ne dépasse pas cette hauteur × le format de la maquette. */
  const maxStage = (720 * desktopFrame.width) / desktopFrame.height;
  return `min(${((width / desktopFrame.width) * 100).toFixed(2)}vw, ${Math.ceil((width / desktopFrame.width) * maxStage)}px)`;
};

/** Scène mobile : cadre 402 × 515 à taille fixe, centré (rogné sur les côtés sous 402 px, comme l'image de fond). */
function MobileStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute top-0 left-1/2 h-full -translate-x-1/2"
      style={{ width: `${mobileFrame.width / 16}rem` }}
    >
      {children}
    </div>
  );
}

/* ---------- Libellés ---------- */

/** Titre problème / solution : captionSwiss/accentuation + separateur (shape/brand/bright). */
function Title({ text, end = false, className }: { text: string; end?: boolean; className: string }) {
  return (
    <div className={`flex flex-col justify-center ${className}`}>
      <div className={`flex flex-col gap-xxs ${end ? "items-end text-right" : "items-start text-left"}`}>
        <span className="type-swiss-accentuation">{text}</span>
        <span aria-hidden className="h-px w-full rounded-xs bg-shape-brand-bright" />
      </div>
    </div>
  );
}

/**
 * Libellé de phase desktop (« Navigation Label ») : ancré sur la scène des tournesols aux coordonnées du texte dans
 * Figma (haut-gauche, ou bas-droite), pour rester à sa place sur les fleurs à toutes les largeurs
 * (la grille ne suit pas la mise à l'échelle de la scène sous 1300 : décalage relevé par l'utilisateur).
 * S'il chevauche le texte de l'étape (écrans plus étroits), il s'écarte sur le côté juste assez pour lui laisser
 * la place, avec spacing/sm d'écart (demande de l'utilisateur) : voir useLabelsAvoidText.
 */
type LabelAnchor = { left: number; top: number } | { right: number; bottom: number };
const phaseLabels = {
  decouvrir: { left: 303, top: 34 },
  developper: { left: 888, top: 34 },
  definir: { right: 552, bottom: 687 },
  /* État 02 : définir est décalé dans la maquette desktop. */
  definir02: { right: 698, bottom: 687 },
  livrer: { right: 1137, bottom: 687 },
} satisfies Record<string, LabelAnchor>;

function PhaseLabel({ text, at }: { text: string; at: LabelAnchor }) {
  const style: CSSProperties =
    "left" in at
      ? { left: percent(at.left / desktopFrame.width), top: percent(at.top / desktopFrame.height) }
      : {
          right: percent(1 - at.right / desktopFrame.width),
          bottom: percent(1 - at.bottom / desktopFrame.height),
        };
  return (
    <DesktopStage>
      <span data-phase-label className="absolute type-caption-accentuation whitespace-nowrap" style={style}>
        {text}
      </span>
    </DesktopStage>
  );
}

/** Décale chaque libellé de phase qui chevauche le texte de son état : vers la gauche ou la droite selon le côté du texte. */
function useLabelsAvoidText() {
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const update = () => {
      /* spacing/sm en px (le token est en rem). */
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const gap = (parseFloat(getComputedStyle(scene).getPropertyValue("--spacing-sm")) || 0) * rem;
      for (const layer of scene.querySelectorAll<HTMLElement>("[data-layer]")) {
        const text = layer.querySelector<HTMLElement>("[data-phase-text]");
        for (const label of layer.querySelectorAll<HTMLElement>("[data-phase-label]")) {
          label.style.removeProperty("translate");
          if (!text || !text.offsetParent) continue;
          const a = label.getBoundingClientRect();
          const b = text.getBoundingClientRect();
          const overlaps = a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom && a.bottom > b.top;
          if (!overlaps) continue;
          const shift = a.left + a.width / 2 < b.left + b.width / 2 ? b.left - gap - a.right : b.right + gap - a.left;
          label.style.setProperty("translate", `${shift}px 0`);
        }
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scene);
    document.fonts.ready.then(update);
    return () => observer.disconnect();
  }, []);
  return sceneRef;
}

/** Libellé de phase mobile : texte captionText/accentuation remplissant sa cellule. */
function MobileLabel({ text, bottom = false, className }: { text: string; bottom?: boolean; className: string }) {
  return (
    <div className={`flex min-w-0 ${bottom ? "items-end justify-end text-right" : "items-start text-left"} ${className}`}>
      <span className="type-caption-accentuation">{text}</span>
    </div>
  );
}

/* Places sur la grille desktop : classes de base = tablette (8 colonnes), desktop: = maquette (10 colonnes). */
const place = {
  probleme: "row-start-4 col-start-1",
  solution: "row-start-4 col-start-8 desktop:col-start-10",
  /* Textes : 3 lignes en tablette (la scène y est moins haute, choix validé), 2 en desktop comme la maquette. */
  textTopLeft: "row-start-1 col-start-1",
  textBottomLeft: "row-start-5 col-start-1 desktop:row-start-6",
  textTopRight: "row-start-1 col-start-7 desktop:col-start-9",
  textBottomRight: "row-start-5 col-start-7 desktop:col-start-9 desktop:row-start-6",
};

const desktopGrid = "grid grid-cols-8 grid-rows-7 gap-lg py-lg desktop:grid-cols-10";

/** Ombre dropshadow/mid sur tous les textes du schéma (héritée par libellés, textes et copyright ; choix validé). */
const textShadow = "[text-shadow:var(--dropshadow-mid-text)]";

const desktopTextPlace: Record<Phase, string> = {
  probleme: place.textTopLeft,
  "01": place.textTopLeft,
  "02": place.textBottomLeft,
  /* Solution : en bas à droite comme livrer (demande de l'utilisateur). */
  solution: place.textBottomRight,
  "03": place.textTopRight,
  "04": place.textBottomRight,
};

/* ---------- Composant ---------- */

export type DoubleFlowerProps = {
  /** Desktop : affiche l'état diamonds au repos (déclenché par le survol d'un autre élément de la page). */
  diamonds?: boolean;
  className?: string;
};

export function DoubleFlower({ diamonds = false, className = "" }: DoubleFlowerProps) {
  const id = useId();
  const isTouch = useMediaQuery(touchQuery);
  const [hovered, setHovered] = useState<Phase | null>(null);
  const [step, setStep] = useState<Step>("default");
  /** « Afficher les diamants » maintenu (state=finishedDiamondClicked). */
  const [revealed, setRevealed] = useState(false);

  const flowView: View = step === "finishedDiamond" ? (revealed ? "diamonds" : "default") : step;
  const desktopView: View = isTouch ? flowView : (hovered ?? (diamonds ? "diamonds" : "default"));
  /* Mobile : finishedDiamondClicked = visuel diamonds avec le copyright. */
  const mobileView: View = flowView;

  const goTo = (target: Step) => {
    setRevealed(false);
    setStep(target);
  };
  const index = steps.indexOf(step);

  /* Survol des tournesols : point de la scène (px de maquette) sur une partie opaque d'un demi-tournesol. */
  const masks = useFlowerMasks(!isTouch);
  const desktopSceneRef = useLabelsAvoidText();
  const stageRef = useRef<HTMLDivElement>(null);
  const flowerAt = (event: PointerEvent): FlowerPhase | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * desktopFrame.width;
    const y = ((event.clientY - rect.top) / rect.height) * desktopFrame.height;
    for (const phase of flowerPhases) {
      const mask = masks.current[phase];
      const [left, top] = desktopVisuals[phase].box;
      const mx = Math.floor(x - left);
      const my = Math.floor(y - top);
      if (!mask || mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) continue;
      if (mask.data[(my * mask.width + mx) * 4 + 3] > 128) return phase;
    }
    return null;
  };
  const cursor = useCursorLabel(
    hovered && !isTouch ? <Icon name={cursorArrows[hovered]} size="var(--icon-lg)" /> : undefined,
    "center",
  );

  const hoverZone = (phase: Phase) => ({
    onPointerEnter: (event: PointerEvent) => event.pointerType !== "touch" && setHovered(phase),
    onPointerLeave: (event: PointerEvent) => event.pointerType !== "touch" && setHovered(null),
    onFocus: () => setHovered(phase),
    onBlur: () => setHovered(null),
  });
  const textId = (phase: Phase) => `${id}-${phase}`;
  const zoneLabel: Record<Phase, string> = {
    probleme: commun.double_probleme,
    "01": commun.double_decouvrir,
    "02": commun.double_definir,
    solution: commun.double_solution,
    "03": commun.double_developper,
    "04": commun.double_livrer,
  };

  const hold = {
    onPointerDown: () => setRevealed(true),
    onPointerUp: () => setRevealed(false),
    onPointerLeave: () => setRevealed(false),
    onPointerCancel: () => setRevealed(false),
    onKeyDown: (event: { key: string }) => (event.key === " " || event.key === "Enter") && setRevealed(true),
    onKeyUp: () => setRevealed(false),
    onBlur: () => setRevealed(false),
    onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
  };

  const stepText = step === "default" || step === "finishedDiamond" ? null : stepTexts[step];

  return (
    <div className={`flex flex-col text-text-neutral-white ${className}`}>
      {/* ---------- Scène mobile ---------- */}
      <div className="relative h-(--double-flower-mobile-scene-height) overflow-clip tablet:hidden">
        <MobileStage>
          <span aria-hidden className="absolute bg-shape-neutral-white" style={boxStyle(mobileDivider, mobileFrame)} />
        </MobileStage>

        {(["default", "diamonds"] as const).map((background) => (
          <Layer key={background} active={mobileView === background}>
            <Image
              src={`/double-flower/mobile-${background}.png`}
              alt=""
              fill
              sizes={`${Math.ceil((mobileFrame.height * images["mobile-default"][0]) / images["mobile-default"][1])}px`}
              className="object-cover"
            />
          </Layer>
        ))}

        {phases.map((phase) => (
          <Layer key={phase} active={mobileView === phase}>
            <MobileStage>
              {mobileVisuals[phase].map((visual, i) => (
                <PlacedVisual
                  key={i}
                  visual={visual}
                  frame={mobileFrame}
                  sizes={`${Math.ceil(renderedWidth(visual))}px`}
                />
              ))}
            </MobileStage>
          </Layer>
        ))}

        {(["default", "diamonds", ...phases] as const).map((view) => {
          const all = view === "default" || view === "diamonds";
          return (
            <Layer key={view} active={mobileView === view} className={`grid grid-cols-4 grid-rows-12 gap-md px-md ${textShadow}`}>
              {(all || view === "probleme" || view === "01" || view === "02") && (
                <Title text={commun.double_probleme} className="col-span-2 col-start-1 row-start-2" />
              )}
              {(all || view === "solution" || view === "03" || view === "04") && (
                <Title text={commun.double_solution} end className="col-span-2 col-start-3 row-start-2" />
              )}
              {(all || view === "probleme" || view === "01") && (
                <MobileLabel text={commun.double_decouvrir} className="col-start-1 row-start-3" />
              )}
              {all && <MobileLabel text={commun.double_developper} className="col-start-3 row-start-4" />}
              {(view === "solution" || view === "03") && (
                <MobileLabel text={commun.double_developper} className="col-start-1 row-start-3" />
              )}
              {(all || view === "01") && (
                <MobileLabel text={commun.double_definir} bottom className="col-start-2 row-start-10" />
              )}
              {(view === "probleme" || view === "02") && (
                <MobileLabel text={commun.double_definir} bottom className="col-start-4 row-start-11" />
              )}
              {(all || view === "solution" || view === "04") && (
                <MobileLabel text={commun.double_livrer} bottom className="col-start-4 row-start-11" />
              )}
              {/* Copyright : default et finishedDiamond (avec ou sans diamants), pas l'étape diamonds. */}
              {(view === "default" || (view === "diamonds" && step === "finishedDiamond")) && (
                <p className="absolute inset-x-0 bottom-0 px-md py-xxs type-swiss-small-regular">{commun.double_copyright}</p>
              )}
            </Layer>
          );
        })}
      </div>

      {/* ---------- Scène desktop et tablette ---------- */}
      {/* Hauteur proportionnelle à la largeur, plafonnée à 720 ; libellés et textes sur la grille (choix validé). */}
      <div
        ref={desktopSceneRef}
        className="relative hidden max-h-(--double-flower-height) overflow-clip tablet:block"
        style={{ aspectRatio: `${desktopFrame.width} / ${desktopFrame.height}` }}
      >
        <DesktopStage>
          {(["desktop-default", "desktop-diamonds", "desktop-muted"] as const).map((background) => (
            <Layer key={background} active={desktopBackground(desktopView) === background}>
              <Image src={`/double-flower/${background}.png`} alt="" fill sizes={desktopSizes(desktopFrame.width)} />
            </Layer>
          ))}
          {phases.map((phase) => (
            <Layer key={phase} active={desktopView === phase}>
              <PlacedVisual
                visual={desktopVisuals[phase]}
                frame={desktopFrame}
                sizes={desktopSizes(renderedWidth(desktopVisuals[phase]))}
              />
            </Layer>
          ))}
        </DesktopStage>

        {(["default", "diamonds", ...phases] as const).map((view) => {
          const all = view === "default" || view === "diamonds";
          const phase = all ? null : view;
          return (
            <Layer key={view} active={desktopView === view} className={`${desktopGrid} ${textShadow}`}>
              {(all || view === "probleme") && <Title text={commun.double_probleme} className={place.probleme} />}
              {(all || view === "solution") && <Title text={commun.double_solution} end className={place.solution} />}
              {(all || view === "probleme" || view === "01") && (
                <PhaseLabel text={commun.double_decouvrir} at={phaseLabels.decouvrir} />
              )}
              {(all || view === "solution" || view === "03") && (
                <PhaseLabel text={commun.double_developper} at={phaseLabels.developper} />
              )}
              {(all || view === "probleme") && <PhaseLabel text={commun.double_definir} at={phaseLabels.definir} />}
              {view === "02" && <PhaseLabel text={commun.double_definir} at={phaseLabels.definir02} />}
              {(all || view === "solution" || view === "04") && (
                <PhaseLabel text={commun.double_livrer} at={phaseLabels.livrer} />
              )}
              {phase && (
                /* Écran tactile : le texte passe sous la scène, au format mobile. */
                <div
                  className={`col-span-2 row-span-3 flex desktop:row-span-2 min-h-0 flex-col [@media(hover:none)]:hidden ${desktopTextPlace[phase]} ${phase === "02" || phase === "04" || phase === "solution" ? "justify-end" : "justify-start"}`}
                >
                  <p id={textId(phase)} data-phase-text className="type-caption-regular">
                    <RichLines lines={[stepTexts[phase]]} />
                  </p>
                </div>
              )}
              {/* Copyright masqué dans Figma en desktop ; gardé sur écran tactile (la section affiche le sien sinon). */}
              {all && (
                <p className="absolute inset-x-0 bottom-0 hidden h-(--double-flower-credit-height) items-center px-lg py-xxs type-swiss-small-regular [@media(hover:none)]:flex">
                  {commun.double_copyright}
                </p>
              )}
            </Layer>
          );
        })}

        {/* Zones de survol, dans l'ordre du parcours ; absentes sur écran tactile (parcours par boutons). */}
        <div
          className={`absolute inset-0 ${desktopGrid} [@media(hover:none)]:hidden ${cursor.className}`}
          onPointerMove={cursor.handlers.onPointerMove}
          onPointerLeave={cursor.handlers.onPointerLeave}
        >
          {/* Survol des tournesols 01 à 04 : forme des demi-tournesols (les boutons restent pour le clavier). */}
          <div className="pointer-events-none relative col-span-full row-span-full -my-lg">
            <DesktopStage>
              <div
                ref={stageRef}
                className="pointer-events-auto absolute inset-0"
                onPointerMove={(event) => {
                  if (event.pointerType === "touch") return;
                  const phase = flowerAt(event);
                  if (phase !== hovered) setHovered(phase);
                }}
                onPointerLeave={(event) => event.pointerType !== "touch" && setHovered(null)}
              />
            </DesktopStage>
          </div>
          {phases.map((phase) => {
            const common = {
              type: "button" as const,
              "aria-label": zoneLabel[phase],
              "aria-describedby": textId(phase),
              ...hoverZone(phase),
            };
            if (phase === "probleme" || phase === "solution") {
              return <button key={phase} {...common} className={`relative z-1 cursor-default ${place[phase]}`} />;
            }
            return (
              <div key={phase} className="pointer-events-none relative col-span-full row-span-full -my-lg">
                <DesktopStage>
                  <button
                    {...common}
                    className="absolute cursor-default"
                    style={boxStyle(desktopZones[phase], desktopFrame)}
                  />
                </DesktopStage>
              </div>
            );
          })}
        </div>
        {cursor.node}
      </div>

      {/* ---------- Texte et boutons : mobile, et tablette tactile ---------- */}
      <div className="tablet:hidden tablet:[@media(hover:none)]:block">
        <span aria-hidden className="block h-px w-full bg-shape-neutral-white" />
        <div className="flex flex-col gap-md p-md">
          <p aria-live="polite" className="type-body-regular empty:hidden">
            {stepText && <RichLines lines={[stepText]} size="body" />}
          </p>
          <div className="flex flex-col gap-xs">
            {step === "default" && (
              <TextualButton icon="ArrowElbowDownLeft" iconPosition="right" onClick={() => goTo("diamonds")}>
                {commun.double_decouvrir_methode}
              </TextualButton>
            )}
            {step !== "default" && step !== "finishedDiamond" && (
              <>
                <TextualButton icon="ArrowRight" iconPosition="right" onClick={() => goTo(steps[index + 1])}>
                  {commun.double_continuer}
                </TextualButton>
                <TextualButton variant="tertiary" color="white" onClick={() => goTo(steps[index - 1])}>
                  {commun.double_retour}
                </TextualButton>
              </>
            )}
            {step === "finishedDiamond" && (
              <>
                <TextualButton
                  color="white"
                  icon="Eye"
                  iconPosition="right"
                  aria-pressed={revealed}
                  className="select-none [-webkit-touch-callout:none]"
                  {...hold}
                >
                  {commun.double_afficher_diamants}
                </TextualButton>
                <TextualButton
                  variant="secondary"
                  icon="ArrowElbowDownLeft"
                  iconPosition="right"
                  onClick={() => goTo("diamonds")}
                >
                  {commun.double_revoir_methode}
                </TextualButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
