"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { commun } from "@/content/texts";
import { PlayManager } from "../PlayManager";
import { ProgressBar } from "../ProgressBar";
import { TimeManager } from "../TimeManager";
import {
  playEvents,
  readMuted,
  readPlaying,
  readProgress,
  readVolume,
  timeEvents,
  useMediaValue,
  volumeEvents,
} from "../use-media-value";

/*
 * Lecteur d'un extrait audio — composant Figma « audioManager » (fichier content, node 6297:14986).
 * Affichage Figma, logique du videoManager (décision de l'utilisateur) :
 * - rangée de --audio-manager-height (button-size/sm) : lecture / pause (playManager), barre de lecture qui remplit
 *   l'espace, volume (TimeManager, comme la vidéo) ; boutons de 40 × 40 et icônes icon/md comme la vidéo ;
 * - couleurs : miroir en noir des contrôles vidéo (décision de l'utilisateur) : boutons iconButton black / tertiary,
 *   barre de 4 px, fond faded/black/40 %, lecture progressBar black (liquide), au survol l'écart entre la lecture et
 *   le curseur en shape/brand/darkest ;
 * - rond de lecture (12, shape/neutral/black) : visible dès que l'extrait est lancé, masqué avant la première lecture
 *   et une fois l'extrait terminé (décision de l'utilisateur) ;
 * - légende sous la rangée (spacing/sm) : captionText/small/italic.
 * Texte au curseur : celui de la vidéo (décision de l'utilisateur). Clavier : flèches ±5 s, Début, Fin.
 * Le composant prend toute la largeur de son parent (fill).
 */

export type AudioManagerProps = {
  /** Fichier audio. */
  src: string;
  /** Légende sous le lecteur (ex. « Margaux, à 08:58 de l'entretien – 13 s »). */
  caption: string;
  className?: string;
};

/* Pas des flèches du clavier sur la barre de lecture, en secondes (comme la vidéo). */
const keyboardSeek = 5;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function AudioManager({ src, caption, className = "" }: AudioManagerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRef = useRef<HTMLSpanElement>(null);
  const seeking = useRef(false);
  const [clicked, setClicked] = useState(false);
  /* Position survolée sur la barre de lecture (souris), de 0 à 1. */
  const [preview, setPreview] = useState<number | null>(null);
  /* Extrait lancé et pas encore terminé : le rond de lecture est visible. */
  const [started, setStarted] = useState(false);

  const playing = useMediaValue(audioRef, playEvents, readPlaying, false);
  const volume = useMediaValue(audioRef, volumeEvents, readVolume, 1);
  const muted = useMediaValue(audioRef, volumeEvents, readMuted, false);
  const progress = useMediaValue(audioRef, timeEvents, readProgress, 0, true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setStarted(true);
    const onEnded = () => setStarted(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused || audio.ended) void audio.play();
    else audio.pause();
  };

  const seekTo = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !(audio.duration > 0)) return;
    audio.currentTime = clamp(ratio) * audio.duration;
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

  const onSeekUp = () => {
    seeking.current = false;
    setClicked(false);
  };

  const onSeekKey = (event: KeyboardEvent<HTMLSpanElement>) => {
    const audio = audioRef.current;
    if (!audio || !(audio.duration > 0)) return;
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (event.key in steps) seekTo((audio.currentTime + steps[event.key] * keyboardSeek) / audio.duration);
    else if (event.key === "Home") seekTo(0);
    else if (event.key === "End") seekTo(1);
    else return;
    event.preventDefault();
  };

  return (
    <div className={`flex w-full flex-col gap-sm ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex h-(--audio-manager-height) w-full items-center">
        <PlayManager
          state={playing ? "pause" : "play"}
          label={playing ? commun.audio_pause : commun.audio_lecture}
          tone="black"
          onClick={togglePlay}
        />
        <span ref={seekRef} className="relative h-(--audio-manager-bar-height) min-w-0 flex-1">
          <span aria-hidden className="absolute inset-0 bg-faded-black-40" />
          <ProgressBar
            value={progress}
            color="black"
            backward
            immediate={clicked}
            aria-hidden
            className="absolute! inset-0 h-full!"
          />
          {!clicked && preview !== null && (
            <span
              aria-hidden
              className="absolute inset-y-0 bg-shape-brand-darkest"
              style={{
                left: `${Math.min(progress, preview) * 100}%`,
                width: `${Math.abs(preview - progress) * 100}%`,
              }}
            />
          )}
          {started && (
            <span
              aria-hidden
              className="absolute top-1/2 size-(--audio-manager-handle-size) -translate-x-1/2 -translate-y-1/2 rounded-rounded bg-shape-neutral-black"
              // Gardé dans la barre aux extrémités : toujours entier (comme la vidéo).
              style={{
                left: `clamp(var(--audio-manager-handle-size) / 2, ${progress * 100}%, 100% - var(--audio-manager-handle-size) / 2)`,
              }}
            />
          )}
          {/* Zone cliquable : la barre et une marge au-dessus et au-dessous. */}
          <span
            role="slider"
            tabIndex={0}
            aria-label={commun.audio_progression}
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
            className="absolute inset-x-0 -inset-y-(--audio-manager-seek-zone) cursor-pointer touch-none outline-none"
          />
        </span>
        <TimeManager
          tone="black"
          volume={volume}
          muted={muted}
          onVolumeChange={(value) => {
            if (audioRef.current) audioRef.current.volume = value;
          }}
          onMutedChange={(value) => {
            if (audioRef.current) audioRef.current.muted = value;
          }}
        />
      </div>
      <p className="type-caption-small-italic text-pretty">{caption}</p>
    </div>
  );
}
