import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationCltApp } from "./components/SimulationCltApp";
import "./styles/custom.css";

run(SimulationCltApp, {
  DOM: makeDOMDriver("#app")
});
