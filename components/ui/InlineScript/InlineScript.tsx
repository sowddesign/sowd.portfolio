"use client";

/*
 * Script en ligne exécuté pendant la lecture du HTML, avant le premier rendu (chargement complet de la page).
 * Méthode de la doc Next (preventing-flash-before-hydration) : « text/javascript » côté serveur, « text/plain »
 * côté client, pour que React n'avertisse plus d'une balise <script> rendue au changement de page (où elle ne
 * s'exécute de toute façon pas).
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
