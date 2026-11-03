"use client";

import { useRef } from "react";
import { VideoManager } from "@/components/ui/VideoManager";

/* Démo UI kit : contrôles branchés sur la vidéo du showreel ; en plein écran, la vidéo tient dans l'écran. */
export function VideoControlsDemo() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div
      ref={frameRef}
      className="relative w-full bg-background-neutral-black [&:fullscreen>video]:aspect-auto [&:fullscreen>video]:h-full [&:fullscreen>video]:object-contain"
    >
      <video ref={videoRef} src="/showreel/showreel.mp4" muted playsInline className="block aspect-video w-full" />
      <VideoManager videoRef={videoRef} fullscreenRef={frameRef} className="absolute! inset-x-0 bottom-0" />
    </div>
  );
}
