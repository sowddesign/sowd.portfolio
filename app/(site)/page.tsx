import { accueil } from "@/content/texts";
import { PagePlaceholder } from "./PagePlaceholder";

export default function Home() {
  return (
    <PagePlaceholder
      title={accueil.titre}
      anchors={[
        { id: "showreel", label: accueil.showreel },
        { id: "ux-process", label: accueil.demarche_ux },
      ]}
    />
  );
}
