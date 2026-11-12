"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { commun } from "@/content/texts";
import { parseLine, type MdLine } from "@/lib/markdown";
import { useCursorLabel } from "../CursorLabel";
import { Icon } from "../Icon";
import type { IconName } from "../Icon/icon-names";
import { colorTransition } from "../button-tones";
import { IconButton } from "../IconButton";
import { RichLines } from "../RichText";
import { TextualButton } from "../TextualButton";
import { tokenDuration } from "../token-duration";
import { reducedMotionQuery, touchQuery, useMediaQuery } from "../use-media-query";

/*
 * Double diamant sur deux tournesols — composant Figma « doubleFlower » (fichier portfolio, node 4178:18013).
 * Variantes Figma : device (desktop, mobile) × state (default, diamonds, probleme, 01, 02, solution, 03, 04,
 * finishedDiamond, finishedDiamondClicked) ; finishedDiamond et finishedDiamondClicked ne sont plus utilisés (parcours au toucher).
 *
 * - Desktop et tablette avec souris : le survol (ou le focus clavier) d'une zone affiche son état, la sortie revient à
 *   default (ou diamonds avec la prop diamonds). Tablette : report de la grille 10 colonnes sur 8 (choix validé).
 *   Zones 01 à 04 : la forme du demi-tournesol seulement (transparence de son image), pas son rectangle ;
 *   problème et solution : leurs titres. Au survol, le curseur devient une flèche (couleur adaptative du texte curseur)
 *   qui pointe vers le texte de l'étape (demandes de l'utilisateur).
 * - Mobile et tablette tactile (demandes de l'utilisateur, sans maquette Figma) : état initial default (copyright,
 *   bouton Découvrir vers diamonds). Toucher une zone affiche son état et son texte (sous la scène) ; la toucher à
 *   nouveau revient à diamonds. Zones mobiles : libellés (problème, solution, découvrir, définir, développer, livrer)
 *   et demi-tournesols 01 à 04 (états de phase) ; à default et diamonds, tournesol entier (gauche : problème, droite :
 *   solution). Tablette tactile : titres et demi-tournesols de la scène desktop.
 *   À diamonds : consigne animée « appuie sur un tournesol » (appui rapide) à la place du copyright, relancée à
 *   chaque retour. Hors default : indicateur d'étapes (6 repères en deux groupes, précédent / suivant ; précédent
 *   ramène de diamonds à default, suivant ramène de 04 à default et le bouton devient Re-découvrir) et croix au-dessus de solution (retour à default).
 *
 * Chaque état est un calque superposé ; le changement d'état est un fondu d'opacité (dissolve Figma).
 * Desktop : hauteur fixe ; visuels et zones de survol sont placés en % d'une scène au format de la maquette, réduite
 * pour tenir en entier (bandes noires). Libellés et textes restent sur la grille de l'écran.
 * Mobile : scène 402 × 515 à taille fixe, centrée.
 * Sans fond : à poser sur un fond noir (fond retiré des variantes Figma à la demande).
 */

type Phase = "probleme" | "01" | "02" | "solution" | "03" | "04";
type View = "default" | "diamonds" | Phase;

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
  probleme: {
    image: "half-probleme",
    box: [124, -0.83, 659, 721],
    shadow: "complete",
  },
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

type Masks = Partial<Record<FlowerPhase, Mask>>;

/** Masques des demi-tournesols 01 à 04, chargés depuis leurs images (cadrage « cover » ou « crop » comme à l'affichage). */
function useFlowerMasks(visuals: Record<FlowerPhase, Visual>) {
  const masks = useRef<Masks>({});
  useEffect(() => {
    let cancelled = false;
    for (const phase of flowerPhases) {
      if (masks.current[phase]) continue;
      const { image, box, crop } = visuals[phase];
      const [, , boxWidth, boxHeight] = box;
      const img = new window.Image();
      img.src = `/_next/image?url=${encodeURIComponent(`/double-flower/${image}.webp`)}&w=640&q=75`;
      img.onload = () => {
        if (cancelled) return;
        const width = Math.round(boxWidth);
        const height = Math.round(boxHeight);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        if (crop) {
          const [a, c, d, f] = crop;
          context.drawImage(img, (-c / a) * boxWidth, (-f / d) * boxHeight, boxWidth / a, boxHeight / d);
        } else {
          const scale = Math.max(boxWidth / img.naturalWidth, boxHeight / img.naturalHeight);
          const drawWidth = img.naturalWidth * scale;
          const drawHeight = img.naturalHeight * scale;
          context.drawImage(img, (boxWidth - drawWidth) / 2, (boxHeight - drawHeight) / 2, drawWidth, drawHeight);
        }
        masks.current[phase] = {
          data: context.getImageData(0, 0, width, height).data,
          width,
          height,
        };
      };
    }
    return () => {
      cancelled = true;
    };
  }, [visuals]);
  return masks;
}

/**
 * Demi-tournesol au point (x, y) d'une scène (px de maquette) : sa forme, élargie dans les vides d'un même tournesol
 * seulement (un point transparent encadré à gauche et à droite par des moitiés du même tournesol prend la plus proche).
 */
function flowerAt(
  masks: Masks,
  visuals: Record<FlowerPhase, Visual>,
  candidates: FlowerPhase[],
  frameWidth: number,
  x: number,
  y: number,
): FlowerPhase | null {
  const opaqueAt = (px: number, py: number): FlowerPhase | null => {
    for (const phase of candidates) {
      const mask = masks[phase];
      const [left, top] = visuals[phase].box;
      const mx = Math.floor(px - left);
      const my = Math.floor(py - top);
      if (!mask || mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) continue;
      if (mask.data[(my * mask.width + mx) * 4 + 3] > 128) return phase;
    }
    return null;
  };
  const nearestOnRow = (direction: -1 | 1) => {
    for (let d = 1; x + d * direction >= 0 && x + d * direction < frameWidth; d++) {
      const phase = opaqueAt(x + d * direction, y);
      if (phase) return { phase, d };
    }
    return null;
  };
  const hit = opaqueAt(x, y);
  if (hit) return hit;
  const left = nearestOnRow(-1);
  const right = nearestOnRow(1);
  if (!left || !right) return null;
  const sunflower = (phase: FlowerPhase) => (phase === "01" || phase === "02" ? 1 : 2);
  if (sunflower(left.phase) !== sunflower(right.phase)) return null;
  return left.d <= right.d ? left.phase : right.phase;
}

/** Point d'un événement dans une scène, en px de maquette. */
function framePoint(event: { clientX: number; clientY: number }, element: HTMLElement, frame: Frame) {
  const rect = element.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * frame.width,
    y: ((event.clientY - rect.top) / rect.height) * frame.height,
  };
}

const desktopBackground = (view: View): ImageName =>
  view === "default" ? "desktop-default" : view === "diamonds" ? "desktop-diamonds" : "desktop-muted";

/** Calques des états mobiles (offSunfw, sunfw puis visuel de la phase), du dessous vers le dessus. */
const mobileVisuals: Record<Phase, Visual[]> = {
  probleme: [
    { image: "mobile-offsunfw", box: [77, 0, 402, 515] },
    {
      image: "mobile-sunfw-probleme",
      box: [0, 0, 402, 515],
      shadow: "complete",
    },
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
    {
      image: "mobile-offsunfw-solution",
      box: [0, 0, 402, 515],
      shadow: "complete",
    },
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

/** Demi-tournesols touchables en mobile : mêmes places dans tous les états d'un même tournesol (sous la fleur entière). */
const mobileFlowerVisuals: Record<FlowerPhase, Visual> = {
  "01": mobileVisuals["01"][2],
  "02": mobileVisuals["02"][2],
  "03": mobileVisuals["03"][2],
  "04": mobileVisuals["04"][2],
};
/** Demi-tournesols touchables selon l'état mobile affiché. */
const mobileFlowerCandidates = (view: View): FlowerPhase[] =>
  view === "probleme" || view === "01" || view === "02"
    ? ["01", "02"]
    : view === "solution" || view === "03" || view === "04"
      ? ["03", "04"]
      : [];

/** dividerBar vertical de la variante mobile (shape/neutral/white), sous les visuels. */
const mobileDivider: Box = [200, 0, 1, 504.39];

/** Séparateur mobile, repris dans chaque calque de visuel (calques opaques, voir Layer). */
function MobileDivider() {
  return (
    <MobileStage>
      <span aria-hidden className="absolute bg-shape-neutral-white" style={boxStyle(mobileDivider, mobileFrame)} />
    </MobileStage>
  );
}

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
function Layer({
  active,
  hold = false,
  className = "",
  children,
}: {
  active: boolean;
  /**
   * Visuels mobiles : calque opaque (fond noir, séparateur et visuels). Le nouveau apparaît au-dessus du sortant, qui
   * reste opaque puis s'efface (retard --motion-duration-fast) : rien de ce qui est derrière ne se voit pendant le fondu.
   */
  hold?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden={!active}
      inert={!active}
      data-layer
      className={`absolute inset-0 ${fade} ${active ? "opacity-100" : `opacity-0 ${hold ? "delay-(--motion-duration-fast)" : ""}`} ${hold ? `bg-background-neutral-black ${active ? "z-1" : ""}` : ""} ${className}`}
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
  const src = `/double-flower/${image}.webp`;

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
    <div className="absolute top-0 left-1/2 h-full -translate-x-1/2" style={{ width: `${mobileFrame.width / 16}rem` }}>
      {children}
    </div>
  );
}

/* ---------- Libellés ---------- */

/** Titre problème / solution : captionSwiss/accentuation + separateur (shape/brand/bright). */
function Title({
  text,
  end = false,
  className,
  onPress,
}: {
  text: string;
  end?: boolean;
  className: string;
  /** Mobile : le titre est une zone touchable. */
  onPress?: () => void;
}) {
  const inner = (
    <div className={`flex flex-col gap-xxs ${end ? "items-end text-right" : "items-start text-left"}`}>
      <span className="type-swiss-accentuation">{text}</span>
      <span aria-hidden className="w-full rounded-xs border-t border-shape-brand-bright" />
    </div>
  );
  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className={`pointer-events-auto flex cursor-pointer flex-col justify-center ${className}`}
      >
        {inner}
      </button>
    );
  }
  return <div className={`flex flex-col justify-center ${className}`}>{inner}</div>;
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
      ? {
          left: percent(at.left / desktopFrame.width),
          top: percent(at.top / desktopFrame.height),
        }
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
function MobileLabel({
  text,
  bottom = false,
  className,
  onPress,
}: {
  text: string;
  bottom?: boolean;
  className: string;
  /** Le libellé est une zone touchable. */
  onPress: () => void;
}) {
  return (
    <div
      className={`flex min-w-0 ${bottom ? "items-end justify-end text-right" : "items-start text-left"} ${className}`}
    >
      <button type="button" onClick={onPress} className="pointer-events-auto cursor-pointer type-caption-accentuation">
        {text}
      </button>
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

/**
 * Consigne animée « appui rapide » (proposition sans Figma) : échelle 1 → 0,91 en --motion-duration-fast, retour à 1
 * en --motion-duration-base (ease out), puis pause --motion-hint-pause ; en boucle. Relancée à chaque affichage
 * (ref de rappel). Mouvement réduit : texte immobile.
 */
function useTapHint() {
  const reduced = useMediaQuery(reducedMotionQuery);
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el || reduced) return;
      const press = tokenDuration(el, "--motion-duration-fast");
      const release = tokenDuration(el, "--motion-duration-base");
      const total = press + release + tokenDuration(el, "--motion-hint-pause");
      const easing = getComputedStyle(el).getPropertyValue("--motion-ease-out").trim() || "ease-out";
      const animation = el.animate(
        [
          { offset: 0, transform: "scale(1)", easing },
          { offset: press / total, transform: "scale(0.91)", easing },
          { offset: (press + release) / total, transform: "scale(1)" },
          { offset: 1, transform: "scale(1)" },
        ],
        { duration: total, iterations: Infinity },
      );
      return () => animation.cancel();
    },
    [reduced],
  );
}

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
  /** État du parcours au toucher (mobile et tablette tactile). */
  const [step, setStep] = useState<View>("default");
  /** Parcours bouclé une fois (suivant depuis 04) : le bouton de l'état initial devient Re-découvrir. */
  const [looped, setLooped] = useState(false);
  const hintRef = useTapHint();

  const desktopView: View = isTouch ? step : (hovered ?? (diamonds ? "diamonds" : "default"));
  const mobileView: View = step;

  /* Survol des tournesols : point de la scène (px de maquette) sur une partie opaque d'un demi-tournesol. */
  const masks = useFlowerMasks(desktopVisuals);
  const mobileMasks = useFlowerMasks(mobileFlowerVisuals);
  const desktopSceneRef = useLabelsAvoidText();
  const stageRef = useRef<HTMLDivElement>(null);
  const mobileStageRef = useRef<HTMLDivElement>(null);
  /*
   * Zone de survol = forme du demi-tournesol, élargie dans les vides d'un même tournesol seulement (demande de
   * l'utilisateur, pour éviter le retour à default entre deux zones). Entre les deux tournesols et sur les bords
   * extérieurs, la zone reste à la forme.
   */
  const desktopFlowerAt = (event: { clientX: number; clientY: number }): FlowerPhase | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const { x, y } = framePoint(event, stage, desktopFrame);
    return flowerAt(masks.current, desktopVisuals, flowerPhases, desktopFrame.width, x, y);
  };
  /** Toucher : affiche l'état de la zone, ou revient à diamonds si elle est déjà affichée. */
  const navigate = setStep;
  const toggle = (phase: Phase) => navigate(step === phase ? "diamonds" : phase);
  const phaseIndex = phases.indexOf(step as Phase);
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

  const stepText = step === "default" ? null : stepTexts[step];

  return (
    <div className={`flex flex-col text-text-neutral-white ${className}`}>
      {/* ---------- Scène mobile ---------- */}
      <div className="relative h-(--double-flower-mobile-scene-height) overflow-clip tablet:hidden">
        {/* Visuels : contexte d'empilement isolé (le calque actif passe au-dessus sans couvrir textes et zones). */}
        <div className="absolute inset-0 isolate">
          {(["default", "diamonds"] as const).map((background) => (
            <Layer key={background} active={mobileView === background} hold>
              <MobileDivider />
              <Image
                src={`/double-flower/mobile-${background}.webp`}
                alt=""
                fill
                sizes={`${Math.ceil((mobileFrame.height * images["mobile-default"][0]) / images["mobile-default"][1])}px`}
                className="object-cover"
              />
            </Layer>
          ))}

          {phases.map((phase) => (
            <Layer key={phase} active={mobileView === phase} hold>
              <MobileDivider />
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
        </div>

        {/* Toucher des demi-tournesols (états de phase) : forme des demi-tournesols du tournesol affiché. */}
        <MobileStage>
          <div
            ref={mobileStageRef}
            aria-hidden
            className="absolute inset-0"
            onClick={(event) => {
              const stage = mobileStageRef.current;
              if (!stage) return;
              const { x, y } = framePoint(event, stage, mobileFrame);
              /* default et diamonds : tournesol entier, de part et d'autre du séparateur (demande de l'utilisateur). */
              if (mobileView === "default" || mobileView === "diamonds") {
                toggle(x < mobileDivider[0] ? "probleme" : "solution");
                return;
              }
              const candidates = mobileFlowerCandidates(mobileView);
              const phase = flowerAt(mobileMasks.current, mobileFlowerVisuals, candidates, mobileFrame.width, x, y);
              if (phase) toggle(phase);
            }}
          />
        </MobileStage>

        {(["default", "diamonds", ...phases] as const).map((view) => {
          const all = view === "default" || view === "diamonds";
          return (
            <Layer
              key={view}
              active={mobileView === view}
              className={`pointer-events-none grid grid-cols-4 grid-rows-12 gap-md px-md ${textShadow}`}
            >
              {(all || view === "probleme" || view === "01" || view === "02") && (
                <Title
                  text={commun.double_probleme}
                  className="col-span-2 col-start-1 row-start-2"
                  onPress={() => toggle("probleme")}
                />
              )}
              {(all || view === "solution" || view === "03" || view === "04") && (
                <Title
                  text={commun.double_solution}
                  end
                  className="col-span-2 col-start-3 row-start-2"
                  onPress={() => toggle("solution")}
                />
              )}
              {/* Essai : croix au-dessus de solution, retour à l'état initial (hors état initial). */}
              {view !== "default" && (
                <div className="col-start-4 row-start-1 flex items-start justify-end">
                  <IconButton
                    icon="X"
                    label={commun.double_revenir_debut}
                    cursorLabel={null}
                    variant="tertiary"
                    color="white"
                    onClick={() => navigate("default")}
                    className="pointer-events-auto"
                  />
                </div>
              )}
              {(all || view === "probleme" || view === "01") && (
                <MobileLabel
                  text={commun.double_decouvrir}
                  className="col-start-1 row-start-3"
                  onPress={() => toggle("01")}
                />
              )}
              {all && (
                <MobileLabel
                  text={commun.double_developper}
                  className="col-start-3 row-start-4"
                  onPress={() => toggle("03")}
                />
              )}
              {(view === "solution" || view === "03") && (
                <MobileLabel
                  text={commun.double_developper}
                  className="col-start-1 row-start-3"
                  onPress={() => toggle("03")}
                />
              )}
              {all && (
                <MobileLabel
                  text={commun.double_definir}
                  bottom
                  className="col-start-2 row-start-10"
                  onPress={() => toggle("02")}
                />
              )}
              {(view === "probleme" || view === "02") && (
                <MobileLabel
                  text={commun.double_definir}
                  bottom
                  className="col-start-4 row-start-11"
                  onPress={() => toggle("02")}
                />
              )}
              {(all || view === "solution" || view === "04") && (
                <MobileLabel
                  text={commun.double_livrer}
                  bottom
                  className="col-start-4 row-start-11"
                  onPress={() => toggle("04")}
                />
              )}
              {/* Copyright : état initial (default). */}
              {view === "default" && (
                <p className="absolute inset-x-0 bottom-0 px-md py-xxs type-swiss-small-regular">
                  {commun.double_copyright}
                </p>
              )}
              {/* Consigne animée (appui rapide, style de HoldHint) à la place du copyright, relancée à chaque retour à diamonds. */}
              {view === "diamonds" && mobileView === "diamonds" && (
                <div className="absolute inset-x-0 bottom-0 px-md py-xxs">
                  <p
                    ref={hintRef}
                    className="w-fit type-swiss-small-accentuation text-faded-white-40 will-change-transform"
                  >
                    {commun.double_consigne}
                  </p>
                </div>
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
        style={{
          aspectRatio: `${desktopFrame.width} / ${desktopFrame.height}`,
        }}
      >
        <DesktopStage>
          {(["desktop-default", "desktop-diamonds", "desktop-muted"] as const).map((background) => (
            <Layer key={background} active={desktopBackground(desktopView) === background}>
              <Image src={`/double-flower/${background}.webp`} alt="" fill sizes={desktopSizes(desktopFrame.width)} />
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

        {/* Zones de survol, dans l'ordre du parcours ; sur écran tactile, zones à toucher. */}
        <div
          className={`absolute inset-0 ${desktopGrid} ${cursor.className}`}
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
                  const phase = desktopFlowerAt(event);
                  if (phase !== hovered) setHovered(phase);
                }}
                onClick={(event) => {
                  if (!isTouch) return;
                  const phase = desktopFlowerAt(event);
                  if (phase) toggle(phase);
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
              return (
                <button
                  key={phase}
                  {...common}
                  onClick={() => isTouch && toggle(phase)}
                  className={`relative z-1 cursor-default ${place[phase]}`}
                />
              );
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
        <span aria-hidden className="block w-full border-t border-shape-neutral-white" />
        <div className="flex flex-col gap-md p-md">
          <p aria-live="polite" className="type-caption-regular empty:hidden">
            {stepText && <RichLines lines={[stepText]} />}
          </p>
          {/* État initial : bouton Découvrir (lance le parcours) ; ensuite, indicateur d'étapes (proposition sans Figma). */}
          {step === "default" ? (
            <TextualButton icon="ArrowRight" iconPosition="right" onClick={() => navigate("diamonds")}>
              {looped ? commun.double_redecouvrir : commun.double_commencer}
            </TextualButton>
          ) : (
            <div className="flex items-center gap-xs">
              {/* Précédent : à diamonds, ramène à l'état initial (demande de l'utilisateur). */}
              <IconButton
                icon="CaretLeft"
                label={commun.double_etape_precedente}
                cursorLabel={null}
                variant="tertiary"
                color="white"
                onClick={() =>
                  navigate(phaseIndex < 0 ? "default" : phaseIndex === 0 ? "diamonds" : phases[phaseIndex - 1])
                }
              />
              <div className="flex flex-1 gap-sm">
                {[phases.slice(0, 3), phases.slice(3)].map((group, g) => (
                  <div key={g} className="flex flex-1 gap-xxs">
                    {group.map((phase) => (
                      <button
                        key={phase}
                        type="button"
                        aria-label={zoneLabel[phase]}
                        aria-current={step === phase ? "step" : undefined}
                        onClick={() => toggle(phase)}
                        className="flex h-(--icon-lg) flex-1 cursor-pointer items-center"
                      >
                        <span
                          aria-hidden
                          className={`w-full border-t-2 ${colorTransition} ${step === phase ? "border-shape-brand-bright" : "border-faded-white-40"}`}
                        />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              {/* Suivant : en boucle, 04 ramène à l'état initial (le bouton devient Re-découvrir). */}
              <IconButton
                icon="CaretRight"
                label={commun.double_etape_suivante}
                cursorLabel={null}
                variant="tertiary"
                color="white"
                onClick={() => {
                  if (phaseIndex >= phases.length - 1) {
                    setLooped(true);
                    navigate("default");
                  } else navigate(phases[phaseIndex + 1]);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
