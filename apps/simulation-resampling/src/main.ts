import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationResamplingApp } from "./components/SimulationResamplingApp";
import "./styles/custom.css";

run(SimulationResamplingApp, {
  DOM: makeDOMDriver("#app")
});
