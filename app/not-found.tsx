import { NotFound } from "@/components/ui/NotFound";
import { PageHeader } from "@/components/ui/PageHeader";

/* Page 404 : toute adresse inconnue. En-tête du site au-dessus (demande de l'utilisateur), sans pied de page ;
   l'éditeur de dessin, ouvert depuis la 404, a son propre en-tête et recouvre celui du site. */

export default function NotFoundPage() {
  return (
    <>
      <PageHeader />
      <NotFound />
    </>
  );
}
