import { PagePlaceholder } from "./PagePlaceholder";

export default function Home() {
  return (
    <PagePlaceholder
      title="Accueil"
      anchors={[
        { id: "showreel", label: "Showreel" },
        { id: "ux-process", label: "Démarche UX" },
      ]}
    />
  );
}
