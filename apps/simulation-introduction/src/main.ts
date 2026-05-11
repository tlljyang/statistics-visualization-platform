import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { SimulationIntroductionApp } from "./components/SimulationIntroductionApp";
import "./styles/custom.css";

run(SimulationIntroductionApp, {
  DOM: makeDOMDriver("#app")
});
