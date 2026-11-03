"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { commun } from "@/content/texts";
import { cursorHidden } from "../CursorLabel";
import { PlayManager, VideoIconButton } from "../PlayManager";
import { TimeManager } from "../TimeManager";
import { touchQuery, useMediaQuery } from "../use-media-query";

/*
 * Contrôles de la vidéo — composant Figma « videoManager » (fichier portfolio, node 5725:32544).
 * Variantes Figma → état interne :
 * - default : seule la barre de lecture (1 px) est visible ;
 * - Hovered : survol de la zone (64 de haut, décision de l'utilisateur ; Figma button-size/sm) ou focus clavier : fond en
 *   dégradé, lecture / pause (playManager) et volume (TimeManager du projet, demande de l'utilisateur) à gauche,
 *   plein écran à droite, barre de lecture de 4 px ;
 * - clicked : appui sur la barre de lecture : rond de 12 au niveau de lecture ; glisser déplace la lecture.
 * Barre de lecture en hovered et clicked : fond faded/white/40 % jusqu'au bout (demande de l'utilisateur) ; au survol
 * de la barre, l'écart entre la lecture et le curseur en shape/brand/darkest (choix de l'utilisateur).
 * Souris : clic simple sur la vidéo → lecture / pause, double clic → plein écran, aussi en plein écran.
 * Tactile : barre d'outils affichée au toucher, appui long → lecture / pause, double appui → plein écran.
 * Vidéo sortie de l'écran en défilant : mise en pause.
 * Inactivité : après --video-manager-idle sans mouvement, appui ni touche, même sous la souris, la barre disparaît en
 * fondu (--video-manager-fade-out) ; elle revient en fondu plus rapide (--video-manager-fade-in).
 * Le composant prend toute la largeur de son parent (fill).
 * Tous les boutons font 40 × 40 (décision de l'utilisateur). Plein écran : « Agrandir » puis « Fermer » (icône X),
 * comme pour les photos (demande de l'utilisateur). Barre de lecture simple, sans animation (demande de l'utilisateur).
 * Passage de default à Hovered sans animation (rien dans Figma).
 */

export type VideoManagerProps = {
  /** Vidéo pilotée par les contrôles. */
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Bloc affiché en plein écran (vidéo et contrôles). */
  fullscreenRef: RefObject<HTMLElement | null>;
  className?: string;
};

/* Pas des flèches du clavier sur la barre de lecture, en secondes. */
const keyboardSeek = 5;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Vidéo Safari iPhone : plein écran du lecteur du système. */
type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/** Durée d'un token CSS (« 500ms » ou « 0.5s ») en millisecondes. */
function readDuration(element: Element, name: string) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
}

const playEvents = ["play", "pause", "ended"];
const volumeEvents = ["volumechange"];
const timeEvents = ["timeupdate", "seeking", "seeked", "loadedmetadata", "durationchange"];

/** Valeur lue sur la vidéo, mise à jour à chaque évènement (et à chaque image pendant la lecture si frame). */
function useVideoValue<T>(
  videoRef: RefObject<HTMLVideoElement | null>,
  events: string[],
  read: (video: HTMLVideoElement) => T,
  fallback: T,
  frame = false,
) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const video = videoRef.current;
      if (!video) return () => {};
      events.forEach((name) => video.addEventListener(name, notify));
      // Pendant la lecture : une mise à jour par image, pour une barre fluide.
      let raf = 0;
      const tick = () => {
        notify();
        raf = requestAnimationFrame(tick);
      };
      const start = () => {
        if (frame && !raf) raf = requestAnimationFrame(tick);
      };
      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
      };
      video.addEventListener("play", start);
      video.addEventListener("pause", stop);
      if (!video.paused) start();
      return () => {
        events.forEach((name) => video.removeEventListener(name, notify));
        video.removeEventListener("play", start);
        video.removeEventListener("pause", stop);
        stop();
      };
    },
    [videoRef, events, frame],
  );
  return useSyncExternalStore(
    subscribe,
    () => (videoRef.current ? read(videoRef.current) : fallback),
    () => fallback,
  );
}

const readPlaying = (video: HTMLVideoElement) => !video.paused && !video.ended;
const readVolume = (video: HTMLVideoElement) => video.volume;
const readMuted = (video: HTMLVideoElement) => video.muted;
const readProgress = (video: HTMLVideoElement) => (video.duration > 0 ? video.currentTime / video.duration : 0);

export function VideoManager({ videoRef, fullscreenRef, className = "" }: VideoManagerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLSpanElement>(null);
  const seeking = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [clicked, setClicked] = useState(false);
  /* Position survolée sur la barre de lecture (souris), de 0 à 1. */
  const [preview, setPreview] = useState<number | null>(null);

  const playing = useVideoValue(videoRef, playEvents, readPlaying, false);
  const volume = useVideoValue(videoRef, volumeEvents, readVolume, 1);
  const muted = useVideoValue(videoRef, volumeEvents, readMuted, false);
  const progress = useVideoValue(videoRef, timeEvents, readProgress, 0, true);
  const fullscreen = useSyncExternalStore(
    useCallback((notify: () => void) => {
      document.addEventListener("fullscreenchange", notify);
      return () => document.removeEventListener("fullscreenchange", notify);
    }, []),
    () => !!fullscreenRef.current && document.fullscreenElement === fullscreenRef.current,
    () => false,
  );

  // Tactile : pas de survol, la barre d'outils est toujours affichée (demande de l'utilisateur).
  const touch = useMediaQuery(touchQuery);
  // Inactivité (demande de l'utilisateur) : sans mouvement ni appui pendant --video-manager-idle, la barre
  // disparaît, même sous la souris ; elle revient au prochain mouvement, appui ou touche.
  const [awake, setAwake] = useState(true);
  const idleTimer = useRef(0);
  const wake = useCallback(() => {
    setAwake(true);
    window.clearTimeout(idleTimer.current);
    const root = rootRef.current;
    if (!root) return;
    idleTimer.current = window.setTimeout(() => setAwake(false), readDuration(root, "--video-manager-idle"));
  }, []);
  // À l'apparition (après le bouton Play), la barre reste visible le temps d'inactivité.
  useEffect(() => {
    const root = rootRef.current;
    if (root) idleTimer.current = window.setTimeout(() => setAwake(false), readDuration(root, "--video-manager-idle"));
    return () => window.clearTimeout(idleTimer.current);
  }, []);
  const shown = clicked || ((touch || hovered || focused) && awake);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) void video.play();
    else video.pause();
  };

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const element = fullscreenRef.current;
    if (element?.requestFullscreen) void element.requestFullscreen();
    // iPhone : seul le lecteur du système passe en plein écran.
    else (videoRef.current as WebkitVideo | null)?.webkitEnterFullscreen?.();
  }, [fullscreenRef, videoRef]);

  // Souris (desktop, plein écran compris) : clic simple sur la vidéo → lecture / pause, double clic → plein écran.
  // Le double clic passe aussi par deux clics simples : la lecture revient à son état (demande de l'utilisateur).
  // Tactile : appui long (--video-manager-long-press) → lecture / pause, double appui
  // (--video-manager-double-tap entre deux appuis) → plein écran.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mouse = () => !window.matchMedia(touchQuery).matches;
    const toggle = () => {
      if (video.paused || video.ended) void video.play();
      else video.pause();
    };
    const onClick = () => mouse() && toggle();
    const onDoubleClick = () => mouse() && toggleFullscreen();

    let pressTimer = 0;
    let longPressed = false;
    let lastTap = 0;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "touch") return;
      wake();
      longPressed = false;
      pressTimer = window.setTimeout(() => {
        longPressed = true;
        toggle();
      }, readDuration(video, "--video-manager-long-press"));
    };
    const onPointerEnd = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "touch") return;
      window.clearTimeout(pressTimer);
      if (event.type !== "pointerup" || longPressed) return;
      const now = performance.now();
      if (now - lastTap <= readDuration(video, "--video-manager-double-tap")) {
        lastTap = 0;
        toggleFullscreen();
      } else lastTap = now;
    };
    // Pas de menu du système à l'appui long.
    const onContextMenu = (event: Event) => !mouse() && event.preventDefault();

    video.addEventListener("click", onClick);
    video.addEventListener("dblclick", onDoubleClick);
    video.addEventListener("pointerdown", onPointerDown);
    video.addEventListener("pointerup", onPointerEnd);
    video.addEventListener("pointercancel", onPointerEnd);
    video.addEventListener("contextmenu", onContextMenu);
    return () => {
      window.clearTimeout(pressTimer);
      video.removeEventListener("click", onClick);
      video.removeEventListener("dblclick", onDoubleClick);
      video.removeEventListener("pointerdown", onPointerDown);
      video.removeEventListener("pointerup", onPointerEnd);
      video.removeEventListener("pointercancel", onPointerEnd);
      video.removeEventListener("contextmenu", onContextMenu);
    };
  }, [videoRef, toggleFullscreen, wake]);

  // Vidéo entièrement sortie de l'écran (défilement) : mise en pause, sans reprise automatique (demande de l'utilisateur).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !video.paused && !document.fullscreenElement) video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef]);

  const seekTo = (ratio: number) => {
    const video = videoRef.current;
    if (!video || !(video.duration > 0)) return;
    video.currentTime = clamp(ratio) * video.duration;
  };

  const seekFromPointer = (clientX: number) => {
    const rect = seekRef.current?.getBoundingClientRect();
    if (rect) seekTo((clientX - rect.left) / rect.width);
  };

  const onSeekDown = (event: PointerEvent<HTMLSpanElement>) => {
    seeking.current = true;
    setClicked(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromPointer(event.clientX);
  };

  const onSeekMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (seeking.current) seekFromPointer(event.clientX);
    else if (event.pointerType === "mouse") {
      const rect = seekRef.current?.getBoundingClientRect();
      if (rect) setPreview(clamp((event.clientX - rect.left) / rect.width));
    }
  };

  const onSeekUp = (event: PointerEvent<HTMLSpanElement>) => {
    seeking.current = false;
    setClicked(false);
    // Relâché hors de la zone des contrôles : retour à default.
    const under = document.elementFromPoint(event.clientX, event.clientY);
    if (!under || !rootRef.current?.contains(under)) setHovered(false);
  };

  const onSeekKey = (event: KeyboardEvent<HTMLSpanElement>) => {
    const video = videoRef.current;
    if (!video || !(video.duration > 0)) return;
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (event.key in steps) seekTo((video.currentTime + steps[event.key] * keyboardSeek) / video.duration);
    else if (event.key === "Home") seekTo(0);
    else if (event.key === "End") seekTo(1);
    else return;
    event.preventDefault();
  };

  // Clavier : les contrôles apparaissent au focus visible.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(":focus-visible")) setFocused(true);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  // Fondu léger (demande de l'utilisateur) : arrivée rapide, départ plus lent qui finit à la fin de l'inactivité.
  const fade = [
    "transition-[opacity,height] ease-(--motion-ease-out)",
    shown ? "duration-(--video-manager-fade-in)" : "duration-(--video-manager-fade-out)",
  ].join(" ");
  const controls = `${fade} ${shown ? "" : "pointer-events-none opacity-0"}`;

  return (
    <div
      ref={rootRef}
      // Inactivité sous la souris : ni curseur ni texte de curseur (demande de l'utilisateur).
      className={`relative flex h-(--video-manager-height) w-full flex-col ${hovered && !shown ? cursorHidden : ""} ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        setHovered(true);
        wake();
      }}
      onPointerLeave={() => !seeking.current && setHovered(false)}
      onPointerMove={wake}
      onPointerDown={wake}
      onKeyDown={wake}
      onFocus={(event) => {
        wake();
        onFocus(event);
      }}
      onBlur={onBlur}
    >
      <div className="relative flex min-h-0 flex-1 items-end justify-between">
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-(image:--video-manager-background) ${fade} ${shown ? "" : "opacity-0"}`}
        />
        <div className={`relative flex items-center gap-none ${controls}`}>
          <PlayManager state={playing ? "pause" : "play"} onClick={togglePlay} hideCursorLabel={!shown} />
          <TimeManager
            hideCursorLabel={!shown}
            volume={volume}
            muted={muted}
            onVolumeChange={(value) => {
              if (videoRef.current) videoRef.current.volume = value;
            }}
            onMutedChange={(value) => {
              if (videoRef.current) videoRef.current.muted = value;
            }}
          />
        </div>
        <VideoIconButton
          icon={fullscreen ? "X" : "CornersOut"}
          label={fullscreen ? commun.video_fermer : commun.video_agrandir}
          cursorLabel={shown ? (fullscreen ? commun.curseur_video_fermer : commun.curseur_agrandir) : undefined}
          onClick={toggleFullscreen}
          className={`relative ${controls}`}
        />
      </div>

      {/* Barre de lecture : 1 px en default ; en hovered et clicked, 4 px avec fond jusqu'au bout (demande de
          l'utilisateur) ; au survol, l'écart entre la lecture et le curseur en shape/brand/darkest ; en clicked,
          rond de lecture. */}
      <span
        ref={seekRef}
        className={`relative w-full ${fade} ${shown ? "h-(--video-manager-bar-height-hovered)" : "h-(--video-manager-bar-height)"}`}
      >
        <span aria-hidden className={`absolute inset-0 bg-faded-white-40 ${fade} ${shown ? "" : "opacity-0"}`} />
        <span aria-hidden className="absolute inset-y-0 left-0 bg-shape-neutral-white" style={{ width: `${progress * 100}%` }} />
        {shown && !clicked && preview !== null && (
          <span
            aria-hidden
            className="absolute inset-y-0 bg-shape-brand-darkest"
            style={{
              left: `${Math.min(progress, preview) * 100}%`,
              width: `${Math.abs(preview - progress) * 100}%`,
            }}
          />
        )}
        {clicked && (
          <span
            aria-hidden
            className="absolute top-1/2 size-(--video-manager-handle-size) -translate-x-1/2 -translate-y-1/2 rounded-rounded bg-shape-neutral-white"
            // Gardé dans la barre aux extrémités (demande de l'utilisateur) : toujours entier.
            style={{
              left: `clamp(var(--video-manager-handle-size) / 2, ${progress * 100}%, 100% - var(--video-manager-handle-size) / 2)`,
            }}
          />
        )}
        {/* Zone cliquable : la barre et une marge au-dessus. */}
        <span
          role="slider"
          tabIndex={0}
          aria-label={commun.video_progression}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={`${Math.round(progress * 100)} %`}
          onPointerDown={onSeekDown}
          onPointerMove={onSeekMove}
          onPointerUp={onSeekUp}
          onPointerCancel={onSeekUp}
          onPointerLeave={() => setPreview(null)}
          onKeyDown={onSeekKey}
          className="absolute inset-x-0 -top-(--video-manager-seek-zone) bottom-0 cursor-pointer touch-none outline-none"
        />
      </span>
    </div>
  );
}
