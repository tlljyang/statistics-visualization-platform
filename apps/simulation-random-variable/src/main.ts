import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationRandomVariableApp } from "./components/SimulationRandomVariableApp";
import "./styles/custom.css";

run(SimulationRandomVariableApp, {
  DOM: makeDOMDriver("#app")
});
