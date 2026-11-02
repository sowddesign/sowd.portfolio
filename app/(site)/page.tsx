import { accueil } from "@/content/texts";
import { SectionDemarcheUX } from "@/components/ui/SectionDemarcheUX";
import { PagePlaceholder } from "./PagePlaceholder";

export default function Home() {
  return (
    <>
      {/* Provisoire : contenu au-dessus de la démarche UX (à venir). */}
      <PagePlaceholder title={accueil.titre} anchors={[{ id: "showreel", label: accueil.showreel }]} />
      <SectionDemarcheUX id="ux-process" className="bg-background-neutral-black" />
    </>
  );
}
