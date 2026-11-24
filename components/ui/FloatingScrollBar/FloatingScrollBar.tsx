"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { tokenDuration } from "../token-duration";

/*
 * Petite barre de défilement flottante (demande de l'utilisateur, remplace la barre native « discrète ») : sans piste,
 * le curseur flotte au-dessus du contenu, contre le bord droit de la zone qui défile.
 *  - visible au survol de la zone ou pendant le défilement, puis masqué --scroll-bar-float-hide-delay après le dernier
 *    défilement (fondu --motion-duration-base, --motion-ease-out) ;
 *  - curseur --scroll-bar-discreet-thumb de large, à --scroll-bar-discreet-gap du bord, arrondi
 *    --scroll-bar-discreet-corner, hauteur proportionnelle au contenu visible (--scroll-bar-float-min au moins) ;
 *  - couleurs de la grande barre : shape/neutral/black, survol shape/brand/bright, appui shape/brand/somber ;
 *  - le curseur se glisse comme une barre native.
 * La zone qui défile masque sa barre native (classe scroll-bar-none) ; son parent sert de repère (position relative).
 */

type Thumb = { left: number; top: number; height: number };

export function FloatingScrollBar({ target }: { target: RefObject<HTMLElement | null> }) {
  const [thumb, setThumb] = useState<Thumb | null>(null);
  const [hover, setHover] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; scrollTop: number; ratio: number } | null>(null);

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

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight, offsetTop, offsetLeft, offsetWidth } = el;
      if (scrollHeight <= clientHeight + 1) {
        setThumb(null);
        return;
      }
      const track = clientHeight - 2 * gap;
      const height = Math.max(min, (track * clientHeight) / scrollHeight);
      const top = offsetTop + gap + (scrollTop / (scrollHeight - clientHeight)) * (track - height);
      setThumb({ left: offsetLeft + offsetWidth - gap - width, top, height });
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scroll = () => {
      update();
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), hideDelay);
    };
    const enter = () => setHover(true);
    const leave = () => setHover(false);
    update();
    el.addEventListener("scroll", scroll, { passive: true });
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", scroll);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      observer.disconnect();
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

  return (
    <div
      aria-hidden
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={[
        "absolute z-10 w-(--scroll-bar-discreet-thumb) cursor-default touch-none rounded-(--scroll-bar-discreet-corner)",
        "bg-shape-neutral-black hover:bg-shape-brand-bright active:bg-shape-brand-somber",
        "transition-opacity duration-(--motion-duration-base) ease-(--motion-ease-out) motion-reduce:transition-none",
        hover || scrolling || dragging ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      style={{ left: thumb.left, top: thumb.top, height: thumb.height }}
    />
  );
}
