import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Accès au serveur de dev depuis le mobile (adresse Wi-Fi du PC).
  allowedDevOrigins: ["192.168.1.113"],
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
