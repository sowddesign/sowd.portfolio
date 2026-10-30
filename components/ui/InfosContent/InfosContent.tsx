"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { commun } from "@/content/texts";
import { Icon } from "../Icon";
import { buttonTones, colorTransition } from "../button-tones";
import { tabletQuery, useMediaQuery } from "../use-media-query";

/*
 * Ligne question / réponse — composant Figma « infosContent » (fichier portfolio, node 4539:4471).
 * Propriétés Figma : « type » → type (heading / default ; « answered » = état ouvert de default),
 * « questionN » → questionN, « questionText » → questionText, « Answer » → children, « double » → double.
 * La variante « device » passe par les breakpoints : la variante tabletLarge (820px) vaut pour toute la tablette.
 *
 * Mobile : accordéon. Toute la ligne de la question est le bouton (réaction Figma sur la ligne) ;
 * l'icône reprend iconButton tertiary (black fermé, white ouvert), sans être un bouton à part.
 * Tablette et desktop : grille de 12 colonnes, réponse toujours visible, sans bouton.
 *
 * Animation (validée par l'utilisateur, reprend le menu de pageHeader) :
 * rideau de --motion-duration-base en --motion-ease-out à l'ouverture comme à la fermeture,
 * lignes de la réponse qui apparaissent une à une à partir de la moitié du rideau (animate-menu-line) ;
 * fond et texte de la question changent sur la même durée ; le + tourne de 45° en laissant place au X par un fondu.
 * Animations réduites (prefers-reduced-motion) : changement instantané.
 */

/** Une seule ligne ouverte à la fois parmi celles d'un même groupe. */
const GroupContext = createContext<{ openId: string | null; setOpenId: (id: string | null) => void } | null>(null);

export function InfosContentGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <GroupContext.Provider value={{ openId, setOpenId }}>{children}</GroupContext.Provider>;
}

export type InfosContentProps = {
  /** heading : ligne de titre (« N° », « Question : », « Réponse : ») ; default : question et réponse. */
  type?: "heading" | "default";
  questionN?: string;
  questionText?: string;
  /** Question sur plusieurs lignes en mobile : numéro et question alignés en haut au lieu d'être centrés. */
  double?: boolean;
  /** Réponse (slot Figma « Answer ») : un élément par ligne, ex. des <p className="type-caption-regular">. */
  children?: ReactNode;
  className?: string;
};

const stateTransition =
  "duration-(--motion-duration-base) ease-(--motion-ease-out) motion-reduce:transition-none";

/** Trait de 1px (instance Figma « separator », shape/neutral/black). */
function Divider({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-full shrink-0 bg-shape-neutral-black ${className}`} />;
}

export function InfosContent({
  type = "default",
  questionN = "XX",
  questionText = "Texte",
  double = false,
  children,
  className = "",
}: InfosContentProps) {
  if (type === "heading") {
    return (
      <div className={`flex w-full flex-col gap-sm bg-background-neutral-white text-text-neutral-black ${className}`}>
        <div className="flex gap-xxs px-md py-sm type-caption-regular tablet:grid tablet:grid-cols-12 tablet:gap-lg tablet:px-lg">
          {/* Largeur fixe de 24px (valeur Figma validée) : même espace avec un numéro à deux chiffres. */}
          <p className="w-[24px] shrink-0 tablet:col-span-3 tablet:w-auto">{commun.infos_numero}</p>
          <p className="flex-1 tablet:col-span-3 desktop:col-start-7">{commun.infos_question}</p>
          <p className="hidden tablet:col-span-6 tablet:block desktop:col-span-3">{commun.infos_reponse}</p>
        </div>
        <Divider />
      </div>
    );
  }

  return (
    <InfosRow questionN={questionN} questionText={questionText} double={double} className={className}>
      {children}
    </InfosRow>
  );
}

function InfosRow({
  questionN,
  questionText,
  double,
  children,
  className,
}: Required<Pick<InfosContentProps, "questionN" | "questionText" | "double">> & Pick<InfosContentProps, "children" | "className">) {
  const id = useId();
  const group = useContext(GroupContext);
  const [localOpen, setLocalOpen] = useState(false);
  const isTablet = useMediaQuery(tabletQuery);
  const answerRef = useRef<HTMLDivElement>(null);

  // Ouverture seulement en mobile : en tablette et desktop, la réponse est toujours visible.
  const open = !isTablet && (group ? group.openId === id : localOpen);
  const toggle = () => {
    if (group) group.setOpenId(open ? null : id);
    else setLocalOpen(!open);
  };

  // Rang de chaque ligne de la réponse (--line-index), pour décaler son apparition.
  useEffect(() => {
    Array.from(answerRef.current?.children ?? []).forEach((line, index) => {
      (line as HTMLElement).style.setProperty("--line-index", String(index));
    });
  }, [children]);

  const question = (
    <>
      {/* questionNumber : numéro et question ; centrés face à l'icône, en haut si double. */}
      <span className={`flex flex-1 gap-xxs self-stretch tablet:contents ${double ? "items-start" : "items-center"}`}>
        <span className="w-[24px] shrink-0 tablet:col-span-3 tablet:w-auto">{questionN}</span>
        <span className="flex-1 tablet:col-span-3 desktop:col-start-7">{questionText}</span>
      </span>

      {/* Icône : + (iconButton tertiary black) qui tourne de 45° et laisse place au X (tertiary white). */}
      <span aria-hidden className="relative flex size-(--button-size-sm) shrink-0 items-center justify-center tablet:hidden">
        {(
          [
            { name: "Plus", tone: buttonTones.tertiary.black, shown: !open, turn: "rotate-45" },
            { name: "X", tone: buttonTones.tertiary.white, shown: open, turn: "-rotate-45" },
          ] as const
        ).map(({ name, tone, shown, turn }) => (
          <span
            key={name}
            className={`absolute transition-[rotate,opacity] ${stateTransition} ${shown ? "rotate-0 opacity-100" : `${turn} opacity-0`}`}
          >
            <Icon name={name} size="var(--icon-md)" className={`${colorTransition} ${tone.icon}`} />
          </span>
        ))}
      </span>
    </>
  );

  const rowClassName = [
    "group flex w-full items-start gap-lg px-md py-sm text-left type-caption-regular tablet:contents",
    `transition-colors ${stateTransition}`,
    open ? "bg-background-neutral-black text-text-neutral-white" : "text-text-neutral-black",
  ].join(" ");

  return (
    <div className={`flex w-full flex-col ${open ? "" : "bg-background-neutral-white tablet:bg-transparent"} ${className}`}>
      <div className="flex flex-col tablet:grid tablet:grid-cols-12 tablet:gap-lg tablet:px-lg tablet:py-sm">
        {isTablet ? (
          <div className={rowClassName}>{question}</div>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-answer`}
            onClick={toggle}
            className={`cursor-pointer ${rowClassName}`}
          >
            {question}
          </button>
        )}

        {/* Rideau (mobile) : la zone se déplie de haut en bas ; toujours ouverte en tablette et desktop. */}
        <div
          id={`${id}-answer`}
          inert={!open && !isTablet}
          className={[
            "grid transition-[grid-template-rows]",
            stateTransition,
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            "tablet:col-span-6 tablet:grid-rows-[1fr] desktop:col-span-3",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            {/* Trait entre la question et la réponse ouverte (mobile). */}
            <Divider className="tablet:hidden" />
            <div
              ref={answerRef}
              className={[
                "flex flex-col gap-md px-md py-sm type-caption-regular text-text-neutral-black tablet:p-0",
                open
                  ? "[&>*]:animate-menu-line [&>*]:[animation-delay:calc(var(--motion-duration-base)/2+var(--line-index,0)*var(--motion-menu-stagger))] motion-reduce:[&>*]:animate-none"
                  : "",
              ].join(" ")}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      <Divider />
    </div>
  );
}
