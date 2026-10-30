"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { contact, contactFields, contactMessage, type ContactField } from "@/content/texts";
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
 * e-mail saisie n'est pas valide ; au clic, le bouton affiche « Message envoyé » et une coche.
 * Aucun envoi réel pour l'instant.
 */

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
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const ready = contactFields.every((field, index) => isValid(field, values[index])) && isValid(contactMessage, message);

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

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) setSent(true);
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
    <div className={`@container/contacter flex w-full flex-col gap-xxl ${className}`}>
      <PageHead type="H2" details={contact.formulaire_details} title={contact.formulaire_titre} />

      <form
        ref={formRef}
        noValidate
        onSubmit={submit}
        className="relative flex w-full flex-col gap-xxl px-md tablet:grid tablet:grid-cols-8 tablet:gap-x-lg tablet:gap-y-xxl tablet:px-lg desktop:grid-cols-12"
      >
        {contactFields.map((field, index) => (
          <TextField
            key={field.titre}
            {...fieldProps(field)}
            inputType={inputTypes[field.type]}
            isValid={field.type === "email" ? (value) => EMAIL_PATTERN.test(value.trim()) : undefined}
            onValueChange={(value) => setValues((current) => current.map((old, i) => (i === index ? value : old)))}
            className={index >= fullFrom ? "col-span-full" : `tablet:col-span-4 ${ONE_COLUMN} desktop:col-span-6`}
          />
        ))}

        {/* Copie invisible pour mesurer la largeur d'un texte saisi sur une ligne (même style que le champ). */}
        <span ref={measureRef} aria-hidden className="type-body-regular pointer-events-none invisible absolute whitespace-pre" />

        {/* Textarea (messageContainer en mobile) : message puis bouton, pleine largeur. */}
        <div className="flex w-full flex-col gap-lg tablet:col-span-full">
          <TextField type="textArea" {...fieldProps(contactMessage)} onValueChange={setMessage} />
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
    </div>
  );
}
