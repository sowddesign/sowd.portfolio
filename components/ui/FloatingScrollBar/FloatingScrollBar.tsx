"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { tokenDuration } from "../token-duration";

/*
 * Petite barre de défilement flottante (demande de l'utilisateur, remplace la barre native « discrète ») : sans piste,
 * le curseur flotte au-dessus du contenu, contre le bord droit de la zone qui défile.
 *  - visible quand le pointeur passe à moins de --scroll-bar-float-hover-zone de la piste (invisible, toute la hauteur),
 *    de tous les côtés (demande de l'utilisateur), ou
 *    pendant le défilement, puis masqué --scroll-bar-float-hide-delay après le dernier
 *    défilement (fondu --motion-duration-base, --motion-ease-out) ;
 *  - curseur --scroll-bar-discreet-thumb de large, à --scroll-bar-discreet-gap du bord, arrondi
 *    --scroll-bar-discreet-corner, hauteur proportionnelle au contenu visible (--scroll-bar-float-min au moins) ;
 *  - couleurs de la grande barre : shape/neutral/black, survol shape/brand/bright, appui shape/brand/somber ;
 *  - le curseur se glisse comme une barre native ; un clic sur la piste (invisible, largeur de la barre) fait défiler
 *    jusqu'à la position du clic (demande de l'utilisateur). Piste et curseur réactivent le pointeur (pointer-events
 *    auto) : le parent peut l'avoir coupé.
 * La zone qui défile masque sa barre native (classe scroll-bar-none) ; son parent sert de repère (position relative).
 */

type Thumb = { left: number; top: number; height: number; gap: number; trackTop: number; trackHeight: number };

export function FloatingScrollBar({ target }: { target: RefObject<HTMLElement | null> }) {
  const [thumb, setThumb] = useState<Thumb | null>(null);
  const [hover, setHover] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; scrollTop: number; ratio: number } | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const px = (token: string) => {
      const probe = document.createElement("div");
      probe.style.cssText = `position:absolute;visibility:hidden;width:var(${token})`;
      document.body.append(probe);
      const value = probe.getBoundingClientRect().width;
      probe.remove();
      return value;
    };
    const gap = px("--scroll-bar-discreet-gap");
    const width = px("--scroll-bar-discreet-thumb");
    const min = px("--scroll-bar-float-min");
    const hideDelay = tokenDuration(document.documentElement, "--scroll-bar-float-hide-delay");
    const zone = px("--scroll-bar-float-hover-zone");

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight, offsetTop, offsetLeft, offsetWidth } = el;
      if (scrollHeight <= clientHeight + 1) {
        setThumb(null);
        return;
      }
      const track = clientHeight - 2 * gap;
      const height = Math.max(min, (track * clientHeight) / scrollHeight);
      const top = offsetTop + gap + (scrollTop / (scrollHeight - clientHeight)) * (track - height);
      setThumb({
        left: offsetLeft + offsetWidth - gap - width,
        top,
        height,
        gap,
        trackTop: offsetTop,
        trackHeight: clientHeight,
      });
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scroll = () => {
      update();
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), hideDelay);
    };
    // Survol : pointeur à moins de --scroll-bar-float-hover-zone de la piste invisible (toute la hauteur de la zone
    // qui défile, à la largeur du curseur), de tous les côtés (demande de l'utilisateur).
    const near = (event: PointerEvent) => {
      const t = thumbRef.current?.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      setHover(
        !!t &&
          event.clientX >= t.left - zone &&
          event.clientX <= t.right + zone &&
          event.clientY >= box.top - zone &&
          event.clientY <= box.bottom + zone,
      );
    };
    const away = () => setHover(false);
    update();
    el.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointermove", near, { passive: true });
    document.documentElement.addEventListener("pointerleave", away);
    // Taille de la zone et de son contenu (qui peut changer après le premier rendu : images, polices, données).
    const observer = new ResizeObserver(update);
    const watch = () => {
      observer.observe(el);
      for (const child of el.children) observer.observe(child);
    };
    watch();
    const mutations = new MutationObserver(() => {
      watch();
      update();
    });
    mutations.observe(el, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", scroll);
      window.removeEventListener("pointermove", near);
      document.documentElement.removeEventListener("pointerleave", away);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [target]);

  if (!thumb) return null;

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = target.current;
    if (!el) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const track = el.clientHeight - thumb.height;
    drag.current = { y: event.clientY, scrollTop: el.scrollTop, ratio: (el.scrollHeight - el.clientHeight) / track };
    setDragging(true);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = target.current;
    if (!el || !drag.current) return;
    el.scrollTo({ top: drag.current.scrollTop + (event.clientY - drag.current.y) * drag.current.ratio });
  };
  const up = () => {
    drag.current = null;
    setDragging(false);
  };

  /** Piste : défilement jusqu'à la position du clic, le curseur centré sur elle (demande de l'utilisateur). */
  const jump = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = target.current;
    if (!el || event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    const track = el.clientHeight - 2 * thumb.gap - thumb.height;
    const offset = event.clientY - box.top - thumb.gap - thumb.height / 2;
    const ratio = track > 0 ? Math.min(1, Math.max(0, offset / track)) : 0;
    el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: "smooth" });
  };
  const visible = hover || scrolling || dragging;

  return (
    <>
      <div
        aria-hidden
        onPointerDown={jump}
        className={`absolute z-10 w-[calc(var(--scroll-bar-discreet-thumb)+2*var(--scroll-bar-discreet-gap))] ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ left: thumb.left - thumb.gap, top: thumb.trackTop, height: thumb.trackHeight }}
      />
      <div
        ref={thumbRef}
        aria-hidden
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className={[
          "absolute z-10 w-(--scroll-bar-discreet-thumb) cursor-default touch-none rounded-(--scroll-bar-discreet-corner)",
          "bg-shape-neutral-black hover:bg-shape-brand-bright active:bg-shape-brand-somber",
          "transition-opacity duration-(--motion-duration-base) ease-(--motion-ease-out) motion-reduce:transition-none",
          visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        style={{ left: thumb.left, top: thumb.top, height: thumb.height }}
      />
    </>
  );
}
