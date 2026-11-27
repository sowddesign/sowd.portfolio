import { Suspense, type ComponentType } from "react";
import { notFound } from "next/navigation";
import { HeadPageContainer } from "@/components/ui/HeadPageContainer";
import { ImageLightboxGroup } from "@/components/ui/ImageLightbox";
import { OthersProjects } from "@/components/ui/OthersProjects";
import { getProjects } from "@/lib/projects";
import { CMediaContent } from "./CMediaContent";
import { FlashInvadersContent } from "./FlashInvadersContent";

/*
 * Page d'un projet (/projects/<slug>), générée depuis content/projects/<slug>/index.md.
 * En-tête avec photo (headPage Container) — détails = type, titre = title, photo = image ; sans les tags sur la photo
 * (demande de l'utilisateur : ils sont déjà dans le contexte de la page ; ils restent sur les tuiles).
 * Contenu propre à chaque projet qui a sa maquette (CONTENTS), suivi des autres projets (othersProject).
 * Les projets sans maquette n'ont pour l'instant que l'en-tête.
 * params est lu dans un enfant sous <Suspense> (Partial Prefetching de Next 16) : le cadre de la page
 * reste commun à tous les projets ; sans maquette de chargement, rien ne s'affiche en attendant.
 */

/** Contenu de page par projet (nom du dossier dans content/projects/). */
const CONTENTS: Record<string, ComponentType> = {
  "c-media": CMediaContent,
  flashinvaders: FlashInvadersContent,
};

export function generateStaticParams() {
  return getProjects()
    .filter((project) => project.available)
    .map((project) => ({ slug: project.slug }));
}

async function ProjectBody({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  const { slug } = await params;
  const projects = getProjects();
  const project = projects.find((item) => item.slug === slug);
  if (!project || !project.available) notFound();

  const Content = CONTENTS[slug];
  return (
    <>
      <HeadPageContainer details={project.type} title={project.title} image={project.image} imageFocus={project.imageFocus} tags={[]} />
      {Content && (
        <>
          <ImageLightboxGroup>
            {/* Limite de longueur des lignes de texte (paragraphes et éléments de liste), pour toutes les pages projet. */}
            <div className="flex w-full flex-col [&_li]:max-w-(--project-text-max-width) [&_p]:max-w-(--project-text-max-width)">
              <Content />
            </div>
          </ImageLightboxGroup>
          <OthersProjects
            currentSlug={slug}
            projects={projects.map(({ slug, title, year, image, imageFocus, href, isNew, available }) => ({ slug, title, year, image, imageFocus, href, isNew, available }))}
          />
        </>
      )}
    </>
  );
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <div className="flex w-full flex-col bg-background-neutral-black">
      <Suspense>
        <ProjectBody params={params} />
      </Suspense>
    </div>
  );
}
