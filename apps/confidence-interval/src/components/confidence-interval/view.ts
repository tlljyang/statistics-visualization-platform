import { button, div, h1, h2, h3, p, small, span, svg } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import * as d3 from "d3";
import type { State } from "./types";
import { confidenceCopy } from "./copy";
import { controlPanelView } from "./components/control-panel-view";
import { drawCIs, drawTrueMean, createRenderData } from "./components/graph";
import { drawXAxis, drawYAxis } from "./components/axes";

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) => {
    const copy = confidenceCopy[state.language];
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
        ? copy.emptyInterpretation
        : state.coverage >= state.confidenceLevel
          ? copy.healthyInterpretation
          : copy.lowCoverageInterpretation;

    return div(".module-shell", [
      div(".module-layout", [
        div(".experiment-board", [
          div(".experiment-header", [
            div([
              p(".eyebrow", copy.coreVisualizer),
              h1(copy.title),
              p(".module-kicker", copy.kicker),
              p(".module-description", copy.description),
            ]),
          ]),
          div(".output-dock", [
            div(".output-heading", [
              div([
                p(".eyebrow", copy.modelOutput),
                h2(copy.chartTitle),
                p(copy.chartDescription),
              ]),
              span(".sample-pill", copy.samples(sampleCount)),
            ]),
            div(".chart-legend", [
              span(".legend-item", [
                span(".legend-swatch.legend-swatch--capture"),
                span(copy.capturesTrueMean),
              ]),
              span(".legend-item", [
                span(".legend-swatch.legend-swatch--miss"),
                span(copy.missesTrueMean),
              ]),
              span(".legend-item", [
                span(".legend-swatch.legend-swatch--true"),
                span(copy.trueMean(config.populationMean)),
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
                  }, copy.populationScale),
                  svg.text({
                    attrs: {
                      class: "chart-axis-label",
                      transform: `translate(16, ${height / 2}) rotate(-90)`,
                      "text-anchor": "middle",
                    },
                  }, copy.sampleIndex),
                ]),
            ]),
          ]),
          div(".metrics-grid", [
            div(".metric-card", [
              span(".metric-label", copy.observedCoverage),
              span(".metric-value", `${(state.coverage * 100).toFixed(1)}%`),
              small(".metric-note", copy.observedCoverageNote),
            ]),
            div(".metric-card", [
              span(".metric-label", copy.samplesDrawn),
              span(".metric-value", String(sampleCount)),
              small(".metric-note", copy.samplesDrawnNote),
            ]),
            div(".metric-card", [
              span(".metric-label", copy.averageIntervalWidth),
              span(".metric-value", averageWidth.toFixed(2)),
              small(".metric-note", copy.averageIntervalWidthNote),
            ]),
            div(".metric-card", [
              span(".metric-label", copy.zMultiplier),
              span(".metric-value", zValue.toFixed(2)),
              small(".metric-note", copy.zMultiplierNote),
            ]),
          ]),
        ]),
        div(".teaching-area", [
          div(".teaching-panel.parameter-panel", [
            p(".eyebrow", copy.parameters),
            controlPanelView(state, copy),
            div(".studio-control-bar.studio-control-bar--side", [
              div(".studio-control-bar__buttons", [
                button("#generateSample.studio-button.studio-button--primary", [
                  span(".studio-button__icon", "+"),
                  span(copy.generateOne),
                ]),
                button("#generateMultiple.studio-button.studio-button--secondary", [
                  span(".studio-button__icon", "⋯"),
                  span(copy.generateTwenty),
                ]),
                button("#reset.studio-button.studio-button--danger", [
                  span(".studio-button__icon", "↺"),
                  span(copy.reset),
                ]),
              ]),
              span(".studio-control-bar__hint", copy.controlHint),
            ]),
          ]),
          div(".teaching-panel", [
            p(".eyebrow", copy.conceptKeyIdea),
            div(".concept-block", [
              span(".concept-icon", "◎"),
              div([
                h2(copy.whatIsTitle),
                p(copy.whatIsBody),
              ]),
            ]),
            div(".concept-divider"),
            div(".concept-block", [
              span(".concept-icon", "▥"),
              div([
                h3(copy.coverageTitle),
                p(copy.coverageBody),
              ]),
            ]),
          ]),
          div(".teaching-panel", [
            p(".eyebrow", copy.formula),
            div(".latex-formula", [
              div(".math-expression", [
                span(copy.estimate),
                span(".math-symbol", "±"),
                span(copy.criticalValue),
                span(".math-symbol", "×"),
                span(copy.se),
              ]),
            ]),
            p(copy.formulaNote(zValue.toFixed(2), config.populationMean.toFixed(1))),
          ]),
          div(".teaching-panel", [
            p(".eyebrow", copy.howToReadThis),
            h3(copy.currentInterpretation),
            p(interpretation),
            p(sampleCount === 0 ? copy.emptyPrompt : copy.missPrompt(misses)),
          ]),
          div(".teaching-panel.learning-note", [
            p(".eyebrow", copy.learningNote),
            p(copy.learningNoteBody),
          ]),
        ]),
      ]),
    ]);
  });
}

export default view;
