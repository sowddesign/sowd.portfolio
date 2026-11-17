"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { contact, contactFields, contactMessage, contactObjet, type ContactField } from "@/content/texts";
import { AlertMessage, type AlertMessageType } from "../AlertMessage";
import { HyperLink } from "../HyperLink";
import { PageHead } from "../PageHead";
import { TextField } from "../TextField";
import { TextualButton } from "../TextualButton";

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
 * Envoyer (choix de l'utilisateur) : désactivé tant qu'un champ obligatoire est vide ou qu'une adresse
 * e-mail saisie n'est pas valide.
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

/* Adresse e-mail : texte@domaine.extension, sans espace. Le téléphone n'est pas vérifié (formats internationaux). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValid = (field: ContactField, value: string) => {
  const text = value.trim();
  if (text === "") return !field.obligatoire;
  return field.type !== "email" || EMAIL_PATTERN.test(text);
};

export type ContacterContainerProps = {
  className?: string;
};

export function ContacterContainer({ className = "" }: ContacterContainerProps) {
  const [values, setValues] = useState<string[]>(() => contactFields.map(() => ""));
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
    setObjet(next.objet);
    setMessage(next.message);
    setSent(false);
    setFillKey((current) => current + 1);
  };
  const [alert, setAlert] = useState<Alert | null>(null);
  /* Alerte affichée (false : elle redescend sous le bouton, puis est retirée). */
  const [alertOpen, setAlertOpen] = useState(false);

  const ready = contactFields.every((field, index) => isValid(field, values[index])) &&
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
      const first = contactFields.findIndex((_, index) => {
        const field = form.children[index] as HTMLElement | undefined;
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
            subject: contact.mail_objet,
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

  return (
    <div className={`@container/contacter relative flex w-full flex-col gap-xxl ${className}`}>
      <PageHead type="H2" details={contact.formulaire_details} title={contact.formulaire_titre} />

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
        {contactFields.map((field, index) => (
          <TextField
            key={`${field.titre}-${fillKey}`}
            {...fieldProps(field)}
            defaultValue={prefill?.values[index]}
            inputType={inputTypes[field.type]}
            isValid={field.type === "email" ? (value) => EMAIL_PATTERN.test(value.trim()) : undefined}
            errorDetails={field.type === "email" ? contact.email_invalide : undefined}
            onValueChange={(value) => setValues((current) => current.map((old, i) => (i === index ? value : old)))}
            className={index >= fullFrom ? "col-span-full" : `tablet:col-span-4 ${ONE_COLUMN} desktop:col-span-6`}
          />
        ))}

        {/* Copie invisible pour mesurer la largeur d'un texte saisi sur une ligne (même style que le champ). */}
        <span ref={measureRef} aria-hidden className="type-body-regular pointer-events-none invisible absolute whitespace-pre" />

        {/* Textarea (messageContainer en mobile) : objet et message, puis bouton, pleine largeur. */}
        <div className="flex w-full flex-col gap-lg tablet:col-span-full">
          {/* Objet puis message : spacing/xxl (48, demande de l'utilisateur ; Figma : 24 sans variable). */}
          <div className="flex flex-col gap-xxl">
            <TextField
              key={fillKey}
              {...fieldProps(contactObjet)}
              defaultValue={prefill?.objet}
              onValueChange={setObjet}
            />
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
          </div>
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
