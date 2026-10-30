import { contact } from "@/content/texts";
import { ContacterContainer } from "@/components/ui/ContacterContainer";
import { PageHead } from "@/components/ui/PageHead";
import { PhotosContainer } from "@/components/ui/PhotosContainer";
import { getPhotos } from "@/lib/photos";

/*
 * Page Contact (maquette body/contact) : titre pageHead H1, puis contentContainer :
 *   mobile : photos (photosContainer), trait horizontal, formulaire (contacterContainer), marge basse spacing/xxl ;
 *   tablette et desktop : photos | trait vertical | formulaire, deux moitiés égales ;
 *     le formulaire a spacing/lg en haut et en bas, les photos s'étirent à sa hauteur (premier essai validé par l'utilisateur,
 *     sinon défilement dans la moitié droite). La tablette reprend la maquette desktop en attendant sa refonte.
 * Un trait ferme le contenu avant le pied de page.
 * Textes et champs : content/pages/contact.md.
 */

export default function Contact() {
  return (
    <div className="flex w-full flex-col bg-background-neutral-black">
      <PageHead title={contact.titre} />

      {/* contentContainer */}
      <div className="flex w-full flex-col pb-xxl tablet:flex-row tablet:pb-none">
        <div className="flex w-full tablet:w-auto tablet:flex-1">
          <PhotosContainer photos={getPhotos()} />
        </div>
        <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white tablet:h-auto tablet:w-px" />
        <ContacterContainer className="tablet:min-w-0 tablet:flex-1 tablet:py-lg" />
      </div>

      <span aria-hidden className="h-px w-full shrink-0 bg-shape-neutral-white" />
    </div>
  );
}
