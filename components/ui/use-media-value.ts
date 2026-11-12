"use client";

import { useCallback, useSyncExternalStore, type RefObject } from "react";

/* Lecture d'un élément vidéo ou audio, partagée par VideoManager et AudioManager. */

export const playEvents = ["play", "pause", "ended"];
export const volumeEvents = ["volumechange"];
export const timeEvents = ["timeupdate", "seeking", "seeked", "loadedmetadata", "durationchange"];

/** Valeur lue sur la vidéo ou l'audio, mise à jour à chaque évènement (et à chaque image pendant la lecture si frame). */
export function useMediaValue<T>(
  mediaRef: RefObject<HTMLMediaElement | null>,
  events: string[],
  read: (media: HTMLMediaElement) => T,
  fallback: T,
  frame = false,
) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const media = mediaRef.current;
      if (!media) return () => {};
      events.forEach((name) => media.addEventListener(name, notify));
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
      media.addEventListener("play", start);
      media.addEventListener("pause", stop);
      if (!media.paused) start();
      return () => {
        events.forEach((name) => media.removeEventListener(name, notify));
        media.removeEventListener("play", start);
        media.removeEventListener("pause", stop);
        stop();
      };
    },
    [mediaRef, events, frame],
  );
  return useSyncExternalStore(
    subscribe,
    () => (mediaRef.current ? read(mediaRef.current) : fallback),
    () => fallback,
  );
}

export const readPlaying = (media: HTMLMediaElement) => !media.paused && !media.ended;
export const readVolume = (media: HTMLMediaElement) => media.volume;
export const readMuted = (media: HTMLMediaElement) => media.muted;
export const readProgress = (media: HTMLMediaElement) => (media.duration > 0 ? media.currentTime / media.duration : 0);
