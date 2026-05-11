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

  return h("div.table-card", [
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
  ]);
}

function renderTeachingPoints(state: State): VNode {
  return h("ul.teaching-list", state.activeExample.teachingPoints.map((point) => h("li", point)));
}

export function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) =>
    h("div.app-shell", [
      h("header.hero-panel", [
        h("p.eyebrow", state.config.category),
        h("h1", state.config.title),
        h("p.hero-copy", state.config.subtitle),
        h("p.source-note", `Source: Bayes-Cluster/WALS/${state.config.sourcePath}`)
      ]),
      h("main.workspace", [
        h("aside.control-panel", [
          h("div.panel-section", [
            h("h2", "Templates"),
            h(
              "div.example-tabs",
              state.config.examples.map((example) =>
                h(
                  "button.example-tab",
                  {
                    attrs: {
                      type: "button",
                      "data-example-id": example.id,
                      "data-active": String(example.id === state.activeExample.id)
                    }
                  },
                  [example.title]
                )
              )
            )
          ]),
          h("div.panel-section", [
            h("h2", "Controls"),
            ...state.activeExample.controls.map((control) => renderControl(control, state.controls)),
            h("button.run-button", { attrs: { type: "button" } }, ["Run simulation"])
          ])
        ]),
        h("section.content-stack", [
          h("section.lesson-banner", [
            h("div", [
              h("p.lesson-label", "Current template"),
              h("h2", state.activeExample.title),
              h("p", state.activeExample.description)
            ]),
            h("div.source-chip", state.activeExample.sourcePath)
          ]),
          h("section.chart-card", [
            h("div.chart-card-header", [
              h("h3", state.result.headline),
              h("p", state.result.narrative)
            ]),
            chartToVNode(state.result.chart)
          ]),
          h(
            "section.stats-grid",
            state.result.metrics.map((metric) =>
              h("article.metric-card", compact([
                h("span", metric.label),
                h("strong", metric.value),
                metric.detail ? h("small", metric.detail) : null
              ]))
            )
          ),
          ...compact([renderTable(state)]),
          h("section.explanation-card", [
            h("h3", "Teaching focus"),
            renderTeachingPoints(state)
          ])
        ])
      ]),
      h("footer.module-footer", [
        h("span", "mes-distributions-visualization"),
        h("a", { attrs: { href: "https://github.com/Bayes-Cluster/WALS", target: "_blank", rel: "noreferrer" } }, "WALS source")
      ])
    ])
  );
}
