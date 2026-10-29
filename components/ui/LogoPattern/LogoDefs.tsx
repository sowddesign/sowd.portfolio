import { logoPatternPaths } from "./logo-pattern-paths";

/*
 * Définitions SVG du logo du motif (à placer dans <defs>) : remplissage + contour extérieur
 * border/neutral/black de 6 (repère interne).
 * Contour : trait de 12 dessiné sous le remplissage opaque, qui en recouvre la moitié intérieure.
 * Même rendu qu'un trait masqué par l'intérieur des formes, sans le coût d'un masque à chaque image.
 * Sans fillClassName, le remplissage est hérité de l'élément <use> qui affiche le logo.
 */

export const logoDefsIds = (uid: string) => ({
  logo: `logo-${uid}`,
  path: (i: number) => `logo-path-${uid}-${i}`,
});

export function LogoDefs({ uid, fillClassName }: { uid: string; fillClassName?: string }) {
  const ids = logoDefsIds(uid);
  return (
    <>
      {logoPatternPaths.map((d, i) => (
        <path key={i} id={ids.path(i)} d={d} />
      ))}

      <g id={ids.logo}>
        {/* Contour d'abord (toutes les formes), remplissage ensuite par-dessus. */}
        <g fill="none" strokeWidth="12" className="stroke-border-neutral-black">
          {logoPatternPaths.map((_, i) => (
            <use key={i} href={`#${ids.path(i)}`} />
          ))}
        </g>
        <g className={fillClassName}>
          {logoPatternPaths.map((_, i) => (
            <use key={i} href={`#${ids.path(i)}`} />
          ))}
        </g>
      </g>
    </>
  );
}
