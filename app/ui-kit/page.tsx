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

export const metadata: Metadata = { title: "UI kit — sowd design" };

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
                <IconButton variant={variant} color={color} icon="ArrowRight" label="Suivant" />
              </div>
            ))}
            <div className="flex flex-col gap-xs">
              <span className="type-caption-small-regular">disabled ({disabledColor})</span>
              <IconButton variant={variant} color={disabledColor} disabled icon="ArrowRight" label="Suivant" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UiKitPage() {
  return (
    <main className="flex flex-col">
      {/* En-tête réel : fixé en haut, page active déduite de l'URL (aucune sur /ui-kit). */}
      <PageHeader />
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 className="type-h4 px-(--grid-spacing)">Grille — adaptativeGrid</h2>
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
      <section className="flex flex-col gap-xl bg-background-brand-bright p-xxl text-text-neutral-black">
        <h1 className="type-h4">TextualButton — fond clair</h1>
        <ButtonGrid colors={["brand", "black", "active"]} disabledColor="black" />
        <h2 className="type-h4">IconButton — fond clair</h2>
        <IconButtonGrid colors={["brand", "black", "active"]} disabledColor="black" />
        <h2 className="type-h4">NavigationButton — fond clair</h2>
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
      <section className="flex flex-col gap-md bg-background-neutral-white py-xxl text-text-neutral-black">
        <h2 className="type-h4 px-(--grid-spacing)">LogoButton</h2>
        <div className="px-(--grid-spacing)">
          <LogoButton className="max-w-fit" />
        </div>
        <h2 className="type-h4 px-(--grid-spacing)">PageHeader — activePage</h2>
        {(["home", "projects", "about", "contact"] as const).map((page) => (
          <div key={page} className="flex flex-col gap-xs">
            <span className="type-caption-small-regular px-(--grid-spacing)">{page}</span>
            <PageHeader activePage={page} />
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-md bg-background-neutral-black pt-xxl text-text-neutral-white">
        <h2 className="type-h4 px-(--grid-spacing)">FooterSavoirPlus</h2>
        <FooterSavoirPlus />
        <h2 className="type-h4 px-(--grid-spacing)">FooterVisual</h2>
        <FooterVisual />
        <h2 className="type-h4 px-(--grid-spacing)">FooterSeparation</h2>
        <FooterSeparation />
      </section>
      <section className="flex flex-col gap-md bg-background-brand-bright pt-xxl">
        <h2 className="type-h4 px-(--grid-spacing)">NavigationContainer (navigationContent + meContacterContent)</h2>
        <NavigationContainer />
      </section>
      <section className="flex flex-col gap-md pt-xxl">
        <h2 className="type-h4 px-(--grid-spacing)">PageFooter (footerSeparation + navigationContainer)</h2>
        <PageFooter />
      </section>
      <section className="flex flex-col bg-background-neutral-black py-xxl">
        <PageHead title="PageHead H1" />
        <PageHead type="H2" details="Détails" title="PageHead H2" />
      </section>
      <section className="flex flex-col gap-xl bg-background-neutral-black px-(--grid-spacing) py-xxl text-text-neutral-white">
        <h2 className="type-h4">ProjetHubContainer — layout default</h2>
        <ProjetHubContainer
          title="Title"
          type="Personnel"
          year="2026"
          tags={["UX  researcher", "DSM", "DA", "Documentation"]}
          image={<Image src="/projects/placeholder.png" alt="" fill sizes="100vw" className="object-cover" />}
          href="/projects"
        />
        <h2 className="type-h4">ProjetHubContainer — layout new (isNew)</h2>
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
        <h2 className="type-h4">ProjetHubContainer — layout autres</h2>
        <ProjetHubContainer
          layout="autres"
          title="Title"
          year="2026"
          image={<Image src="/projects/placeholder.png" alt="" fill sizes="100vw" className="object-cover" />}
          href="/projects"
        />
      </section>
      <section className="flex flex-col gap-xl bg-background-neutral-black p-xxl text-text-neutral-white">
        <h2 className="type-h4">TextualButton — fond sombre</h2>
        <ButtonGrid colors={["white", "brand", "active"]} disabledColor="white" />
        <h2 className="type-h4">IconButton — fond sombre</h2>
        <IconButtonGrid colors={["white", "brand", "active"]} disabledColor="white" />
      </section>
    </main>
  );
}
