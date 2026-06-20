import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { MesDistributionsApp } from "./components/MesDistributionsApp";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

run(MesDistributionsApp, {
  DOM: makeDOMDriver("#app")
});
