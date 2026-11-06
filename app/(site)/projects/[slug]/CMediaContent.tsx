import type { CSSProperties, ReactNode } from "react";
import { cMedia as t } from "@/content/texts";
import { Icon } from "@/components/ui/Icon";
import { PageHead } from "@/components/ui/PageHead";
import { ProjectImage, type ImageFraming } from "@/components/ui/ProjectImage";
import { RichLines } from "@/components/ui/RichText";
import { SchemaUXEquipe } from "@/components/ui/SchemaUXEquipe";
import { parseLine } from "@/lib/markdown";

/*
 * Contenu de la page projet C-Média — maquette Figma « projectCmedia » (fichier portfolio, node 5763:30825).
 * Textes : content/projects/c-media/page.md ; images : public/projects/c-media/.
 * Mobile : une colonne ; tablette et desktop (la tablette suit le desktop) : grille de 12 colonnes,
 * gouttière spacing/lg. Les blocs qui changent de place passent en « display: contents » à partir de la tablette
 * pour rejoindre la grille.
 */

const IMG = "/projects/c-media";
const FILE = "content/projects/c-media/page.md";

function fail(message: string): never {
  throw new Error(`${FILE} : ${message}`);
}

/** Texte avec mise en forme (gras, italique, liens) et retours à la ligne « \n ». */
function Rich({ text }: { text: string }) {
  return <RichLines lines={text.split("\n").map((line) => parseLine(line, fail))} />;
}

function Divider() {
  return <span aria-hidden className="w-full shrink-0 border-t border-shape-neutral-white" />;
}

/** Section : pageHead H3 puis contenu. */
function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-xl px-md text-text-neutral-white tablet:gap-xxl tablet:px-lg">
      {title && <PageHead type="H3" title={title} />}
      {children}
    </section>
  );
}

const grid = "tablet:grid tablet:grid-cols-12 tablet:gap-x-lg";

/* ---------- Les projets ---------- */

type Action = { title: string; text: string; note?: string; image: ReactNode };

type ProjectBlockProps = {
  title: string;
  text: string;
  enjeu: string;
  actions: [Action, Action, Action];
};

const actionCols = ["tablet:col-start-1", "tablet:col-start-5", "tablet:col-start-9"];

function ProjectBlock({ title, text, enjeu, actions }: ProjectBlockProps) {
  return (
    <div className={`flex flex-col gap-xl ${grid} tablet:gap-y-xxl`}>
      <h3 className="type-subheading tablet:col-span-8">{title}</h3>
      <div className="flex flex-col gap-md tablet:contents">
        <p className="type-caption-regular tablet:col-span-4 tablet:col-start-1">{text}</p>
        {/* « L’enjeu : » seul en text/brand/bright, la suite en blanc (demande de l'utilisateur). */}
        <p className="type-caption-italic tablet:col-span-4 tablet:col-start-5">
          <span className="text-text-brand-bright">{enjeu.slice(0, enjeu.indexOf(":") + 1)}</span>
          {enjeu.slice(enjeu.indexOf(":") + 1)}
        </p>
      </div>
      <div className="flex flex-col gap-md tablet:col-span-12 tablet:grid tablet:grid-cols-12 tablet:gap-lg">
        <h4 className="type-body-accentuation tablet:col-span-12">{t.projets_intervention}</h4>
        {actions.map((action, i) => (
          <div key={action.title} className="flex flex-col gap-xs tablet:contents">
            <div className={`flex flex-col gap-xxs tablet:row-start-2 tablet:col-span-4 tablet:gap-xs ${actionCols[i]}`}>
              <p className="type-caption-accentuation">{action.title}</p>
              <p className="type-caption-regular">
                <Rich text={action.text} />
              </p>
              {action.note && (
                <p className="type-caption-italic">
                  <Rich text={action.note} />
                </p>
              )}
            </div>
            <div className={`tablet:row-start-3 tablet:col-span-4 ${actionCols[i]}`}>{action.image}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Img(props: { src: string; mobile: ImageFraming; desktop: ImageFraming; desktopBackground?: string }) {
  return <ProjectImage {...props} src={`${IMG}/${props.src}`} desktopBackground={props.desktopBackground && `${IMG}/${props.desktopBackground}`} />;
}

/* ---------- Apprentissages ---------- */

function Learning({ title, text, next }: { title: string; text: string; next: string }) {
  return (
    <div className={`flex flex-col gap-sm ${grid} tablet:gap-y-xxl`}>
      <h3 className="type-subheading tablet:col-span-12">{title}</h3>
      <p className="type-caption-regular tablet:col-span-4">
        <Rich text={text} />
      </p>
      <div className="flex items-center justify-center p-(--project-arrow-space) tablet:col-span-4">
        {/* Affichage porté par une enveloppe : Icon pose toujours inline-block, qui l'emporterait sur hidden. */}
        <span className="flex tablet:hidden">
          <Icon name="ArrowDown" size="var(--icon-lg)" className="text-shape-neutral-white" />
        </span>
        <span className="hidden tablet:flex">
          <Icon name="ArrowRight" size="var(--icon-lg)" className="text-shape-neutral-white" />
        </span>
      </div>
      <p className="type-caption-italic text-text-brand-bright tablet:col-span-4">
        <Rich text={next} />
      </p>
    </div>
  );
}

/** Logo blanc (shape/neutral/white) dessiné par le SVG en masque. */
function Logo({ file, ratio, label, className = "" }: { file: string; ratio: string; label: string; className?: string }) {
  const style = { "--logo-url": `url(${IMG}/${file})`, aspectRatio: ratio } as CSSProperties;
  return (
    <span role="img" aria-label={label} style={style} className={`block bg-shape-neutral-white [mask:var(--logo-url)_center/contain_no-repeat] ${className}`} />
  );
}

export function CMediaContent() {
  return (
    <div className="flex w-full flex-col gap-xl pt-xl tablet:gap-xxl tablet:pt-xxl">
      {/* Contexte */}
      <Section>
        <div className={`flex flex-col gap-xl ${grid} tablet:gap-y-lg`}>
          <h2 className="type-subheading tablet:col-span-12">{t.contexte_titre}</h2>
          <div className="flex flex-col gap-sm tablet:contents">
            <p className="type-caption-regular tablet:col-span-4">{t.contexte_texte}</p>
            <div className="type-caption-regular flex flex-col gap-xs tablet:col-span-4 tablet:col-start-5">
              <p>{t.contexte_intro}</p>
              <ul className="list-inside list-disc">
                {t.contexte_liste.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* L’entreprise */}
      <Section title={t.entreprise_titre}>
        <div className="flex flex-col gap-xl tablet:gap-xxl tablet:pb-lg">
          {/* Cegedim & C-Média */}
          <div className={`flex flex-col gap-xl ${grid} tablet:gap-y-xxl`}>
            <h3 className="type-subheading tablet:col-span-12">{t.entreprise_groupe_titre}</h3>
            <div className="flex flex-col gap-xs tablet:row-start-2 tablet:col-span-4 tablet:gap-sm">
              <div className="flex aspect-370/200 w-full items-center justify-center tablet:aspect-448/278">
                <Logo file="logo-cegedim.svg" ratio="448 / 97.8519" label={t.entreprise_logo_groupe} className="w-full" />
              </div>
              <p className="type-caption-regular">{t.entreprise_groupe_texte}</p>
            </div>
            <div className="flex flex-col gap-md tablet:contents">
              <div className="flex flex-col gap-xs tablet:row-start-2 tablet:col-span-4 tablet:col-start-5 tablet:gap-sm">
                <div className="flex aspect-370/200 w-full items-center justify-center tablet:aspect-448/278">
                  <Logo
                    file="logo-cmedia.svg"
                    ratio="347.26 / 170.369"
                    label={t.entreprise_logo_filiale}
                    className="w-full max-w-(--project-c-media-logo-width)"
                  />
                </div>
                <p className="type-caption-regular">{t.entreprise_filiale_texte}</p>
              </div>
              <ul className="type-swiss-accentuation flex gap-lg tablet:row-start-3 tablet:col-start-9 tablet:flex-col">
                {t.entreprise_canaux.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="flex flex-col justify-end gap-xs tablet:row-start-3 tablet:col-span-4 tablet:col-start-5 tablet:gap-sm">
                <Img src="entreprise.webp" mobile={{ mode: "fill", ratio: "370 / 220" }} desktop={{ mode: "fit", ratio: "448 / 278" }} />
                <p className="type-caption-regular">{t.entreprise_solutions_texte}</p>
              </div>
            </div>
          </div>

          {/* L’équipe */}
          <div className={`flex flex-col gap-xl ${grid} tablet:gap-y-xxl`}>
            <h3 className="type-subheading tablet:col-span-12">{t.equipe_titre}</h3>
            <div className="type-caption-regular flex flex-col gap-xs tablet:col-span-4 tablet:gap-sm">
              <p>{t.equipe_texte_1}</p>
              <p>{t.equipe_texte_2}</p>
              <p>{t.equipe_texte_3}</p>
              <p>{t.equipe_texte_4}</p>
            </div>
            <SchemaUXEquipe
              className="tablet:col-span-8 tablet:col-start-5 tablet:self-start"
              avatars={{
                leadUX: `${IMG}/equipe-avatar-lead.webp`,
                po: `${IMG}/equipe-avatar-po.webp`,
                moi: `${IMG}/equipe-avatar-moi.webp`,
                devs: `${IMG}/equipe-avatar-devs.webp`,
              }}
              texts={{
                lead: t.schema_lead,
                leadLabel: t.schema_lead_label,
                po: t.schema_po,
                poLabel: t.schema_po_label,
                moi: t.schema_moi,
                moiLabel: t.schema_moi_label,
                devs: t.schema_devs,
                devsLabel: t.schema_devs_label,
                validation: t.schema_validation,
                cadrage: t.schema_cadrage,
                specificationsDesktop: t.schema_specifications_desktop,
                specificationsMobile: t.schema_specifications_mobile,
                retours: t.schema_retours,
                apprentissages: t.schema_apprentissages,
              }}
            />
          </div>
        </div>
      </Section>

      <Divider />

      {/* Les projets */}
      <Section title={t.projets_titre}>
        <div className="flex flex-col gap-xl tablet:gap-xxl">
          <ProjectBlock
            title={t.projet_1_titre}
            text={t.projet_1_texte}
            enjeu={t.projet_1_enjeu}
            actions={[
              {
                title: t.projet_1_action_1_titre,
                text: t.projet_1_action_1_texte,
                image: <Img src="app-mobile-1.webp" mobile={{ mode: "crop", ratio: "354 / 272", crop: [1, 1.001, 0, 0] }} desktop={{ mode: "fit", ratio: "448 / 344" }} />,
              },
              {
                title: t.projet_1_action_2_titre,
                text: t.projet_1_action_2_texte,
                image: (
                  <Img
                    src="app-mobile-2.webp"
                    mobile={{ mode: "crop", ratio: "354 / 348", crop: [0.666, 1, 0, 0] }}
                    desktop={{ mode: "crop", ratio: "448 / 344", crop: [0.843, 1, 0, 0] }}
                  />
                ),
              },
              {
                title: t.projet_1_action_3_titre,
                text: t.projet_1_action_3_texte,
                image: <Img src="app-mobile-3.webp" mobile={{ mode: "fit", ratio: "354 / 275" }} desktop={{ mode: "fit", ratio: "448 / 344" }} />,
              },
            ]}
          />
          <Divider />
          <ProjectBlock
            title={t.projet_2_titre}
            text={t.projet_2_texte}
            enjeu={t.projet_2_enjeu}
            actions={[
              {
                title: t.projet_2_action_1_titre,
                text: t.projet_2_action_1_texte,
                image: <Img src="progiciel-1.webp" mobile={{ mode: "fill", ratio: "370 / 348" }} desktop={{ mode: "fill", ratio: "448 / 344" }} />,
              },
              {
                title: t.projet_2_action_2_titre,
                text: t.projet_2_action_2_texte,
                note: t.projet_2_action_2_note,
                image: (
                  <Img
                    src="progiciel-2.webp"
                    desktopBackground="progiciel-2-fond.webp"
                    mobile={{ mode: "crop", ratio: "354 / 276", crop: [1, 1, 0, 0] }}
                    desktop={{ mode: "fit", ratio: "448 / 344" }}
                  />
                ),
              },
              {
                title: t.projet_2_action_3_titre,
                text: t.projet_2_action_3_texte,
                image: (
                  <Img
                    src="progiciel-3.webp"
                    mobile={{ mode: "crop", ratio: "370 / 254", crop: [0.999, 0.919, 0.001, 0.078] }}
                    desktop={{ mode: "crop", ratio: "448 / 344", crop: [0.91, 0.91, 0.026, 0.09] }}
                  />
                ),
              },
            ]}
          />
          <Divider />
          <ProjectBlock
            title={t.projet_3_titre}
            text={t.projet_3_texte}
            enjeu={t.projet_3_enjeu}
            actions={[
              {
                title: t.projet_3_action_1_titre,
                text: t.projet_3_action_1_texte,
                image: (
                  <Img
                    src="interface-1.webp"
                    mobile={{ mode: "fill", ratio: "370 / 252" }}
                    desktop={{ mode: "crop", ratio: "448 / 311", crop: [0.87, 0.904, 0.065, 0] }}
                  />
                ),
              },
              {
                title: t.projet_3_action_2_titre,
                text: t.projet_3_action_2_texte,
                image: (
                  <Img
                    src="interface-2.webp"
                    mobile={{ mode: "crop", ratio: "370 / 252", crop: [1, 0.913, 0, 0.088] }}
                    desktop={{ mode: "crop", ratio: "448 / 313", crop: [1, 0.911, 0, 0.09] }}
                  />
                ),
              },
              {
                title: t.projet_3_action_3_titre,
                text: t.projet_3_action_3_texte,
                image: (
                  <Img
                    src="interface-3.webp"
                    mobile={{ mode: "crop", ratio: "370 / 339", crop: [0.79, 0.91, 0.105, 0.091] }}
                    desktop={{ mode: "crop", ratio: "448 / 313", crop: [0.999, 0.91, 0, 0.091] }}
                  />
                ),
              },
            ]}
          />
        </div>
      </Section>

      <Divider />

      {/* Apprentissages */}
      <Section title={t.apprentissages_titre}>
        <div className="flex flex-col gap-xl tablet:gap-xxl">
          <Learning title={t.appris_1_titre} text={t.appris_1_texte} next={t.appris_1_suite} />
          <Divider />
          <Learning title={t.appris_2_titre} text={t.appris_2_texte} next={t.appris_2_suite} />
          <Divider />
          <Learning title={t.appris_3_titre} text={t.appris_3_texte} next={t.appris_3_suite} />
          <Divider />
          <Learning title={t.appris_4_titre} text={t.appris_4_texte} next={t.appris_4_suite} />
        </div>
      </Section>

      <Divider />
    </div>
  );
}

