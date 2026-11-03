import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Accès au serveur de dev depuis le mobile (adresse Wi-Fi du PC).
  allowedDevOrigins: ["192.168.1.113"],
  // Qualités d'image autorisées : 75 par défaut, 90 pour la photo du showreel (sol en pierre sombre, sensible à la compression).
  // Largeurs servies : celles par défaut de Next, plus 4096 (pleine largeur de la photo du showreel, pour les grands
  // écrans haute densité).
  images: { qualities: [75, 90], deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 4096] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // Textes du site : content/**/*.md → objet { clé: texte } (voir content/texts.ts).
      "*.md": {
        condition: { path: /^content\// },
        loaders: ["./scripts/texts-loader.cjs"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
