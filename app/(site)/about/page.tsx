import { aPropos } from "@/content/texts";
import { AboutContent } from "@/components/ui/AboutContent";
import { FaqContainer } from "@/components/ui/FaqContainer";
import { HeadPageContainer } from "@/components/ui/HeadPageContainer";
import { PageHead } from "@/components/ui/PageHead";
import { getPresentation } from "@/lib/about";
import { getFaq } from "@/lib/faq";

/*
 * Page À propos (maquette body/about) : titre pageHead H1, en-tête avec photo (headPage Container), présentation (About Content),
 * puis foire aux questions (faqContainer).
 * Textes, photo et tags : content/pages/a-propos.md ; présentation : content/pages/a-propos/presentation.md ;
 * questions : content/pages/a-propos/faq/.
 */

export default function About() {
  return (
    <div className="flex w-full flex-col bg-background-neutral-black">
      <PageHead title={aPropos.titre} />
      <HeadPageContainer
        headingLevel="h2"
        details={aPropos.entete_details}
        title={aPropos.entete_titre}
        image={`/about/${aPropos.entete_image}`}
        tags={aPropos.entete_tags}
      />
      <AboutContent blocks={getPresentation()} />
      <FaqContainer title={aPropos.faq_titre} items={getFaq()} />
    </div>
  );
}
