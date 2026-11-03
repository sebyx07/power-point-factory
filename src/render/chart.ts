import type PptxGenJS from "pptxgenjs";
import { bare, contrast, mix } from "@/core/color";
import type { ChartEl, Hex } from "@/core/types";
import type { Theme } from "@/theme/types";

const TYPES = {
  column: { type: "bar", barDir: "col", grouping: "clustered" },
  bar: { type: "bar", barDir: "bar", grouping: "clustered" },
  stackedColumn: { type: "bar", barDir: "col", grouping: "stacked" },
  line: { type: "line" },
  area: { type: "area" },
  pie: { type: "pie" },
  doughnut: { type: "doughnut" },
} as const;

/** Native chart styled from theme tokens: no chart junk, muted axes, hero series in accent. */
export function addChart(slide: PptxGenJS.Slide, el: ChartEl, t: Theme): void {
  const c = el.chart;
  const kind = TYPES[c.type];
  const round = c.type === "pie" || c.type === "doughnut";
  const hl = c.highlight !== undefined && c.series.length === 1 && "barDir" in kind ? c.highlight : undefined;
  const only = c.series[0];
  const data =
    hl !== undefined && only
      ? [
          { name: only.name, labels: c.labels, values: only.values.map((v, i) => (i === hl ? v : 0)) },
          { name: `${only.name} `, labels: c.labels, values: only.values.map((v, i) => (i === hl ? 0 : v)) },
        ]
      : c.series.map((s) => ({ name: s.name, labels: c.labels, values: s.values }));
  const axisColor = bare(t.colors.muted);
  const fmt = c.format ?? "#,##0";
  // round charts print white % labels inside slices → darken any slice that can't carry them (≥ 3:1)
  const readable = (h: Hex): Hex => {
    let out = h;
    for (let k = 0; k < 10 && contrast(out, t.colors.onAccent) < 3; k++) out = mix(t.colors.text, out, 0.15);
    return out;
  };
  const colors = round ? c.labels.map((_, i) => readable(t.colors.chart[i % t.colors.chart.length] ?? t.colors.accent)) : t.colors.chart;
  const opts: PptxGenJS.IChartOpts = {
    x: el.box.x,
    y: el.box.y,
    w: el.box.w,
    h: el.box.h,
    objectName: el.id,
    chartColors: (hl !== undefined ? [t.colors.accent, mix(t.colors.muted, t.colors.bg, 0.45)] : colors).map(bare),
    ...("barDir" in kind ? { barDir: kind.barDir, barGrouping: hl !== undefined ? "stacked" : kind.grouping, barGapWidthPct: 55 } : {}),
    showLegend: c.showLegend ?? ((c.series.length > 1 || round) && hl === undefined),
    legendPos: round ? "r" : "b",
    legendFontFace: t.fonts.body,
    legendFontSize: t.type.caption + 1,
    legendColor: axisColor,
    catAxisLabelColor: axisColor,
    catAxisLabelFontFace: t.fonts.body,
    catAxisLabelFontSize: t.type.caption + 1,
    catAxisLineShow: true,
    catAxisLineColor: bare(t.colors.rule),
    valAxisLabelColor: axisColor,
    valAxisLabelFontFace: t.fonts.body,
    valAxisLabelFontSize: t.type.caption,
    valAxisLabelFormatCode: fmt,
    ...(c.min !== undefined ? { valAxisMinVal: c.min } : {}),
    ...(c.max !== undefined ? { valAxisMaxVal: c.max } : {}),
    valAxisLineShow: false,
    valGridLine: { color: bare(mix(t.colors.rule, t.colors.bg, 0.6)), size: 0.5 },
    catGridLine: { style: "none" },
    showValue: c.showValues ?? ("barDir" in kind && c.labels.length * c.series.length <= 12),
    dataLabelFormatCode: fmt,
    dataLabelColor: bare(t.colors.text),
    dataLabelFontFace: t.fonts.body,
    dataLabelFontSize: t.type.caption,
    dataLabelFontBold: true,
    ...(c.type === "line" ? { lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 7 } : {}),
    ...(round
      ? {
          holeSize: 58,
          showPercent: c.showValues ?? true,
          showValue: false,
          dataLabelFormatCode: "0%",
          dataLabelColor: bare(t.colors.onAccent),
          dataLabelFontSize: t.type.caption + 2,
          legendFontSize: t.type.small,
          legendColor: bare(t.colors.text),
        }
      : {}),
  };
  slide.addChart(kind.type as PptxGenJS.CHART_NAME, data, opts);
}
