import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { MesConfidenceIntervalApp } from "./components/MesConfidenceIntervalApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(MesConfidenceIntervalApp, {
  DOM: makeDOMDriver("#app")
});
