import Image from "next/image";
import { PageHead } from "@/components/ui/PageHead";
import { ProjetHubContainer } from "@/components/ui/ProjetHubContainer";
import { getProjects, type Project } from "@/lib/projects";

/*
 * Page Projets — frame Figma « body/projetsListe » (fichier portfolio, node 4932:83544).
 * Le projet le plus récent en tête (tuile new), puis les autres (tuiles default) :
 * une colonne en mobile et tablette, deux en desktop.
 * Marges latérales : spacing/md en mobile, spacing/lg à partir de la tablette.
 */

function ProjectTile({ project, sizes }: { project: Project; sizes: string }) {
  return (
    <ProjetHubContainer
      layout={project.layout}
      title={project.title}
      type={project.type}
      year={project.year}
      tags={project.tags}
      isNew={project.isNew}
      image={<Image src={project.image} alt="" fill sizes={sizes} className="object-cover" />}
      href={project.href}
    />
  );
}

export default function Projects() {
  const [latest, ...others] = getProjects();

  return (
    <div className="flex w-full flex-col bg-background-neutral-black">
      {/* Content Container */}
      <div className="flex w-full flex-col gap-lg">
        <div className="flex w-full flex-col">
          <PageHead title="Projets" />
          <PageHead type="H2" details="Découvrir :" title="le plus récent" />
        </div>
        {latest && (
          <div className="w-full px-md tablet:px-lg">
            <ProjectTile project={latest} sizes="100vw" />
          </div>
        )}
      </div>

      {/* appliquerContent */}
      {others.length > 0 && (
        <div className="flex w-full flex-col gap-xxl pt-xxl">
          <PageHead type="H2" details="En  découvrir :" title="d’autres" />
          {/* Project List : gouttière desktop = --grid-spacing (24px), écart vertical spacing/xxl. */}
          <div className="flex w-full flex-col gap-xxl px-md tablet:px-lg desktop:grid desktop:grid-cols-2 desktop:gap-x-(--grid-spacing)">
            {others.map((project) => (
              <ProjectTile key={project.slug} project={project} sizes="(width > 1300px) 50vw, 100vw" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
