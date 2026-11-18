"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { commun } from "@/content/texts";
import type { MethodeFinishContent } from "@/lib/methode";
import { IconButton } from "../IconButton";
import { TextualButton } from "../TextualButton";

/*
 * Méthode, page « Bonus » — composant Figma « methode » (fichier portfolio, node 5851:29682),
 * variante pageSelected=finish (desktop). Textes et images : clés fin_* de
 * content/methode/intros/<étape>.md, images dans public/methode/fin/.
 * Desktop : remplit son parent ; trait du haut, fond background/neutral/white, marges spacing/sm.
 *   Défile quand le contenu dépasse (écrans larges).
 * Titre headings/H3, texte body/regular, écart spacing/sm ; blocs séparés de spacing/lg (demande de l'utilisateur) ; image avec marges spacing/sm sur les côtés,
 * déjà recadrée comme dans Figma (fichier fin_image, recadrage Figma « Crop »), à sa proportion, bordure border/neutral/black,
 * sans coins ; boutons côte à côte, écart spacing/lg :
 *   « Partager » (textualButton secondary black, ShareNetwork) : sans action pour l'instant (demande de l'utilisateur) ;
 *   « Télécharger au format PNG » (textualButton primary brand, DownloadSimple) : image haute qualité.
 * Mobile (pas de maquette Figma, choix de l'utilisateur) : ouverte sous la tuile Bonus, à sa hauteur (défile avec le site),
 *   sans trait du haut (celui sous la tuile) ; marges spacing/md comme les autres pages mobiles, mêmes écarts et même image ;
 *   boutons comme les autres pages mobiles de la méthode (demande de l'utilisateur) : côte à côte, écart spacing/md ;
 *   trait noir sous les boutons, après la marge spacing/sm.
 * Boutons, à toutes les tailles d'écran comme les autres pages : si un texte ne tient pas sur une ligne à côté de son icône,
 * les deux prennent leur texte court ; si un texte court ne tient toujours pas,
 * ils perdent aussi leur icône.
 */

/** Date de la carte téléchargée, valeurs Figma x2 (la carte est exportée x2) : 24 px, ligne 32 px, interlettrage -2 %. */
const CARD_DATE = { size: 48, lineHeight: 64, tracking: -0.02 };

export function MethodeFinish({
  content,
  device = "desktop",
  onNext,
}: {
  content: MethodeFinishContent;
  device?: "desktop" | "mobile";
  /** « Voir la prochaine étape » : comme le bouton des pages de la méthode. */
  onNext?: () => void;
}) {
  const mobile = device === "mobile";
  /* Côtés : spacing/md en mobile, spacing/lg (24 px) en desktop (demande de l'utilisateur). */
  const side = mobile ? "px-md" : "px-lg";

  /* Desktop : le défilement de la page n'est retenu (overscroll-contain) que si le contenu dépasse ;
     sinon la molette sur la page Bonus fait défiler le site (demande de l'utilisateur). */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const check = () => setOverflows(scroller.scrollHeight > scroller.clientHeight);
    const observer = new ResizeObserver(check);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => observer.disconnect();
  }, [mobile]);

  /* 0 : texte + icône · 1 : texte court + icône · 2 : texte court sans icône (même règle que MethodePage). */
  const navRef = useRef<HTMLDivElement>(null);
  const iconSpace = useRef(0);
  const [navFit, setNavFit] = useState<0 | 1 | 2>(0);
  const shortLabels = navFit > 0;
  const compact = navFit === 2;
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const labels = [...nav.querySelectorAll<HTMLElement>("[data-label]")];
      const icon = nav.querySelector<HTMLElement>("[style*='--icon-url']");
      if (icon) iconSpace.current = icon.getBoundingClientRect().width + parseFloat(getComputedStyle(icon.parentElement!).columnGap);
      // Largeur d'un texte sur une ligne, mesurée sur une copie invisible de la zone de texte du bouton.
      const width = (text: HTMLElement, value: string) => {
        const probe = text.cloneNode(false) as HTMLElement;
        probe.textContent = value;
        probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;width:auto;height:auto;flex:none";
        text.parentElement!.append(probe);
        const needed = probe.getBoundingClientRect().width;
        probe.remove();
        return needed;
      };
      const fits = (key: "label" | "short") =>
        labels.every((label) => {
          const text = label.parentElement!;
          const available = text.getBoundingClientRect().width - (icon ? 0 : iconSpace.current);
          return width(text, label.dataset[key]!) <= available;
        });
      setNavFit(fits("label") ? 0 : fits("short") ? 1 : 2);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [mobile]);

  /* Boutons comme ceux des autres pages de la méthode (demande de l'utilisateur) :
     page secrète comme le bouton du projet, prochaine étape comme celui de MethodePage. */
  const secretButton = (
    <TextualButton
      variant="secondary"
      color="black"
      icon={compact ? undefined : "ArrowUpRight"}
      iconPosition="right"
      href={commun.methode_bonus_page_secrete_lien}
      newTab
    >
      <span data-label={commun.methode_bonus_page_secrete} data-short={commun.methode_bonus_page_secrete_court}>
        {shortLabels ? commun.methode_bonus_page_secrete_court : commun.methode_bonus_page_secrete}
      </span>
    </TextualButton>
  );
  const nextButton = (
    <TextualButton
      variant="primary"
      color="brand"
      icon={compact ? undefined : "ArrowRight"}
      iconPosition="right"
      onClick={onNext}
    >
      <span data-label={commun.methode_etape_suivante} data-short={commun.methode_etape_suivante_court}>
        {shortLabels ? commun.methode_etape_suivante_court : commun.methode_etape_suivante}
      </span>
    </TextualButton>
  );

  /* Téléchargement de la carte haute qualité (fin_image_hd) avec la date du jour (demande de l'utilisateur) :
     écrite à fin_date_position, alignée à droite, centrée sur une ligne de 32 px comme dans Figma (node 5851:21709) ;
     Merriweather Sans Bold 24 px, interlettrage -2 %, text/somber (choix de l'utilisateur), le tout x2 comme la carte. */
  const download = async () => {
    const card = new window.Image();
    const loaded = new Promise((resolve, reject) => {
      card.onload = resolve;
      card.onerror = reject;
    });
    card.src = content.download;
    const root = getComputedStyle(document.documentElement);
    const family = root.getPropertyValue("--font-merriweather-sans").trim();
    const font = `700 ${CARD_DATE.size}px ${family}`;
    /* Seule la vraie police est chargée : la police de secours de next/font (local("Arial")) échoue sur iPhone
       (NetworkError) ; un échec de chargement ne bloque pas le téléchargement. */
    const mainFamily = family.split(",")[0].trim();
    const fontLoaded = document.fonts.load(`700 ${CARD_DATE.size}px ${mainFamily}`).catch(() => undefined);
    await Promise.all([loaded, fontLoaded]);
    const canvas = document.createElement("canvas");
    canvas.width = card.naturalWidth;
    canvas.height = card.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(card, 0, 0);
    ctx.font = font;
    ctx.letterSpacing = `${CARD_DATE.size * CARD_DATE.tracking}px`;
    ctx.fillStyle = root.getPropertyValue("--text-brand-somber").trim();
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const metrics = ctx.measureText(today);
    const glyphs = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const baseline = content.datePosition.top + (CARD_DATE.lineHeight - glyphs) / 2 + metrics.fontBoundingBoxAscent;
    /* Comme dans Figma, l'interlettrage compte aussi après la dernière lettre. */
    ctx.fillText(today, content.datePosition.right, baseline);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = content.fileName;
    /* Mobile : le lien doit être dans la page et l'adresse gardée le temps que le téléchargement démarre. */
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  /* Primary black (choix de l'utilisateur), en haut à droite de l'image, marges spacing/sm. */
  const downloadButtons = (
    <div className="absolute top-sm right-sm flex">
      <IconButton
        icon="DownloadSimple"
        label={commun.methode_bonus_telecharger}
        cursorLabel={commun.methode_bonus_telecharger}
        variant="primary"
        color="black"
        onClick={download}
      />
    </div>
  );

  /* Desktop, écrans larges : l'image remplit la hauteur restante pour tout garder à l'écran (demande de l'utilisateur),
     de sa hauteur entière jusqu'au rognage maximal en haut et en bas (fin_image_rognage), centrée pour que la fleur
     ne soit jamais coupée ; au-delà, la page défile. Hauteurs en cqw : proportionnelles à la largeur de l'image. */
  const { width, height } = content.image;
  const { top, bottom } = content.crop;
  const frame = {
    "--finish-image-min": `${((height - top - bottom) / width) * 100}cqw`,
    "--finish-image-max": `${(height / width) * 100}cqw`,
  } as CSSProperties;
  const objectY = top + bottom > 0 ? (top / (top + bottom)) * 100 : 50;

  /* Légende sans lien (demande de l'utilisateur), style des légendes de la méthode ; écart avec l'image
     spacing/sm en desktop, spacing/xs en mobile (comme les légendes sous une image). */
  const caption = <p className="type-caption-small-italic">{commun.methode_bonus_legende}</p>;

  const body = (
    <div className={`flex shrink-0 flex-col items-center gap-lg ${mobile ? "" : "grow"}`}>
      <div className={`flex w-full flex-col gap-sm ${side} wrap-break-word`}>
        <h2 className="type-h3">{content.title}</h2>
        <p className="type-body-regular text-pretty">{content.text}</p>
      </div>
      {/* Image déjà recadrée comme dans Figma (fin_image) ; marges sur les côtés
          (demande de l'utilisateur, comme les textes et les boutons). */}
      <div className={`flex w-full flex-col ${mobile ? "gap-xs" : "grow"} ${side}`}>
        {mobile ? (
          <div className="relative w-full">
            <Image
              src={content.image.src}
              alt=""
              width={width}
              height={height}
              unoptimized
              className="h-auto w-full border border-border-neutral-black"
            />
            {downloadButtons}
          </div>
        ) : (
          <div className="@container flex w-full grow flex-col gap-sm">
            <div
              style={frame}
              className="relative max-h-(--finish-image-max) min-h-(--finish-image-min) w-full grow basis-0 border border-border-neutral-black"
            >
              <Image
                src={content.image.src}
                alt=""
                fill
                unoptimized
                className="object-cover"
                style={{ objectPosition: `50% ${objectY}%` }}
              />
              {downloadButtons}
            </div>
            {/* Desktop : juste sous l'image, même quand celle-ci a atteint sa hauteur maximale. */}
            {caption}
          </div>
        )}
        {mobile && caption}
      </div>
      <div ref={navRef} className={`grid w-full grid-cols-2 ${mobile ? "gap-x-md" : "gap-x-lg"} ${side}`}>
        <div className="min-w-0">{secretButton}</div>
        <div className="min-w-0">{nextButton}</div>
      </div>
    </div>
  );

  if (mobile) {
    /* Trait noir sous les boutons (demande de l'utilisateur), comme en bas des autres pages mobiles. */
    return (
      <div className="flex w-full flex-col bg-background-neutral-white text-text-neutral-black">
        <div className="py-sm">{body}</div>
        <span aria-hidden className="block w-full shrink-0 border-t border-shape-neutral-black" />
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col bg-background-neutral-white text-text-neutral-black">
      <span aria-hidden className="block w-full shrink-0 border-t border-shape-neutral-black" />
      {/* Défile quand le contenu dépasse la hauteur du conteneur (écrans larges, demande de l'utilisateur),
          comme les pages de la méthode ; le trait du haut reste fixe. */}
      <div
        ref={scrollRef}
        className={`scroll-bar-discreet flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-auto py-sm ${
          overflows ? "overscroll-contain" : ""
        }`}
      >
        {body}
      </div>
    </div>
  );
}
