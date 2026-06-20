import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationMcmcApp } from "./components/SimulationMcmcApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(SimulationMcmcApp, {
  DOM: makeDOMDriver("#app")
});
