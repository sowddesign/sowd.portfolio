import Image from "next/image";
import type { Metadata } from "next";
import {
  TextualButton,
  type TextualButtonColor,
  type TextualButtonVariant,
} from "@/components/ui/TextualButton";
import { IconButton } from "@/components/ui/IconButton";
import { NavigationButton } from "@/components/ui/NavigationButton";
import { NavigationContainer } from "@/components/ui/NavigationContainer";
import { LogoButton } from "@/components/ui/LogoButton";
import { FooterSavoirPlus } from "@/components/ui/FooterSavoirPlus";
import { FooterVisual } from "@/components/ui/FooterVisual";
import { FooterSeparation } from "@/components/ui/FooterSeparation";
import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjetHubContainer } from "@/components/ui/ProjetHubContainer";
import { PageHead } from "@/components/ui/PageHead";
import { InfosContent, InfosContentGroup } from "@/components/ui/InfosContent";
import { Photos } from "@/components/ui/Photos";
import { ColorBackground } from "@/components/ui/ColorBackground";
import { PhotosContainer } from "@/components/ui/PhotosContainer";
import { TextField } from "@/components/ui/TextField";
import { ContacterContainer } from "@/components/ui/ContacterContainer";
import { GridBar, type GridBarNumber, type GridBarProps } from "@/components/ui/GridBar";
import { AnimationGrid } from "@/components/ui/AnimationGrid";
import { HeaderImage } from "@/components/ui/HeaderImage";
import { MessageContainer } from "@/components/ui/MessageContainer";
import { DoubleFlower } from "@/components/ui/DoubleFlower";
import { getPhotos } from "@/lib/photos";
import { ProgressBarDemo } from "./ProgressBarDemo";
import { VideoControlsDemo } from "./VideoControlsDemo";
import { NavSideMenusDemo } from "./NavSideMenusDemo";
import { NavSideTilesDemo } from "./NavSideTilesDemo";
import { MethodeDemo } from "./MethodeDemo";
import { KitSummary, type KitSummaryGroup } from "./KitSummary";
import { getMethode, getMethodeIntro, getMethodePage } from "@/lib/methode";
import { MethodeContainer } from "@/components/ui/Methode";

export const metadata: Metadata = { title: "UI kit — sowd design" };

const gridBarNumbers: GridBarNumber[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const gridBarVariants: { label: string; props: GridBarProps }[] = [
  { label: "default · 00", props: { state: "default" } },
  ...gridBarNumbers.map((number) => ({ label: `hovered · ${number}`, props: { state: "hovered" as const, number } })),
];

const variants: TextualButtonVariant[] = ["primary", "secondary", "tertiary"];
const iconConfigs = [
  { label: "icône à gauche", iconPosition: "left" as const, icon: "ArrowRight" as const },
  { label: "icône à droite", iconPosition: "right" as const, icon: "ArrowRight" as const },
  { label: "sans icône", iconPosition: "left" as const, icon: undefined },
];

function ButtonGrid({ colors, disabledColor }: { colors: TextualButtonColor[]; disabledColor: "black" | "white" }) {
  return (
    <div className="flex flex-col gap-xl">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-md">
          <h3 className="type-caption-accentuation">{variant}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-lg">
            {colors.map((color) =>
              iconConfigs.map((config) => (
                <div key={`${color}-${config.label}`} className="flex flex-col gap-xs">
                  <span className="type-caption-small-regular">
                    {color} · {config.label}
                  </span>
                  <TextualButton variant={variant} color={color} icon={config.icon} iconPosition={config.iconPosition}>
                    button
                  </TextualButton>
                </div>
              )),
            )}
            {iconConfigs.map((config) => (
              <div key={`disabled-${config.label}`} className="flex flex-col gap-xs">
                <span className="type-caption-small-regular">
                  disabled ({disabledColor}) · {config.label}
                </span>
                <TextualButton
                  variant={variant}
                  color={disabledColor}
                  disabled
                  icon={config.icon}
                  iconPosition={config.iconPosition}
                >
                  button
                </TextualButton>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IconButtonGrid({ colors, disabledColor }: { colors: TextualButtonColor[]; disabledColor: "black" | "white" }) {
  return (
    <div className="flex flex-col gap-lg">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-xs">
          <h3 className="type-caption-accentuation">{variant}</h3>
          <div className="flex flex-wrap items-end gap-lg">
            {colors.map((color) => (
              <div key={color} className="flex flex-col gap-xs">
                <span className="type-caption-small-regular">{color}</span>
                <IconButton variant={variant} color={color} icon="ArrowRight" label="Suivant" cursorLabel="Suivant" />
              </div>
            ))}
            <div className="flex flex-col gap-xs">
              <span className="type-caption-small-regular">disabled ({disabledColor})</span>
              <IconButton variant={variant} color={disabledColor} disabled icon="ArrowRight" label="Suivant" cursorLabel="Suivant" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Sommaire : groupes dans l'ordre de la page, id = ancre du titre de chaque composant. */
const summary: KitSummaryGroup[] = [
  { title: "Fondations", items: [{ id: "grille", label: "Grille" }] },
  {
    title: "Boutons",
    items: [
      { id: "textual-button-clair", label: "TextualButton — fond clair" },
      { id: "icon-button-clair", label: "IconButton — fond clair" },
      { id: "navigation-button", label: "NavigationButton" },
      { id: "textual-button-sombre", label: "TextualButton — fond sombre" },
      { id: "icon-button-sombre", label: "IconButton — fond sombre" },
      { id: "logo-button", label: "LogoButton" },
    ],
  },
  {
    title: "En-tête et pied de page",
    items: [
      { id: "page-header", label: "PageHeader" },
      { id: "page-head", label: "PageHead" },
      { id: "footer-savoir-plus", label: "FooterSavoirPlus" },
      { id: "footer-visual", label: "FooterVisual" },
      { id: "footer-separation", label: "FooterSeparation" },
      { id: "navigation-container", label: "NavigationContainer" },
      { id: "page-footer", label: "PageFooter" },
    ],
  },
  {
    title: "Projets",
    items: [
      { id: "projet-hub-default", label: "ProjetHubContainer — default" },
      { id: "projet-hub-new", label: "ProjetHubContainer — new" },
      { id: "projet-hub-autres", label: "ProjetHubContainer — autres" },
    ],
  },
  { title: "À propos", items: [{ id: "infos-content", label: "InfosContent" }] },
  {
    title: "Photos",
    items: [
      { id: "photos", label: "Photos" },
      { id: "photos-container", label: "PhotosContainer" },
      { id: "color-background", label: "ColorBackground" },
    ],
  },
  {
    title: "Contact",
    items: [
      { id: "text-field", label: "TextField" },
      { id: "contacter-container", label: "ContacterContainer" },
    ],
  },
  {
    title: "Démarche UX",
    items: [
      { id: "message-container", label: "MessageContainer" },
      { id: "double-flower", label: "DoubleFlower" },
      { id: "grid-bar", label: "GridBar" },
      { id: "animation-grid", label: "AnimationGrid" },
    ],
  },
  {
    title: "Méthode",
    items: [
      { id: "methode-container", label: "MethodeContainer" },
      { id: "methode", label: "Methode" },
      { id: "header-image", label: "HeaderImage" },
      { id: "progress-bar", label: "ProgressBar" },
      { id: "nav-side-tiles", label: "NavSideTiles" },
      { id: "nav-side-menus", label: "NavSideMenus" },
    ],
  },
  { title: "Vidéo", items: [{ id: "video-controls", label: "VideoManager" }] },
];

export default async function UiKitPage() {
  return (
    <main className="flex flex-col">
      {/* En-tête réel : fixé en haut, page active déduite de l'URL (aucune sur /ui-kit). */}
      <PageHeader />
      <section className="bg-background-neutral-white py-lg">
        <KitSummary groups={summary} />
      </section>

      {/* Fondations */}
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h1 id="grille" className="type-h4 px-(--grid-spacing)">
          Grille — adaptativeGrid
        </h1>
        <div className="grid-layout">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              data-grid-column
              className={`${i >= 8 ? "hidden desktop:flex" : i >= 4 ? "hidden tablet:flex" : "flex"} h-xxl items-center justify-center bg-faded-black-10 type-caption-small-regular`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      {/* Boutons */}
      <section className="flex flex-col gap-xl bg-background-brand-bright p-xxl text-text-neutral-black">
        <h2 id="textual-button-clair" className="type-h4">
          TextualButton — fond clair
        </h2>
        <ButtonGrid colors={["brand", "black", "active"]} disabledColor="black" />
        <h2 id="icon-button-clair" className="type-h4">
          IconButton — fond clair
        </h2>
        <IconButtonGrid colors={["brand", "black", "active"]} disabledColor="black" />
        <h2 id="navigation-button" className="type-h4">
          NavigationButton — fond clair
        </h2>
        <div className="flex flex-col gap-lg">
          {(["lg", "md"] as const).map((size) =>
            (["black", "active"] as const).map((color) => (
              <div key={`${size}-${color}`} className="flex flex-col gap-xs">
                <span className="type-caption-small-regular">
                  {size} · {color}
                </span>
                <NavigationButton size={size} color={color}>
                  navButton
                </NavigationButton>
              </div>
            )),
          )}
        </div>
      </section>
      <section className="flex flex-col gap-xl bg-background-neutral-black p-xxl text-text-neutral-white">
        <h2 id="textual-button-sombre" className="type-h4">
          TextualButton — fond sombre
        </h2>
        <ButtonGrid colors={["white", "brand", "active"]} disabledColor="white" />
        <h2 id="icon-button-sombre" className="type-h4">
          IconButton — fond sombre
        </h2>
        <IconButtonGrid colors={["white", "brand", "active"]} disabledColor="white" />
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 id="logo-button" className="type-h4 px-(--grid-spacing)">
          LogoButton
        </h2>
        <div className="px-(--grid-spacing)">
          <LogoButton className="max-w-fit" />
        </div>
      </section>

      {/* En-tête et pied de page */}
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 id="page-header" className="type-h4 px-(--grid-spacing)">
          PageHeader — activePage
        </h2>
        {(["home", "projects", "about", "contact"] as const).map((page) => (
          <div key={page} className="flex flex-col gap-xs">
            <span className="type-caption-small-regular px-(--grid-spacing)">{page}</span>
            <PageHeader activePage={page} />
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="page-head" className="type-h4 px-(--grid-spacing)">
          PageHead — H1, H2
        </h2>
        <PageHead title="PageHead H1" />
        <PageHead type="H2" details="Détails" title="PageHead H2" />
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black pt-xxl text-text-neutral-white">
        <h2 id="footer-savoir-plus" className="type-h4 px-(--grid-spacing)">
          FooterSavoirPlus
        </h2>
        <FooterSavoirPlus />
        <h2 id="footer-visual" className="type-h4 px-(--grid-spacing)">
          FooterVisual
        </h2>
        <FooterVisual />
        <h2 id="footer-separation" className="type-h4 px-(--grid-spacing)">
          FooterSeparation
        </h2>
        <FooterSeparation />
      </section>
      <section className="flex flex-col gap-md bg-background-brand-bright pt-xxl">
        <h2 id="navigation-container" className="type-h4 px-(--grid-spacing)">
          NavigationContainer (navigationContent + meContacterContent)
        </h2>
        <NavigationContainer />
      </section>
      <section className="flex flex-col gap-md pt-xxl">
        <h2 id="page-footer" className="type-h4 px-(--grid-spacing)">
          PageFooter (footerSeparation + navigationContainer)
        </h2>
        <PageFooter />
      </section>

      {/* Projets */}
      <section className="flex flex-col gap-xl bg-background-neutral-black px-(--grid-spacing) py-xxl text-text-neutral-white">
        <h2 id="projet-hub-default" className="type-h4">
          ProjetHubContainer — layout default
        </h2>
        <ProjetHubContainer
          title="Title"
          type="Personnel"
          year="2026"
          tags={["UX  researcher", "DSM", "DA", "Documentation"]}
          image={<Image src="/projects/placeholder.png" alt="" fill sizes="100vw" className="object-cover" />}
          href="/projects"
        />
        <h2 id="projet-hub-new" className="type-h4">
          ProjetHubContainer — layout new (isNew)
        </h2>
        <ProjetHubContainer
          layout="new"
          isNew
          title="Title"
          type="Personnel"
          year="2026"
          tags={["UX  researcher", "DSM", "DA", "Documentation"]}
          image={<Image src="/projects/placeholder.png" alt="" fill sizes="100vw" className="object-cover" />}
          href="/projects"
        />
        <h2 id="projet-hub-autres" className="type-h4">
          ProjetHubContainer — layout autres
        </h2>
        <ProjetHubContainer
          layout="autres"
          title="Title"
          year="2026"
          image={<Image src="/projects/placeholder.png" alt="" fill sizes="100vw" className="object-cover" />}
          href="/projects"
        />
      </section>

      {/* À propos */}
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 id="infos-content" className="type-h4 px-(--grid-spacing)">
          InfosContent — heading, default, double (une seule réponse ouverte à la fois en mobile)
        </h2>
        <InfosContentGroup>
          <InfosContent type="heading" />
          <InfosContent questionN="01" questionText="Combien de temps dure un projet ?">
            <p>Réponse développée</p>
          </InfosContent>
          <InfosContent questionN="02" questionText="Quels outils utilises-tu ?">
            <p>Première ligne de la réponse.</p>
            <p>Deuxième ligne de la réponse.</p>
            <p>Troisième ligne de la réponse.</p>
          </InfosContent>
          <InfosContent
            double
            questionN="03"
            questionText="Une question plus longue qui passe sur deux lignes en mobile pour tester la variante double ?"
          >
            <p>Réponse développée</p>
          </InfosContent>
        </InfosContentGroup>
      </section>

      {/* Photos */}
      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="photos" className="type-h4 px-(--grid-spacing)">
          Photos — mosaïque, vue photo au clic
        </h2>
        {/* Hauteur de démonstration, en attendant une maquette. */}
        <div className="h-[60vh] w-full">
          <Photos photos={getPhotos()} />
        </div>
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 id="photos-container" className="type-h4 px-(--grid-spacing)">
          PhotosContainer
        </h2>
        {/* Largeur de la maquette : tout l'écran en mobile, 50 % à partir de la tablette. */}
        <div className="flex w-full tablet:w-1/2">
          <PhotosContainer photos={getPhotos()} />
        </div>
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-white p-xxl text-text-neutral-black">
        <h2 id="color-background" className="type-h4">
          ColorBackground
        </h2>
        {/* Taille de la variante desktop de photosContainer (719,5 × 562). */}
        <div className="h-[562px] w-[719.5px] max-w-full">
          <ColorBackground />
        </div>
      </section>

      {/* Contact */}
      <section className="flex flex-col gap-xxl bg-background-neutral-black p-xxl text-text-neutral-white">
        <h2 id="text-field" className="type-h4">
          TextField — textField, textArea
        </h2>
        <div className="flex w-full flex-col gap-xxl tablet:w-1/2">
          <TextField label="Title" required details="détails détaillés" />
          <TextField label="Titre sans icône ni détails" iconBefore={false} />
          <TextField label="Titre assez long pour passer à la ligne une fois le bord du champ atteint" required />
          <TextField label="Champ déjà rempli" defaultValue="Placeholder" details="détails détaillés" />
          <TextField type="textArea" label="Title" required details="détails détaillés" />
        </div>
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="contacter-container" className="type-h4 px-(--grid-spacing)">
          ContacterContainer (textes et champs : content/pages/contact.md)
        </h2>
        <ContacterContainer />
      </section>

      {/* Démarche UX */}
      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="message-container" className="type-h4 px-(--grid-spacing)">
          MessageContainer — lien vers la démarche UX
        </h2>
        <MessageContainer />
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="double-flower" className="type-h4 px-(--grid-spacing)">
          DoubleFlower — survol (desktop), parcours par boutons (mobile, tablette tactile)
        </h2>
        <DoubleFlower />
        <h3 className="type-caption-accentuation px-(--grid-spacing)">diamonds (desktop, déclenché par la page)</h3>
        <DoubleFlower diamonds />
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black p-xxl text-text-neutral-white">
        <h2 id="grid-bar" className="type-h4">
          GridBar — style upToDown
        </h2>
        <div className="flex flex-wrap gap-lg">
          {gridBarVariants.map((variant) => (
            <div key={variant.label} className="flex flex-col gap-xs">
              <span className="type-caption-small-regular">{variant.label}</span>
              {/* Taille de la variante Figma (94 × 900) ; en usage, la tuile remplit sa colonne. */}
              <div className="h-[900px] w-[94px]">
                <GridBar {...variant.props} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="animation-grid" className="type-h4 px-(--grid-spacing)">
          AnimationGrid — survol ou appui sur une tuile
        </h2>
        {/* Hauteur de la maquette (900) ; en usage, la grille remplit son parent. */}
        <div className="h-[900px] w-full">
          <AnimationGrid />
        </div>
      </section>

      {/* Méthode */}
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 id="methode-container" className="type-h4 px-(--grid-spacing)">
          MethodeContainer — étapes et pages (content/methode/ordre.yaml), redimensionnable en largeur
        </h2>
        {/* Démo : largeur réglable à la poignée (à partir de la tablette) pour voir le passage progressif.
            En mobile, pas de cadre défilant : la page défile et les en-têtes collants fonctionnent. */}
        <div className="w-full tablet:resize-x tablet:overflow-auto">
          <MethodeContainer steps={await getMethode()} />
        </div>
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 id="methode" className="type-h4 px-(--grid-spacing)">
          Methode — introduction et modèle de page (étape découvrir)
        </h2>
        <MethodeDemo intro={getMethodeIntro("decouvrir")} page={await getMethodePage("recherches-quantitatives")} />
      </section>      <section className="flex flex-col gap-md bg-background-neutral-black py-xxl text-text-neutral-white">
        <h2 id="header-image" className="type-h4 px-(--grid-spacing)">
          HeaderImage — mots-clés au survol ou à l’appui maintenu
        </h2>
        {/* Taille de la maquette (709,5 × 226,8) ; en usage, le composant remplit son parent. */}
        <div className="h-[226.8px] w-full max-w-[709.5px] px-(--grid-spacing)">
          <HeaderImage title="benchmark" keywords={["comparaison", "concurrence", "offres", "se  différencier"]} />
        </div>
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black pt-xxl text-text-neutral-white">
        <h2 id="progress-bar" className="type-h4 px-(--grid-spacing)">
          ProgressBar — lecture d&apos;article, liquide au bord ondulant, sans retour arrière
        </h2>
        <ProgressBarDemo />
      </section>
      <section className="flex flex-col gap-md bg-background-brand-bright p-xxl text-text-neutral-black">
        <h2 id="nav-side-tiles" className="type-h4">
          NavSideTiles — affichage réduit quand un Main text ne tient plus sur une ligne
        </h2>
        <NavSideTilesDemo />
      </section>
      <section className="flex flex-col gap-md bg-background-brand-bright p-xxl text-text-neutral-black">
        <h2 id="nav-side-menus" className="type-h4">
          NavSideMenus — tuiles, compteur « Terminés » et tuile vide
        </h2>
        <NavSideMenusDemo />
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black p-xxl text-text-neutral-white">
        <h2 id="video-controls" className="type-h4">
          VideoManager — lecture, volume et plein écran de la vidéo
        </h2>
        <VideoControlsDemo />
      </section>
    </main>
  );
}
