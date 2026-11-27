"use client";

import { useRef, type CSSProperties } from "react";
import { VideoManager } from "@/components/ui/VideoManager";

/*
 * Vidéo dans une page projet avec les contrôles du site (VideoManager, comme le showreel) :
 * cadre aux coins corner/xs et aux proportions de la vidéo ; en plein écran, la vidéo tient dans l'écran.
 */
export function ProjectVideo({ src, title, ratio, className = "" }: { src: string; title: string; ratio: string; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div
      ref={frameRef}
      style={{ "--video-ratio": ratio } as CSSProperties}
      className={`relative w-full overflow-hidden rounded-xs bg-background-neutral-black [&:fullscreen]:rounded-none [&:fullscreen>video]:aspect-auto [&:fullscreen>video]:h-full ${className}`}
    >
      <video ref={videoRef} src={src} title={title} playsInline preload="metadata" className="block aspect-(--video-ratio) w-full object-contain" />
      <VideoManager videoRef={videoRef} fullscreenRef={frameRef} className="absolute! inset-x-0 bottom-0" />
    </div>
  );
}
