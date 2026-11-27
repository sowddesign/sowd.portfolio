import type { CSSProperties, ReactNode } from "react";
import { cMedia as t } from "@/content/texts";
import { PageHead } from "@/components/ui/PageHead";
import { ProjectImage, type ImageFraming } from "@/components/ui/ProjectImage";
import { RichLines } from "@/components/ui/RichText";
import { SchemaUXEquipe } from "@/components/ui/SchemaUXEquipe";
import { parseLine } from "@/lib/markdown";

/*
 * Contenu de la page projet C-Media — maquette Figma « projectCmedia » (fichier portfolio, node 5763:30825).
 * Textes : content/projects/c-media/page.md ; images : public/projects/c-media/.
 * Texte courant en body, comme toutes les pages projet (demande de l'utilisateur).
 * Mobile (jusqu'à 740px) : une colonne, texte en body. Tablette (740 à 972px, variante project-desktop) : mise en page
 * desktop avec textes en caption, écarts de la maquette (les écarts réduits étaient trop serrés). Desktop (au-delà de
 * 972px, variante project-wide) : textes en body (demande de l'utilisateur).
 * Maquette Figma « body/projetDescription » (fichier content, node 6399:3792), grille de 4 colonnes,
 * gouttière spacing/lg : texte sur 2 colonnes, image ou enjeu sur les 2 autres (textes de la page conservés,
 * demande de l'utilisateur). Mobile et tablette : une colonne, comme avant. Les blocs qui changent de place passent en
 * « display: contents » en desktop pour rejoindre la grille.
 */

const IMG = "/projects/c-media";
const FILE = "content/projects/c-media/page.md";

function fail(message: string): never {
  throw new Error(`${FILE} : ${message}`);
}

/** Texte avec mise en forme (gras, italique, liens) et retours à la ligne « \n ». */
function Rich({ text }: { text: string }) {
  return <RichLines lines={text.split("\n").map((line) => parseLine(line, fail))} size="project" background="dark" />;
}

function Divider() {
  return <span aria-hidden className="w-full shrink-0 border-t border-shape-neutral-white" />;
}

/** Section : pageHead H3 puis contenu. */
function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-xl px-md text-text-neutral-white project-desktop:gap-xxl tablet:px-lg">
      {title && <PageHead type="H3" title={title} />}
      {children}
    </section>
  );
}

const grid = "project-desktop:grid project-desktop:grid-cols-4 project-desktop:gap-x-lg";

/* ---------- Les projets ---------- */

type Action = { title: string; text: string; note?: string; image: ReactNode };

type ProjectBlockProps = {
  title: string;
  text: string;
  enjeu: string;
  actions: [Action, Action, Action];
};

function ProjectBlock({ title, text, enjeu, actions }: ProjectBlockProps) {
  return (
    <div className={`flex flex-col gap-xl ${grid} project-desktop:gap-y-lg`}>
      <h3 className="type-subheading project-desktop:col-span-4">{title}</h3>
      <div className="flex flex-col gap-md project-desktop:contents">
        <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular project-desktop:col-span-2">{text}</p>
        {/* « L’enjeu : » seul en text/brand/bright, la suite en blanc (demande de l'utilisateur). */}
        <p className="type-body-italic project-desktop:type-caption-italic project-wide:type-body-italic project-desktop:col-span-2 project-desktop:col-start-3">
          <span className="text-text-brand-bright">{enjeu.slice(0, enjeu.indexOf(":") + 1)}</span>
          {enjeu.slice(enjeu.indexOf(":") + 1)}
        </p>
      </div>
      {/* Mon intervention : une action par rangée, texte à gauche (2 colonnes), image à droite (2 colonnes). */}
      <div className="flex flex-col gap-md project-desktop:col-span-4 project-desktop:grid project-desktop:grid-cols-4 project-desktop:gap-lg">
        <h4 className="type-body-accentuation project-desktop:type-caption-accentuation project-wide:type-body-accentuation project-desktop:col-span-4">{t.projets_intervention}</h4>
        {actions.map((action) => (
          <div key={action.title} className="flex flex-col gap-xs project-desktop:contents">
            <div className="flex flex-col gap-xxs project-desktop:col-span-2 project-desktop:gap-sm">
              <p className="type-body-accentuation project-desktop:type-caption-accentuation project-wide:type-body-accentuation">{action.title}</p>
              <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular">
                <Rich text={action.text} />
              </p>
              {action.note && (
                <p className="type-body-italic project-desktop:type-caption-italic project-wide:type-body-italic">
                  <Rich text={action.note} />
                </p>
              )}
            </div>
            {/* Image plafonnée à la taille de la maquette (684 × 344) sur les grands écrans (demande de l'utilisateur). */}
            <div className="project-desktop:col-span-2 project-desktop:col-start-3 project-desktop:max-w-(--project-image-max-width)">{action.image}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Img(props: { src: string; mobile: ImageFraming; desktop: ImageFraming; desktopBackground?: string }) {
  // Cadrage desktop au-delà du seuil de la mise en page 4 colonnes (variante project-desktop), mobile en dessous.
  return (
    <ProjectImage
      {...props}
      breakpoint="project"
      src={`${IMG}/${props.src}`}
      desktopBackground={props.desktopBackground && `${IMG}/${props.desktopBackground}`}
    />
  );
}

/* ---------- Apprentissages ---------- */

function Learning({ title, text, next }: { title: string; text: string; next: string }) {
  return (
    <div className={`flex flex-col gap-sm ${grid} project-desktop:gap-y-xxl`}>
      <h3 className="type-subheading project-desktop:col-span-4">{title}</h3>
      <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular project-desktop:col-span-2">
        <Rich text={text} />
      </p>
      <p className="type-body-italic project-desktop:type-caption-italic project-wide:type-body-italic text-text-brand-bright project-desktop:col-span-2 project-desktop:col-start-3">
        <Rich text={next} />
      </p>
    </div>
  );
}

/* Logos Cegedim et C-Média (référence envoyée par l'utilisateur) : chacun centré dans son cadre, le logo C-Média
   (rond de carrés compris) sur 25,2 % de la largeur du cadre en hauteur, le logo Cegedim à 56 % de cette hauteur :
   le texte « C-MEDIA » a ainsi à peu près la hauteur du mot « cegedim ». Sans dépasser la hauteur du cadre
   (unités du cadre, container-type). Classes écrites en entier pour que Tailwind les trouve. */
const cMediaHeight = "h-[min(25.2cqw,100cqh)]";
const cegedimHeight = "h-[calc(min(25.2cqw,100cqh)*0.56)]";

/** Logo blanc (shape/neutral/white) dessiné par le SVG en masque. */
function Logo({ file, ratio, label, className = "" }: { file: string; ratio: string; label: string; className?: string }) {
  const style = { "--logo-url": `url(${IMG}/${file})`, aspectRatio: ratio } as CSSProperties;
  return (
    <span role="img" aria-label={label} style={style} className={`block bg-shape-neutral-white [mask:var(--logo-url)_center/contain_no-repeat] ${className}`} />
  );
}

export function CMediaContent() {
  return (
    <div className="flex w-full flex-col gap-xl pt-xl project-desktop:gap-xxl tablet:pt-xxl">
      {/* Contexte */}
      <Section>
        <div className={`flex flex-col gap-xl ${grid} project-desktop:gap-y-lg`}>
          <h2 className="type-subheading project-desktop:col-span-2 project-desktop:row-start-1">{t.contexte_titre}</h2>
          <div className="flex flex-col gap-sm project-desktop:contents">
            <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular project-desktop:col-span-2 project-desktop:row-start-2">{t.contexte_texte}</p>
            <div className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular flex flex-col gap-xs project-desktop:col-span-2 project-desktop:col-start-3 project-desktop:row-start-2">
              <p>{t.contexte_intro}</p>
              <ul className="list-inside list-disc">
                {t.contexte_liste.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {/* Mes rôles : à droite du titre en desktop (maquette), sous le texte hors desktop. */}
            <ul className="type-swiss-accentuation flex flex-wrap gap-lg project-desktop:col-span-2 project-desktop:col-start-3 project-desktop:row-start-1 project-desktop:justify-end project-desktop:self-center">
              {t.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Divider />

      {/* L’entreprise */}
      <Section title={t.entreprise_titre}>
        <div className="flex flex-col gap-xl project-desktop:gap-xxl tablet:pb-lg">
          {/* Cegedim & C-Media */}
          <div className={`flex flex-col gap-xl ${grid} project-desktop:gap-y-xxl`}>
            <h3 className="type-subheading project-desktop:col-span-4">{t.entreprise_groupe_titre}</h3>
            <div className="flex flex-col gap-xs project-desktop:row-start-2 project-desktop:col-span-2 project-desktop:gap-sm">
              <div className="flex aspect-370/200 w-full max-w-(--project-media-max-width) items-center justify-center [container-type:size] project-desktop:aspect-684/278 project-desktop:max-w-full">
                <Logo file="logo-cegedim.svg" ratio="448 / 97.8519" label={t.entreprise_logo_groupe} className={cegedimHeight} />
              </div>
              <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular">{t.entreprise_groupe_texte}</p>
            </div>
            <div className="flex flex-col gap-md project-desktop:contents">
              <div className="flex flex-col gap-xs project-desktop:row-start-2 project-desktop:col-span-2 project-desktop:col-start-3 project-desktop:gap-sm">
                <div className="flex aspect-370/200 w-full max-w-(--project-media-max-width) items-center justify-center [container-type:size] project-desktop:aspect-684/278 project-desktop:max-w-full">
                  <Logo
                    file="logo-cmedia.svg"
                    ratio="347.26 / 170.369"
                    label={t.entreprise_logo_filiale}
                    className={cMediaHeight}
                  />
                </div>
                <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular">{t.entreprise_filiale_texte}</p>
              </div>
              <ul className="type-swiss-accentuation flex gap-lg project-desktop:row-start-3 project-desktop:col-start-3 project-desktop:flex-col">
                {t.entreprise_canaux.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="flex flex-col justify-end gap-xs project-desktop:row-start-3 project-desktop:col-span-2 project-desktop:col-start-1 project-desktop:gap-sm">
                <Img src="entreprise.webp" mobile={{ mode: "fill", ratio: "370 / 220" }} desktop={{ mode: "fit", ratio: "684 / 424" }} />
                <p className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular">{t.entreprise_solutions_texte}</p>
              </div>
            </div>
          </div>

          {/* L’équipe */}
          <div className={`flex flex-col gap-xl ${grid} project-desktop:gap-y-xxl`}>
            <h3 className="type-subheading project-desktop:col-span-4">{t.equipe_titre}</h3>
            <div className="type-body-regular project-desktop:type-caption-regular project-wide:type-body-regular flex flex-col gap-xs project-desktop:col-span-2 project-desktop:gap-sm">
              <p>{t.equipe_texte_1}</p>
              <p>{t.equipe_texte_2}</p>
              <p>{t.equipe_texte_3}</p>
              <p>{t.equipe_texte_4}</p>
            </div>
            <SchemaUXEquipe
              className="project-desktop:col-span-2 project-desktop:col-start-3 project-desktop:self-start"
              avatars={{
                leadUX: `${IMG}/equipe-avatar-lead.webp`,
                po: `${IMG}/equipe-avatar-po.webp`,
                moi: `${IMG}/equipe-avatar-moi.webp`,
                devs: `${IMG}/equipe-avatar-devs.webp`,
              }}
              texts={{
                lead: t.schema_lead,
                leadLabel: t.schema_lead_label,
                leadShort: t.schema_lead_court,
                po: t.schema_po,
                poLabel: t.schema_po_label,
                moi: t.schema_moi,
                moiLabel: t.schema_moi_label,
                moiShort: t.schema_moi_court,
                devs: t.schema_devs,
                devsLabel: t.schema_devs_label,
                devsShort: t.schema_devs_court,
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
        <div className="flex flex-col gap-xl project-desktop:gap-xxl">
          <ProjectBlock
            title={t.projet_1_titre}
            text={t.projet_1_texte}
            enjeu={t.projet_1_enjeu}
            actions={[
              {
                title: t.projet_1_action_1_titre,
                text: t.projet_1_action_1_texte,
                image: <Img src="app-mobile-1.webp" mobile={{ mode: "crop", ratio: "354 / 272", crop: [1, 1.001, 0, 0] }} desktop={{ mode: "crop", ratio: "684 / 344", crop: [1, 0.5179, 0, 0.4821] }} />,
              },
              {
                title: t.projet_1_action_2_titre,
                text: t.projet_1_action_2_texte,
                image: (
                  <Img
                    src="app-mobile-2.webp"
                    mobile={{ mode: "crop", ratio: "354 / 348", crop: [0.666, 1, 0, 0] }}
                    desktop={{ mode: "crop", ratio: "684 / 344", crop: [0.8426, 1, 0, 0] }}
                  />
                ),
              },
              {
                title: t.projet_1_action_3_titre,
                text: t.projet_1_action_3_texte,
                image: <Img src="app-mobile-3.webp" mobile={{ mode: "fit", ratio: "354 / 275" }} desktop={{ mode: "crop", ratio: "684 / 344", crop: [1, 0.6558, 0, 0] }} />,
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
                image: <Img src="progiciel-1.webp" mobile={{ mode: "fill", ratio: "370 / 348" }} desktop={{ mode: "fill", ratio: "684 / 344" }} />,
              },
              {
                title: t.projet_2_action_2_titre,
                text: t.projet_2_action_2_texte,
                note: t.projet_2_action_2_note,
                image: (
                  <Img
                    src="progiciel-2.webp"
                    mobile={{ mode: "crop", ratio: "354 / 276", crop: [1, 1, 0, 0] }}
                    desktop={{ mode: "crop", ratio: "684 / 344", crop: [1, 0.6548, 0, 0] }}
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
                    desktop={{ mode: "crop", ratio: "684 / 344", crop: [0.9639, 0.6317, 0.0181, 0.1371] }}
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
                    desktop={{ mode: "fill", ratio: "684 / 344" }}
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
                    desktop={{ mode: "fill", ratio: "684 / 344" }}
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
                    desktop={{ mode: "fill", ratio: "684 / 344" }}
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
        <div className="flex flex-col gap-xl project-desktop:gap-xxl">
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

