import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { ConfidenceIntervalWithState } from "./components/confidence-interval";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(ConfidenceIntervalWithState, {
  DOM: makeDOMDriver("#app"),
});
