import { h } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import { chartToVNode } from "../../d3/charts";
import type { ControlConfig, ControlValue, State } from "./types";

function compact(children: Array<VNode | null>): VNode[] {
  return children.filter((child): child is VNode => child !== null);
}

function valueFor(control: ControlConfig, controls: Record<string, ControlValue>): ControlValue {
  return controls[control.id] ?? control.defaultValue;
}

function renderControl(control: ControlConfig, controls: Record<string, ControlValue>): VNode {
  const value = valueFor(control, controls);

  if (control.type === "select") {
    return h("label.control-field", [
      h("span.control-label", control.label),
      h(
        "select.control-input",
        {
          attrs: {
            "data-control-id": control.id
          }
        },
        (control.options ?? []).map((option) =>
          h(
            "option",
            {
              attrs: {
                value: option.value,
                selected: String(value) === option.value
              }
            },
            [option.label]
          )
        )
      )
    ]);
  }

  const inputAttrs: Record<string, string | number | boolean> = {
    "data-control-id": control.id,
    type: control.type,
    value: String(value)
  };

  if (control.min !== undefined) inputAttrs.min = control.min;
  if (control.max !== undefined) inputAttrs.max = control.max;
  if (control.step !== undefined) inputAttrs.step = control.step;

  return h("label.control-field", [
    h("span.control-label", control.label),
    h("input.control-input", { attrs: inputAttrs }, [])
  ]);
}

function renderTable(state: State): VNode | null {
  if (!state.result.table) {
    return null;
  }

  return h("section.teaching-panel.table-panel", [
    h("h3", "Data table"),
    h("div.table-scroll", [
      h("table.result-table", [
        h("thead", [
          h("tr", state.result.table.columns.map((column) => h("th", column)))
        ]),
        h(
          "tbody",
          state.result.table.rows.map((row) =>
            h("tr", row.map((cell) => h("td", String(cell))))
          )
        )
      ])
    ])
  ]);
}

function renderTeachingPoints(state: State): VNode {
  return h("ul.teaching-list", state.activeExample.teachingPoints.map((point) => h("li", point)));
}

function renderMetricCards(state: State): VNode[] {
  return state.result.metrics.map((metric) =>
    h("article.metric-card", compact([
      h("span.metric-label", metric.label),
      h("strong.metric-value", metric.value),
      metric.detail ? h("small.metric-note", metric.detail) : null
    ]))
  );
}

function renderFormula(state: State): VNode {
  const title = state.config.title.toLowerCase();

  if (title.includes("anova")) {
    return h("div.math-expression", [
      h("span", "F ="),
      h("span.math-frac", [
        h("span.math-num", ["MS", h("sub", "between")]),
        h("span.math-den", ["MS", h("sub", "within")])
      ])
    ]);
  }

  if (title.includes("regression")) {
    return h("div.math-expression", [
      h("span", "SSE ="),
      h("span.math-symbol", "Σ"),
      h("span", ["(", "y", h("sub", "i"), " − ", "ŷ", h("sub", "i"), ")"]),
      h("sup", "2")
    ]);
  }

  if (title.includes("confidence")) {
    return h("div.math-expression", [
      h("span", "estimate"),
      h("span.math-symbol", "±"),
      h("span", "critical value"),
      h("span.math-symbol", "×"),
      h("span", "SE")
    ]);
  }

  if (title.includes("distribution")) {
    return h("div.math-expression", [
      h("span", "P(a ≤ X ≤ b) ="),
      h("span.math-symbol", "∫"),
      h("span", [h("sub", "a"), h("sup", "b")]),
      h("span", "f(x) dx")
    ]);
  }

  if (title.includes("mcmc")) {
    return h("div.math-expression", [
      h("span", "p(θ | y)"),
      h("span.math-symbol", "∝"),
      h("span", "p(y | θ) p(θ)")
    ]);
  }

  return h("div.math-expression", [
    h("span", "simulation result"),
    h("span.math-symbol", "="),
    h("span", "f(parameters, random seed)")
  ]);
}

export function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) =>
    h("div.module-shell", [
      h("main.module-layout", [
        h("section.experiment-board", [
          h("header.experiment-header", [
            h("div", [
              h("p.eyebrow", state.config.category),
              h("h1", state.config.title),
              h("p", state.config.subtitle)
            ])
          ]),
          h("section.output-dock", [
            h("div.output-heading", [
              h("p.eyebrow", "Model output"),
              h("h2", state.result.headline),
              h("p", state.result.narrative)
            ]),
            h("div.chart-frame", [chartToVNode(state.result.chart)])
          ]),
          h("section.metrics-grid", renderMetricCards(state))
        ]),
        h("aside.teaching-area", [
          h("section.teaching-panel.parameter-panel", [
            h("p.eyebrow", "Parameters"),
            h("div.example-tabs", state.config.examples.map((example) =>
              h("button.example-tab", {
                attrs: {
                  type: "button",
                  "data-example-id": example.id,
                  "data-active": String(example.id === state.activeExample.id)
                }
              }, [example.title])
            )),
            h("div.control-grid", state.activeExample.controls.map((control) => renderControl(control, state.controls))),
            h("button.run-button", { attrs: { type: "button" } }, ["Run"])
          ]),
          h("section.teaching-panel", [
            h("p.eyebrow", "Concept + key idea"),
            h("h2", state.activeExample.title),
            h("p", state.activeExample.description),
            renderTeachingPoints(state)
          ]),
          h("section.teaching-panel.formula-panel", [
            h("p.eyebrow", "Formula"),
            h("div.latex-formula", [renderFormula(state)]),
            h("p", "Use the formula as the anchor, then connect each symbol back to the controls and chart.")
          ]),
          h("section.teaching-panel", [
            h("p.eyebrow", "How to read this"),
            h("h3", state.result.headline),
            h("p", state.result.narrative)
          ]),
          ...compact([renderTable(state)])
        ])
      ])
    ])
  );
}
