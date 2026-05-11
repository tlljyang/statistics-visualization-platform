import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationMcmcApp } from "./components/SimulationMcmcApp";
import "./styles/custom.css";

run(SimulationMcmcApp, {
  DOM: makeDOMDriver("#app")
});
