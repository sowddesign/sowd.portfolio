import type { Metadata } from "next";
import { Merriweather_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { commun } from "@/content/texts";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
});

/*
 * Épaisseur réelle des traits (bordures de 1px) : le navigateur l'arrondit au pixel d'écran (ex. 0,667 px à 150 %).
 * Mesurée avant le premier rendu et à chaque changement de zoom, publiée dans --divider-width
 * pour les hauteurs qui comptent un trait (tuiles de la méthode, image d'en-tête).
 */
const dividerScript = `(function(){var r=document.documentElement;function m(){var p=document.createElement("div");p.style.cssText="position:absolute;visibility:hidden;border-top:1px solid";r.appendChild(p);r.style.setProperty("--divider-width",getComputedStyle(p).borderTopWidth);p.remove();matchMedia("(resolution: "+devicePixelRatio+"dppx)").addEventListener("change",m,{once:true})}m()})()`;

export const metadata: Metadata = {
  title: commun.site_titre,
  description: commun.site_description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /* Raccourci vers l'UI kit : importé en développement seulement, pour qu'il ne soit pas dans le build final. */
  const KitShortcut =
    process.env.NODE_ENV === "development" ? (await import("./ui-kit/KitShortcut")).KitShortcut : null;
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      // data-intro (layout du site) et --divider-width (ci-dessous) sont posés par des scripts en ligne avant l'hydratation.
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${merriweatherSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: dividerScript }} />
        {children}
        {KitShortcut && <KitShortcut />}
      </body>
    </html>
  );
}
