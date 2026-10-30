/*
 * Fond coloré — composant Figma « colorBackground » (fichier portfolio, node 5574:25978), utilisé derrière le visuel
 * de photosContainer. Deux calques qui remplissent le parent : aplat background/brand/darkest, puis dégradé
 * shadowBehindVisual (ombre simulée derrière le visuel).
 * Composant décoratif : masqué aux lecteurs d'écran.
 */

export function ColorBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none relative size-full bg-background-brand-darkest ${className}`}>
      <div className="absolute inset-0 bg-(image:--shadow-behind-visual)" />
    </div>
  );
}
