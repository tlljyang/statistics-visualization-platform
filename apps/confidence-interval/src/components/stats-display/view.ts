import { div } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import type { StatsDisplayState } from "./types";

export default function view(state$: Stream<StatsDisplayState>): Stream<VNode> {
  return state$.map((state) => {
    const { coverage } = state;
    return div(".fw-bold", `Coverage: ${(coverage * 100).toFixed(1)}%`);
  });
}
