import xs from "xstream";
import debounce from "xstream/extra/debounce";
import type { Actions, ControlValue, Sources } from "./types";

function readControlValue(target: HTMLInputElement | HTMLSelectElement): ControlValue {
  return target.type === "number" ? Number(target.value) : target.value;
}

export function intent(sources: Sources): Actions {
  const dom = sources.DOM as any;

  const selectExample$ = dom
    .select(".example-tab")
    .events("click")
    .map((event: Event) => {
      const target = event.currentTarget as HTMLElement;
      return target.dataset.exampleId ?? "";
    })
    .filter((exampleId: string) => exampleId.length > 0);

  const input$ = dom.select(".control-input").events("input");
  const change$ = dom.select(".control-input").events("change");

  const updateControl$ = xs.merge(input$, change$).compose(debounce(30)).map((event: unknown) => {
    const target = (event as Event).target as HTMLInputElement | HTMLSelectElement;
    return {
      id: target.dataset.controlId ?? "",
      value: readControlValue(target)
    };
  }).filter((action: { id: string; value: ControlValue }) => action.id.length > 0);

  const runSimulation$ = dom
    .select(".run-button")
    .events("click")
    .map(() => Date.now());

  return {
    selectExample$,
    updateControl$,
    runSimulation$
  };
}
