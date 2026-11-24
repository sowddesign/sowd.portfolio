import { logoPatternPaths } from "../LogoPattern/logo-pattern-paths";
import { tokenDuration } from "../token-duration";

/*
 * Éditeur de dessin du motif logo (page 404, après « Dessiner ») — reprise optimisée de tools/motif-editor/motif-dessin.html.
 * Grille en quinconce du motif (pas, rangée et décalage du footer, repère interne du logo 442).
 *
 * Tailles (choix de l'utilisateur, option B de l'aperçu tools/motif-editor/apercu-tailles.html) : grilles emboîtées,
 * le dernier logo posé gagne. Les grilles sont centrées sur la même origine : le centre de chaque logo de 24 tombe sur un
 * centre de 12, lui-même sur un centre de 4 (24 = 2 × 12, 12 = 3 × 4). Un logo posé efface les logos d'autres tailles
 * qu'il recouvre (centres plus proches que OVERLAP × la moyenne des deux tailles) : aucun chevauchement.
 *
 * Outils (demandes de l'utilisateur, interface à venir) :
 *  - pinceau : couleur choisie pour les prochains logos (setColor) ;
 *  - gomme : efface les logos de toutes tailles dont le centre est dans un disque de diamètre réglable (setEraserSize,
 *    px écran) ;
 *  - pot de peinture (comme un logiciel de dessin) : sur un logo, recolore les logos voisins de même taille et de même
 *    couleur ; sur le vide, remplit toute la zone vide qui se touche, jusqu'aux logos ou au bord de la zone de dessin ;
 *  - annuler / refaire : revient en arrière d'une action, ou la refait (poser le doigt, glisser, relever = une action ;
 *    un remplissage ; « Tout effacer »). Zoomer, déplacer la vue et changer d'outil ne sont pas des actions ;
 *  - pinceau large (setBrush) : colorie les logos de la taille choisie dont le centre est dans un disque de N logos de
 *    diamètre autour du pointeur (1 = le logo sous le pointeur) ;
 *  - main : glisser déplace la vue (zoomée) ; Contrôle maintenu fait de même avec n'importe quel outil ;
 *  - Espace maintenu : gomme temporaire, quel que soit l'outil (même pendant un trait) ;
 *  - Contrôle + molette : zoom autour du pointeur (zone de dessin seulement, le zoom de la page est bloqué) ;
 *    molette seule : la vue zoomée monte et descend ; Maj + molette : elle va à gauche et à droite ;
 *  - zoom par boutons (zoomBy), centré sur la zone de dessin ; onZoom donne le zoom courant (affichage en %).
 *
 * Optimisations :
 *  - logos coloriés : une case par logo (numéro d'ordre de pose, 0 = vide, et couleur), gardés dans un calque ; seuls
 *    les logos touchés sont dessinés, et une zone n'est redessinée que si des logos y ont été effacés ;
 *  - logo sous le doigt calculé directement (sans recherche), trait interpolé entre deux positions du pointeur ;
 *  - aucun rendu en continu : on dessine seulement quand quelque chose change ;
 *  - pincement (tactile) : le calque est seulement déplacé et agrandi pendant le geste, rendu net à la fin.
 * Tactile : un doigt dessine, deux doigts zooment et déplacent la vue sans dessiner ; l'action commencée juste avant
 * le second doigt (moins de --not-found-editor-pinch-grace) est annulée.
 */

const LOGO_UNITS = 442;
const STEP_X = 384.54;
const STEP_Y = 322.66;
const SHIFT = 192.27;
/** Contour des logos coloriés, repère interne (comme HiddenShape). */
const STROKE = 12;
/** Recouvrement : deux logos de tailles différentes se gênent si leurs centres sont plus proches que
 *  OVERLAP × (taille 1 + taille 2) / 2 (valeur de l'aperçu validé). */
const OVERLAP = 0.62;

export const editorSizes = [4, 12, 24] as const;
export type EditorSize = (typeof editorSizes)[number];
export type EditorTool = "paint" | "erase" | "fill" | "hand";
const MAX_SIZE = Math.max(...editorSizes);

type Grid = {
  size: number;
  k: number;
  sx: number;
  sy: number;
  cols: number;
  rows: number;
  /** Numéro d'ordre de pose du logo (0 = vide). */
  cells: Uint32Array;
  /** Couleur du logo (indice dans la palette). */
  colors: Uint8Array;
};
/** Valeurs d'une case avant une modification (pour annuler). */
type Change = { g: Grid; i: number; n: number; c: number };

export type MotifEditor = {
  setSize: (size: EditorSize) => void;
  setTool: (tool: EditorTool) => void;
  /** Gomme temporaire (touche Espace maintenue), quel que soit l'outil choisi. */
  setTempEraser: (on: boolean) => void;
  /** Couleur CSS des prochains logos. */
  setColor: (color: string) => void;
  /** Diamètre de la gomme, en px écran. */
  setEraserSize: (px: number) => void;
  /** Diamètre du pinceau, en logos (1 = un seul logo). */
  setBrush: (logos: number) => void;
  /** Zoom multiplié par factor, centré sur la zone de dessin (borné de 1 à --not-found-editor-zoom-max). */
  zoomBy: (factor: number) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  /** PNG du dessin, à la taille de la zone ou recadré autour du dessin (marge en px CSS) ;
   *  background : couleur du fond, null = transparent. */
  exportPng: (options: { background: string | null; crop?: { margin: number } }) => Promise<Blob | null>;
  /** Dessin à partager : couleurs utilisées, puis logos dans l'ordre de pose. */
  snapshot: () => MotifSnapshot;
  /** Remplace le dessin par un dessin partagé (sans historique) ; logos hors du monde de cet écran ignorés. */
  load: (snapshot: MotifSnapshot) => void;
  destroy: () => void;
};

/** Dessin partagé : couleurs CSS, et pour chaque logo (ordre de pose) [indice de taille, rangée, colonne, couleur]. */
export type MotifSnapshot = {
  colors: string[];
  logos: [size: number, row: number, col: number, color: number][];
};

/** Couleur d'un token, résolue par le navigateur (les tokens peuvent être des color-mix). */
function tokenColor(host: Element, token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  host.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

export function createMotifEditor(
  canvas: HTMLCanvasElement,
  options: {
    size: EditorSize;
    eraserSize: number;
    /** Nombre d'actions à annuler et à refaire, à chaque changement. */
    onHistory?: (undo: number, redo: number) => void;
    /** Zoom courant (1 = 100 %), à chaque changement. */
    onZoom?: (zoom: number) => void;
    /** Le dessin contient au moins un logo (true) ou est vide (false), à chaque changement. */
    onDrawing?: (hasDrawing: boolean) => void;
  },
): MotifEditor {
  const ctx = canvas.getContext("2d")!;
  const host = canvas.parentElement ?? document.body;
  const paths = logoPatternPaths.map((d) => new Path2D(d));
  const strokeColor = tokenColor(host, "--border-neutral-black");
  const zoomMax = parseFloat(getComputedStyle(host).getPropertyValue("--not-found-editor-zoom-max")) || 1;
  const pinchGrace = tokenDuration(host, "--not-found-editor-pinch-grace");

  /* Palette : couleurs utilisées (indice 0 = couleur par défaut, shape/brand/brand). */
  const palette = [tokenColor(host, "--shape-brand-brand")];
  let colorIndex = 0;

  /* Monde : carré du plus grand côté de l'écran, pour couvrir rotation et redimensionnement sans reconstruire. */
  const worldSide = Math.max(screen.width, screen.height, window.innerWidth, window.innerHeight);
  const grids = new Map<number, Grid>();
  for (const size of editorSizes) {
    const k = size / LOGO_UNITS;
    const sx = STEP_X * k;
    const sy = STEP_Y * k;
    const cols = Math.ceil(worldSide / sx) + 3;
    const rows = Math.ceil(worldSide / sy) + 3;
    const count = cols * rows;
    grids.set(size, {
      size,
      k,
      sx,
      sy,
      cols,
      rows,
      cells: new Uint32Array(count),
      colors: new Uint8Array(count),
    });
  }
  const gridOf = (size: number) => grids.get(size)!;
  let grid = gridOf(options.size);
  /** Outil choisi, et outil en cours (gomme tant que la gomme temporaire est active). */
  let chosen: EditorTool = "paint";
  let tool: EditorTool = "paint";
  let tempEraser = false;
  let eraserSize = options.eraserSize;
  let brush = 1;
  let seq = 0;

  /* Case (r, c) → indice : r et c commencent à -1 (logos à cheval sur le bord haut ou gauche). */
  const rowOf = (g: Grid, i: number) => Math.floor(i / g.cols) - 1;
  const colOf = (g: Grid, i: number) => (i % g.cols) - 1;
  const centreX = (g: Grid, i: number) => colOf(g, i) * g.sx + (rowOf(g, i) & 1 ? SHIFT * g.k : 0);
  const centreY = (g: Grid, i: number) => rowOf(g, i) * g.sy;
  /** Parcourt les cases de g dont le centre peut être dans le rectangle (monde). */
  const each = (g: Grid, x0: number, y0: number, x1: number, y1: number, fn: (i: number) => void) => {
    const r0 = Math.max(-1, Math.floor(y0 / g.sy));
    const r1 = Math.min(g.rows - 2, Math.ceil(y1 / g.sy));
    for (let r = r0; r <= r1; r++) {
      const off = r & 1 ? SHIFT * g.k : 0;
      const c0 = Math.max(-1, Math.floor((x0 - off) / g.sx));
      const c1 = Math.min(g.cols - 2, Math.ceil((x1 - off) / g.sx));
      for (let c = c0; c <= c1; c++) fn((r + 1) * g.cols + c + 1);
    }
  };
  /** Cases de g dont le centre est à moins de radius du point (monde). */
  const within = (g: Grid, x: number, y: number, radius: number, fn: (i: number) => void) =>
    each(g, x - radius, y - radius, x + radius, y + radius, (i) => {
      if ((centreX(g, i) - x) ** 2 + (centreY(g, i) - y) ** 2 < radius * radius) fn(i);
    });

  /** Case du logo le plus proche d'un point du monde. */
  const nearest = (g: Grid, wx: number, wy: number) => {
    let best = -1,
      bd = Infinity;
    each(g, wx - g.sx, wy - g.sy, wx + g.sx, wy + g.sy, (i) => {
      const d = (centreX(g, i) - wx) ** 2 + (centreY(g, i) - wy) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };

  /* Vue : écran = monde × zoom + décalage. */
  let zoom = 1,
    tx = 0,
    ty = 0,
    vw = 1,
    vh = 1,
    dpr = 1;
  let shownZoom = 0;
  const clampView = () => {
    zoom = Math.min(zoomMax, Math.max(1, zoom));
    tx = Math.min(0, Math.max(vw - vw * zoom, tx));
    ty = Math.min(0, Math.max(vh - vh * zoom, ty));
    if (zoom !== shownZoom) {
      shownZoom = zoom;
      options.onZoom?.(zoom);
    }
  };
  const toWorld = (sx: number, sy: number) => [(sx - tx) / zoom, (sy - ty) / zoom] as const;

  /* Logo colorié, dessiné une fois par taille et par couleur à la résolution affichée. */
  const sprites = new Map<string, { c: HTMLCanvasElement; pad: number }>();
  const spriteOf = (size: number, color: number) => {
    const key = `${size}:${color}`;
    let s = sprites.get(key);
    if (!s) {
      const unit = (size / LOGO_UNITS) * zoom * dpr;
      const pad = Math.ceil((STROKE / 2) * unit) + 1;
      const c = document.createElement("canvas");
      c.width = c.height = Math.ceil(size * zoom * dpr) + 2 * pad;
      const x = c.getContext("2d")!;
      x.translate(pad, pad);
      x.scale(unit, unit);
      x.strokeStyle = strokeColor;
      x.lineWidth = STROKE;
      x.lineJoin = "round";
      paths.forEach((p) => x.stroke(p));
      x.fillStyle = palette[color];
      paths.forEach((p) => x.fill(p));
      s = { c, pad };
      sprites.set(key, s);
    }
    return s;
  };

  /* Calque des logos coloriés, à la résolution affichée. */
  const layer = document.createElement("canvas");
  const lctx = layer.getContext("2d")!;
  const stamp = (g: Grid, i: number, target: CanvasRenderingContext2D = lctx) => {
    const s = spriteOf(g.size, g.colors[i]);
    const x = ((centreX(g, i) - g.size / 2) * zoom + tx) * dpr;
    const y = ((centreY(g, i) - g.size / 2) * zoom + ty) * dpr;
    if (x + s.c.width < 0 || y + s.c.height < 0 || x - s.pad > canvas.width || y - s.pad > canvas.height) return;
    target.drawImage(s.c, Math.round(x) - s.pad, Math.round(y) - s.pad);
  };
  /** Logos coloriés dont le centre peut être dans le rectangle (monde), dans l'ordre de pose. */
  const paintedIn = (x0: number, y0: number, x1: number, y1: number) => {
    const list: { n: number; g: Grid; i: number }[] = [];
    for (const g of grids.values())
      each(g, x0, y0, x1, y1, (i) => {
        if (g.cells[i]) list.push({ n: g.cells[i], g, i });
      });
    return list.sort((a, b) => a.n - b.n);
  };

  /** Affichage d'un rectangle (px canvas) : copie du calque. */
  const compose = (x = 0, y = 0, w = canvas.width, h = canvas.height) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(x, y, w, h);
    ctx.drawImage(layer, x, y, w, h, x, y, w, h);
  };
  /** Calque entier redessiné dans l'ordre de pose (zoom, taille de l'écran, annulation, remplissage). */
  const render = () => {
    lctx.clearRect(0, 0, layer.width, layer.height);
    const [x0, y0] = toWorld(0, 0);
    const [x1, y1] = toWorld(vw, vh);
    for (const p of paintedIn(x0 - MAX_SIZE, y0 - MAX_SIZE, x1 + MAX_SIZE, y1 + MAX_SIZE)) stamp(p.g, p.i);
    compose();
  };
  /** Zone du monde redessinée après un effacement : calque découpé, logos restants reposés dans l'ordre. */
  const repaint = (x0: number, y0: number, x1: number, y1: number) => {
    const px0 = Math.max(0, Math.floor((x0 * zoom + tx) * dpr) - 2);
    const py0 = Math.max(0, Math.floor((y0 * zoom + ty) * dpr) - 2);
    const px1 = Math.min(canvas.width, Math.ceil((x1 * zoom + tx) * dpr) + 2);
    const py1 = Math.min(canvas.height, Math.ceil((y1 * zoom + ty) * dpr) + 2);
    if (px1 <= px0 || py1 <= py0) return;
    lctx.save();
    lctx.beginPath();
    lctx.rect(px0, py0, px1 - px0, py1 - py0);
    lctx.clip();
    lctx.clearRect(px0, py0, px1 - px0, py1 - py0);
    for (const p of paintedIn(x0 - MAX_SIZE, y0 - MAX_SIZE, x1 + MAX_SIZE, y1 + MAX_SIZE)) stamp(p.g, p.i);
    lctx.restore();
    compose(px0, py0, px1 - px0, py1 - py0);
  };

  /* Taille de la zone. */
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    vw = Math.max(1, box.width);
    vh = Math.max(1, box.height);
    dpr = window.devicePixelRatio || 1;
    canvas.width = layer.width = Math.round(vw * dpr);
    canvas.height = layer.height = Math.round(vh * dpr);
    sprites.clear();
    clampView();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  /* Historique : une action = liste des cases modifiées avec leurs valeurs d'avant. */
  const history: Change[][] = [];
  const redoStack: Change[][] = [];
  let action: Change[] | null = null;
  const notify = () => options.onHistory?.(history.length, redoStack.length);
  /* Nombre de logos coloriés : signale quand le dessin devient vide ou ne l'est plus. */
  let painted = 0;
  let hadDrawing = false;
  const write = (g: Grid, i: number, n: number, c: number) => {
    painted += (n ? 1 : 0) - (g.cells[i] ? 1 : 0);
    g.cells[i] = n;
    g.colors[i] = c;
    if (painted > 0 !== hadDrawing) {
      hadDrawing = painted > 0;
      options.onDrawing?.(hadDrawing);
    }
  };
  const setCell = (g: Grid, i: number, n: number, c: number) => {
    action?.push({ g, i, n: g.cells[i], c: g.colors[i] });
    write(g, i, n, c);
  };
  const begin = () => {
    action = [];
  };
  const commit = () => {
    if (action?.length) {
      history.push(action);
      redoStack.length = 0;
      notify();
    }
    action = null;
  };
  /** Remet les cases à leurs valeurs d'avant ; renvoie l'inverse (pour refaire, ou annuler à nouveau). */
  const revert = (changes: Change[]) => {
    const inverse: Change[] = [];
    for (let k = changes.length - 1; k >= 0; k--) {
      const ch = changes[k];
      inverse.push({
        g: ch.g,
        i: ch.i,
        n: ch.g.cells[ch.i],
        c: ch.g.colors[ch.i],
      });
      write(ch.g, ch.i, ch.n, ch.c);
    }
    render();
    return inverse;
  };

  /* Pinceau : le dernier posé gagne, logos d'autres tailles recouverts effacés. */
  const paintAt = (sx: number, sy: number) => {
    const [wx, wy] = toWorld(sx, sy);
    if (brush <= 1) paintCell(nearest(grid, wx, wy));
    else within(grid, wx, wy, (brush / 2) * grid.sx, paintCell);
  };
  const paintCell = (cell: number) => {
    if (cell < 0 || (grid.cells[cell] && grid.colors[cell] === colorIndex)) return;
    const cx = centreX(grid, cell);
    const cy = centreY(grid, cell);
    let reach = grid.cells[cell] ? grid.size / 2 : 0;
    for (const g of grids.values()) {
      if (g === grid) continue;
      const radius = ((grid.size + g.size) / 2) * OVERLAP;
      within(g, cx, cy, radius, (i) => {
        if (!g.cells[i]) return;
        setCell(g, i, 0, 0);
        reach = Math.max(reach, radius + g.size / 2);
      });
    }
    setCell(grid, cell, ++seq, colorIndex);
    if (reach) repaint(cx - reach, cy - reach, cx + reach, cy + reach);
    else {
      // Nouveau logo au-dessus de tout : posé directement sur le calque et à l'écran.
      stamp(grid, cell);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      stamp(grid, cell, ctx);
    }
  };

  /* Gomme : logos de toutes tailles dont le centre est dans le disque. */
  const eraseAt = (sx: number, sy: number) => {
    const [wx, wy] = toWorld(sx, sy);
    const radius = eraserSize / 2 / zoom;
    let erased = false;
    for (const g of grids.values())
      within(g, wx, wy, radius, (i) => {
        if (!g.cells[i]) return;
        setCell(g, i, 0, 0);
        erased = true;
      });
    const reach = radius + MAX_SIZE;
    if (erased) repaint(wx - reach, wy - reach, wx + reach, wy + reach);
  };

  /* Remplissage du vide : une case de la grille choisie est bloquée si elle porte un logo ou si un logo d'une autre
     taille la recouvre. */
  const blocked = (i: number) => {
    if (grid.cells[i]) return true;
    const cx = centreX(grid, i);
    const cy = centreY(grid, i);
    for (const g of grids.values()) {
      if (g === grid) continue;
      let hit = false;
      within(g, cx, cy, ((grid.size + g.size) / 2) * OVERLAP, (j) => {
        if (g.cells[j]) hit = true;
      });
      if (hit) return true;
    }
    return false;
  };
  /** Parcours de voisin en voisin (6 voisins de la quinconce) depuis start, tant que accept(j) ; dans la zone de
   *  dessin au zoom 1 (0..vw, 0..vh), qui sert de bord. */
  const flood = (g: Grid, start: number, accept: (j: number) => boolean) => {
    const seen = new Uint8Array(g.cells.length);
    const queue = [start];
    seen[start] = 1;
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q];
      const r = rowOf(g, i);
      const c = colOf(g, i);
      const side = r & 1 ? [c, c + 1] : [c - 1, c];
      const next: [number, number][] = [
        [r, c - 1],
        [r, c + 1],
        [r - 1, side[0]],
        [r - 1, side[1]],
        [r + 1, side[0]],
        [r + 1, side[1]],
      ];
      for (const [nr, nc] of next) {
        if (nr < -1 || nr > g.rows - 2 || nc < -1 || nc > g.cols - 2) continue;
        const j = (nr + 1) * g.cols + nc + 1;
        if (seen[j]) continue;
        seen[j] = 1;
        const x = centreX(g, j);
        const y = centreY(g, j);
        if (x < 0 || y < 0 || x > vw || y > vh) continue;
        if (accept(j)) queue.push(j);
      }
    }
    return queue;
  };
  /** Logo colorié sous le point (monde), le plus récent s'ils se touchent. */
  const paintedAt = (wx: number, wy: number) => {
    let hit: { g: Grid; i: number } | null = null;
    for (const g of grids.values()) {
      const i = nearest(g, wx, wy);
      if (i < 0 || !g.cells[i]) continue;
      if ((centreX(g, i) - wx) ** 2 + (centreY(g, i) - wy) ** 2 > (g.size / 2) ** 2) continue;
      if (!hit || g.cells[i] > hit.g.cells[hit.i]) hit = { g, i };
    }
    return hit;
  };
  /* Pot de peinture, comme dans un logiciel de dessin (demande de l'utilisateur) :
     - sur un logo colorié : recolore les logos de même taille et de même couleur qui se touchent ;
     - sur le vide : remplit de logos de la taille choisie toute la zone vide qui se touche, jusqu'aux logos ou au bord
       de la zone de dessin. */
  const fillAt = (sx: number, sy: number) => {
    const [wx, wy] = toWorld(sx, sy);
    const hit = paintedAt(wx, wy);
    if (hit) {
      const { g, i: start } = hit;
      const from = g.colors[start];
      if (from === colorIndex) return;
      const region = flood(g, start, (j) => g.cells[j] !== 0 && g.colors[j] === from);
      begin();
      for (const i of region) setCell(g, i, g.cells[i], colorIndex);
      commit();
      render();
      return;
    }
    const g = grid;
    const start = nearest(g, wx, wy);
    if (start < 0 || blocked(start)) return;
    const region = flood(g, start, (j) => !blocked(j));
    begin();
    for (const i of region) setCell(g, i, ++seq, colorIndex);
    commit();
    render();
  };

  /* Pointeurs : un = outil choisi ; deux (tactile) = zoom et déplacement. */
  const pointers = new Map<number, { x: number; y: number }>();
  let mode: "idle" | "draw" | "pan" | "pinch" | "wait" = "idle";
  let pan: { tx: number; ty: number; x: number; y: number } | null = null;
  let actionTime = 0,
    lastX = 0,
    lastY = 0;
  let pinch: {
    z: number;
    tx: number;
    ty: number;
    d: number;
    mx: number;
    my: number;
  } | null = null;
  const local = (e: MouseEvent) => {
    const box = canvas.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };
  const twoFingers = () => {
    const [a, b] = [...pointers.values()];
    return {
      d: Math.hypot(b.x - a.x, b.y - a.y) || 1,
      mx: (a.x + b.x) / 2,
      my: (a.y + b.y) / 2,
    };
  };
  /** Trait interpolé entre deux positions (pas : fraction du logo, ou de la gomme). */
  const drawLine = (ax: number, ay: number, bx: number, by: number) => {
    const at = tool === "erase" ? eraseAt : paintAt;
    const step = tool === "erase" ? Math.max(1, eraserSize * 0.25) : grid.size * zoom * 0.3 * brush;
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let i = 1; i <= n; i++) at(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n);
  };
  /** Aperçu pendant un geste de vue : calque déplacé et agrandi depuis la vue de départ (z0, x0, y0). */
  const preview = (z0: number, x0: number, y0: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const f = zoom / z0;
    ctx.drawImage(layer, (tx - x0 * f) * dpr, (ty - y0 * f) * dpr, canvas.width * f, canvas.height * f);
  };
  const movePinch = () => {
    if (!pinch) return;
    const { d, mx, my } = twoFingers();
    zoom = (pinch.z * d) / pinch.d;
    const wx = (pinch.mx - pinch.tx) / pinch.z;
    const wy = (pinch.my - pinch.ty) / pinch.z;
    tx = mx - wx * zoom;
    ty = my - wy * zoom;
    clampView();
    sprites.clear();
    preview(pinch.z, pinch.tx, pinch.ty);
  };

  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Pointeur déjà relâché : rien à capturer.
    }
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 1 && mode === "idle") {
      settleWheel();
      // Main, ou Contrôle maintenu : glisser déplace la vue.
      if (tool === "hand" || e.ctrlKey) {
        mode = "pan";
        pan = { tx, ty, x: p.x, y: p.y };
        return;
      }
      if (tool === "fill") {
        // Le remplissage attend le relâchement : un second doigt peut encore en faire un zoom.
        mode = "draw";
        actionTime = e.timeStamp;
        lastX = p.x;
        lastY = p.y;
        return;
      }
      mode = "draw";
      begin();
      actionTime = e.timeStamp;
      lastX = p.x;
      lastY = p.y;
      (tool === "erase" ? eraseAt : paintAt)(p.x, p.y);
    } else if (pointers.size === 2 && e.pointerType === "touch") {
      if (mode === "pan") {
        pan = null;
        render();
      }
      if (mode === "draw" && action) {
        if (e.timeStamp - actionTime < pinchGrace) {
          revert(action);
          action = null;
        } else commit();
      }
      pinch = { z: zoom, tx, ty, ...twoFingers() };
      mode = "pinch";
    }
  };
  const move = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (mode === "draw" && tool !== "fill") {
      drawLine(lastX, lastY, p.x, p.y);
      lastX = p.x;
      lastY = p.y;
    } else if (mode === "pan" && pan) {
      tx = pan.tx + p.x - pan.x;
      ty = pan.ty + p.y - pan.y;
      clampView();
      preview(zoom, pan.tx, pan.ty);
    } else if (mode === "pinch" && pointers.size >= 2) movePinch();
  };
  const up = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId)) return;
    if (mode === "pinch" && pointers.size < 2) {
      pinch = null;
      sprites.clear();
      render();
      mode = "wait";
    }
    if (mode === "draw") {
      if (tool === "fill") fillAt(lastX, lastY);
      else commit();
      mode = pointers.size ? "wait" : "idle";
    }
    if (mode === "pan") {
      pan = null;
      render();
    }
    if (pointers.size === 0) mode = "idle";
  };
  /* Contrôle + molette : zoom autour du pointeur (molette avant = zoom). Aperçu pendant la rotation (calque agrandi),
     rendu net --not-found-editor-wheel-settle après le dernier cran. */
  const wheelSettle = tokenDuration(host, "--not-found-editor-wheel-settle");
  const zoomStep = parseFloat(getComputedStyle(host).getPropertyValue("--not-found-editor-zoom-step")) || 1;
  let wheelBase: { z: number; tx: number; ty: number } | null = null;
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;
  const settleWheel = () => {
    clearTimeout(wheelTimer);
    if (!wheelBase) return;
    wheelBase = null;
    sprites.clear();
    render();
  };
  const wheel = (e: WheelEvent) => {
    // Empêche le zoom et le défilement de la page du navigateur.
    e.preventDefault();
    // Espace maintenue : la molette règle la taille de la gomme (géré par l'interface), la vue ne bouge pas.
    if (mode !== "idle" || tempEraser) return;
    wheelBase ??= { z: zoom, tx, ty };
    const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? vh : 1;
    if (e.ctrlKey) {
      const p = local(e);
      const z0 = zoom;
      const wx = (p.x - tx) / z0;
      const wy = (p.y - ty) / z0;
      // Un cran de molette (deltaY 100) = un pas de zoom ; les pavés tactiles donnent des fractions de cran.
      zoom = Math.min(zoomMax, Math.max(1, z0 * zoomStep ** ((-e.deltaY * unit) / 100)));
      tx = p.x - wx * zoom;
      ty = p.y - wy * zoom;
    } else {
      // Molette seule : défilement vertical de la vue ; Maj + molette (ou molette horizontale) : horizontal.
      const dx = e.shiftKey ? e.deltaX || e.deltaY : e.deltaX;
      const dy = e.shiftKey ? 0 : e.deltaY;
      tx -= dx * unit;
      ty -= dy * unit;
    }
    clampView();
    preview(wheelBase.z, wheelBase.tx, wheelBase.ty);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(settleWheel, wheelSettle);
  };
  canvas.addEventListener("wheel", wheel, { passive: false });
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  return {
    setSize(size) {
      grid = gridOf(size);
    },
    setTool(next) {
      chosen = next;
      tool = tempEraser ? "erase" : chosen;
    },
    setTempEraser(on) {
      tempEraser = on;
      tool = on ? "erase" : chosen;
    },
    setColor(color) {
      let i = palette.indexOf(color);
      if (i < 0 && palette.length < 256) {
        palette.push(color);
        i = palette.length - 1;
      }
      if (i >= 0) colorIndex = i;
    },
    setEraserSize(px) {
      eraserSize = px;
    },
    setBrush(logos) {
      brush = Math.max(1, logos);
    },
    zoomBy(factor) {
      if (mode !== "idle") return;
      settleWheel();
      const z0 = zoom;
      // Centre de la zone de dessin gardé en place.
      const wx = (vw / 2 - tx) / z0;
      const wy = (vh / 2 - ty) / z0;
      zoom = Math.min(zoomMax, Math.max(1, z0 * factor));
      tx = vw / 2 - wx * zoom;
      ty = vh / 2 - wy * zoom;
      clampView();
      if (zoom === z0) return;
      sprites.clear();
      render();
    },
    undo() {
      if (action) return;
      const last = history.pop();
      if (!last) return;
      redoStack.push(revert(last));
      notify();
    },
    redo() {
      if (action) return;
      const next = redoStack.pop();
      if (!next) return;
      history.push(revert(next));
      notify();
    },
    clear() {
      begin();
      for (const g of grids.values()) for (let i = 0; i < g.cells.length; i++) if (g.cells[i]) setCell(g, i, 0, 0);
      commit();
      render();
    },
    snapshot() {
      const all: { n: number; g: Grid; i: number }[] = [];
      for (const g of grids.values())
        for (let i = 0; i < g.cells.length; i++) if (g.cells[i]) all.push({ n: g.cells[i], g, i });
      all.sort((a, b) => a.n - b.n);
      // Seules les couleurs utilisées, renumérotées.
      const colors: string[] = [];
      const index = new Map<number, number>();
      const logos = all.map(({ g, i }): MotifSnapshot["logos"][number] => {
        const c = g.colors[i];
        if (!index.has(c)) {
          index.set(c, colors.length);
          colors.push(palette[c]);
        }
        return [editorSizes.indexOf(g.size as EditorSize), rowOf(g, i), colOf(g, i), index.get(c)!];
      });
      return { colors, logos };
    },
    load({ colors, logos }) {
      const map = colors.map((color) => {
        let i = palette.indexOf(color);
        if (i < 0 && palette.length < 256) {
          palette.push(color);
          i = palette.length - 1;
        }
        return Math.max(0, i);
      });
      for (const g of grids.values()) for (let i = 0; i < g.cells.length; i++) if (g.cells[i]) write(g, i, 0, 0);
      for (const [size, r, c, color] of logos) {
        const g = grids.get(editorSizes[size]);
        if (!g || r < -1 || r > g.rows - 2 || c < -1 || c > g.cols - 2) continue;
        write(g, (r + 1) * g.cols + c + 1, ++seq, map[color] ?? 0);
      }
      history.length = 0;
      redoStack.length = 0;
      notify();
      sprites.clear();
      render();
    },
    exportPng({ background: fill, crop }) {
      // Dessin seul, sur la couleur de fond choisie (ou transparent).
      let sx = 0;
      let sy = 0;
      let w = layer.width;
      let h = layer.height;
      let pad = 0;
      if (crop) {
        // Boîte des pixels peints du calque, plus la marge de chaque côté.
        const data = lctx.getImageData(0, 0, layer.width, layer.height).data;
        let x0 = layer.width;
        let y0 = layer.height;
        let x1 = -1;
        let y1 = -1;
        for (let y = 0; y < layer.height; y++) {
          const row = y * layer.width;
          for (let x = 0; x < layer.width; x++) {
            if (!data[(row + x) * 4 + 3]) continue;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            y1 = y;
          }
        }
        if (x1 >= 0) {
          sx = x0;
          sy = y0;
          w = x1 - x0 + 1;
          h = y1 - y0 + 1;
          pad = Math.round(crop.margin * dpr);
        }
      }
      const out = document.createElement("canvas");
      out.width = w + 2 * pad;
      out.height = h + 2 * pad;
      const x = out.getContext("2d")!;
      if (fill) {
        x.fillStyle = fill;
        x.fillRect(0, 0, out.width, out.height);
      }
      x.drawImage(layer, sx, sy, w, h, pad, pad, w, h);
      return new Promise((resolve) => out.toBlob(resolve, "image/png"));
    },
    destroy() {
      observer.disconnect();
      clearTimeout(wheelTimer);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    },
  };
}
