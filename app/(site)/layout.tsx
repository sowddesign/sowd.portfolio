import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";

/* Pages du site : en-tête et pied de page communs (le UI kit reste hors de ce groupe). */

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PageHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <PageFooter />
    </>
  );
}
