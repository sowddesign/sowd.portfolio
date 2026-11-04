"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { commun } from "@/content/texts";
import { ProgressBar } from "../ProgressBar";
import { ShowreelLogo } from "../ShowreelLogo";
import { tokenDuration } from "../token-duration";
import { reducedMotionQuery } from "../use-media-query";
import { createIntroEngine, introLogoSize } from "./intro-engine";
import { trackVisuals } from "./track-visuals";

/*
 * Chargement du site (demandes de l'utilisateur, animation validée sur démo) :
 * - nouvelle visite (une fois par onglet, sessionStorage) : intro tournesol (voir intro-engine) par-dessus la page,
 *   qui attend les visuels du premier écran (page chargée pendant la boucle « 01 » : elle s'efface, court temps, puis le logo au repos revient en fondu) ; le logo animé rejoint le logo de l'en-tête (cibles data-intro-target),
 *   puis la page apparaît d'un bloc ;
 * - changement de page, ou chargement direct d'une page une fois l'intro vue : si des visuels du premier écran manquent, le contenu reste masqué ; au-delà de
 *   --site-intro-nav-threshold, la boucle du logo « 01 » et la barre de progression s'affichent, jusqu'à la fin
 *   d'une boucle une fois la page chargée.
 * Barre de progression : progressBar noir en haut de l'écran, provisoire (à revoir avec l'utilisateur).
 * Mouvement réduit : pas d'animation, la barre seule pendant le chargement.
 * L'attribut data-intro de <html> pilote l'affichage (globals.css) ; « play » est posé avant le premier rendu par
 * introScript, dans le layout du site.
 */

const storageKey = "sowd-intro";
/** Script en ligne : intro à jouer si l'onglet ne l'a pas encore vue, sinon attente des visuels de la page. */
export const introScript = `try{document.documentElement.setAttribute("data-intro",sessionStorage.getItem("${storageKey}")?"wait":"play")}catch(e){}`;

/** Rejoue l'intro (raccourci de développement) : l'onglet l'oublie et la page se recharge. */
export function replayIntro() {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {}
  window.location.reload();
}

type IntroState = "play" | "reveal" | "wait" | "loading";
const setIntro = (state: IntroState | null) => {
  if (state) document.documentElement.setAttribute("data-intro", state);
  else document.documentElement.removeAttribute("data-intro");
};

/** Suit les visuels du premier écran du contenu et les polices. */
function trackFirstScreen(onProgress: (value: number) => void, onReady: () => void) {
  const main = document.querySelector("main") ?? document.body;
  return trackVisuals(main, { onProgress, onReady, withFonts: true });
}

/** Rectangle de la cible visible (logo de l'en-tête, logotype de l'accueil en mobile). */
function visibleTarget(name: "mark" | "type") {
  for (const node of document.querySelectorAll(`[data-intro-target="${name}"]`)) {
    const box = node.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) return box;
  }
  return null;
}

export function SiteIntro() {
  const pathname = usePathname();
  const svgRef = useRef<SVGSVGElement>(null);
  const loadedRef = useRef(false);
  const resumeRef = useRef<(() => void) | null>(null);
  /** Intro en attente : reprise de la suite, dès la page chargée. */
  const introResumeRef = useRef<(() => void) | null>(null);
  const [loopFading, setLoopFading] = useState(false);
  const lastPathRef = useRef(pathname);
  const [progress, setProgress] = useState(0);
  const [loop, setLoop] = useState<{ x: number; y: number; size: number } | null>(null);
  const [barHidden, setBarHidden] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [blocking, setBlocking] = useState(false);
  /* La barre ne recule jamais : nouvelle barre à chaque chargement. */
  const [run, setRun] = useState(0);

  /** Apparition groupée de la page, puis fin du chargement. */
  const reveal = useCallback((onEnd?: () => void) => {
    setIntro("reveal");
    setBarHidden(true);
    setRevealing(true);
    setBlocking(false);
    window.setTimeout(
      () => {
        setIntro(null);
        setRevealing(false);
        setLoop(null);
        setBarHidden(false);
        setProgress(0);
        setRun((value) => value + 1);
        onEnd?.();
      },
      tokenDuration(document.documentElement, "--site-intro-reveal-duration"),
    );
  }, []);

  // Nouvelle visite : intro.
  useEffect(() => {
    if (document.documentElement.getAttribute("data-intro") !== "play") return;
    const markSeen = () => {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {}
    };
    loadedRef.current = false;
    const reduced = window.matchMedia(reducedMotionQuery).matches;
    const tracker = trackFirstScreen(setProgress, () => {
      loadedRef.current = true;
      if (reduced) reveal(markSeen);
      else if (introResumeRef.current) {
        // Boucle « 01 » en cours : elle s'efface, puis le logo au repos revient (demandes de l'utilisateur).
        const resume = introResumeRef.current;
        introResumeRef.current = null;
        resume();
      }
    });
    if (reduced) {
      setIntro("loading");
      return () => tracker.stop();
    }
    const svg = svgRef.current;
    if (!svg) return () => tracker.stop();
    setBlocking(true);
    const engine = createIntroEngine(svg, {
      isLoaded: () => loadedRef.current,
      getTargets: () => ({ mark: visibleTarget("mark"), type: visibleTarget("type") }),
      onWait: (logo) => {
        // La boucle s'efface, un court temps sans logo, puis le logo au repos revient en fondu et la suite démarre.
        introResumeRef.current = () => {
          const root = document.documentElement;
          setLoopFading(true);
          window.setTimeout(
            () => {
              setLoop(null);
              setLoopFading(false);
              engine.resume();
            },
            tokenDuration(root, "--site-intro-loop-fade") + tokenDuration(root, "--site-intro-loop-gap"),
          );
        };
        setLoop(logo);
      },
      onFlight: () => setBarHidden(true),
      onLanded: () => {
        svg.innerHTML = "";
        reveal(markSeen);
      },
    });
    engine.start();
    return () => {
      engine.destroy();
      tracker.stop();
    };
  }, [reveal]);

  /**
   * Attente des visuels du premier écran : contenu masqué, puis au-delà de --site-intro-nav-threshold, boucle du logo
   * « 01 » et barre de progression. Renvoie l'arrêt (la page suivante reprend alors la main).
   */
  const waitForPage = useCallback(() => {
    loadedRef.current = false;
    let shown = false;
    let timer = 0;
    const reduced = window.matchMedia(reducedMotionQuery).matches;
    const tracker = trackFirstScreen(setProgress, () => {
      loadedRef.current = true;
      window.clearTimeout(timer);
      if (!shown) setIntro(null);
      else if (reduced) reveal();
    });
    if (!tracker.pending) {
      tracker.stop();
      setIntro(null);
      return () => {};
    }
    setIntro("wait");
    timer = window.setTimeout(
      () => {
        if (loadedRef.current) return;
        shown = true;
        setIntro("loading");
        if (reduced) return;
        resumeRef.current = () => reveal();
        setLoop({ x: window.innerWidth / 2, y: window.innerHeight / 2, size: introLogoSize() });
      },
      tokenDuration(document.documentElement, "--site-intro-nav-threshold"),
    );
    return () => {
      window.clearTimeout(timer);
      tracker.stop();
      setLoop(null);
    };
  }, [reveal]);

  // Chargement direct d'une page une fois l'intro vue (attente posée par introScript avant le premier rendu),
  // puis chaque changement de page, même pendant une attente en cours.
  useLayoutEffect(() => {
    const state = document.documentElement.getAttribute("data-intro");
    if (state === "play" || state === "reveal") return;
    const waiting = state === "wait" || state === "loading";
    // Même page (premier rendu sans attente, effets rejoués en développement) : rien à attendre.
    if (lastPathRef.current === pathname && !waiting) return;
    lastPathRef.current = pathname;
    return waitForPage();
  }, [pathname, waitForPage]);

  // Fin d'une boucle d'attente : la suite reprend si la page est chargée.
  const onLoopEnd = () => {
    if (loadedRef.current) resumeRef.current?.();
  };

  return (
    <div className="site-intro" aria-hidden={!loop && !blocking}>
      {/* Fond : sous l'en-tête (z-10), au-dessus du contenu. */}
      <div
        className={`fixed inset-0 z-9 bg-neutral-50 transition-opacity duration-(--site-intro-reveal-duration) ease-(--motion-ease-out) ${
          revealing ? "opacity-0" : "opacity-100"
        }`}
      />
      {loop && (
        <div
          className={`fixed z-9 transition-opacity duration-(--site-intro-loop-fade) ease-(--motion-ease-out) ${
            loopFading ? "opacity-0" : "opacity-100"
          }`}
          style={{ left: loop.x - loop.size / 2, top: loop.y - loop.size / 2, width: loop.size, height: loop.size }}
        >
          <ShowreelLogo phase="loop" onLoopEnd={onLoopEnd} className="size-full fill-shape-neutral-black!" />
        </div>
      )}
      <svg
        ref={svgRef}
        aria-hidden
        className={`fixed inset-0 z-50 size-full fill-shape-neutral-black ${blocking ? "" : "pointer-events-none"}`}
      />
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-opacity duration-(--motion-duration-base) ease-(--motion-ease-out) ${
          barHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        <ProgressBar key={run} value={progress} color="black" aria-label={commun.chargement_progression} />
      </div>
    </div>
  );
}
