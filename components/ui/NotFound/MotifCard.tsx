"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import { introuvable } from "@/content/texts";
import { ColorPicker, HexField } from "../ColorPicker";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { SwitchButton } from "../SwitchButton";
import { FloatingScrollBar } from "../FloatingScrollBar";
import { TextualButton } from "../TextualButton";
import { isLight } from "./MotifEditor";

/*
 * Fenêtre « Ton dessin » de l'éditeur, après « Valider le dessin » — Figma 5937:35424 (sur l'éditeur : 5937:34724).
 *  - fond de l'éditeur assombri (dégradé radial, Figma 5937:34753 : noir au centre, faded/black/60 au bord) ;
 *  - fenêtre --not-found-editor-card-width, background/buttons/neutral/white, à spacing/lg sous l'en-tête et au-dessus
 *    du bas de l'écran au plus (demande de l'utilisateur), défilement intérieur ; croix tertiary black en haut à droite ;
 *  - « Ton dessin » (pageHead H3 clair : headings/H3, spacing/lg × spacing/sm, trait noir) ;
 *  - carte (ombre dropshadow/low, demande de l'utilisateur) : dessin recadré sur la couleur du fond du dessin, contour
 *    --not-found-editor-card-stroke noir, corner/md ; signature (Mrs Saint Delafield, --not-found-editor-card-signature-size,
 *    largeur au texte, marge de 0,5 em pour les jambages de l'écriture, jamais coupée) en bas à droite, un clic
 *    pour l'écrire ; trait --not-found-editor-card-separator ; nom du dessin (headings/subheading, un clic pour l'écrire,
 *    coupé au bout de sa ligne, à spacing/lg du QR code), adresse du portfolio (captionText/small/regular) et QR code
 *    vers elle, carré à la hauteur des deux lignes ;
 *  - « Personnaliser » (pageHead H4 clair, sous un trait) : grille 2 colonnes à spacing/lg — « Appliquer ma signature » et
 *    couleur de la signature, trait, couleurs du nom et du QR code (champ Hex et tuile comme la pop-up du PNG), trait,
 *    « Télécharger mon souvenir » (primary brand, DownloadSimple) : PNG de la carte complète. Le bouton de gauche est
 *    à définir (demande de l'utilisateur).
 * Cadre du dessin (demande de l'utilisateur) : exactement à la forme du dessin recadré sans marge, sans bornes ; le PNG
 * de la carte suit. Mobile : réglages sur une colonne ; marges spacing/md (16, comme les côtés du site) au lieu de
 * spacing/lg, écarts comme les pages méthode en mobile (lg → md, sm → xs ; demande de l'utilisateur).
 * Couleurs de départ : signature shape/neutral/white, nom et QR code shape/brand/darkest (valeurs de Figma).
 */

type Field = "background" | "signature" | "name" | "qr";

/** Nom du dessin : nombre de caractères au plus (tient sur sa ligne, demande de l'utilisateur ; valeur d'essai). */
const NAME_MAX = 24;

/** Pastille choisie sur fond clair : contour noir décalé (comme le contour blanc de l'outil Couleur). */
const swatchChosen =
  "outline-(length:--divider-width) outline-border-neutral-black outline-offset-(--not-found-editor-swatch-outline-offset)";

export function MotifCard({
  drawing,
  canvasBg,
  colors: initial,
  custom,
  onClose,
}: {
  /** Image du dessin (PNG recadré, sans fond). */
  drawing: string;
  /** Couleur du fond du dessin, sous l'image. */
  canvasBg: string;
  /** Couleurs de départ (« #rrggbb ») : signature, nom, QR code. */
  colors: Record<Exclude<Field, "background">, string>;
  /** Couleurs personnalisées de l'outil Couleur (« #rrggbb »), proposées au-dessus du modificateur. */
  custom: string[];
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  /** Zone qui défile : petite barre flottante (FloatingScrollBar). */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [signed, setSigned] = useState(true);
  const [signature, setSignature] = useState("");
  const [name, setName] = useState("");
  const [colors, setColors] = useState<Record<Field, string>>({ ...initial, background: canvasBg });
  /** Fond transparent : le dessin sans sa couleur de fond (la carte blanche dessous). */
  const [transparent, setTransparent] = useState(false);
  const [picker, setPicker] = useState<Field | null>(null);
  const [qr, setQr] = useState("");
  const [url] = useState(() => `${location.origin}/`);
  /** Ratio du cadre (largeur / hauteur) : celui du dessin ; 3:2 le temps du chargement de l'image. Le ratio compte le
   *  contour du cadre, l'image est posée dedans : remplie (cover), sans bande de fond qui épaissirait le contour en haut
   *  et en bas (l'écart de ratio du contour, moins d'un pixel, est coupé). */
  const [ratio, setRatio] = useState(1.5);
  const fitFrame = (img: HTMLImageElement) => {
    if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
  };

  // QR code vers le portfolio, à la couleur choisie, sans fond.
  useEffect(() => {
    let alive = true;
    void QRCode.toString(url, { type: "svg", margin: 0, color: { dark: colors.qr, light: "#0000" } }).then(
      (svg) => alive && setQr(`data:image/svg+xml,${encodeURIComponent(svg)}`),
    );
    return () => {
      alive = false;
    };
  }, [url, colors.qr]);

  // Échap ferme la fenêtre.
  useEffect(() => {
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const download = async () => {
    if (!cardRef.current) return;
    const png = await toPng(cardRef.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = png;
    // « sowd - [nom du dessin].png » (demande de l'utilisateur), caractères interdits dans un nom de fichier retirés.
    const fileName = name.replace(/[\\/:*?"<>|]/g, "").trim() || introuvable.carte_fichier_sans_nom;
    a.download = introuvable.carte_fichier.replace("{nom}", fileName);
    a.click();
  };

  /** Couleur réglable : champ Hex (titre au-dessus) et tuile, modificateur de couleur au clic sur la tuile. */
  const colorField = (field: Field, label: string) => (
    <div className="flex flex-col gap-xs tablet:gap-sm">
      <div className="flex items-end gap-xs pt-[1rem] tablet:gap-sm">
        <HexField
          theme="light"
          label={label}
          value={colors[field]}
          onChange={(hex) => setColors((c) => ({ ...c, [field]: hex }))}
        />
        <button
          type="button"
          aria-label={`${label} ${colors[field]}`}
          aria-expanded={picker === field}
          onClick={() => setPicker((p) => (p === field ? null : field))}
          className="flex size-(--button-size-sm) shrink-0 cursor-pointer items-center justify-center border-(length:--divider-width) border-border-neutral-black"
          style={{ background: colors[field] }}
        >
          <Icon
            name={picker === field ? "Check" : "Palette"}
            size="var(--icon-md)"
            className={isLight(colors[field]) ? "text-text-neutral-black" : "text-text-neutral-white"}
          />
        </button>
      </div>
      {picker === field && custom.length > 0 && (
        <div role="group" aria-label={introuvable.editeur_couleurs_perso} className="flex gap-xs tablet:gap-sm">
          {custom.map((hex, i) => (
            <button
              key={i}
              type="button"
              aria-label={hex}
              aria-pressed={colors[field] === hex}
              onClick={() => setColors((c) => ({ ...c, [field]: hex }))}
              className={`size-(--button-size-sm) shrink-0 cursor-pointer border-(length:--divider-width) border-border-neutral-black ${colors[field] === hex ? swatchChosen : ""}`}
              style={{ background: hex }}
            />
          ))}
        </div>
      )}
      {picker === field && (
        <ColorPicker
          fill
          hexField={false}
          value={colors[field]}
          onChange={(hex) => setColors((c) => ({ ...c, [field]: hex }))}
          labels={{
            hex: introuvable.editeur_hex,
            area: introuvable.editeur_couleur_cadre,
            hue: introuvable.editeur_couleur_nuance,
          }}
        />
      )}
    </div>
  );

  const divider = <div aria-hidden className="h-(--divider-width) bg-shape-neutral-black tablet:col-span-2" />;

  return (
    // Tout l'éditeur derrière est bloqué (en-tête compris) ; un clic en dehors de la fenêtre la ferme.
    <div className="absolute inset-0 z-30" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[calc(var(--button-size-sm)+var(--divider-width))] bottom-0 bg-[radial-gradient(var(--shape-neutral-black),var(--faded-black-60))]"
      />
      <div
        className="absolute inset-x-0 top-[calc(var(--button-size-sm)+var(--divider-width))] bottom-0 flex justify-center p-(--grid-spacing) tablet:p-lg"
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={introuvable.carte_titre}
          className="relative flex max-h-full w-(--not-found-editor-card-width) flex-col bg-background-buttons-neutral-white text-text-neutral-black"
        >
          <div className="absolute top-0 right-0 z-1">
            <IconButton
              icon="X"
              label={introuvable.carte_fermer}
              cursorLabel={introuvable.carte_fermer}
              variant="tertiary"
              color="black"
              onClick={onClose}
            />
          </div>
          <div ref={scrollRef} className="scroll-bar-none flex min-h-0 flex-col overflow-y-auto">
            {/* pageHead H3 */}
            <div className="flex flex-col">
              <h2 className="type-h3 px-md py-sm tablet:px-lg">{introuvable.carte_titre}</h2>
              <div aria-hidden className="h-(--divider-width) bg-shape-neutral-black" />
            </div>

            {/* Carte */}
            <div className="p-md tablet:p-lg">
              <div
                ref={cardRef}
                className="flex flex-col bg-background-buttons-neutral-white shadow-(--dropshadow-low)"
              >
                <div className="p-md tablet:p-lg">
                  <div
                    className="relative flex w-full items-end justify-end overflow-hidden rounded-md border-(length:--not-found-editor-card-stroke) border-border-neutral-black px-lg py-exs"
                    style={{ aspectRatio: ratio, background: transparent ? undefined : colors.background }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- image locale (blob), pas d'optimisation */}
                    <img
                      alt=""
                      src={drawing}
                      onLoad={(event) => fitFrame(event.currentTarget)}
                      className="absolute inset-0 size-full object-cover"
                    />
                    {/* Largeur au texte (copie invisible du texte dans la même cellule, tous navigateurs), marge de 0,5 em
                        pour les jambages de l'écriture : la signature n'est jamais coupée. */}
                    {signed && (
                      <span
                        className="relative inline-grid max-w-full font-(family-name:--typography-font-signature) text-(length:--not-found-editor-card-signature-size)"
                        style={{ color: colors.signature }}
                      >
                        {/* Texte affiché par ce span (jamais coupé, même pour les jambages qui débordent) ; le champ,
                            posé dessus, garde la saisie et le curseur, son propre texte transparent (un champ coupe
                            son texte à son bord intérieur). */}
                        <span
                          aria-hidden
                          className={`pointer-events-none px-[0.5em] text-right whitespace-pre [grid-area:1/1] ${signature ? "" : "opacity-60"}`}
                        >
                          {signature || introuvable.carte_signature}
                        </span>
                        <input
                          value={signature}
                          onChange={(event) => setSignature(event.target.value)}
                          aria-label={introuvable.carte_signature}
                          size={1}
                          style={{ caretColor: colors.signature }}
                          className="w-full min-w-0 bg-transparent px-[0.5em] text-right text-transparent outline-none [grid-area:1/1] selection:text-transparent"
                        />
                      </span>
                    )}
                  </div>
                </div>
                <div aria-hidden className="h-(--not-found-editor-card-separator) bg-shape-neutral-black" />
                <div className="flex gap-md p-md tablet:gap-lg tablet:p-lg">
                  <div className="flex min-w-0 flex-1 flex-col gap-xxs">
                    <input
                      value={name}
                      maxLength={NAME_MAX}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={introuvable.carte_nom}
                      aria-label={introuvable.carte_nom}
                      className="type-subheading w-full min-w-0 bg-transparent outline-none placeholder:text-current"
                      style={{ color: colors.name }}
                    />
                    <p className="type-caption-small-regular">{url}</p>
                  </div>
                  {qr && (
                    // eslint-disable-next-line @next/next/no-img-element -- QR code généré (data URI)
                    <img
                      alt={introuvable.carte_qr}
                      src={qr}
                      className="size-(--not-found-editor-card-qr-size) shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Personnaliser (pageHead H4), sous un trait qui le sépare de la carte (demande de l'utilisateur) */}
            <div aria-hidden className="h-(--divider-width) shrink-0 bg-shape-neutral-black" />
            <div className="flex flex-col">
              <h3 className="type-h4 px-md py-sm tablet:px-lg">{introuvable.carte_parametres}</h3>
              <div aria-hidden className="h-(--divider-width) bg-shape-neutral-black" />
            </div>
            <div className="grid grid-cols-1 items-start gap-md p-md tablet:grid-cols-2 tablet:gap-lg tablet:p-lg">
              {/* Interrupteurs alignés en haut, sur la ligne du champ voisin (demande de l'utilisateur). */}
              <div className="flex h-[calc(1rem+var(--spacing-sm)*2+var(--icon-md)+var(--divider-width))] items-end">
                <SwitchButton
                  theme="light"
                  checked={transparent}
                  onChange={setTransparent}
                  className="w-full justify-between"
                >
                  {introuvable.editeur_fond_transparent}
                </SwitchButton>
              </div>
              {transparent ? (
                <div className="hidden tablet:block" />
              ) : (
                colorField("background", introuvable.carte_couleur_fond)
              )}
              {divider}
              <div className="flex h-[calc(1rem+var(--spacing-sm)*2+var(--icon-md)+var(--divider-width))] items-end">
                <SwitchButton theme="light" checked={signed} onChange={setSigned} className="w-full justify-between">
                  {introuvable.carte_appliquer_signature}
                </SwitchButton>
              </div>
              {colorField("signature", introuvable.carte_couleur_signature)}
              {divider}
              {colorField("name", introuvable.carte_couleur_nom)}
              {colorField("qr", introuvable.carte_couleur_qr)}
            </div>
          </div>
          {/* « Télécharger mon souvenir » dans une bande fixe en bas de la fenêtre, hors du défilement (demande de
              l'utilisateur) : trait au-dessus et blanc autour du bouton, comme la barre « Voir la prochaine étape » des
              pages méthode ; mobile : pleine largeur, marges spacing/md ; tablette et desktop : colonne de droite de la
              grille des réglages, marges spacing/lg. */}
          <div className="flex shrink-0 flex-col bg-background-buttons-neutral-white">
            <div aria-hidden className="h-(--divider-width) bg-shape-neutral-black" />
            <div className="grid grid-cols-1 p-md tablet:grid-cols-2 tablet:gap-x-lg tablet:p-lg">
              <TextualButton
                color="brand"
                icon="DownloadSimple"
                iconPosition="right"
                onClick={download}
                className="w-full! tablet:col-start-2"
              >
                {introuvable.carte_telecharger}
              </TextualButton>
            </div>
          </div>
          <FloatingScrollBar target={scrollRef} />
        </div>
      </div>
    </div>
  );
}
