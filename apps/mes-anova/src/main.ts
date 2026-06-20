import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { MesAnovaApp } from "./components/MesAnovaApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(MesAnovaApp, {
  DOM: makeDOMDriver("#app")
});
