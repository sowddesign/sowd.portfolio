import { accueil } from "@/content/texts";
import { getMethode } from "@/lib/methode";
import { HeaderText } from "@/components/ui/HeaderText";
import { MethodeContainer } from "@/components/ui/Methode";
import { SectionDemarcheUX } from "@/components/ui/SectionDemarcheUX";
import { Showreel } from "@/components/ui/Showreel";

/*
 * Accueil — composant Figma « body/homeP » (fichier portfolio, node 4585:16729), variantes desktop et mobile.
 * Fond background/neutral/black. Showreel, puis (écart 96) la démarche UX et « Méthode : l'appliquer aux projets » :
 *   desktop : marge du haut 96, en-tête (headerText, écart 24, trait), écart 48, methodeContainer ;
 *   mobile : marges 48 en haut et en bas, en-tête puis methodeContainer sans écart.
 * Écart showreel → suite : 96 sans variable dans Figma (= spacing/mega).
 * La démarche UX n'a pas de fond (Figma) : la photo du showreel et son fondu vers le noir passent dessous.
 * « Méthode : l'appliquer aux projets » : fond background/neutral/white, textes text/neutral/black, marges spacing/lg.
 */

export default async function Home() {
  const steps = await getMethode();
  return (
    <div className="flex flex-col gap-mega bg-background-neutral-black">
      <Showreel id="showreel" fadeUntil="#ux-process h2" />
      <div className="relative flex flex-col">
        <SectionDemarcheUX id="ux-process" />
        <section className="flex flex-col bg-background-neutral-white py-xxl tablet:pb-none">
          <div className="flex flex-col tablet:gap-xxl">
            <div className="flex flex-col gap-lg">
              <HeaderText
                label={accueil.appliquer_methode}
                name={accueil.appliquer_methode_nom}
                description={[]}
                color="black"
                inset="lg"
              />
              <span aria-hidden className="block w-full border-t border-shape-neutral-black" />
            </div>
            <MethodeContainer steps={steps} />
          </div>
        </section>
      </div>
    </div>
  );
}
