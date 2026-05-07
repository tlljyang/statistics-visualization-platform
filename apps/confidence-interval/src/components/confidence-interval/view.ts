import { div, h1, h2, h3, p, small, span, svg } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import * as d3 from "d3";
import type { State } from "./types";
import { controlPanelView } from "./components/control-panel-view";
import { drawCIs, drawTrueMean, createRenderData } from "./components/graph";
import { drawXAxis, drawYAxis } from "./components/axes";

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) => {
    const { samples, scales, config } = state;
    const { width, height, margin } = config;
    const marginTop = margin.top ?? 20;
    const marginBottom = margin.bottom ?? 30;
    const marginLeft = margin.left ?? 40;

    const chartHeight = height - marginTop - marginBottom;
    const renderData = createRenderData(samples, scales);
    const sampleCount = samples.length;
    const misses = sampleCount - samples.filter((sample) => sample.contains).length;
    const averageWidth =
      sampleCount === 0
        ? 0
        : samples.reduce((sum, sample) => sum + (sample.upper - sample.lower), 0) / sampleCount;
    const zValue =
      state.confidenceLevel === 0.99
        ? 2.5758
        : state.confidenceLevel === 0.95
          ? 1.96
          : state.confidenceLevel === 0.9
            ? 1.6449
            : 1.2816;

    const interpretation =
      sampleCount === 0
        ? "Start by generating a sample so students can see one interval before talking about repeated sampling."
        : state.coverage >= state.confidenceLevel
          ? "Coverage is currently at or above the target confidence level, so the long-run behavior is looking healthy."
          : "Coverage is currently below the target confidence level, which is a good prompt to discuss randomness and finite samples.";

    return div(".confidence-page-shell", [
      div(".page-container", [
        div(".hero-panel", [
          div(".hero-copy", [
            p(".eyebrow", "Interactive Estimation Lab"),
            h1(".hero-title", "Turn repeated sampling into something students can actually see."),
            p(
              ".hero-text",
              "Generate confidence intervals one sample at a time, compare observed coverage to the target level, and use the chart to explain why some intervals miss the true mean.",
            ),
          ]),
          div(".hero-tips", [
            div(".tip-chip", "Blue dashed line = true mean"),
            div(".tip-chip", "Green interval = covers μ"),
            div(".tip-chip", "Red interval = misses μ"),
          ]),
        ]),

        div(".lesson-banner", [
          div(".lesson-meta", [
            div(".lesson-label", "Current lesson"),
            h2(".lesson-title", "Repeated samples produce different intervals"),
            p(
              ".lesson-headline",
              "Confidence is about the long-run capture rate of the method, not the probability that one finished interval is correct.",
            ),
            p(
              ".lesson-prompt",
              "Ask students what changes when you increase the sample size, raise the confidence level, or make the population more variable.",
            ),
          ]),
          div(".lesson-stats", [
            div(".lesson-stat", [
              span(".lesson-stat-label", "Population Mean"),
              span(".lesson-stat-value", config.populationMean.toFixed(1)),
            ]),
            div(".lesson-stat", [
              span(".lesson-stat-label", "Target Confidence"),
              span(".lesson-stat-value", `${Math.round(state.confidenceLevel * 100)}%`),
            ]),
          ]),
        ]),

        div(".content-grid", [
          controlPanelView(state),
          div(".main-column", [
            div(".chart-card", [
              div(".chart-card-header", [
                h3(".chart-card-title", "Confidence intervals across repeated samples"),
                p(
                  ".chart-card-subtitle",
                  "Each horizontal interval comes from a different random sample. Watch how the capture pattern changes as the controls move.",
                ),
              ]),
              div(".chart-shell", [
                svg({ attrs: { width, height, viewBox: `0 0 ${width} ${height}` } }, [
                  {
                    sel: "g",
                    data: {
                      attrs: { transform: `translate(${marginLeft}, ${marginTop})`, id: "main_group" },
                    },
                    children: [
                      {
                        sel: "g",
                        data: {
                          attrs: { transform: `translate(0, ${chartHeight})` },
                          hook: {
                            insert: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawXAxis(g, scales.xScale);
                            },
                            update: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawXAxis(g, scales.xScale);
                            },
                          },
                        },
                      },
                      {
                        sel: "g",
                        data: {
                          hook: {
                            insert: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawYAxis(g, scales.yScale);
                            },
                            update: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawYAxis(g, scales.yScale);
                            },
                          },
                        },
                      },
                      {
                        sel: "g",
                        data: {
                          hook: {
                            insert: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawTrueMean(g, scales.xScale(config.populationMean), chartHeight, config.populationMean);
                            },
                            update: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawTrueMean(g, scales.xScale(config.populationMean), chartHeight, config.populationMean);
                            },
                          },
                        },
                      },
                      {
                        sel: "g",
                        data: {
                          hook: {
                            insert: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawCIs(g, renderData);
                            },
                            update: (vnode: any) => {
                              const g = d3.select(vnode.elm);
                              drawCIs(g, renderData);
                            },
                          },
                        },
                      },
                    ],
                  } as any,
                  svg.text({
                    attrs: {
                      class: "chart-axis-label",
                      x: String(width / 2),
                      y: String(height - 10),
                      "text-anchor": "middle",
                    },
                  }, "Population scale"),
                  svg.text({
                    attrs: {
                      class: "chart-axis-label",
                      transform: `translate(16, ${height / 2}) rotate(-90)`,
                      "text-anchor": "middle",
                    },
                  }, "Sample index"),
                ]),
              ]),
              div(".chart-legend", [
                div(".legend-item", [span(".legend-swatch.legend-swatch--cover"), span("Interval captures true mean")]),
                div(".legend-item", [span(".legend-swatch.legend-swatch--miss"), span("Interval misses true mean")]),
                div(".legend-item", [span(".legend-swatch.legend-swatch--line"), span("True mean")]),
              ]),
            ]),

            div(".stats-grid", [
              div(".metric-card", [
                span(".metric-label", "Observed Coverage"),
                span(".metric-value", `${(state.coverage * 100).toFixed(1)}%`),
                small(".metric-note", "Share of generated intervals that contain the true mean."),
              ]),
              div(".metric-card", [
                span(".metric-label", "Samples Drawn"),
                span(".metric-value", String(sampleCount)),
                small(".metric-note", "More samples make the long-run pattern easier to see."),
              ]),
              div(".metric-card", [
                span(".metric-label", "Average Interval Width"),
                span(".metric-value", averageWidth.toFixed(2)),
                small(".metric-note", "Wider intervals usually come from higher confidence or more variability."),
              ]),
              div(".metric-card", [
                span(".metric-label", "Z Multiplier"),
                span(".metric-value", zValue.toFixed(2)),
                small(".metric-note", "Critical value used to construct each interval."),
              ]),
            ]),

            div(".explanation-card", [
              h3(".explanation-title", "How to teach with this view"),
              p(
                ".explanation-text",
                "Generate a handful of intervals first, ask students to guess whether the method is working, then add many more samples and compare observed coverage with the target confidence level.",
              ),
              div(".teaching-callout", [
                h3(".callout-title", "Current interpretation"),
                p(".callout-text", interpretation),
                p(
                  ".callout-text.callout-text--secondary",
                  sampleCount === 0
                    ? "Confidence level controls the method before any intervals are generated."
                    : `${misses} interval${misses === 1 ? "" : "s"} currently miss the true mean.`,
                ),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  });
}

export default view;
