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
      // data-intro est posé par le script en ligne du layout du site avant l'hydratation.
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${merriweatherSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {KitShortcut && <KitShortcut />}
      </body>
    </html>
  );
}
