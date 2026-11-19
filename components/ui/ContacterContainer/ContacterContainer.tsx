"use client";

import { Fragment, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { contact, contactFields, contactMessage, contactObjet, type ContactField } from "@/content/texts";
import { AlertMessage, type AlertMessageType } from "../AlertMessage";
import { HyperLink } from "../HyperLink";
import { PageHead } from "../PageHead";
import { TextField } from "../TextField";
import { TextualButton } from "../TextualButton";
import { isValidPhone } from "./phone";

/*
 * Formulaire de contact — composant Figma « contacterContainer » (fichier portfolio, node 5051:23973).
 * La variante « device » passe par les breakpoints :
 *   mobile  : une colonne, marges spacing/md ;
 *   tablet  : grille de 8 colonnes, champs sur 4 + 4, marges spacing/lg ;
 *   desktop : grille de 12 colonnes, champs sur 6 + 6, marges spacing/lg ;
 *   tabletBis : en tablette, une colonne (champs sur 8) dès qu'un champ ne peut plus afficher
 *     un texte moyen de 20 caractères (choix de l'utilisateur) sur une ligne. Voir ONE_COLUMN.
 * Les écarts de la grille Form (48 / 24) ne sont pas liés à une variable dans Figma : spacing/xxl et spacing/lg.
 *
 * Champs, textes, obligatoire, icônes et types : content/pages/contact.md.
 * Champs « au moins un » (e-mail et téléphone, node 5869:26518) : regroupés pleine largeur sous leur texte
 * (captionText/small/italic, text/brand/bright) ; tablette deux colonnes et desktop : sur une ligne séparés par « et / ou »
 * (body/regular) ; une colonne (mobile, tabletBis) : l'un sous l'autre. Tout à spacing/lg (texte → champs : 24, choix de
 * l'utilisateur ; Figma desktop : spacing/sm).
 * Puis un trait shape/brand/bright, l'objet, et le message suivi du bouton, chacun sur sa ligne de la grille.
 * Légende « * : obligatoire » (captionText/regular, choix de l'utilisateur, text/brand/bright) : flottante, spacing/xs sous le trait du titre,
 * à spacing/md (mobile) ou spacing/lg du bord droit (demande de l'utilisateur).
 * Envoyer (choix de l'utilisateur) : désactivé tant qu'un champ obligatoire est vide, qu'aucun champ « au moins un »
 * n'est rempli correctement, ou qu'une adresse e-mail saisie n'est pas valide.
 *
 * Envoi (Web3Forms, clé NEXT_PUBLIC_WEB3FORMS_KEY ; le mail arrive à l'adresse liée à la clé) :
 * une alerte flottante (AlertMessage) sort du bas du conteneur, par-dessus le contenu : progress pendant l'envoi, puis validate (minutée)
 * ou error (fermée à la croix ; hors ligne ou autre échec). Décisions de l'utilisateur :
 *   réussite : seul le message est vidé ; le bouton garde « Message envoyé » et sa coche jusqu'à ce qu'un nouveau
 *     message soit tapé, puis redevient « Envoyer » ;
 *   échec : tout reste rempli pour pouvoir renvoyer.
 */

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

type Alert = { type: AlertMessageType; text: string; details?: string; timed: boolean };

/* Adresse e-mail écrite dans un texte d'alerte (content/pages/contact.md) : lien mailto cliquable (HyperLink, body/hyperlien). */
const EMAIL_IN_TEXT = /([^\s@]+@[^\s@]+\.[a-z]{2,})/gi;
const withMailLinks = (text: string, size: "caption" | "body" = "body") =>
  text.split(EMAIL_IN_TEXT).map((part, i) =>
    i % 2 === 1 ? (
      <HyperLink key={i} href={`mailto:${part}`} size={size}>
        {part}
      </HyperLink>
    ) : (
      part
    ),
  );

/* Remplissage de test, en développement seulement (next dev, localhost) : retiré du site en ligne. */
const DEV = process.env.NODE_ENV === "development";
const devSample = {
  texte: "Test",
  email: "test@example.com",
  telephone: "06 00 00 00 00",
} as const;
const devObjet = "Test du formulaire";
const devMessage = "Message de test du formulaire de contact.";

const inputTypes = { texte: "text", email: "email", telephone: "tel" } as const;

/*
 * Passage à une colonne (variante tabletBis), selon la largeur du composant (container query) :
 * 20 caractères d'adresse e-mail en body/regular tablette (18 px) mesurent 187 px en moyenne (9,33 px par caractère,
 * mesuré sur 8 adresses), + 48 px devant le texte (spacing/sm, icon/md, spacing/sm) = 235 px par champ.
 * Deux champs + spacing/lg entre eux + spacing/lg de chaque côté = 542 px (33,875rem).
 * En desktop, le composant fait toujours plus de 542 px : la règle ne s'y applique jamais.
 */
const ONE_COLUMN = "tablet:@max-[33.875rem]/contacter:col-span-full";

/* Adresse e-mail : texte@domaine.extension, sans espace. Téléphone : voir phone.ts. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValid = (field: ContactField, value: string) => {
  const text = value.trim();
  if (text === "") return !field.obligatoire || field.auMoinsUn;
  if (field.type === "email") return EMAIL_PATTERN.test(text);
  if (field.type === "telephone") return isValidPhone(text);
  return true;
};

/* Champs « au moins un » : regroupés à la place du premier d'entre eux. */
const groupIndexes = contactFields.flatMap((field, index) => (field.auMoinsUn ? [index] : []));
const groupStart = groupIndexes[0] ?? -1;

export type ContacterContainerProps = {
  className?: string;
};

export function ContacterContainer({ className = "" }: ContacterContainerProps) {
  const [values, setValues] = useState<string[]>(() => contactFields.map(() => ""));
  /* Champs « au moins un » remplis, dans l'ordre où ils l'ont été : le premier garde l'astérisque. */
  const [filledOrder, setFilledOrder] = useState<number[]>([]);
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  /* Clé du champ message : changée après un envoi réussi pour le vider. */
  const [messageKey, setMessageKey] = useState(0);
  /* Remplissage de test : valeurs de départ des champs, recréés à chaque remplissage (fillKey). */
  const [prefill, setPrefill] = useState<{ values: string[]; objet: string; message: string; messageKey: number } | null>(
    null,
  );
  const [fillKey, setFillKey] = useState(0);
  const autofill = () => {
    const next = {
      values: contactFields.map((field) => devSample[field.type]),
      objet: devObjet,
      message: devMessage,
      messageKey,
    };
    setPrefill(next);
    setValues(next.values);
    setFilledOrder(groupIndexes);
    setObjet(next.objet);
    setMessage(next.message);
    setSent(false);
    setFillKey((current) => current + 1);
  };
  const [alert, setAlert] = useState<Alert | null>(null);
  /* Alerte affichée (false : elle redescend sous le bouton, puis est retirée). */
  const [alertOpen, setAlertOpen] = useState(false);

  const ready = contactFields.every((field, index) => isValid(field, values[index])) &&
    (groupIndexes.length === 0 || groupIndexes.some((index) => values[index].trim() !== "")) &&
    isValid(contactObjet, objet) &&
    isValid(contactMessage, message);

  /*
   * Champ trop étroit pour son texte (demande de l'utilisateur) : plutôt que de passer à la ligne dans une demi-largeur,
   * le champ prend toute la largeur du formulaire, et les champs suivants aussi. S'il dépasse encore, le texte passe à la ligne.
   * Mesure : largeur du texte sur une ligne (copie invisible au même style) comparée à la place du texte
   * dans un champ en demi-largeur (place actuelle, moins l'écart avec la demi-largeur si le champ est déjà élargi).
   */
  const formRef = useRef<HTMLFormElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fullFrom, setFullFrom] = useState(Infinity);

  useLayoutEffect(() => {
    const form = formRef.current;
    const measure = measureRef.current;
    if (!form || !measure) return;
    const update = () => {
      const style = getComputedStyle(form);
      const inner = form.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const half = (inner - (parseFloat(style.columnGap) || 0)) / 2;
      // Champs simples seulement, dans l'ordre (le groupe « au moins un » est toujours pleine largeur).
      const fieldEls = Array.from(form.children).filter((el) => !el.hasAttribute("data-groupe"));
      const first = contactFields.findIndex((contactField, index) => {
        if (contactField.auMoinsUn) return false;
        const field = fieldEls[contactFields.slice(0, index).filter((other) => !other.auMoinsUn).length] as
          | HTMLElement
          | undefined;
        const text = field?.querySelector("textarea");
        if (!field || !text || values[index] === "") return false;
        measure.textContent = values[index];
        const room = text.clientWidth - Math.max(0, field.offsetWidth - half);
        return measure.offsetWidth > room;
      });
      setFullFrom(first === -1 ? Infinity : first);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(form);
    return () => observer.disconnect();
  }, [values]);

  const showAlert = (next: Alert) => {
    setAlert(next);
    setAlertOpen(true);
  };

  /* Erreur de test (développement seulement) : le prochain envoi échoue sans rien envoyer. */
  const devErrorRef = useRef<"hors_ligne" | "echec" | null>(null);
  const simulateError = (kind: "hors_ligne" | "echec") => {
    devErrorRef.current = kind;
    formRef.current?.requestSubmit();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // Erreur de test : simulée même avec un formulaire incomplet.
    if ((!ready && !(DEV && devErrorRef.current)) || sending) return;
    setSending(true);
    showAlert({ type: "progress", text: contact.alerte_envoi, timed: false });

    const fields = Object.fromEntries(contactFields.map((field, index) => [field.titre, values[index].trim()]));
    const emailIndex = contactFields.findIndex((field) => field.type === "email");
    const name = contactFields
      .map((field, index) => (field.type === "texte" ? values[index].trim() : ""))
      .filter(Boolean)
      .join(" ");

    try {
      if (DEV && devErrorRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new Error(`erreur de test : ${devErrorRef.current}`);
      }
      /* Sur localhost (dev ou build lancé en local), aucun mail ne part : envoi réussi simulé (demande de l'utilisateur).
         Le site en ligne envoie normalement. */
      if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
        if (!key) throw new Error("NEXT_PUBLIC_WEB3FORMS_KEY manquante");
        const response = await fetch(WEB3FORMS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: key,
            // Objet saisi : « fr:portfolio : <objet> » (demande de l'utilisateur) ; sinon l'objet par défaut.
            subject: objet.trim() ? `${contact.mail_objet_debut}${objet.trim()}` : contact.mail_objet,
            from_name: name,
            // « email » : adresse de réponse du mail reçu (Web3Forms).
            ...(emailIndex !== -1 && values[emailIndex].trim() !== "" ? { email: values[emailIndex].trim() } : {}),
            ...fields,
            [contactObjet.titre]: objet.trim(),
            [contactMessage.titre]: message.trim(),
          }),
        });
        const result = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;
        if (!response.ok || !result?.success) throw new Error(result?.message ?? `HTTP ${response.status}`);
      }

      setMessage("");
      setMessageKey((current) => current + 1);
      setSent(true);
      showAlert({ type: "validate", text: contact.alerte_envoye, timed: true });
    } catch (error) {
      console.error("Envoi du formulaire de contact :", error);
      const offline =
        DEV && devErrorRef.current ? devErrorRef.current === "hors_ligne" : typeof navigator !== "undefined" && !navigator.onLine;
      showAlert({
        type: "error",
        text: offline ? contact.alerte_hors_ligne : contact.alerte_echec,
        details: offline ? contact.alerte_hors_ligne_details : contact.alerte_echec_details,
        timed: false,
      });
    } finally {
      devErrorRef.current = null;
      setSending(false);
    }
  };

  const fieldProps = (field: ContactField) => ({
    label: field.titre,
    required: field.obligatoire,
    details: field.details || undefined,
    iconBefore: field.icone !== undefined,
    icon: field.icone,
    // Croix seulement dans un champ rempli (demande de l'utilisateur ; IconAfter=false dans les instances Figma).
    iconAfter: "filled" as const,
  });

  const renderField = (index: number, className: string) => {
    const field = contactFields[index];
    return (
      <TextField
        key={`${field.titre}-${fillKey}`}
        {...fieldProps(field)}
        // « Au moins un » (demande de l'utilisateur) : tant qu'aucun champ du groupe n'est rempli, tous ont l'astérisque ;
        // ensuite, seul le premier rempli le garde (si on le vide, il passe au suivant encore rempli).
        required={field.auMoinsUn ? filledOrder.length === 0 || filledOrder[0] === index : field.obligatoire}
        defaultValue={prefill?.values[index]}
        inputType={inputTypes[field.type]}
        // Téléphone : seuls chiffres, espaces, +, points, tirets, barres obliques et parenthèses s'écrivent (demande de l'utilisateur).
        sanitize={field.type === "telephone" ? (value) => value.replace(/[^\d\s+.\-/()]/g, "") : undefined}
        autoComplete={field.autocompletion}
        isValid={field.type === "texte" ? undefined : (value) => isValid(field, value)}
        errorDetails={
          field.type === "email" ? contact.email_invalide : field.type === "telephone" ? contact.telephone_invalide : undefined
        }
        onValueChange={(value) => {
          setValues((current) => current.map((old, i) => (i === index ? value : old)));
          if (field.auMoinsUn) {
            const filled = value.trim() !== "";
            setFilledOrder((order) =>
              filled ? (order.includes(index) ? order : [...order, index]) : order.filter((other) => other !== index),
            );
          }
        }}
        className={className}
      />
    );
  };

  return (
    <div className={`@container/contacter relative flex w-full flex-col gap-xxl ${className}`}>
      <div className="relative">
        <PageHead type="H2" details={contact.formulaire_details} title={contact.formulaire_titre} />
        <p className="type-caption-regular absolute top-full right-md mt-xs text-text-brand-bright tablet:right-lg">
          {contact.obligatoire_legende}
        </p>
      </div>

      {DEV && (
        <div className="type-caption-regular mx-md -my-lg flex flex-wrap gap-lg text-text-neutral-white tablet:mx-lg">
          <span>Tests (localhost seulement) :</span>
          <button type="button" onClick={autofill} className="cursor-pointer underline">
            Remplir
          </button>
          <button type="button" onClick={() => simulateError("hors_ligne")} className="cursor-pointer underline">
            Erreur hors ligne
          </button>
          <button type="button" onClick={() => simulateError("echec")} className="cursor-pointer underline">
            Erreur autre échec
          </button>
        </div>
      )}

      <form
        ref={formRef}
        noValidate
        onSubmit={submit}
        className="relative flex w-full flex-col gap-xxl px-md tablet:grid tablet:grid-cols-8 tablet:gap-x-lg tablet:gap-y-xxl tablet:px-lg desktop:grid-cols-12"
      >
        {contactFields.map((field, index) => {
          if (!field.auMoinsUn) {
            return renderField(index, index >= fullFrom ? "col-span-full" : `tablet:col-span-4 ${ONE_COLUMN} desktop:col-span-6`);
          }
          if (index !== groupStart) return null;
          return (
            <div
              key="groupe"
              data-groupe
              className="flex flex-col gap-lg tablet:col-span-full"
            >
              <p className="type-caption-small-italic text-text-brand-bright">{contact.au_moins_un_texte}</p>
              <div
                className={`flex flex-col gap-lg tablet:flex-row tablet:items-center tablet:@max-[33.875rem]/contacter:flex-col tablet:@max-[33.875rem]/contacter:items-stretch`}
              >
                {groupIndexes.map((groupIndex, order) => (
                  <Fragment key={groupIndex}>
                    {order > 0 && (
                      <p className="type-body-regular whitespace-nowrap text-text-neutral-white">
                        {contact.au_moins_un_separateur}
                      </p>
                    )}
                    {renderField(groupIndex, `tablet:min-w-0 tablet:flex-1 tablet:@max-[33.875rem]/contacter:flex-none`)}
                  </Fragment>
                ))}
              </div>
            </div>
          );
        })}

        {/* Copie invisible pour mesurer la largeur d'un texte saisi sur une ligne (même style que le champ). */}
        <span ref={measureRef} aria-hidden className="type-body-regular pointer-events-none invisible absolute whitespace-pre" />

        {/* Trait shape/brand/bright, puis objet : chacun sur sa ligne de la grille (spacing/xxl entre elles). */}
        <span aria-hidden data-groupe className="w-full border-t border-shape-brand-bright tablet:col-span-full" />
        <TextField
          key={fillKey}
          {...fieldProps(contactObjet)}
          defaultValue={prefill?.objet}
          onValueChange={setObjet}
          className="tablet:col-span-full"
        />

        {/* Textarea (messageContainer en mobile) : message puis bouton, pleine largeur. */}
        <div data-groupe className="flex w-full flex-col gap-lg tablet:col-span-full">
          <TextField
            key={`${messageKey}-${fillKey}`}
            defaultValue={messageKey === prefill?.messageKey ? prefill?.message : undefined}
            type="textArea"
            {...fieldProps(contactMessage)}
            onValueChange={(value) => {
              setMessage(value);
              if (value !== "") setSent(false);
            }}
          />
          {ready || sent ? (
            <TextualButton type="submit" color="white" icon={sent ? "Check" : "ArrowRight"} iconPosition="right">
              {sent ? contact.envoye : contact.envoyer}
            </TextualButton>
          ) : (
            <TextualButton type="submit" disabled color="white" icon="ArrowRight" iconPosition="right">
              {contact.envoyer}
            </TextualButton>
          )}
        </div>
      </form>

      {/* Alerte flottante : sort du bas du conteneur, par-dessus le contenu, dans les marges du formulaire,
          et s'arrête à spacing/lg (24) du bas (demande de l'utilisateur), ce qui laisse la place à l'ombre dropshadow/bold ;
          puis redescend sous le bas du conteneur, où elle est coupée. */}
      {alert && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-y-clip px-md pb-lg tablet:px-lg">
          <AlertMessage
            type={alert.type}
            text={withMailLinks(alert.text)}
            details={alert.details ? withMailLinks(alert.details, "caption") : undefined}
            timed={alert.timed}
            onClose={() => {
              setAlertOpen(false);
              // Sans animation (mouvement réduit), pas de fin de transition : retrait direct.
              if (matchMedia("(prefers-reduced-motion: reduce)").matches) setAlert(null);
            }}
            className={`pointer-events-auto transition-transform duration-(--alert-message-slide-duration) ease-(--alert-message-slide-ease) starting:translate-y-[calc(100%+var(--spacing-lg))] motion-reduce:transition-none ${
              alertOpen ? "translate-y-0" : "translate-y-[calc(100%+var(--spacing-lg))]"
            }`}
            onTransitionEnd={(event) => {
              if (event.target === event.currentTarget && !alertOpen) setAlert(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
