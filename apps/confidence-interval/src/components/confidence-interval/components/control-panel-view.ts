import { div, input, button, select, option } from "@cycle/dom";
import type { ControlPanelState } from "../../control-panel/types";

export function controlPanelView(state: ControlPanelState) {
  const { sampleSize, populationSD, confidenceLevel, coverage, collapsed } = state;

  const sliderCard = (
    id: string,
    label: string,
    value: string,
    hint: string,
    attrs: Record<string, string>,
  ) =>
    div(".control-panel__group", [
      div(".control-panel__label-row", [
        div(".control-panel__label", [label]),
        div(".control-panel__value", [value]),
      ]),
      div(".control-panel__hint", [hint]),
      input(`#${id}.form-range.control-panel__input`, { attrs }, []),
    ]);

  return div(
    `#sidebar.control-sidebar${
      collapsed ? ".collapsed" : ""
    }`,
    [
      button("#toggleSidebar.control-panel__toggle", [
        collapsed ? "❯" : "❮",
      ]),

      !collapsed
        ? div(".control-panel", [
            div(".control-panel__title", ["Confidence Interval Controls"]),
            div(".control-panel__intro", [
              "Tune the simulation inputs, then generate repeated samples to see how often intervals capture the true mean.",
            ]),
            sliderCard(
              "sampleSize",
              "Sample Size",
              String(sampleSize),
              "Larger samples usually narrow the confidence interval.",
              { type: "range", min: "1", max: "100", value: String(sampleSize) },
            ),
            sliderCard(
              "populationSD",
              "Population SD",
              populationSD.toFixed(1),
              "Higher variability makes intervals wider and coverage noisier in small samples.",
              { type: "range", min: "0.1", max: "10", step: "0.1", value: String(populationSD) },
            ),
            div(".control-panel__group", [
              div(".control-panel__label-row", [
                div(".control-panel__label", ["Confidence Level"]),
                div(".control-panel__value", [`${Math.round(confidenceLevel * 100)}%`]),
              ]),
              div(".control-panel__hint", [
                "Higher confidence captures the true mean more often, but also widens the interval.",
              ]),
              select("#confidenceLevel.form-select.control-panel__select", [
                  option({ attrs: { value: "0.8" } }, ["80%"]),
                  option({ attrs: { value: "0.9" } }, ["90%"]),
                  option({ attrs: { value: "0.95", selected: true } }, ["95%"]),
                  option({ attrs: { value: "0.99" } }, ["99%"]),
                ]),
            ]),
            div(".control-panel__actions", [
              button("#generateSample.btn.btn-primary.w-100.mb-2", "Generate 1 Sample"),
              button("#generateMultiple.btn.btn-outline-primary.w-100.mb-2", "Generate 20 Samples"),
              button("#reset.btn.btn-outline-danger.w-100", "Reset"),
            ]),
            div(".control-panel__coverage-card", [
              div(".control-panel__coverage-label", ["Observed Coverage"]),
              div("#statsDisplay.control-panel__coverage-value", [`${(coverage * 100).toFixed(1)}%`]),
            ]),
          ])
        : null,
    ],
  );
}
