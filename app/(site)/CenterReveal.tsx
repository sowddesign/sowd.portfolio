"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
 * Écrans tactiles (sans survol) : le visuel de tuile projet le plus proche du centre de l'écran
 * passe en couleur — attribut data-centered sur l'élément [data-reveal] (voir ProjetHubContainer).
 * Une seule image à la fois. Pour éviter que la couleur saute entre deux images à égale distance,
 * une nouvelle image ne prend la main que si elle est plus proche d'au moins SWITCH_MARGIN (part de la hauteur d'écran).
 * Avec une souris, rien n'est marqué : le survol garde la main.
 */

const SWITCH_MARGIN = 0.1;

export function CenterReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const touch = window.matchMedia("(hover: none)");
    let current: Element | null = null;
    let frame = 0;

    const setCurrent = (next: Element | null) => {
      if (next === current) return;
      current?.removeAttribute("data-centered");
      next?.setAttribute("data-centered", "");
      current = next;
    };

    const update = () => {
      frame = 0;
      if (!touch.matches) return setCurrent(null);
      const middle = window.innerHeight / 2;
      const distance = (el: Element) => {
        const box = el.getBoundingClientRect();
        return Math.abs(box.top + box.height / 2 - middle);
      };
      let closest: Element | null = null;
      let closestDistance = Infinity;
      for (const el of document.querySelectorAll("[data-reveal]")) {
        const d = distance(el);
        if (d < closestDistance) [closest, closestDistance] = [el, d];
      }
      const keep = current?.isConnected && distance(current) - closestDistance < window.innerHeight * SWITCH_MARGIN;
      setCurrent(keep ? current : closest);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    touch.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      touch.removeEventListener("change", schedule);
      setCurrent(null);
    };
  }, [pathname]);

  return null;
}
