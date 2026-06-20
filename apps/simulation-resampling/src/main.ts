import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationResamplingApp } from "./components/SimulationResamplingApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(SimulationResamplingApp, {
  DOM: makeDOMDriver("#app")
});
