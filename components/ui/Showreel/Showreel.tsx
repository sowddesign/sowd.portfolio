"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { accueil, commun } from "@/content/texts";
import { AnimationGrid } from "../AnimationGrid";
import { IconButton } from "../IconButton";
import { Logotype } from "../LogoButton";
import { MessageContainer } from "../MessageContainer";
import { VideoManager } from "../VideoManager";
import { desktopQuery, reducedMotionQuery, tabletQuery, touchQuery, useMediaQuery } from "../use-media-query";

/*
 * Showreel en haut de l'accueil — frame Figma « showreelcontainer » de « body/homeP » (fichier portfolio, node 4585:16729),
 * variantes desktop et mobile (la tablette n'est pas encore à développer : le desktop s'applique dès le seuil tablette).
 *
 * Premier écran (demandes de l'utilisateur) : le showreel occupe toute la hauteur sous l'en-tête du site, le texte
 * « Curieux|se ? » finit à spacing/lg du bas de l'écran, et la démarche UX n'apparaît qu'en défilant.
 * Scène à l'échelle (option B) : la composition Figma est reproduite en unités de scène (--u = un pixel de la maquette).
 * Photo, écran, positions et fonds suivent l'échelle ; les textes gardent leur taille.
 *   desktop (maquette 1440 × 843) : --u suit la largeur jusqu'à 1440, reste à 1 px entre 1440 et 2108, puis grandit
 *     au-delà de 2108 (option D) ; il grandit aussi pour que la scène remplisse la hauteur de l'écran
 *     (photo et écran plus grands, bords rognés) ;
 *   desktop à la souris (au-delà de 1300, demande de l'utilisateur) : la scène est calée sur la ligne d'horizon
 *     de la photo (bordure entre le fond et le sol) : « Curieux|se ? » commence spacing/lg sous cette ligne et finit
 *     spacing/lg au-dessus du bas de l'écran ; sur un écran plus haut que la maquette, la place en plus va en haut
 *     (fond et grille), la scène ne grandit pas ; sur un écran moins haut, la scène se réduit pour tenir ;
 *     écrans restreints (740 à 1300) et tablette tactile : la scène grandit pour remplir la hauteur, calée en haut
 *     (le calage sur l'horizon y réduisait trop la vidéo, décision de l'utilisateur) ;
 *   mobile (maquette 402 × 634) : --u suit la largeur, sans dépasser ce qui tient dans la hauteur de l'écran ;
 *     au-delà, la scène reste centrée et on découvre plus de fond sur les côtés (comme en desktop).
 * « Curieux|se ? » s'efface peu à peu en défilant (--showreel-message-fade-distance, demande de l'utilisateur).
 * La photo déborde vers le bas derrière la suite de la page (Figma : pas de découpe), avec le fondu showreel-fade.
 * Écran de l'ordinateur : écran noir et « Attends un peu », allumage de l'écran une fois la page chargée, vidéo
 * voilée avec un bouton Play, puis la vidéo du showreel (public/showreel/showreel.mp4, provisoire car trop lourde)
 * avec ses contrôles videoManager (demandes de l'utilisateur).
 * Coins du haut 8 (Figma sans variable = corner/md).
 * Fond : aplat color/neutral/50 seul en attendant la variante colorBackground de l'accueil (dégradés à lier dans Figma).
 * Bouton workTogether : pas encore développé.
 * Mobile : mots-clés en bandeau qui défile en continu (--showreel-marquee-speed), immobile en mouvement réduit.
 */

/** Hauteur du premier écran sous l'en-tête du site. */
const firstScreen = "(100svh - var(--page-header-height, 0px))";
/* Message en bas : son texte finit à spacing/lg du bas de l'écran (le conteneur a déjà spacing/sm de marge). */
const messageBottom = "calc(var(--spacing-lg) - var(--spacing-sm))";

/** Longueur en unités de scène (pixels de la maquette). */
const u = (value: number) => `calc(${value} * var(--u))`;
const scene = (unit: string) => ({ "--u": unit }) as CSSProperties;

/* Photo de l'ordinateur et écran, en pourcentage de la photo (identiques en desktop et en mobile dans Figma). */
const photo = { src: "/showreel/ordinateur-sol-ameliore.webp", width: 4096, height: 3389 };
const screen = {
  left: "39.58%",
  top: "15.07%",
  width: "20.84%",
  height: "16.67%",
};

function Photo({
  left,
  top,
  width,
  scene,
  children,
}: {
  left: number;
  top: number;
  width: number;
  /** Scène qui contient la photo : seul l'écran de la scène affichée charge et anime la vidéo. */
  scene: "desktop" | "mobile";
  children?: ReactNode;
}) {
  const tablet = useMediaQuery(tabletQuery);
  return (
    <div
      className="pointer-events-none absolute aspect-[4096/3389]"
      style={{ left: `calc(50% - ${u(left)})`, top: u(top), width: u(width) }}
    >
      <Image
        src={photo.src}
        alt=""
        fill
        sizes="(width > 740px) 150vw, 450vw"
        priority
        quality={90}
        className="object-cover"
      />
      <ShowreelScreen active={(scene === "desktop") === tablet} />
      {children}
    </div>
  );
}

/** Durée d'un token CSS (« 3s » ou « 300ms ») en millisecondes. */
function readDuration(element: Element, name: string) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
}

/** « Attends un peu » : typo de la consigne « Appuie » des photos, sans animation, en faded/white/40 (demande de
    l'utilisateur). */
function WaitingText() {
  return (
    <p className="type-swiss-small-accentuation pointer-events-none absolute bottom-lg left-lg whitespace-pre text-faded-white-40">
      {accueil.showreel_attends}
    </p>
  );
}

/** Allumage de l'écran (balayage, choix de l'utilisateur) : un trait lumineux descend du haut vers le bas et
    découvre l'écran derrière lui ; le cache noir porte « Attends un peu », effacé au passage du trait. */
function PowerOn() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-showreel-power-on-cover bg-background-neutral-black"
      >
        <WaitingText />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 animate-showreel-power-on-line border-t border-shape-neutral-white"
      />
    </>
  );
}

/* Écran de l'ordinateur (demandes de l'utilisateur) : écran noir et « Attends un peu » ; une fois la page chargée
   (intro du site comprise) et après --showreel-power-on-delay, l'écran s'allume ; la vidéo voilée apparaît avec le
   bouton Play dès qu'elle est chargée (« Attends un peu » reste jusque-là), puis la vidéo du showreel avec ses
   contrôles (videoManager). La vidéo tient entière dans l'écran, avec des bandes noires si ses proportions diffèrent
   (demande de l'utilisateur), en plein écran aussi. Découpe aux bords de l'écran, sauf en bas où le rond de lecture
   déborde (demande de l'utilisateur). Vidéo provisoire (trop lourde, à remplacer). Mouvement réduit : pas d'allumage,
   la vidéo apparaît une fois chargée. */
function ShowreelScreen({ active }: { active: boolean }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useMediaQuery(reducedMotionQuery);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [poweredOn, setPoweredOn] = useState(false);

  // Vidéo prête à être lue sans attente.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;
    const onReady = () => setLoaded(true);
    video.addEventListener("canplaythrough", onReady);
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) queueMicrotask(onReady);
    return () => video.removeEventListener("canplaythrough", onReady);
  }, [active]);

  // Page chargée (plus d'attribut data-intro sur <html>, intro du site comprise), écran noir
  // (--showreel-power-on-delay), puis allumage de l'écran.
  useEffect(() => {
    const element = screenRef.current;
    if (!element || !active) return;
    const root = document.documentElement;
    let timer = 0;
    const start = () => {
      if (timer || root.hasAttribute("data-intro")) return;
      observer.disconnect();
      timer = window.setTimeout(() => setPoweredOn(true), readDuration(element, "--showreel-power-on-delay"));
    };
    const observer = new MutationObserver(start);
    observer.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    start();
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [active]);

  const revealed = playing || (poweredOn && loaded);

  const play = () => {
    setPlaying(true);
    void videoRef.current?.play();
  };

  return (
    <div
      ref={screenRef}
      className="pointer-events-auto absolute rounded-t-md bg-background-neutral-black [clip-path:var(--showreel-screen-clip)] [&:fullscreen]:rounded-none [&:fullscreen]:[clip-path:none]"
      style={screen}
    >
      {/* Vidéo voilée et bouton Play : apparaissent en fondu une fois l'écran allumé et la vidéo chargée. */}
      <div
        className={
          revealed ? "absolute inset-0 animate-showreel-reveal motion-reduce:animate-none" : "absolute inset-0 opacity-0"
        }
      >
        <video
          ref={videoRef}
          src="/showreel/showreel.mp4"
          preload={active ? "auto" : "none"}
          // Son coupé par défaut (demande de l'utilisateur) : remis avec le bouton volume.
          muted
          playsInline
          className="absolute inset-0 size-full object-contain select-none [-webkit-touch-callout:none]"
        />
        {revealed && !playing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-faded-black-20">
            <IconButton
              icon="PlayFill"
              label={commun.video_lecture}
              cursorLabel={commun.curseur_video_lecture}
              variant="primary"
              color="black"
              onClick={play}
            />
          </div>
        ) : null}
      </div>

      {/* « Attends un peu » : jusqu'à l'apparition de la vidéo. */}
      {!revealed && <WaitingText />}

      {/* Allumage de l'écran, par-dessus son contenu : « Attends un peu » reste sur le cache noir jusqu'à ce que le
          trait l'efface (demande de l'utilisateur). */}
      {poweredOn && !reduced && !playing && <PowerOn />}

      {playing && (
        <VideoManager videoRef={videoRef} fullscreenRef={screenRef} className="absolute! inset-x-0 bottom-0" />
      )}
    </div>
  );
}

function ShowreelInfo() {
  return (
    <div className="flex flex-col gap-xxs">
      <p className="type-swiss-regular whitespace-pre">{accueil.showreel_duree}</p>
      <p className="type-swiss-italic whitespace-pre">{accueil.showreel_logiciel}</p>
    </div>
  );
}

function ProjectsInfo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <p className="type-swiss-regular whitespace-pre">{accueil.showreel_metier}</p>
      <p className="type-swiss-regular whitespace-pre-line">{accueil.showreel_projets}</p>
    </div>
  );
}

/** Fondu vers le noir : noir complet au bas du bloc parent de l'élément « until » (titre de la section suivante). */
function Fade({ left, top, width, until }: { left: number; top: number; width: number; until?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fade = ref.current;
    const target = until ? document.querySelector(until)?.parentElement : null;
    if (!fade || !target) return;
    const measure = () => {
      /* Écran masqué (affichage de l'autre appareil) : rien à mesurer. */
      if (!fade.offsetParent) return;
      const end = Math.max(0, target.getBoundingClientRect().bottom - fade.getBoundingClientRect().top);
      fade.style.setProperty("--showreel-fade-end", `${end}px`);
      fade.style.minHeight = `${end}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [until]);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute showreel-fade"
      style={{ left: `calc(50% - ${u(left)})`, top: u(top), width: u(width), height: u(1310) }}
    />
  );
}

/** Mots-clés en bandeau continu : deux copies de la liste, décalées d'une longueur de liste. */
function Marquee({ words }: { words: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery(reducedMotionQuery);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;
    const list = track.firstElementChild as HTMLElement;
    let animation: Animation | undefined;
    const start = () => {
      animation?.cancel();
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const distance = list.offsetWidth + gap;
      const speed = parseFloat(getComputedStyle(track).getPropertyValue("--showreel-marquee-speed")) || 1;
      animation = track.animate([{ transform: "translateX(0)" }, { transform: `translateX(${-distance}px)` }], {
        duration: (distance / speed) * 1000,
        iterations: Infinity,
      });
    };
    start();
    const observer = new ResizeObserver(start);
    observer.observe(list);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [reduced]);

  const list = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 gap-lg">
      {words.map((word) => (
        <p key={word} className="type-swiss-regular whitespace-pre">
          {word}
        </p>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-hidden text-text-neutral-white">
      <div ref={trackRef} className="flex w-max gap-lg">
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}

/** Message en bas du premier écran, qui s'efface au fil du défilement. */
function FadingMessage({ inFlow = false }: { inFlow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = parseFloat(getComputedStyle(el).getPropertyValue("--showreel-message-fade-distance")) || 1;
      el.style.opacity = String(Math.max(0, 1 - window.scrollY / distance));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={inFlow ? "relative w-full" : "absolute inset-x-0"}
      style={inFlow ? { marginBottom: messageBottom } : { bottom: messageBottom }}
    >
      <MessageContainer />
    </div>
  );
}

/** Ligne d'horizon de la photo (bordure fond / sol), en unités de scène depuis le haut de la scène. */
const horizon = 635;
/* Échelle desktop selon la largeur : suit la largeur jusqu'à 1440, 1 px jusqu'à 2108, puis grandit. */
const desktopWidthUnit = "max(min(100cqw / 1440, 1px), 100cqw / 2108)";

function DesktopPhoto() {
  return (
    <Photo left={1056} top={-157.4} width={2108} scene="desktop">
      <div className="absolute w-max text-text-neutral-black" style={{ left: "61.8%", top: screen.top }}>
        <div className="flex w-(--showreel-info-width) flex-col gap-xs">
          <ShowreelInfo />
          <ProjectsInfo className="gap-xs" />
        </div>
      </div>
      <ul className="absolute inset-x-0 flex justify-center gap-lg text-text-neutral-white" style={{ top: "34.79%" }}>
        {accueil.showreel_mots_cles.map((word) => (
          <li key={word} className="type-swiss-regular whitespace-pre mix-blend-exclusion">
            {word}
          </li>
        ))}
      </ul>
    </Photo>
  );
}

function ShowreelDesktop({ fadeUntil }: { fadeUntil?: string }) {
  const touch = useMediaQuery(touchQuery);
  const desktop = useMediaQuery(desktopQuery);

  /* Écrans restreints et tablette tactile : la scène grandit pour remplir la hauteur, calée en haut. */
  if (touch || !desktop) {
    return (
      <div
        className="relative w-full"
        style={{ ...scene(`max(${desktopWidthUnit}, ${firstScreen} / 843)`), height: `calc${firstScreen}` }}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 overflow-hidden bg-neutral-50" style={{ height: u(739) }}>
          <div className="absolute inset-x-0" style={{ top: u(-104), height: u(900) }}>
            <AnimationGrid />
          </div>
        </div>
        <DesktopPhoto />
        <Fade left={1054} top={647} width={2108} until={fadeUntil} />
        <FadingMessage />
      </div>
    );
  }

  /* Desktop à la souris : scène calée sur l'horizon, juste au-dessus du message ; place en plus en haut. */
  return (
    <div
      className="relative flex w-full flex-col"
      style={{ ...scene(`min(${desktopWidthUnit}, ${firstScreen} / 843)`), height: `calc${firstScreen}` }}
    >
      <div className="relative min-h-0 flex-1">
        {/* Horizon : spacing/lg au-dessus du texte du message (le message a déjà spacing/sm de marge haute). */}
        <div
          className="absolute inset-x-0"
          style={{ top: `calc(100% - ${messageBottom} - ${u(horizon)})`, height: u(843) }}
        >
          {/* Fond coloré et grille : prolongés jusqu'en haut de l'écran (place en plus sur un écran plus haut). */}
          <div
            aria-hidden
            className="absolute inset-x-0 overflow-hidden bg-neutral-50"
            style={{ top: "calc(-100svh)", height: `calc(100svh + ${u(739)})` }}
          >
            <div className="absolute inset-x-0 top-0" style={{ height: `calc(100svh + ${u(796)})` }}>
              <AnimationGrid />
            </div>
          </div>
          <DesktopPhoto />
          <Fade left={1054} top={647} width={2108} until={fadeUntil} />
        </div>
      </div>
      <FadingMessage inFlow />
    </div>
  );
}

function ShowreelMobile({ fadeUntil }: { fadeUntil?: string }) {
  return (
    <div
      className="relative w-full"
      style={{
        ...scene(`min(100cqw / 402, ${firstScreen} / 634)`),
        height: `calc${firstScreen}`,
      }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 overflow-hidden bg-neutral-50" style={{ height: u(835) }}>
        <div className="absolute inset-x-0 top-0" style={{ height: u(240) }}>
          <AnimationGrid />
        </div>
      </div>
      <Photo left={874} top={18.9} width={1748} scene="mobile" />
      <div
        className="absolute flex items-center px-md text-text-neutral-black"
        style={{ left: `calc(50% - ${u(201)})`, width: u(402), top: u(143.5) }}
      >
        <div className="flex-1">
          <ShowreelInfo />
        </div>
        {/* Figma : écart 16 sans variable (= spacing/md). */}
        <ProjectsInfo className="flex-1 gap-md" />
      </div>
      <Fade left={1043.75} top={743} width={2087.5} until={fadeUntil} />
      {/* Logo « sowd » et trait. */}
      <div className="absolute inset-x-0 top-0 flex flex-col">
        <div className="px-md py-lg text-shape-neutral-black">
          <Logotype data-intro-target="type" className="h-(--showreel-logo-height) w-auto" />
        </div>
        <span aria-hidden className="block w-full border-t border-shape-neutral-black" />
      </div>
      <FadingMessage />
      {/* Bandeau sous le message, écart de la maquette (25). */}
      <div className="absolute inset-x-0" style={{ top: `calc(100% - ${messageBottom} + ${u(25)})` }}>
        <Marquee words={accueil.showreel_mots_cles} />
      </div>
    </div>
  );
}

export function Showreel({
  id,
  fadeUntil,
  className = "",
}: {
  id?: string;
  /** Sélecteur du titre de la section suivante : le fondu de la photo finit en noir au bas de son bloc. */
  fadeUntil?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={accueil.showreel}
      className={`@container relative w-full overflow-x-clip ${className}`}
    >
      <div className="tablet:hidden">
        <ShowreelMobile fadeUntil={fadeUntil} />
      </div>
      <div className="hidden tablet:block">
        <ShowreelDesktop fadeUntil={fadeUntil} />
      </div>
    </section>
  );
}
