"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { introuvable } from "@/content/texts";
import { AlertMessage } from "../AlertMessage";
import { ColorPicker, HexField } from "../ColorPicker";
import { Icon } from "../Icon";
import type { IconName } from "../Icon/icon-names";
import { IconButton } from "../IconButton";
import { LogoButton } from "../LogoButton";
import { Slider } from "../Slider";
import { SwitchButton } from "../SwitchButton";
import { TextualButton } from "../TextualButton";
import { tokenDuration } from "../token-duration";
import { MotifShortcuts } from "./MotifShortcuts";
import { decodeMotif, encodeMotif, sharedCodeOf, sharedLink, shareUrl } from "./motif-share";
import { tokenPx } from "./token-px";
import {
  createMotifEditor,
  editorSizes,
  type EditorSize,
  type EditorTool,
  type MotifEditor as Engine,
} from "./motif-editor-engine";

/*
 * Page 404, après « Dessiner » : éditeur de dessin du motif logo en plein écran (moteur : motif-editor-engine).
 * Design de test Figma 5912:32154, variante 1 (choix de l'utilisateur), desktop :
 *  - en-tête (grille 12 colonnes) : logo vers l'accueil (col. 1-2), annuler / refaire (col. 3), « Télécharger en PNG »
 *    tertiary (col. 9-10), « Valider le dessin » brand primary (col. 11-12), puis séparateur ;
 *  - colonne d'outils (spacing/lg, alignée en haut, demande de l'utilisateur) : Main, Pinceau, Gomme, Remplir, séparateur, Couleur, Taille ;
 *    outil actif en secondary active avec son icône pleine (fill, demande de l'utilisateur), les autres en secondary white ; Tout effacer (tertiary) en bas ;
 *  - zone de dessin, et sous elle le zoom : − , zoom en %, +.
 * Options à droite d'un bouton (points du pinceau, curseur de la gomme, tailles 4 / 12 / 24) : affichées au survol du
 * bouton ou après l'appui, masquées --not-found-editor-options-delay après la sortie du pointeur (demande de
 * l'utilisateur). Option choisie en primary active (comme la taille 4 dans Figma), les autres en primary white.
 * Points du pinceau (demande de l'utilisateur) : Dot = 1 logo, dotMedium et dotLarge = disques de
 * --not-found-editor-brush-medium / -large logos de diamètre (à ajuster).
 * Couleur (Figma 5929:33918, demandes de l'utilisateur) : goutte du bouton à la couleur choisie ; options en deux
 * rangées à spacing/lg, pastilles à spacing/sm :
 *  - rangée 1 : couleurs du portfolio (brand, whitish, bright, darkest, somber), non modifiables ;
 *  - rangée 2 : jusqu'à 5 couleurs personnalisées, gardées dans le navigateur ; « Ajouter une couleur » (secondary +)
 *    après la dernière, masqué à 5 : crée une pastille de la couleur actuelle, la choisit et ouvre le modificateur.
 *  Pastille choisie : contour blanc décalé (--not-found-editor-swatch-outline-offset, aperçu C choisi par
 *  l'utilisateur) ; rangée 2 seulement, icône Palette (Check modificateur ouvert), noire sur une couleur claire. Un clic
 *  sur la pastille choisie ouvre / ferme le modificateur (ColorPicker), sous les rangées à spacing/lg ; il se ferme
 *  aussi en choisissant une autre pastille, et les options restent ouvertes tant qu'il l'est.
 * Options : elles glissent de gauche à droite depuis le séparateur de la colonne (--not-found-editor-options-duration,
 * --motion-ease-out, valeurs d'essai), à spacing/sm du séparateur (choix de l'utilisateur).
 * Ombre dropshadow/mid (demande de l'utilisateur) sous les options et le zoom, posés sur le dessin : visibles sur un
 * fond coloré.
 * Zoom : posé sur la zone de dessin, à --not-found-editor-zoom-rest-opacity, opaque au survol de sa rangée.
 * Touche Contrôle (dans la zone de dessin) : molette = zoom autour du pointeur, glisser = main ; tant qu'elle est
 * maintenue, l'icône du bouton Main passe en HandFill, couleur active, contour inchangé (demande de l'utilisateur).
 * Touche Espace maintenue : gomme temporaire ; même retour visuel sur le bouton Gomme (EraserFill).
 * « Valider le dessin » : fenêtre de réglages à venir (Figma).
 * « Télécharger en PNG » : réglages du PNG dans une pop-up qui glisse vers le bas depuis le séparateur de l'en-tête,
 * au survol, comme les options d'outil (même délai), masquée quand le téléchargement est désactivé ; le clic télécharge.
 * Pop-up (ordre demandé par l'utilisateur) : « Recadrer l'image à la taille du dessin » (éteint au départ ; marge
 * --not-found-editor-export-margin), séparateur, « Fond transparent » (éteint au départ ; éteint, « Fond : » et une
 * tuile de couleur, noir au départ, icône Palette puis Check : un clic ouvre / ferme le modificateur de couleur, la
 * pop-up reste ouverte tant qu'il l'est).
 * « Copier le lien » (icône Share, col. 7-8, demande de l'utilisateur) : le dessin est codé dans un lien (motif-share),
 * copié dans le presse-papier ; alerte neutre (progress, icône LinkSimple, minutée) en bas de la zone de dessin, avec
 * la durée de validité (30 jours) pour un lien court. Un lien partagé ouvre l'éditeur avec ce dessin ; lien court
 * expiré : alerte d'erreur « Ce dessin n'est plus disponible ».
 * Aides (bouton « ? » au-dessus de Tout effacer, MotifShortcuts) : raccourcis en bas à gauche de la zone de dessin,
 * ouverts à la première visite.
 * Annuler / Refaire : désactivés sans action à annuler / à refaire (demande de l'utilisateur).
 * Mobile et tablette : à concevoir en code avec l'utilisateur (même mise en page pour l'instant).
 */

type Options = "canvas" | "brush" | "eraser" | "color" | "size" | "download" | null;

/* Couleurs du portfolio (rangée 1 de l'outil Couleur, Figma 5929:33921). */
const palette = [
  "--shape-brand-brand",
  "--shape-brand-whitish",
  "--shape-brand-bright",
  "--shape-brand-darkest",
  "--shape-brand-somber",
] as const;

/** Couleurs personnalisées : 5 au plus (rangée 2), gardées dans le navigateur sous cette clé. */
const CUSTOM_MAX = 5;
const CUSTOM_KEY = "motif-editeur-couleurs";
/** Aides affichées ou non (clé du navigateur). */
const HELPS_KEY = "motif-editeur-aides";
const readCustom = (): string[] => {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "[]");
    return Array.isArray(list)
      ? list.filter((c): c is string => typeof c === "string" && /^#[0-9a-f]{6}$/.test(c)).slice(0, CUSTOM_MAX)
      : [];
  } catch {
    return [];
  }
};

/** Couleur résolue « rgb(r, g, b) » → « #rrggbb ». */
const toHex = (rgb: string) =>
  `#${(rgb.match(/\d+/g) ?? ["0", "0", "0"])
    .slice(0, 3)
    .map((c) => Number(c).toString(16).padStart(2, "0"))
    .join("")}`;

/** Couleur trop foncée pour se voir sur du noir : contraste inférieur à 3:1 (seuil WCAG des éléments graphiques),
 *  soit une luminance relative sous 0,1. */
const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.1;
};

/** Couleur claire : icône noire dessus (luminance relative au-dessus de la moitié). */
const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
};

/** Couleur résolue par le navigateur (token « --… » ou valeur CSS ; les tokens peuvent être des color-mix). */
function resolveColor(token: string) {
  const probe = document.createElement("span");
  probe.style.color = token.startsWith("--") ? `var(${token})` : token;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** Options d'un outil : ouvertes au survol du bouton ou à l'appui, fermées un délai après la sortie du pointeur.
 *  Elles restent ouvertes pendant une modification : glisser dans un curseur (capture du pointeur, pas de sortie) ou
 *  saisie dans un champ de la rangée (demande de l'utilisateur) ; onClose : options fermées (modificateur refermé). */
function useOptions(onClose: (which: Exclude<Options, null>) => void) {
  const [open, setOpen] = useState<Options>(null);
  const current = useRef<Options>(null);
  const closed = useRef(onClose);
  useEffect(() => {
    closed.current = onClose;
  });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rows = useRef(new Map<Exclude<Options, null>, HTMLElement>());
  const delay = useRef(0);
  /** Pointeur sur la rangée ouverte. */
  const inside = useRef(false);

  const set = (next: Options) => {
    if (current.current && current.current !== next) closed.current(current.current);
    current.current = next;
    setOpen(next);
  };
  /** Saisie en cours dans un champ de la rangée ouverte. */
  const typing = () => {
    const el = document.activeElement;
    return (
      (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) &&
      !!current.current &&
      !!rows.current.get(current.current)?.contains(el)
    );
  };
  /** Fermeture après le délai, sauf si le pointeur est revenu ou qu'une saisie est en cours. */
  const scheduleClose = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!inside.current && !typing()) set(null);
    }, delay.current);
  };

  const show = (which: Exclude<Options, null>) => {
    clearTimeout(timer.current);
    inside.current = true;
    set(which);
  };
  const leave = () => {
    inside.current = false;
    scheduleClose();
  };

  useEffect(() => {
    delay.current = tokenDuration(document.documentElement, "--not-found-editor-options-delay");
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Toucher ailleurs que dans la rangée ouverte : fermeture après le délai.
    const down = (event: PointerEvent) => {
      if (rows.current.get(open)?.contains(event.target as Node)) return;
      inside.current = false;
      scheduleClose();
    };
    // Pointeur sorti de la fenêtre (ex. ouverture du PNG téléchargé) ou fenêtre quittée : pas de sortie de la rangée
    // détectée, fermeture après le délai comme à la sortie du pointeur.
    const out = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      inside.current = false;
      scheduleClose();
    };
    const blur = () => {
      inside.current = false;
      scheduleClose();
    };
    // Fin de saisie (champ quitté) : fermeture après le délai si le pointeur n'est plus sur la rangée.
    const focusOut = () => {
      if (!inside.current) scheduleClose();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerout", out);
    document.addEventListener("focusout", focusOut);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusout", focusOut);
      window.removeEventListener("blur", blur);
    };
    // scheduleClose ne lit que des références.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  /** enabled = false : le survol n'ouvre pas les options (bouton désactivé : « Télécharger en PNG » sans dessin). */
  const row = (which: Exclude<Options, null>, enabled = true) => ({
    ref: (el: HTMLDivElement | null) => void (el ? rows.current.set(which, el) : rows.current.delete(which)),
    onPointerEnter: (event: ReactPointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (current.current === which) {
        clearTimeout(timer.current);
        inside.current = true;
      } else if (enabled) show(which);
    },
    onPointerLeave: (event: ReactPointerEvent) => event.pointerType === "mouse" && leave(),
  });
  /** Options affichées le temps d'un réglage au clavier (Espace + molette), fermées après le délai. */
  const peek = (which: Exclude<Options, null>) => {
    set(which);
    inside.current = false;
    scheduleClose();
  };
  return { open, show, peek, row };
}

/** Pastille choisie : contour blanc décalé, posé sur le fond (visible sur toute couleur). */
const swatchChosen =
  "outline-(length:--divider-width) outline-border-neutral-white outline-offset-(--not-found-editor-swatch-outline-offset)";
/** Pastille trop foncée pour se voir sur le noir (isDark) : contour intérieur faded/white/40, distinct du contour
 *  plein et décalé de la pastille choisie (demande de l'utilisateur). */
const swatchDark = "border-(length:--divider-width) border-faded-white-40";

const brushes = [
  { icon: "Dot", label: introuvable.editeur_pinceau_1, token: null },
  {
    icon: "dotMedium",
    label: introuvable.editeur_pinceau_3,
    token: "--not-found-editor-brush-medium",
  },
  {
    icon: "dotLarge",
    label: introuvable.editeur_pinceau_6,
    token: "--not-found-editor-brush-large",
  },
] as const;

export function MotifEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Alerte en bas de la zone de dessin (lien copié, dessin plus disponible) : affichée (open), puis redescend et est
   *  retirée (null). */
  const [alert, setAlert] = useState<{
    type: "progress" | "validate" | "error";
    icon: IconName;
    text: string;
    details?: string;
    open: boolean;
  } | null>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const [size, setSize] = useState<EditorSize>(12);
  const [tool, setTool] = useState<EditorTool>("paint");
  const [brush, setBrush] = useState(0);
  // Composant chargé seulement côté navigateur (next/dynamic, ssr: false) : tokens lus dès le premier rendu.
  const [eraser, setEraser] = useState(() => tokenPx("--not-found-editor-eraser-size"));
  const eraserRef = useRef(eraser);
  const setEraserPx = (px: number) => {
    eraserRef.current = px;
    setEraser(px);
    engine.current?.setEraserSize(px);
  };
  const [eraserRange] = useState(() => ({
    min: tokenPx("--not-found-editor-eraser-min"),
    max: tokenPx("--not-found-editor-eraser-max"),
  }));
  const [zoom, setZoom] = useState(1);
  /** Dessin vide : « Télécharger en PNG » et « Valider le dessin » désactivés (demande de l'utilisateur). */
  const [hasDrawing, setHasDrawing] = useState(false);
  /** Réglages de l'export : fond transparent (éteint au départ), couleur du fond, recadrage (éteint au départ). */
  const [transparent, setTransparent] = useState(false);
  /** Couleur du fond du dessin (« #rrggbb ») : noir au départ (shape/neutral/black), modificateur de couleur ouvert. */
  const [canvasBg, setCanvasBg] = useState(() => toHex(resolveColor("--shape-neutral-black")));
  const [canvasPicker, setCanvasPicker] = useState(false);
  /** Couleur du fond du PNG (« #rrggbb ») : celle du fond du dessin par défaut ; changée dans la pop-up d'export, elle
   *  prévaut jusqu'au prochain changement du fond du dessin (demande de l'utilisateur). */
  const [background, setBackground] = useState(canvasBg);
  const [backgroundPicker, setBackgroundPicker] = useState(false);
  const changeCanvasBg = (hex: string) => {
    setCanvasBg(hex);
    setBackground(hex);
  };
  const [crop, setCrop] = useState(false);
  /** Actions à annuler / à refaire : sans action, le bouton est désactivé (demande de l'utilisateur). */
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const [zoomHover, setZoomHover] = useState(false);
  /** Couleur choisie : du portfolio (token) ou personnalisée (indice dans custom). */
  const [color, setColor] = useState<{ token: (typeof palette)[number] } | { custom: number }>({ token: palette[0] });
  const [custom, setCustom] = useState(readCustom);
  /** Aides (raccourcis) : ouvertes à la première visite, puis comme l'utilisateur les a laissées (navigateur). */
  const [helps, setHelps] = useState(() => {
    try {
      return localStorage.getItem(HELPS_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const toggleHelps = (on: boolean) => {
    setHelps(on);
    try {
      localStorage.setItem(HELPS_KEY, on ? "1" : "0");
    } catch {
      // Stockage refusé : réglage gardé pour cette visite.
    }
  };
  /** Modificateur de couleur ouvert (pastille personnalisée choisie). */
  const [editing, setEditing] = useState(false);
  const colorValue = "token" in color ? `var(${color.token})` : (custom[color.custom] ?? `var(${palette[0]})`);
  /** Goutte trop foncée : fond du bouton Couleur blanc au lieu de noir (demande de l'utilisateur). */
  const colorDark = isDark(toHex(resolveColor(colorValue)));
  // Options fermées : leur modificateur de couleur se referme aussi.
  const options = useOptions((which) => {
    if (which === "color") setEditing(false);
    if (which === "download") setBackgroundPicker(false);
    if (which === "canvas") setCanvasPicker(false);
  });
  // Espace + molette : taille de la gomme, par crans de --not-found-editor-eraser-wheel-step (molette avant = plus
  // grande), bornée comme la barre ; la barre de la gomme s'affiche pendant le réglage (demande de l'utilisateur).
  const wheelRef = useRef<(event: WheelEvent) => void>(() => undefined);
  useEffect(() => {
    wheelRef.current = (event: WheelEvent) => {
      if (!spaceRef.current) return;
      event.preventDefault();
      const step = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--not-found-editor-eraser-wheel-step"),
      );
      const unit = event.deltaMode === 1 ? 33 : event.deltaMode === 2 ? window.innerHeight : 1;
      const px = eraserRef.current * step ** ((-event.deltaY * unit) / 100);
      setEraserPx(Math.round(Math.min(eraserRange.max, Math.max(eraserRange.min, px))));
      options.peek("eraser");
    };
  });
  useEffect(() => {
    const wheel = (event: WheelEvent) => wheelRef.current(event);
    window.addEventListener("wheel", wheel, { passive: false });
    return () => window.removeEventListener("wheel", wheel);
  }, []);
  // Touches maintenues : Contrôle = main temporaire (géré par le moteur), Espace = gomme temporaire ; retour visuel
  // sur le bouton de l'outil (icône pleine, couleur active).
  const [ctrl, setCtrl] = useState(false);
  const [space, setSpace] = useState(false);
  const spaceRef = useRef(false);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      setCtrl(event.ctrlKey);
      // Contrôle (ou Commande sur Mac) + Z : annuler ; + Y ou + Maj + Z : refaire (lettre tapée, quelle que soit la disposition).
      if (event.type === "keydown" && (event.ctrlKey || event.metaKey)) {
        const letter = event.key.toLowerCase();
        if (letter === "z" || letter === "y") {
          event.preventDefault();
          // Maj + Z refait aussi (demande de l'utilisateur).
          if (letter === "z" && !event.shiftKey) engine.current?.undo();
          else engine.current?.redo();
          return;
        }
      }
      if (event.code !== "Space") return;
      // Ni défilement, ni clic du bouton qui a le focus.
      event.preventDefault();
      const on = event.type === "keydown";
      setSpace(on);
      spaceRef.current = on;
      engine.current?.setTempEraser(on);
    };
    const reset = () => {
      setCtrl(false);
      setSpace(false);
      spaceRef.current = false;
      engine.current?.setTempEraser(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
      window.removeEventListener("blur", reset);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const e = createMotifEditor(canvas, {
      size: 12,
      eraserSize: tokenPx("--not-found-editor-eraser-size"),
      onZoom: setZoom,
      onDrawing: setHasDrawing,
      onHistory: (undo, redo) => setHistory({ undo, redo }),
    });
    engine.current = e;
    // Lien partagé : le dessin de l'adresse remplace le dessin vide.
    const link = sharedLink();
    let alive = true;
    if (link)
      void sharedCodeOf(link)
        .then((code) => {
          // Lien court expiré (30 jours) ou inconnu : alerte d'erreur (demande de l'utilisateur).
          if (code === "missing") {
            if (alive)
              setAlert({ type: "error", icon: "LinkBreak", text: introuvable.editeur_dessin_indisponible, open: true });
            return null;
          }
          return code ? decodeMotif(code) : null;
        })
        .then((snapshot) => {
          if (alive && snapshot) e.load(snapshot);
        });
    return () => {
      alive = false;
      e.destroy();
    };
  }, []);

  const pickTool = (t: EditorTool) => {
    setTool(t);
    engine.current?.setTool(t);
  };
  const pickBrush = (i: number) => {
    setBrush(i);
    const token = brushes[i].token;
    engine.current?.setBrush(
      token ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token)) : 1,
    );
    pickTool("paint");
  };
  const pickColor = (next: { token: (typeof palette)[number] } | { custom: number }, value?: string) => {
    setColor(next);
    // Couleur résolue par le navigateur, comme la couleur de départ du moteur.
    engine.current?.setColor(resolveColor(value ?? ("token" in next ? next.token : custom[next.custom])));
  };
  const saveCustom = (list: string[]) => {
    setCustom(list);
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    } catch {
      // Stockage refusé (navigation privée) : couleurs gardées pour cette visite seulement.
    }
  };
  /** Pastille : la choisir ; pastille personnalisée déjà choisie : ouvrir / fermer le modificateur. */
  const pressSwatch = (next: { token: (typeof palette)[number] } | { custom: number }) => {
    if ("custom" in next && "custom" in color && color.custom === next.custom) {
      setEditing((e) => !e);
      return;
    }
    setEditing(false);
    pickColor(next);
  };
  const addCustom = () => {
    const hex = toHex(resolveColor(colorValue));
    saveCustom([...custom, hex]);
    pickColor({ custom: custom.length }, hex);
    setEditing(true);
  };
  /** Réglage du modificateur : pastille mise à jour en direct, pinceau à la fin du réglage. */
  const editCustom = (hex: string, final: boolean) => {
    if (!("custom" in color)) return;
    const list = custom.map((c, i) => (i === color.custom ? hex : c));
    if (final) {
      saveCustom(list);
      engine.current?.setColor(resolveColor(hex));
    } else setCustom(list);
  };
  const pickSize = (s: EditorSize) => {
    setSize(s);
    engine.current?.setSize(s);
  };
  const pickEraser = (value: number) => {
    const { min, max } = eraserRange;
    setEraserPx(Math.round(min + value * (max - min)));
  };
  const zoomBy = (direction: 1 | -1) => {
    const step = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--not-found-editor-zoom-step"),
    );
    engine.current?.zoomBy(direction > 0 ? step : 1 / step);
  };
  const copyLink = async () => {
    if (!engine.current) return;
    const link = encodeMotif(engine.current.snapshot()).then(shareUrl);
    const url = link.then((l) => l.url);
    try {
      // Lien passé en promesse au presse-papier : copie autorisée même après l'attente du serveur (Safari).
      if (typeof ClipboardItem !== "undefined") {
        const text = url.then((u) => new Blob([u], { type: "text/plain" }));
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": text })]);
      } else await navigator.clipboard.writeText(await url);
    } catch {
      // Presse-papier refusé (navigateur intégré, permission) : copie par sélection d'un champ caché.
      const field = document.createElement("textarea");
      field.value = await url;
      field.style.cssText = "position:fixed;opacity:0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) return;
    }
    // Lien court : valable 30 jours, précisé sous le texte (demande de l'utilisateur).
    setAlert({
      type: "progress",
      icon: "LinkSimple",
      text: introuvable.editeur_lien_copie,
      details: (await link).short ? introuvable.editeur_lien_duree : undefined,
      open: true,
    });
  };
  const exportPng = async () => {
    const blob = await engine.current?.exportPng({
      background: transparent ? null : resolveColor(background),
      crop: crop ? { margin: tokenPx("--not-found-editor-export-margin") } : undefined,
    });
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = introuvable.editeur_fichier;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    // Validation du téléchargement (demande de l'utilisateur) : alerte validate minutée.
    setAlert({ type: "validate", icon: "Check", text: introuvable.editeur_telecharge, open: true });
  };

  /** Bouton d'outil : icône pleine (fill) quand l'outil est actif ou activé par sa touche (feedback). */
  const toolButton = (
    t: EditorTool,
    [icon, filled]: [IconName, IconName],
    label: string,
    onPress?: () => void,
    feedback = false,
  ) => (
    <IconButton
      icon={tool === t || feedback ? filled : icon}
      iconColor={feedback ? "active" : undefined}
      label={label}
      cursorLabel={label}
      variant="secondary"
      color={tool === t ? "active" : "white"}
      aria-pressed={tool === t}
      onClick={() => {
        pickTool(t);
        onPress?.();
      }}
    />
  );
  /** Bouton d'outil et ses options, qui glissent depuis le séparateur de la colonne d'outils, à spacing/sm de lui. */
  const withOptions = (which: Exclude<Options, null>, button: ReactNode, content: ReactNode) => {
    const open = options.open === which;
    return (
      <div {...options.row(which)} className="relative">
        {button}
        {/* Découpe à gauche seulement, au bord droit du séparateur : les options sortent de dessous. Zone sans pointeur,
            options fermées comprises (inert) : le survol ne s'ouvre que par le bouton, puis reste tant que le pointeur
            est sur le bouton ou les options ouvertes (demande de l'utilisateur). Fermées, elles reculent de spacing/xs
            en plus : leur ombre ne dépasse pas sur un fond de dessin clair. */}
        <div className="pointer-events-none absolute top-0 left-[calc(100%+var(--spacing-lg)+var(--divider-width))] flex h-full pl-sm [clip-path:inset(-100vh_-100vw_-100vh_0)]">
          <div
            inert={!open}
            className={[
              "pointer-events-auto flex items-center transition-[translate] duration-(--not-found-editor-options-duration) ease-(--motion-ease-out) motion-reduce:transition-none",
              open ? "translate-none" : "-translate-x-[calc(100%+var(--spacing-sm)+var(--spacing-xs))]",
            ].join(" ")}
          >
            {content}
          </div>
        </div>
      </div>
    );
  };
  /** « Fond : » (titre du champ), puis à la ligne le code Hex et la tuile (demande de l'utilisateur) ; la tuile (icône
   *  Palette, Check modificateur ouvert, noire sur une couleur claire) ouvre / ferme le modificateur de couleur. Le
   *  titre du champ remonte de 1rem au-dessus de lui : marge haute qui la compense. Pop-up d'export et fond du dessin. */
  const colorField = (value: string, onChange: (hex: string) => void, picker: boolean, toggle: () => void) => (
    <>
      <div className="flex items-end gap-md pt-[1rem]">
        <HexField label={introuvable.editeur_fond} value={value} onChange={onChange} />
        <button
          type="button"
          aria-label={`${introuvable.editeur_fond} ${value}`}
          aria-expanded={picker}
          onClick={toggle}
          className="flex size-(--button-size-sm) shrink-0 cursor-pointer items-center justify-center border-(length:--divider-width) border-border-neutral-white"
          style={{ background: value }}
        >
          <Icon
            name={picker ? "Check" : "Palette"}
            size="var(--icon-md)"
            className={isLight(value) ? "text-text-neutral-black" : "text-text-neutral-white"}
          />
        </button>
      </div>
      {picker && (
        <ColorPicker
          fill
          hexField={false}
          value={value}
          onChange={onChange}
          labels={{
            hex: introuvable.editeur_hex,
            area: introuvable.editeur_couleur_cadre,
            hue: introuvable.editeur_couleur_nuance,
          }}
        />
      )}
    </>
  );
  /** Réglages de l'export : pop-up de « Télécharger en PNG ». */
  const exportPanel = (which: "download") => (
    <>
      {/* Panneau sous le séparateur de l'en-tête, aligné à droite du bouton : découpé en haut, il glisse de
        dessous le séparateur, à spacing/sm de lui. Comme les options d'outil : survol ouvert par le bouton seulement. */}
      <div className="pointer-events-none absolute top-[calc(100%+var(--divider-width))] right-0 pt-sm [clip-path:inset(0_-100vw_-100vh_-100vw)]">
        <div
          inert={!(options.open === which && hasDrawing)}
          className={[
            "pointer-events-auto flex w-max flex-col items-stretch gap-sm bg-background-buttons-neutral-black p-sm shadow-(--dropshadow-mid)",
            "transition-[translate] duration-(--not-found-editor-options-duration) ease-(--motion-ease-out) motion-reduce:transition-none",
            options.open === which && hasDrawing
              ? "translate-none"
              : "-translate-y-[calc(100%+var(--spacing-sm)+var(--spacing-xs))]",
          ].join(" ")}
        >
          <SwitchButton checked={crop} onChange={setCrop} className="justify-between">
            {introuvable.editeur_recadrer}
          </SwitchButton>
          <div aria-hidden className="h-(--divider-width) w-full bg-shape-neutral-white" />
          <SwitchButton checked={transparent} onChange={setTransparent} className="justify-between">
            {introuvable.editeur_fond_transparent}
          </SwitchButton>
          {!transparent && (
            <>{colorField(background, setBackground, backgroundPicker, () => setBackgroundPicker((v) => !v))}</>
          )}
        </div>
      </div>
    </>
  );
  const { min, max } = eraserRange;

  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-background-neutral-black">
      {/* En-tête, au-dessus de la zone de dessin (le panneau d’export déborde dessus). */}
      <div className="grid-layout relative z-3 h-(--button-size-sm) shrink-0">
        <LogoButton color="white" className="col-span-2 col-start-1" />
        <div className="col-start-3 flex items-center gap-xxs">
          <IconButton
            icon="ArrowCounterClockwise"
            label={introuvable.editeur_annuler}
            cursorLabel={introuvable.editeur_annuler}
            variant="tertiary"
            color="white"
            disabled={!history.undo}
            onClick={() => engine.current?.undo()}
          />
          <IconButton
            icon="ArrowClockwise"
            label={introuvable.editeur_refaire}
            cursorLabel={introuvable.editeur_refaire}
            variant="tertiary"
            color="white"
            disabled={!history.redo}
            onClick={() => engine.current?.redo()}
          />
        </div>
        {/* « Copier le lien » (colonnes 7-8, collé à droite, Figma 5923:33239) ; séparateur vertical à spacing/lg de
            chaque côté, entre lui et « Télécharger en PNG » : au bord droit de la case, l'écart de la grille (spacing/lg)
            le sépare du bouton suivant. */}
        <div className="relative col-span-2 col-start-7 flex justify-end pr-[calc(var(--spacing-lg)+var(--divider-width))]">
          <IconButton
            icon="Share"
            label={introuvable.editeur_copier_lien}
            cursorLabel={introuvable.editeur_copier_lien}
            variant="tertiary"
            color="white"
            onClick={copyLink}
          />
          <span
            aria-hidden
            className="absolute top-1/2 right-0 h-(--not-found-editor-header-divider-height) w-(--divider-width) -translate-y-1/2 bg-shape-neutral-white"
          />
        </div>
        {/* « Télécharger en PNG » : sa propre pop-up des réglages de l'export, au survol seulement ; le clic télécharge
            (demande de l'utilisateur). */}
        <div {...options.row("download", hasDrawing)} className="relative col-span-2 col-start-9">
          <TextualButton
            variant="tertiary"
            color="white"
            disabled={!hasDrawing}
            icon="DownloadSimple"
            iconPosition="right"
            onClick={exportPng}
          >
            {introuvable.editeur_exporter}
          </TextualButton>
          {exportPanel("download")}
        </div>
        {/* Fenêtre de réglages à venir (design Figma de l'utilisateur). */}
        <TextualButton
          {...(hasDrawing ? { color: "brand" as const } : { disabled: true as const, color: "white" as const })}
          icon="ArrowRight"
          iconPosition="right"
          className="col-span-2 col-start-11"
        >
          {introuvable.editeur_valider}
        </TextualButton>
      </div>
      <div aria-hidden className="h-(--divider-width) shrink-0 bg-shape-neutral-white" />

      <div className="flex min-h-0 flex-1">
        {/* Colonne d'outils, au-dessus de la zone de dessin (les options débordent dessus). */}
        <div className="relative z-2 flex shrink-0">
          <div className="flex flex-col items-center justify-between p-lg">
            <div className="flex w-(--button-size-sm) flex-col items-start gap-lg">
              {/* Fond du dessin (demande de l'utilisateur) : carré à la couleur du fond, puis un séparateur. */}
              {withOptions(
                "canvas",
                <IconButton
                  icon="SquareFill"
                  iconTint={canvasBg}
                  label={introuvable.editeur_fond_dessin}
                  cursorLabel={introuvable.editeur_fond_dessin}
                  variant="secondary"
                  color="white"
                  onClick={() => options.show("canvas")}
                  className={
                    isDark(canvasBg) ? "bg-background-buttons-neutral-white" : "bg-background-buttons-neutral-black"
                  }
                />,
                <div className="flex w-(--color-picker-width) flex-col gap-sm self-start bg-background-buttons-neutral-black p-sm shadow-(--dropshadow-mid)">
                  {colorField(canvasBg, changeCanvasBg, canvasPicker, () => setCanvasPicker((v) => !v))}
                </div>,
              )}
              <div aria-hidden className="h-(--divider-width) w-full bg-shape-neutral-white" />
              {toolButton("hand", ["Hand", "HandFill"], introuvable.editeur_main, undefined, ctrl)}
              {withOptions(
                "brush",
                toolButton("paint", ["PaintBrush", "PaintBrushFilled"], introuvable.editeur_pinceau, () =>
                  options.show("brush"),
                ),
                <div className="flex items-center gap-sm">
                  {brushes.map((b, i) => (
                    <IconButton
                      key={b.icon}
                      icon={b.icon}
                      label={b.label}
                      cursorLabel={b.label}
                      color={brush === i ? "active" : "white"}
                      aria-pressed={brush === i}
                      onClick={() => pickBrush(i)}
                      className="shadow-(--dropshadow-mid)"
                    />
                  ))}
                </div>,
              )}
              {withOptions(
                "eraser",
                toolButton(
                  "erase",
                  ["Eraser", "EraserFill"],
                  introuvable.editeur_gomme,
                  () => options.show("eraser"),
                  space,
                ),
                // Barre posée dans un cadre comme les boutons d'options (fond noir, barre claire, ombre ; choix de l'utilisateur), pour rester visible sur
                // un dessin coloré (demande de l'utilisateur) ; largeur des trois points du pinceau.
                <div className="flex h-(--button-size-sm) w-[calc(3*var(--button-size-sm)+2*var(--spacing-sm))] items-center bg-background-buttons-neutral-black shadow-(--dropshadow-mid)">
                  <Slider
                    value={max > min ? (eraser - min) / (max - min) : 0}
                    onChange={pickEraser}
                    aria-label={introuvable.editeur_taille_gomme}
                    aria-valuetext={`${eraser} px`}
                    className="w-full"
                  />
                </div>,
              )}
              {toolButton("fill", ["PaintBucket", "PaintBucketFill"], introuvable.editeur_remplir)}
              <div aria-hidden className="h-(--divider-width) w-full bg-shape-neutral-white" />
              {withOptions(
                "color",
                <IconButton
                  icon="DropSimpleFill"
                  iconTint={colorValue}
                  label={introuvable.editeur_couleur}
                  cursorLabel={introuvable.editeur_couleur}
                  variant="secondary"
                  color="white"
                  onClick={() => options.show("color")}
                  className={colorDark ? "bg-background-buttons-neutral-white" : "bg-background-buttons-neutral-black"}
                />,
                <div className="flex flex-col gap-lg self-start">
                  <div role="group" aria-label={introuvable.editeur_couleurs_portfolio} className="flex gap-sm">
                    {palette.map((token) => {
                      const chosen = "token" in color && color.token === token;
                      return (
                        <button
                          key={token}
                          type="button"
                          aria-label={token.replace("--shape-", "")}
                          aria-pressed={chosen}
                          onClick={() => pressSwatch({ token })}
                          className={`size-(--button-size-sm) shrink-0 cursor-pointer shadow-(--dropshadow-mid) ${chosen ? swatchChosen : ""} ${isDark(toHex(resolveColor(token))) ? swatchDark : ""}`}
                          style={{ background: `var(${token})` }}
                        />
                      );
                    })}
                  </div>
                  <div role="group" aria-label={introuvable.editeur_couleurs_perso} className="flex gap-sm">
                    {custom.map((hex, i) => {
                      const chosen = "custom" in color && color.custom === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          aria-label={
                            chosen
                              ? editing
                                ? introuvable.editeur_valider_couleur
                                : introuvable.editeur_modifier_couleur
                              : hex
                          }
                          aria-pressed={chosen}
                          aria-expanded={chosen ? editing : undefined}
                          onClick={() => pressSwatch({ custom: i })}
                          className={`flex size-(--button-size-sm) shrink-0 cursor-pointer items-center justify-center shadow-(--dropshadow-mid) ${chosen ? swatchChosen : ""} ${isDark(hex) ? swatchDark : ""}`}
                          style={{ background: hex }}
                        >
                          {chosen && (
                            <Icon
                              name={editing ? "Check" : "Palette"}
                              size="var(--icon-md)"
                              className={isLight(hex) ? "text-text-neutral-black" : "text-text-neutral-white"}
                            />
                          )}
                        </button>
                      );
                    })}
                    {custom.length < CUSTOM_MAX && (
                      <IconButton
                        icon="Plus"
                        label={introuvable.editeur_ajouter_couleur}
                        cursorLabel={introuvable.editeur_ajouter_couleur}
                        variant="secondary"
                        color="white"
                        onClick={addCustom}
                        className="shadow-(--dropshadow-mid)"
                      />
                    )}
                  </div>
                  {editing && "custom" in color && custom[color.custom] && (
                    <ColorPicker
                      value={custom[color.custom]}
                      onChange={editCustom}
                      labels={{
                        hex: introuvable.editeur_hex,
                        area: introuvable.editeur_couleur_cadre,
                        hue: introuvable.editeur_couleur_nuance,
                      }}
                    />
                  )}
                </div>,
              )}
              {withOptions(
                "size",
                <IconButton
                  icon="DotsNine"
                  label={introuvable.editeur_tailles}
                  cursorLabel={introuvable.editeur_tailles}
                  variant="secondary"
                  color="white"
                  onClick={() => options.show("size")}
                />,
                <div role="group" aria-label={introuvable.editeur_tailles} className="flex items-center gap-sm">
                  {editorSizes.map((s) => (
                    <TextualButton
                      key={s}
                      color={s === size ? "active" : "white"}
                      aria-pressed={s === size}
                      onClick={() => pickSize(s)}
                      align="center"
                      className="w-(--button-size-sm)! shadow-(--dropshadow-mid)"
                    >
                      {String(s)}
                    </TextualButton>
                  ))}
                </div>,
              )}
            </div>
            <div className="flex flex-col gap-lg">
              {/* Aides (demande de l'utilisateur) : comme un outil, active avec l'icône pleine ; tertiary à l'essai. */}
              <IconButton
                icon={helps ? "QuestionFill" : "Question"}
                label={introuvable.editeur_aides}
                cursorLabel={introuvable.editeur_aides}
                variant="tertiary"
                color={helps ? "active" : "white"}
                aria-pressed={helps}
                onClick={() => toggleHelps(!helps)}
              />
              <IconButton
                icon="TrashSimple"
                label={introuvable.editeur_effacer}
                cursorLabel={introuvable.editeur_effacer}
                variant="tertiary"
                color="white"
                onClick={() => engine.current?.clear()}
              />
            </div>
          </div>
          <div aria-hidden className="w-(--divider-width) bg-shape-neutral-white" />
        </div>

        {/* Zone de dessin et zoom */}
        <div
          className="relative z-1 min-w-0 flex-1"
          style={{ background: canvasBg }}
          onPointerMove={(event) => {
            const r = zoomRef.current?.getBoundingClientRect();
            setZoomHover(!!r && event.clientY >= r.top && event.clientY <= r.bottom && event.clientX >= r.left);
          }}
          onPointerLeave={() => setZoomHover(false)}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={introuvable.editeur_zone}
            className="absolute inset-0 size-full touch-none"
          />
          {helps && <MotifShortcuts onClose={() => toggleHelps(false)} />}
          {/* Zoom posé sur la zone de dessin : --not-found-editor-zoom-rest-opacity, opaque au survol de sa rangée
              (zone Figma 5912:32183) ; le dessin passe dessous, seuls les boutons arrêtent le pointeur. */}
          <div
            ref={zoomRef}
            className={[
              "pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-sm px-lg *:pointer-events-auto",
              "transition-opacity duration-(--motion-duration-fast) ease-(--motion-ease-out) focus-within:opacity-100",
              zoomHover ? "opacity-100" : "opacity-(--not-found-editor-zoom-rest-opacity)",
            ].join(" ")}
          >
            <IconButton
              icon="Minus"
              label={introuvable.editeur_dezoomer}
              iconShadow
              cursorLabel={introuvable.editeur_dezoomer}
              variant="tertiary"
              color="white"
              onClick={() => zoomBy(-1)}
            />
            <p
              aria-label={introuvable.editeur_zoom}
              className="type-caption-regular text-text-neutral-white [text-shadow:var(--dropshadow-mid-text)]"
            >
              {`${Math.round(zoom * 100)}%`}
            </p>
            <IconButton
              icon="Plus"
              label={introuvable.editeur_zoomer}
              iconShadow
              cursorLabel={introuvable.editeur_zoomer}
              variant="tertiary"
              color="white"
              onClick={() => zoomBy(1)}
            />
          </div>
          {/* Alerte (lien copié : progress minutée ; dessin plus disponible : error, fermée par la croix) : sort du bas
              de la zone de dessin, dans ses marges (spacing/lg), par-dessus le zoom. */}
          {alert && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden px-lg pt-lg pb-lg">
              <AlertMessage
                key={alert.text}
                type={alert.type}
                icon={alert.icon}
                text={alert.text}
                details={alert.details}
                timed={alert.type !== "error"}
                onClose={() => {
                  setAlert((a) => a && { ...a, open: false });
                  if (matchMedia("(prefers-reduced-motion: reduce)").matches) setAlert(null);
                }}
                onTransitionEnd={(event) => {
                  if (event.target === event.currentTarget && !alert.open) setAlert(null);
                }}
                className={`pointer-events-auto transition-transform duration-(--alert-message-slide-duration) ease-(--alert-message-slide-ease) starting:translate-y-[calc(100%+var(--spacing-lg))] motion-reduce:transition-none ${
                  alert.open ? "translate-y-0" : "translate-y-[calc(100%+var(--spacing-lg))]"
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
