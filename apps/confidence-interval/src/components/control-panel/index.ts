import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import type { ControlPanelSources, ControlPanelSinks } from "./types";
import intent, { type ControlPanelActions } from "./intent";
import view from "./view";

function ControlPanel(sources: ControlPanelSources): ControlPanelSinks {
  const actions = intent(sources);
  // This component only provides view rendering
  // Actions are handled by the parent component through intent
  const vdom$ = view(sources.state.stream);

  return {
    DOM: vdom$,
  };
}

export default ControlPanel;
export { ControlPanel, intent, view };
export type { ControlPanelActions, ControlPanelSources, ControlPanelSinks };
export type { ControlPanelState } from "./types";
