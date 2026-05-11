import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { MesLinearRegressionApp } from "./components/MesLinearRegressionApp";
import "./styles/custom.css";

run(MesLinearRegressionApp, {
  DOM: makeDOMDriver("#app")
});
