/*
 * Pages du site, partagées par le header, le menu et le pied de page.
 * Module sans "use client" : utilisable aussi bien côté serveur que côté client.
 */

export type PageKey = "home" | "projects" | "about" | "contact";

export const pageHrefs: Record<PageKey, string> = {
  home: "/",
  projects: "/projects",
  about: "/about",
  contact: "/contact",
};
