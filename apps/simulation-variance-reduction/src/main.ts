import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationVarianceReductionApp } from "./components/SimulationVarianceReductionApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(SimulationVarianceReductionApp, {
  DOM: makeDOMDriver("#app")
});
