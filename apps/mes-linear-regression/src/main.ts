import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { MesLinearRegressionApp } from "./components/MesLinearRegressionApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(MesLinearRegressionApp, {
  DOM: makeDOMDriver("#app")
});
