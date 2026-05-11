import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationVarianceReductionApp } from "./components/SimulationVarianceReductionApp";
import "./styles/custom.css";

run(SimulationVarianceReductionApp, {
  DOM: makeDOMDriver("#app")
});
