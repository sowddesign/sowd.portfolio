import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HeadPageContainer } from "@/components/ui/HeadPageContainer";
import { getProjects } from "@/lib/projects";

/*
 * Page d'un projet (/projects/<slug>), générée depuis content/projects/<slug>/index.md.
 * Pour l'instant : en-tête avec photo (headPage Container) — détails = type, titre = title,
 * photo = image, tags = tags. Le reste de la page viendra avec sa maquette.
 * params est lu dans un enfant sous <Suspense> (Partial Prefetching de Next 16) : le cadre de la page
 * reste commun à tous les projets ; sans maquette de chargement, rien ne s'affiche en attendant.
 */

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

async function ProjectHeader({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  const { slug } = await params;
  const project = getProjects().find((item) => item.slug === slug);
  if (!project) notFound();

  return <HeadPageContainer details={project.type} title={project.title} image={project.image} tags={project.tags} />;
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <div className="flex w-full flex-col bg-background-neutral-black">
      <Suspense>
        <ProjectHeader params={params} />
      </Suspense>
    </div>
  );
}
