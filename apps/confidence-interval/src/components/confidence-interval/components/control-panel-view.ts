import { div, input, button, select, option } from "@cycle/dom";
import type { ControlPanelState } from "../../control-panel/types";
import type { ConfidenceIntervalCopy } from "../copy";

export function controlPanelView(state: ControlPanelState, copy: ConfidenceIntervalCopy) {
  const { sampleSize, populationSD, confidenceLevel, collapsed } = state;

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
            div(".control-panel__title", [copy.controlsTitle]),
            div(".control-panel__intro", [copy.controlsIntro]),
            sliderCard(
              "sampleSize",
              copy.sampleSize,
              String(sampleSize),
              copy.sampleSizeHint,
              { type: "range", min: "1", max: "100", value: String(sampleSize) },
            ),
            sliderCard(
              "populationSD",
              copy.populationSD,
              populationSD.toFixed(1),
              copy.populationSDHint,
              { type: "range", min: "0.1", max: "10", step: "0.1", value: String(populationSD) },
            ),
            div(".control-panel__group", [
              div(".control-panel__label-row", [
                div(".control-panel__label", [copy.confidenceLevel]),
                div(".control-panel__value", [`${Math.round(confidenceLevel * 100)}%`]),
              ]),
              div(".control-panel__hint", [copy.confidenceLevelHint]),
              select("#confidenceLevel.form-select.control-panel__select", [
                  option({ attrs: { value: "0.8", selected: confidenceLevel === 0.8 } }, ["80%"]),
                  option({ attrs: { value: "0.9", selected: confidenceLevel === 0.9 } }, ["90%"]),
                  option({ attrs: { value: "0.95", selected: confidenceLevel === 0.95 } }, ["95%"]),
                  option({ attrs: { value: "0.99", selected: confidenceLevel === 0.99 } }, ["99%"]),
                ]),
            ]),
            div(".control-panel__info-box", [
              div(".control-panel__info-icon", ["i"]),
              div([copy.confidenceInfo]),
            ]),
          ])
        : null,
    ],
  );
}
