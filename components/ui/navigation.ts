"use client";

import { usePathname } from "next/navigation";
import { pageHrefs, type PageKey } from "./pages";

/*
 * Règle de page active partagée par le header et le menu de navigation.
 * Les boutons passent en color="active" sur leur page ; les ancres (showreel, démarche UX) ne le sont jamais.
 */

export { pageHrefs, type PageKey };

/** Page active : forcée par la prop (UI kit), sinon déduite de l'URL. */
export function useActivePage(activePage?: PageKey): PageKey | undefined {
  const pathname = usePathname();
  if (activePage) return activePage;
  return (Object.keys(pageHrefs) as PageKey[]).find((key) =>
    key === "home" ? pathname === "/" : pathname === pageHrefs[key] || pathname.startsWith(`${pageHrefs[key]}/`),
  );
}
