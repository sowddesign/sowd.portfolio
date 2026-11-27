import type { ReactNode } from "react";
import { flashInvaders as t } from "@/content/texts";
import { HyperLink } from "@/components/ui/HyperLink";
import { methodeHref } from "@/components/ui/Methode/methode-href";
import { ProjectImage, type ImageFraming } from "@/components/ui/ProjectImage";
import { RichLines } from "@/components/ui/RichText";
import { TextualButton } from "@/components/ui/TextualButton";
import { parseLine } from "@/lib/markdown";
import { ProjectVideo } from "./ProjectVideo";

/*
 * Contenu de la page projet Flash Invaders — maquette Figma « body/projetDescription » (fichier content, node 6383:4433),
 * textes du document de consignes (content/projects/flashinvaders/page.md) ; images : public/projects/flashinvaders/.
 * Même construction que la page C-Media : mobile et tablette en une colonne (texte puis image, demande de l'utilisateur), desktop sur une grille
 * de 12 colonnes (gouttière spacing/lg), les blocs qui changent de place passent en « display: contents ».
 * Adaptations (demande de l'utilisateur) : texte courant en body et libellés en body/accentuation partout, écarts de la grille uniformisés
 * à spacing/lg, images dans le cadre des pages projet (ProjectImage, recadrage Figma), gros chiffres en
 * extra/datavizHugeNumber, liste « Ce que cela a apporté » reprise de la liste numérotée de la méthode,
 * arborescence en post-it défilée horizontalement quand l'écran est plus étroit que le tableau.
 * Écarts hors desktop alignés sur ceux de la méthode (demande de l'utilisateur) : libellé → texte spacing/xs,
 * titre → contenu et entre libellés spacing/md, élément numéroté spacing/xs puis spacing/xxs, images spacing/md.
 */

const IMG = "/projects/flashinvaders";
const FILE = "content/projects/flashinvaders/page.md";

/** Slugs des fiches méthode (content/methode/sections/<slug>.md). */
const METHODE_OBSERVATION = "observations-terrain";
const METHODE_USER_JOURNEY = "user-journey";

function fail(message: string): never {
  throw new Error(`${FILE} : ${message}`);
}

/** Texte avec mise en forme (gras, italique, liens) et retours à la ligne « \n ». */
function Rich({ text }: { text: string }) {
  return <RichLines lines={text.split("\n").map((line) => parseLine(line, fail))} size="body" background="dark" />;
}

function Divider() {
  return <span aria-hidden className="w-full shrink-0 border-t border-shape-neutral-white" />;
}

const grid = "desktop:grid desktop:grid-cols-12 desktop:gap-x-lg";

/** Bloc avec marges latérales de page. */
function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`flex w-full flex-col px-md text-text-neutral-white tablet:px-lg ${className}`}>{children}</section>;
}

/** Titre de phase (headings/H3) avec son numéro (captionSwiss/regular) et son sous-titre, puis un trait. */
function PhaseHead({ title, number, subtitle }: { title: string; number: string; subtitle: string }) {
  return (
    <div className="flex w-full flex-col gap-xs">
      <div className="flex w-full items-center justify-between gap-md py-xs tablet:py-sm">
        <div className="flex min-w-0 flex-col">
          <h2 className="type-h3">{title}</h2>
          <p className="type-caption-small-italic">{subtitle}</p>
        </div>
        <span className="type-swiss-regular shrink-0">{number}</span>
      </div>
      <Divider />
    </div>
  );
}

/** Titre de bloc (headings/subheading) et sous-titre facultatif (captionText/small/italic). */
function BlockTitle({ title, subtitle, className = "" }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-xs ${className}`}>
      <h3 className="type-subheading">{title}</h3>
      {subtitle && <p className="type-caption-small-italic">{subtitle}</p>}
    </div>
  );
}

/** Libellé (captionText/accentuation) suivi de son contenu. */
function Field({ label, labelClassName = "", children, className = "" }: { label: string; labelClassName?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-xs desktop:gap-sm ${className}`}>
      <p className={`type-body-accentuation ${labelClassName}`}>{label}</p>
      {children}
    </div>
  );
}

function Bullets({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`type-body-regular ps-lg text-pretty ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((item) => (
        <li key={item}>
          <Rich text={item} />
        </li>
      ))}
    </List>
  );
}

function Img({ src, framing, sizes }: { src: string; framing: ImageFraming; sizes?: string }) {
  return <ProjectImage src={`${IMG}/${src}`} mobile={framing} desktop={framing} sizes={sizes} />;
}

/** Bouton vers une fiche de la méthode (action secondaire, comme « Voir le projet … » dans les fiches). */
function MethodeButton({ slug, children }: { slug: string; children: string }) {
  return (
    <div className="flex desktop:col-span-4">
      <TextualButton variant="secondary" color="white" icon="ArrowUpRight" iconPosition="right" href={methodeHref(slug)} newTab>
        {children}
      </TextualButton>
    </div>
  );
}

/** Cadre d'un élément intégré (Figma, vidéo) : coins corner/xs, proportions du cadre Figma. */
function EmbedFrame({ ratio, children, className = "" }: { ratio: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-full max-w-(--project-media-max-width) overflow-hidden rounded-xs bg-background-neutral-black desktop:max-w-full ${className}`} style={{ aspectRatio: ratio }}>
      {children}
    </div>
  );
}

function FigmaEmbed({ src, title, ratio, className }: { src: string; title: string; ratio: string; className?: string }) {
  return (
    <EmbedFrame ratio={ratio} className={className}>
      <iframe src={src} title={title} allowFullScreen loading="lazy" className="absolute inset-0 size-full border-0" />
    </EmbedFrame>
  );
}

/* ---------- Découvrir ---------- */

function Entretiens() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-xxl`}>
      <div className="flex flex-col gap-md desktop:col-span-4 desktop:row-start-1 desktop:gap-lg">
        <BlockTitle title={t.entretiens_titre} subtitle={t.entretiens_sous_titre} />
        <Field label={t.entretiens_duree_label}>
          <p className="type-body-regular">{t.entretiens_duree}</p>
        </Field>
        <Field label={t.objectif}>
          <p className="type-body-regular text-pretty">
            <Rich text={t.entretiens_objectif} />
          </p>
        </Field>
        <Field label={t.entretiens_criteres_label}>
          <Bullets items={t.entretiens_criteres} />
        </Field>
      </div>
      <div className="desktop:col-span-4 desktop:col-start-5 desktop:row-start-1">
        <Img src="entretiens.webp" framing={{ mode: "fill", ratio: "448 / 442" }} />
      </div>
      <div className="flex flex-col gap-md desktop:col-span-12 desktop:grid desktop:grid-cols-12 desktop:gap-x-lg desktop:gap-y-sm">
        <p className="type-body-accentuation desktop:col-span-12">{t.entretiens_questions_label}</p>
        {t.entretiens_questions.map(({ question, objectif }, i) => (
          <div key={question} className="flex flex-col gap-xxs desktop:contents">
            <ol start={i + 1} className="type-body-regular list-decimal ps-lg text-pretty desktop:col-span-4 desktop:col-start-5">
              <li>{question}</li>
            </ol>
            <p className="type-body-italic text-pretty desktop:col-span-4 desktop:col-start-9">
              <span className="text-text-brand-bright">{t.objectif}</span> <Rich text={objectif} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Audit() {
  return (
    <div className={`flex flex-col gap-md ${grid}`}>
      <div className="flex flex-col gap-md desktop:col-span-8 desktop:grid desktop:grid-cols-8 desktop:gap-lg">
        <BlockTitle title={t.audit_titre} subtitle={t.audit_sous_titre} className="desktop:col-span-8" />
        <Field label={t.audit_positifs_label} className="desktop:col-span-4">
          <Bullets items={t.audit_positifs} />
        </Field>
        <Field label={t.audit_negatifs_label} className="desktop:col-span-4">
          <Bullets items={t.audit_negatifs} />
        </Field>
        <Field label={t.audit_axes_label} className="desktop:col-span-4">
          <Bullets items={t.audit_axes} />
        </Field>
      </div>
      {/* Figma : image « Fit » sur la zone recadrée (part visible 36 % de la hauteur, à partir de 32 %). */}
      <div className="desktop:col-span-4 desktop:col-start-9 desktop:row-start-1">
        <Img src="audit.webp" framing={{ mode: "crop", ratio: "1200 / 944", crop: [1, 0.3618, 0, 0.3191] }} />
      </div>
    </div>
  );
}

/* Benchmark : les quatre écrans de l'image Pokémon GO, chacun recadré sur l'écran du téléphone (bords du cadre
   mesurés dans l'image : écran 345 × 738 px, à 4 px à l'intérieur du cadre gris), demande de l'utilisateur. */
const benchmarkCrops = [96, 557, 1018, 1476].map(
  (left): ImageFraming => ({ mode: "crop", ratio: "345 / 738", crop: [345 / 1920, 738 / 969, left / 1920, 188 / 969] }),
);

function Benchmark() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.benchmark_titre} subtitle={t.benchmark_sous_titre} className="desktop:col-span-12" />
      <Field label={t.benchmark_retenir_label} className="desktop:col-span-4 desktop:row-start-2">
        <Bullets items={t.benchmark_retenir} />
      </Field>
      <Field label={t.benchmark_eviter_label} className="desktop:col-span-4 desktop:col-start-9 desktop:row-start-2">
        <Bullets items={t.benchmark_eviter} />
      </Field>
      {/* Les quatre écrans à la suite dans la colonne du milieu (demande de l'utilisateur) ; deux par ligne en mobile. */}
      <div className="grid grid-cols-2 gap-md desktop:col-span-4 desktop:col-start-5 desktop:row-start-2 desktop:grid-cols-4 desktop:gap-lg desktop:self-start">
        {benchmarkCrops.map((framing, i) => (
          /* sizes = largeur de l'image entière, agrandie ×5,7 par le recadrage (un écran = 17,5 % de sa largeur) :
             sans ça, le navigateur charge une version trop petite, floue une fois agrandie. */
          <Img key={i} src="benchmark.webp" framing={framing} sizes="(width > 1300px) 45vw, 230vw" />
        ))}
      </div>
    </div>
  );
}

function Observation() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.observation_titre} className="desktop:col-span-12" />
      <div className="flex flex-col gap-md desktop:col-span-4 desktop:row-start-2 desktop:gap-lg">
        <Field label={t.observation_organisation_label}>
          <p className="type-body-regular text-pretty">{t.observation_organisation}</p>
        </Field>
        <Field label={t.observation_deroule_label}>
          <Bullets items={t.observation_deroule} ordered />
        </Field>
      </div>
      <Field
        label={t.observation_bonus_label}
        labelClassName="text-text-brand-bright"
        className="desktop:col-span-4 desktop:col-start-9 desktop:row-start-2 desktop:self-end"
      >
        <p className="type-body-regular text-pretty">{t.observation_bonus}</p>
      </Field>
      <div className="desktop:col-span-4 desktop:col-start-5 desktop:row-start-2">
        <Img src="observation.webp" framing={{ mode: "fill", ratio: "448 / 254" }} />
      </div>
      {/* Ce que cela a apporté : liste numérotée des fiches méthode (numéro, constat, puis « → Refonte » en
          captionText/small/italic), aux tailles de texte de la page (captionText) et sur les colonnes de la grille
          (une par constat, comme les questions et les résultats). */}
      <Field label={t.observation_apports_label} className="desktop:col-span-12">
        <ol className="flex flex-col gap-md desktop:grid desktop:grid-cols-3 desktop:gap-lg">
          {t.observation_apports.map(({ constat, refonte }, i) => (
            <li key={constat} className="flex items-start gap-xs desktop:gap-sm">
              <span className="type-body-accentuation w-(--p-number-20) shrink-0">{i + 1}.</span>
              <div className="flex min-w-0 flex-1 flex-col gap-xxs desktop:gap-xs">
                <p className="type-body-regular text-pretty">{constat}</p>
                <p className="type-caption-small-italic text-pretty">
                  <Rich text={refonte} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Field>
      <MethodeButton slug={METHODE_OBSERVATION}>{t.voir_methode_observation}</MethodeButton>
    </div>
  );
}

function Questionnaire() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-xxl`}>
      <BlockTitle title={t.questionnaire_titre} className="desktop:col-span-12" />
      <div className="flex flex-col gap-md desktop:contents">
        {/* Lien sous le déroulé (demande de l'utilisateur), même écart que les libellés empilés de l'Observation. */}
        <div className="flex flex-col gap-md desktop:col-span-4 desktop:row-start-2 desktop:gap-lg">
          <Field label={t.questionnaire_deroule_label}>
            <p className="type-body-regular text-pretty">{t.questionnaire_deroule}</p>
          </Field>
          <Field label={t.questionnaire_lien_label}>
            <ul className="type-body-regular list-disc ps-lg">
              <li>
                <HyperLink href={t.questionnaire_lien} size="body" background="dark">
                  {t.questionnaire_lien_texte}
                </HyperLink>
              </li>
            </ul>
          </Field>
        </div>
        <div className="desktop:col-span-4 desktop:col-start-5 desktop:row-start-2">
          <Img src="questionnaire.webp" framing={{ mode: "fill", ratio: "432 / 188" }} />
        </div>
      </div>
      <Field label={t.questionnaire_resultats_label} className="desktop:col-span-12">
        {/* Même affichage que les gros chiffres de la méthode (demande de l'utilisateur) : chiffre extra/datavizHugeNumber,
            libellé body/regular, écart spacing/sm (spacing/xs hors desktop) ; deux par ligne côte à côte (gouttière
            spacing/md) hors desktop, trois en desktop. */}
        <div className="grid grid-cols-2 gap-md desktop:grid-cols-3 desktop:gap-lg">
          {t.questionnaire_resultats.map(({ chiffre, legende }) => (
            <div key={legende} className="flex flex-col gap-xs desktop:gap-sm">
              <p className="type-extra-dataviz">{chiffre}</p>
              <p className="type-body-regular text-pretty">{legende}</p>
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}

/* ---------- Définir ---------- */

function Personas() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.personas_titre} className="desktop:col-span-12" />
      {/* Côte à côte en desktop, 6 colonnes chacun (demande de l'utilisateur) ; l'un sous l'autre en mobile et tablette. */}
      {t.personas.map(({ cible, prenom, description, image }) => (
        <div key={prenom} className="flex flex-col gap-xs desktop:col-span-6 desktop:gap-sm">
          <p className="type-body-accentuation">{cible}</p>
          <p className="flex flex-wrap items-baseline gap-xxs">
            <span className="type-body-regular">{prenom}</span>
            <span className="type-caption-small-italic">{description}</span>
          </p>
          <Img src={image} framing={{ mode: "fill", ratio: "924 / 435" }} sizes="(width > 1300px) 50vw, 100vw" />
        </div>
      ))}
    </div>
  );
}

function UserJourney() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.user_journey_titre} subtitle={t.user_journey_sous_titre} className="desktop:col-span-12" />
      {/* Un paragraphe par colonne en desktop (demande de l'utilisateur) : le constat à gauche, « La refonte vise… »
          au milieu. */}
      <div className="type-body-regular flex flex-col gap-xs text-pretty desktop:contents">
        {t.user_journey_texte.map((paragraph, i) => (
          <p key={paragraph} className={`desktop:col-span-4 ${i ? "desktop:col-start-5 desktop:row-start-2" : "desktop:row-start-2"}`}>
            <Rich text={paragraph} />
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-md desktop:col-span-12 desktop:grid desktop:grid-cols-3 desktop:gap-lg">
        {[1, 2, 3].map((n) => (
          <Img key={n} src={`user-journey-${n}.webp`} framing={{ mode: "fill", ratio: "456 / 437" }} />
        ))}
      </div>
      <MethodeButton slug={METHODE_USER_JOURNEY}>{t.voir_methode_user_journey}</MethodeButton>
    </div>
  );
}

/* ---------- Développer ---------- */

/** Couleur de chaque page de l'application dans l'arborescence (Figma : variables shape/*). */
const pageColors: Record<string, string> = {
  flash: "bg-shape-brand-whitish text-text-neutral-black",
  carte: "bg-shape-brand-bright text-text-neutral-black",
  collection: "bg-shape-neutral-white text-text-neutral-black",
  communaute: "bg-shape-brand-brand text-text-neutral-black",
  compte: "bg-shape-brand-somber text-text-neutral-white",
};

function colorOf(page: string) {
  return pageColors[page] ?? fail(`la page « ${page} » n'a pas de couleur (flash, carte, collection, communaute, compte).`);
}

function Arborescence() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.arborescence_titre} className="desktop:col-span-12" />
      <Field label={t.arborescence_audit_label} className="desktop:col-span-4">
        <p className="type-body-regular text-pretty">{t.arborescence_audit}</p>
      </Field>
      {/* Tableau de post-it : grille de 12 colonnes (écart spacing/sm) à la largeur du tableau Figma ;
          défilé horizontalement quand l'écran est plus étroit. Légende dans le coin bas droit. */}
      <div className="-mx-md overflow-x-auto px-md desktop:col-span-12 tablet:-mx-lg tablet:px-lg desktop:mx-none desktop:overflow-visible desktop:px-none">
        <div className="grid w-(--project-flash-board-width) grid-cols-12 grid-rows-6 gap-sm desktop:w-full">
          {t.arborescence_postits.map(({ ligne, colonne, page, texte, etiquette }) => (
            <div
              key={`${ligne}-${colonne}`}
              style={{ gridRow: ligne, gridColumn: colonne }}
              className={`flex flex-col justify-between gap-xxs rounded-xs px-xs pt-xs ${colorOf(page)}`}
            >
              <p className="type-caption-small-regular text-pretty">
                <Rich text={texte} />
              </p>
              <p className="type-caption-small-italic text-right">{etiquette}</p>
            </div>
          ))}
          <div className="col-span-3 col-start-10 row-span-2 row-start-5 flex flex-col gap-sm">
            {t.arborescence_legende.map(({ page, nom }) => (
              <div key={page} className="flex flex-1 items-center gap-xs">
                <span aria-hidden className={`h-full min-h-(--p-number-20) w-(--project-flash-legend-swatch) shrink-0 rounded-xs ${colorOf(page)}`} />
                <span className="type-body-regular">{nom}</span>
              </div>
            ))}
            <p className="type-caption-small-italic">{t.arborescence_legende_note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Wireframe() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.wireframe_titre} subtitle={t.wireframe_sous_titre} className="desktop:col-span-12" />
      <FigmaEmbed src={t.wireframe_embed} title={t.wireframe_titre} ratio="920 / 649" className="desktop:col-span-8 desktop:col-start-3" />
    </div>
  );
}

function DesignSystem() {
  const framings: ImageFraming[] = [
    { mode: "crop", ratio: "448 / 275.52", crop: [0.91463, 1, 0.04268, 0] },
    { mode: "crop", ratio: "448 / 275.52", crop: [0.91463, 1, 0.04268, 0] },
    { mode: "crop", ratio: "448 / 275.52", crop: [0.91599, 1, 0.04201, 0] },
  ];
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-xxl`}>
      <BlockTitle title={t.design_system_titre} className="desktop:col-span-12" />
      <div className="flex flex-col gap-md desktop:col-span-12 desktop:grid desktop:grid-cols-3 desktop:gap-lg">
        {framings.map((framing, i) => (
          <Img key={i} src={`design-system-${i + 1}.webp`} framing={framing} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Livrer ---------- */

function Prototype() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.prototype_titre} subtitle={t.prototype_sous_titre} className="desktop:col-span-12" />
      {/* Une seule vidéo dans la colonne du milieu (demande de l'utilisateur), recadrée sur l'écran du téléphone
          (bandes noires retirées) : cadre aux proportions de la vidéo, 496 × 1072, réduit à
          --project-flash-video-width et centré. */}
      <ProjectVideo
        src={`${IMG}/prototype.mp4`}
        title={t.prototype_titre}
        ratio="496 / 1072"
        className="mx-auto max-w-(--project-flash-video-width) desktop:col-span-4 desktop:col-start-5"
      />
    </div>
  );
}

function Presentation() {
  return (
    <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
      <BlockTitle title={t.presentation_titre} subtitle={t.presentation_sous_titre} className="desktop:col-span-12" />
      <FigmaEmbed src={t.presentation_embed} title={t.presentation_titre} ratio="920 / 649" className="desktop:col-span-8 desktop:col-start-3" />
    </div>
  );
}

/** Phase : titre puis blocs séparés par un trait. */
function Phase({ title, number, subtitle, blocks }: { title: string; number: string; subtitle: string; blocks: ReactNode[] }) {
  return (
    <Section className="gap-xl desktop:gap-xxl">
      <PhaseHead title={title} number={number} subtitle={subtitle} />
      {blocks.map((block, i) => (
        <div key={i} className="flex flex-col gap-xl desktop:gap-xxl">
          {i > 0 && <Divider />}
          {block}
        </div>
      ))}
    </Section>
  );
}

export function FlashInvadersContent() {
  return (
    <div className="flex w-full flex-col gap-xl pt-xl desktop:gap-xxl tablet:pt-xxl">
      {/* Contexte */}
      <Section>
        <div className={`flex flex-col gap-md ${grid} desktop:gap-y-lg`}>
          <h2 className="type-subheading desktop:col-span-12">{t.contexte_titre}</h2>
          {/* Trois colonnes (demande de l'utilisateur) : texte, note en italique, rôles. */}
          <div className="type-body-regular flex flex-col gap-xs text-pretty desktop:col-span-4 desktop:gap-sm">
            {t.contexte_paragraphes.map((paragraph) => (
              <p key={paragraph}>
                <Rich text={paragraph} />
              </p>
            ))}
          </div>
          <p className="type-body-italic text-pretty desktop:col-span-4 desktop:col-start-5 desktop:self-start">{t.contexte_note}</p>
          <ul className="type-swiss-accentuation flex flex-wrap gap-lg desktop:col-span-4 desktop:col-start-9 desktop:justify-end desktop:self-start">
            {t.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Divider />

      <Phase
        title={t.phase_1_titre}
        number={t.phase_1_numero}
        subtitle={t.phase_1_sous_titre}
        blocks={[<Entretiens key="e" />, <Audit key="a" />, <Benchmark key="b" />, <Observation key="o" />, <Questionnaire key="q" />]}
      />

      <Divider />

      <Phase title={t.phase_2_titre} number={t.phase_2_numero} subtitle={t.phase_2_sous_titre} blocks={[<Personas key="p" />, <UserJourney key="u" />]} />

      <Divider />

      <Phase
        title={t.phase_3_titre}
        number={t.phase_3_numero}
        subtitle={t.phase_3_sous_titre}
        blocks={[<Arborescence key="a" />, <Wireframe key="w" />, <DesignSystem key="d" />]}
      />

      <Divider />

      <Phase title={t.phase_4_titre} number={t.phase_4_numero} subtitle={t.phase_4_sous_titre} blocks={[<Prototype key="p" />, <Presentation key="s" />]} />

      <Divider />
    </div>
  );
}
