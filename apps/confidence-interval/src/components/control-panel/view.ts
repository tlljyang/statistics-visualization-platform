import { div, input, button, select, option } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import type { ControlPanelState } from "./types";

export default function view(state$: Stream<ControlPanelState>): Stream<VNode> {
  return state$.map((state) => {
    const { sampleSize, populationSD, confidenceLevel, coverage, collapsed } = state;

    return div(
      `#sidebar.col-md-3.col-lg-2.bg-light.p-3.border-end.position-relative${
        collapsed ? ".collapsed" : ""
      }`,
      [
        button("#toggleSidebar.btn.btn-sm.btn-outline-secondary.position-absolute.top-0.end-0.m-2", [
          collapsed ? "❯" : "❮",
        ]),

        !collapsed
          ? div(".sidebar-content", [
              div(".h4", ["Hello Shiny!"]),
              div(".mb-3", [
                div([], ["Sample Size:"]),
                input(
                  "#sampleSize.form-range",
                  { attrs: { type: "range", min: 1, max: 100, value: String(sampleSize) } },
                  [],
                ),
              ]),
              div(".mb-3", [
                div([], ["Population SD:"]),
                input(
                  "#populationSD.form-range",
                  { attrs: { type: "range", min: 0.1, max: 10, step: 0.1, value: String(populationSD) } },
                  [],
                ),
              ]),
              div(".mb-3", [
                div([], ["Confidence Level:"]),
                select("#confidenceLevel.form-select", [
                  option({ attrs: { value: "0.8", selected: confidenceLevel === 0.8 } }, ["80%"]),
                  option({ attrs: { value: "0.9", selected: confidenceLevel === 0.9 } }, ["90%"]),
                  option({ attrs: { value: "0.95", selected: confidenceLevel === 0.95 } }, ["95%"]),
                  option({ attrs: { value: "0.99", selected: confidenceLevel === 0.99 } }, ["99%"]),
                ]),
              ]),
              button("#generateSample.btn.btn-primary.w-100.mb-2", "Generate Sample"),
              button("#generateMultiple.btn.btn-secondary.w-100.mb-2", "Generate 20 Samples"),
              button("#reset.btn.btn-danger.w-100.mb-3", "Reset"),
              div(".fw-bold", `Coverage: ${(coverage * 100).toFixed(1)}%`),
            ])
          : null,
      ],
    );
  });
}
