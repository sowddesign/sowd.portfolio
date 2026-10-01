import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Merriweather_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tom Lamy | sowd.design",
  description: "Portfolio — Game et UX/UI Designer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${merriweatherSans.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
