import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationCltApp } from "./components/SimulationCltApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(SimulationCltApp, {
  DOM: makeDOMDriver("#app")
});
