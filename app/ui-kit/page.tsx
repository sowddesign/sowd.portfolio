import type { Metadata } from "next";
import {
  TextualButton,
  type TextualButtonColor,
  type TextualButtonVariant,
} from "@/components/ui/TextualButton";

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

export default function UiKitPage() {
  return (
    <main className="flex flex-col">
      <section className="flex flex-col gap-xl bg-background-brand-bright p-xxl text-text-neutral-black">
        <h1 className="type-h4">TextualButton — fond clair</h1>
        <ButtonGrid colors={["brand", "black", "active"]} disabledColor="black" />
      </section>
      <section className="flex flex-col gap-xl bg-background-neutral-black p-xxl text-text-neutral-white">
        <h2 className="type-h4">TextualButton — fond sombre</h2>
        <ButtonGrid colors={["white", "brand", "active"]} disabledColor="white" />
      </section>
    </main>
  );
}
