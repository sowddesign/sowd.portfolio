import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { SiteIntro, introScript } from "@/components/ui/SiteIntro";
import { AnchorScroll } from "./AnchorScroll";
import { CenterReveal } from "./CenterReveal";

/* Pages du site : en-tête et pied de page communs, chargement du site (le UI kit reste hors de ce groupe).
   Le script en ligne pose l'intro sur <html> avant le premier rendu (nouvelle visite). */

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <PageHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <PageFooter />
      <AnchorScroll />
      <CenterReveal />
      <SiteIntro />
    </>
  );
}
