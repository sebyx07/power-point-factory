/**
 * The scene graph. Layouts turn a SlideSpec into positioned Elements (inches).
 * QA checks and the PPTX renderer both read this — one source of truth.
 */
export type Hex = `#${string}`;
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Align = "left" | "center" | "right";
export type VAlign = "top" | "middle" | "bottom";

export type Role = "eyebrow" | "title" | "subtitle" | "body" | "caption" | "label" | "metric" | "quote" | "decor" | "media" | "chrome" | "data";

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: Hex;
  /** https://… or #slide:N (internal jump) */
  link?: string;
}
export interface Paragraph {
  runs: Run[];
  bullet?: boolean;
  /** points of space after this paragraph */
  spaceAfter?: number;
}

export type EntranceEffect = "fade" | "rise" | "wipe" | "zoom";
export interface Animation {
  effect: EntranceEffect;
  /** build step; equal orders play together */
  order: number;
}
export type TransitionType = "none" | "fade" | "push" | "wipe" | "morph";
export interface Transition {
  type: TransitionType;
  /** ms */
  duration?: number;
}

interface BaseEl {
  /** stable, unique per slide — becomes the PowerPoint object name (Selection Pane) */
  id: string;
  box: Box;
  role: Role;
  anim?: Animation;
  /** may extend past the slide edge (full-bleed media / bands) */
  bleed?: boolean;
}

export interface TextEl extends BaseEl {
  kind: "text";
  paragraphs: Paragraph[];
  font: string;
  size: number;
  /** auto-fit shrinks down to this size, never below */
  minSize: number;
  color: Hex;
  bold?: boolean;
  italic?: boolean;
  upper?: boolean;
  align: Align;
  valign: VAlign;
  /** line spacing multiple */
  lineSpacing: number;
  /** points */
  letterSpacing?: number;
  /** set by fitText when the text cannot fit even at minSize */
  overflow?: boolean;
}

export interface ShapeEl extends BaseEl {
  kind: "shape";
  shape: "rect" | "roundRect" | "ellipse" | "line" | "chevron" | "homePlate";
  fill?: Hex;
  /** 0..1 opacity of fill */
  opacity?: number;
  line?: { color: Hex; width: number };
  /** inches, roundRect only */
  radius?: number;
}

export type AspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9" | "4:5" | "5:4";
export interface GenerateSpec {
  prompt: string;
  model?: string;
  aspect?: AspectRatio;
  seed?: number;
  /** cut subject out onto transparent bg (Kubeez remove-background) */
  removeBackground?: boolean;
  /** models that expose it (nano-banana-pro…): "1K" | "2K" | "4K" */
  resolution?: "1K" | "2K" | "4K";
}
export type ImageSource = { file: string } | { generate: GenerateSpec } | { icon: string; color?: Hex };

export interface ResolvedImage {
  path: string;
  /** source pixel size before crop — feeds the DPI check */
  srcW: number;
  srcH: number;
  placeholder: boolean;
  origin: string;
}
export interface ImageEl extends BaseEl {
  kind: "image";
  src: ImageSource;
  fit: "cover" | "contain";
  alt: string;
  resolved?: ResolvedImage;
}

export type ChartType = "column" | "bar" | "stackedColumn" | "line" | "area" | "pie" | "doughnut";
export interface ChartSeries {
  name: string;
  values: number[];
}
export interface ChartSpec {
  type: ChartType;
  labels: string[];
  series: ChartSeries[];
  /** Excel number format, e.g. '$#,##0', '0%', '#,##0.0' */
  format?: string;
  showValues?: boolean;
  showLegend?: boolean;
  /** single-series bar/column: index of the one category drawn in accent, rest grey */
  highlight?: number;
  /** value-axis range — set for trends so small moves are visible (never truncate bar charts) */
  min?: number;
  max?: number;
}
export interface ChartEl extends BaseEl {
  kind: "chart";
  chart: ChartSpec;
}

export type Rag = "green" | "amber" | "red";
/** plain value · RAG status dot + label · harvey ball 0–4 (none → full) */
export type Cell = string | number | { rag: Rag; label?: string } | { harvey: 0 | 1 | 2 | 3 | 4 };
export interface TableSpec {
  header: string[];
  rows: Cell[][];
  /** per-column alignment; numbers default right, text left */
  align?: Align[];
  /** relative column widths, e.g. [2,1,1] */
  widths?: number[];
  /** 0-based row index to emphasize */
  highlight?: number;
  /** style the last row as a total */
  total?: boolean;
}
export interface TableEl extends BaseEl {
  kind: "table";
  table: TableSpec;
  font: string;
  size: number;
  rowH: number;
}

export interface VideoGenerateSpec {
  prompt: string;
  /** default KUBEEZ_VIDEO_MODEL (seedance-2-fast) */
  model?: string;
  /** seconds */
  duration?: number;
  aspect?: AspectRatio;
  sound?: boolean;
}
export interface MusicGenerateSpec {
  /** "calm minimal piano, 80 bpm, corporate keynote underscore" */
  prompt: string;
  instrumental?: boolean;
  model?: string;
}
export type MediaSource = { file: string; poster?: string } | { generateVideo: VideoGenerateSpec } | { generateMusic: MusicGenerateSpec };

export interface MediaEl extends BaseEl {
  kind: "media";
  media: "video" | "audio";
  src: MediaSource;
  /** start playing when the slide appears (else on click) */
  autoplay: boolean;
  alt: string;
  resolved?: { path: string; poster: string; placeholder: boolean; origin: string };
}

export type El = TextEl | ShapeEl | ImageEl | ChartEl | TableEl | MediaEl;

export interface SceneSlide {
  index: number;
  layout: string;
  background: Hex;
  elements: El[];
  notes?: string;
  transition: Transition;
  /** null = static slide */
  build: { trigger: "auto" | "click"; dur: number; stagger: number } | null;
  /** Morph pairing names ("!!title") */
  morph: boolean;
}
export interface Scene {
  title: string;
  size: { w: number; h: number };
  slides: SceneSlide[];
}
