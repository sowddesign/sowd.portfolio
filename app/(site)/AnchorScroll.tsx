"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/*
 * Ancre visée depuis une autre page (ex. /projects → /#ux-process) : Next.js y saute sans animation.
 * Avant l'affichage, on repart du haut de la nouvelle page puis on défile en fluide jusqu'à l'ancre.
 * Placé après les pages dans le layout : son effet passe après le défilement de Next.js.
 * Ancre de la page courante : déjà fluide (scroll-behavior de <html>), rien à faire ici.
 */

export function AnchorScroll() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    target.scrollIntoView({ behavior: "smooth" });
  }, [pathname]);

  return null;
}
