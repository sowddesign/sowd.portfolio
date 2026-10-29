/*
 * Géométrie du pattern Figma de footerVisual (export SVG de node 5482:23665), en repère interne :
 * - tuile 384.54 × 645.32, viewBox commençant à -6 (marge du contour) ;
 * - échelle 88.4442 / 384.54 (= 0.23) → tuile de 88.4442 × 148.424 px, origine (667.79, 32.79) ;
 * - rangées en quinconce : une rangée tous les 322.66, décalée de 192.27 une rangée sur deux ;
 * - logo de 442 × 442, contour extérieur de 6 compris dans -6 → 448.
 */
export const patternGeometry = {
  tileWidth: 384.54,
  tileHeight: 645.32,
  rowHeight: 322.66,
  rowShift: 192.27,
  viewBoxOrigin: -6,
  logoMin: -6,
  logoMax: 448,
  scale: 88.4442 / 384.54,
  originX: 667.79,
  originY: 32.79,
} as const;

/** Position en px (repère de la frame) d'un point du repère interne du motif. */
export const toFramePx = (internal: number, origin: number) =>
  origin + (internal - patternGeometry.viewBoxOrigin) * patternGeometry.scale;

/** Centre du logo en repère interne (logo de 0 à 442). */
const LOGO_CENTER = 221;

/**
 * Pour chaque logo, ses voisins directs sur la grille (logos qui le touchent : même rangée ±1 colonne,
 * rangées adjacentes décalées d'une demi-colonne) dont le centre sort de la frame à gauche ou à droite.
 * Ces logos, à peine visibles, sont colorés en même temps que leur voisin.
 */
export function edgeCompanions(logos: { key: string; x: number; y: number }[], width: number) {
  const { tileWidth, originX } = patternGeometry;
  const isCutByEdge = ({ x }: { x: number }) => {
    const center = toFramePx(x + LOGO_CENTER, originX);
    return center < 0 || center > width;
  };
  const edgeLogos = logos.filter(isCutByEdge);
  const companions = new Map<string, string[]>();
  for (const logo of logos) {
    const near = edgeLogos.filter(
      (edge) => edge.key !== logo.key && Math.hypot(edge.x - logo.x, edge.y - logo.y) <= tileWidth + 0.01,
    );
    if (near.length) companions.set(logo.key, near.map(({ key }) => key));
  }
  return companions;
}

/**
 * Logos du motif qui touchent une frame de width × height px, dans l'ordre de superposition du pattern
 * (rangée par rangée, de gauche à droite). x, y : position du logo en repère interne.
 */
export function patternLogos(width: number, height: number) {
  const { tileWidth, rowHeight, rowShift, logoMin, logoMax, viewBoxOrigin, scale, originX, originY } =
    patternGeometry;
  // Repère interne visible (inverse de toFramePx).
  const fromPx = (px: number, origin: number) => (px - origin) / scale + viewBoxOrigin;
  const minX = fromPx(0, originX) - logoMax;
  const maxX = fromPx(width, originX) - logoMin;
  const minY = fromPx(0, originY) - logoMax;
  const maxY = fromPx(height, originY) - logoMin;

  const logos: { key: string; x: number; y: number }[] = [];
  // Arrondis vers l'intérieur : seuls les logos qui chevauchent réellement la frame.
  for (let row = Math.ceil(minY / rowHeight); row <= Math.floor(maxY / rowHeight); row++) {
    const shift = Math.abs(row) % 2 === 1 ? rowShift : 0;
    for (let col = Math.ceil((minX - shift) / tileWidth); col <= Math.floor((maxX - shift) / tileWidth); col++) {
      logos.push({ key: `${row}:${col}`, x: col * tileWidth + shift, y: row * rowHeight });
    }
  }
  return logos;
}
