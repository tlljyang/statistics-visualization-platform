import { button, div, h1, h2, h3, p, small, span, svg } from "@cycle/dom";
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

    return div(".module-shell", [
      div(".module-layout", [
        div(".experiment-board", [
          div(".experiment-header", [
            div([
              p(".eyebrow", "Core Visualizer"),
              h1("Confidence Interval"),
              p(".module-kicker", "Understand uncertainty through repeated sampling ✦"),
              p(".module-description", "Confidence intervals quantify uncertainty about a population parameter by constructing an interval from sample data. Repeated sampling shows how often our intervals capture the true value."),
            ]),
          ]),
          div(".output-dock", [
            div(".output-heading", [
              div([
                p(".eyebrow", "Model output"),
                h2("Confidence intervals across repeated samples"),
                p("Each horizontal interval comes from a different random sample. The vertical dashed line marks the true mean."),
              ]),
              span(".sample-pill", `Samples: ${sampleCount}`),
            ]),
            div(".chart-legend", [
              span(".legend-item", [
                span(".legend-swatch.legend-swatch--capture"),
                span("Captures true mean"),
              ]),
              span(".legend-item", [
                span(".legend-swatch.legend-swatch--miss"),
                span("Misses true mean"),
              ]),
              span(".legend-item", [
                span(".legend-swatch.legend-swatch--true"),
                span(`True Mean (μ = ${config.populationMean})`),
              ]),
            ]),
            div(".chart-frame", [
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
          ]),
          div(".metrics-grid", [
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
              small(".metric-note", "Higher confidence or more variability usually widens intervals."),
            ]),
            div(".metric-card", [
              span(".metric-label", "Z Multiplier"),
              span(".metric-value", zValue.toFixed(2)),
              small(".metric-note", "Critical value used to construct each interval."),
            ]),
          ]),
        ]),
        div(".teaching-area", [
          div(".teaching-panel.parameter-panel", [
            p(".eyebrow", "Parameters"),
            controlPanelView(state),
            div(".studio-control-bar.studio-control-bar--side", [
              div(".studio-control-bar__buttons", [
                button("#generateSample.studio-button.studio-button--primary", [
                  span(".studio-button__icon", "+"),
                  span("Generate 1 Sample"),
                ]),
                button("#generateMultiple.studio-button.studio-button--secondary", [
                  span(".studio-button__icon", "⋯"),
                  span("Generate 20 Samples"),
                ]),
                button("#reset.studio-button.studio-button--danger", [
                  span(".studio-button__icon", "↺"),
                  span("Reset"),
                ]),
              ]),
              span(".studio-control-bar__hint", "Use repeated samples to compare interval behavior with the target confidence level."),
            ]),
          ]),
          div(".teaching-panel", [
            p(".eyebrow", "Concept + key idea"),
            div(".concept-block", [
              span(".concept-icon", "◎"),
              div([
                h2("What is a Confidence Interval?"),
                p("A confidence interval is an interval-built estimate for an unknown population parameter from sample data."),
              ]),
            ]),
            div(".concept-divider"),
            div(".concept-block", [
              span(".concept-icon", "▥"),
              div([
                h3("Coverage is Long-Run Behavior"),
                p("The confidence level describes how often this method captures the true parameter across repeated samples, not the probability for any one interval."),
              ]),
            ]),
          ]),
          div(".teaching-panel", [
            p(".eyebrow", "Formula"),
            div(".latex-formula", [
              div(".math-expression", [
                span("estimate"),
                span(".math-symbol", "±"),
                span("critical value"),
                span(".math-symbol", "×"),
                span("SE"),
              ]),
            ]),
            p(`Current critical value: ${zValue.toFixed(2)}. Population mean shown in the chart: ${config.populationMean.toFixed(1)}.`),
          ]),
          div(".teaching-panel", [
            p(".eyebrow", "How to read this"),
            h3("Current interpretation"),
            p(interpretation),
            p(sampleCount === 0 ? "Generate samples to start the coverage conversation." : `${misses} interval${misses === 1 ? "" : "s"} currently miss the true mean.`),
          ]),
          div(".teaching-panel.learning-note", [
            p(".eyebrow", "Learning note"),
            p("Try changing the sample size and population SD to see how interval width and coverage behave in practice."),
          ]),
        ]),
      ]),
    ]);
  });
}

export default view;
