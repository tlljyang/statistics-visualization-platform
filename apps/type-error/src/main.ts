import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { withState } from "@cycle/state";
import TypeErrorsApp from "./components/TypeErrorsApp";
import { makeConfigDriver } from "./drivers/config-driver";
import "./styles/custom.css";
import "@stats-viz/shared/styles/tokens.css";

const main = withState(TypeErrorsApp);

run(main, {
  DOM: makeDOMDriver("#app"),
  CONFIG: makeConfigDriver(),
});
