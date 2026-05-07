import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import type { StatsDisplayState } from "./types";
import view from "./view";

function StatsDisplay(state$: Stream<StatsDisplayState>): Stream<VNode> {
  return view(state$);
}

export default StatsDisplay;
export { StatsDisplay, view };
export type { StatsDisplayState };
