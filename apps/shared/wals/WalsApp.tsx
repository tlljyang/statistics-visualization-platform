import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  localizeModuleConfig,
  localizeSimulationResult,
  localizeText,
  templateCopy,
  useLanguage,
} from "@stats-viz/shared/i18n";
import { generateSampleMeans, runExample } from "./engine";
import { Chart } from "./charts";
import type {
  ControlConfig,
  ControlValue,
  ExampleConfig,
  ModuleConfig,
  State,
} from "./types";

function createDefaultControls(example: ExampleConfig): Record<string, ControlValue> {
  return Object.fromEntries(example.controls.map((c) => [c.id, c.defaultValue]));
}

function getExample(exampleId: string, config: ModuleConfig): ExampleConfig {
  return config.examples.find((e) => e.id === exampleId) ?? config.examples[0];
}

export function createState(
  moduleConfig: ModuleConfig,
  exampleId: string | undefined,
  controls: Record<string, ControlValue> | undefined,
  seed: number,
  language: ReturnType<typeof useLanguage>,
  sampleMeans?: number[],
): State {
  const config = localizeModuleConfig(moduleConfig, language);
  const activeExample = getExample(exampleId ?? moduleConfig.examples[0].id, config);
  const mergedControls = { ...createDefaultControls(activeExample), ...(controls ?? {}) };
  return {
    language,
    copy: templateCopy[language],
    config,
    activeExample,
    controls: mergedControls,
    seed,
    sampleMeans,
    result: localizeSimulationResult(
      runExample(activeExample, mergedControls, seed, moduleConfig.data, sampleMeans),
      language,
    ),
  };
}

function valueFor(control: ControlConfig, controls: Record<string, ControlValue>): ControlValue {
  return controls[control.id] ?? control.defaultValue;
}

function renderControl(
  control: ControlConfig,
  controls: Record<string, ControlValue>,
  onChange: (id: string, value: ControlValue) => void,
): ReactNode {
  const value = valueFor(control, controls);

  if (control.type === "select") {
    return (
      <label className="control-field" key={control.id}>
        <span className="control-label">{control.label}</span>
        <select
          className="control-input"
          data-control-id={control.id}
          value={String(value)}
          onChange={(e) => onChange(control.id, e.target.value)}
        >
          {(control.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="control-field" key={control.id}>
      <span className="control-label">{control.label}</span>
      <input
        className="control-input"
        data-control-id={control.id}
        type={control.type}
        value={String(value)}
        min={control.min}
        max={control.max}
        step={control.step}
        onChange={(e) =>
          onChange(control.id, control.type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </label>
  );
}

function renderFormula(state: State): ReactNode {
  const moduleId = state.config.id.toLowerCase();

  if (moduleId.includes("clt")) {
    return (
      <div className="math-expression">
        <span>X̄</span>
        <span className="math-symbol">≈</span>
        <span>N</span>
        <span>
          (μ,{" "}
          <span className="math-frac">
            <span className="math-num">σ</span>
            <span className="math-den">
              √<span>n</span>
            </span>
          </span>
          )
        </span>
      </div>
    );
  }

  if (moduleId.includes("anova")) {
    return (
      <div className="math-expression">
        <span>F =</span>
        <span className="math-frac">
          <span className="math-num">
            MS<sub>between</sub>
          </span>
          <span className="math-den">
            MS<sub>within</sub>
          </span>
        </span>
      </div>
    );
  }

  if (moduleId.includes("regression")) {
    return (
      <div className="math-expression">
        <span>SSE =</span>
        <span className="math-symbol">Σ</span>
        <span>
          (y<sub>i</sub> − ŷ<sub>i</sub>)
        </span>
        <sup>2</sup>
      </div>
    );
  }

  if (moduleId.includes("confidence")) {
    return (
      <div className="math-expression">
        <span>{localizeText("estimate", state.language)}</span>
        <span className="math-symbol">±</span>
        <span>{localizeText("critical value", state.language)}</span>
        <span className="math-symbol">×</span>
        <span>SE</span>
      </div>
    );
  }

  if (moduleId.includes("distribution")) {
    return (
      <div className="math-expression">
        <span>P(a ≤ X ≤ b) =</span>
        <span className="math-symbol">∫</span>
        <span>
          <sub>a</sub>
          <sup>b</sup>
        </span>
        <span>f(x) dx</span>
      </div>
    );
  }

  if (moduleId.includes("mcmc")) {
    return (
      <div className="math-expression">
        <span>p(θ | y)</span>
        <span className="math-symbol">∝</span>
        <span>p(y | θ) p(θ)</span>
      </div>
    );
  }

  return (
    <div className="math-expression">
      <span>{localizeText("simulation result", state.language)}</span>
      <span className="math-symbol">=</span>
      <span>{localizeText("f(parameters, random seed)", state.language)}</span>
    </div>
  );
}

export interface WalsAppProps {
  moduleConfig: ModuleConfig;
}

export function WalsApp({ moduleConfig }: WalsAppProps) {
  const language = useLanguage();
  const [exampleId, setExampleId] = useState<string | undefined>(undefined);
  const [controls, setControls] = useState<Record<string, ControlValue> | undefined>(undefined);
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [sampleMeans, setSampleMeans] = useState<number[] | undefined>(undefined);

  const isClt = moduleConfig.id === "simulation-clt";

  const state = useMemo(
    () => createState(moduleConfig, exampleId, controls, seed, language, sampleMeans),
    [moduleConfig, exampleId, controls, seed, language, sampleMeans],
  );

  const handleSelectExample = useCallback((id: string) => {
    setExampleId(id);
    setControls(undefined);
    setSeed((s) => s + 1);
    setSampleMeans(undefined);
  }, []);

  const handleUpdateControl = useCallback((id: string, value: ControlValue) => {
    setControls((prev) => ({ ...createDefaultControls(state.activeExample), ...prev, [id]: value }));
    if (isClt) {
      setSampleMeans(undefined);
    }
    setSeed((s) => s + 1);
  }, [state.activeExample, isClt]);

  const handleRun = useCallback(() => {
    if (isClt) {
      const current = controls ?? createDefaultControls(state.activeExample);
      const count = Math.max(sampleMeans?.length ?? 0, 20);
      const nextSeed = Date.now();
      setSampleMeans(generateSampleMeans(current, count, nextSeed));
      setSeed(nextSeed);
    } else {
      setSeed(Date.now());
    }
  }, [isClt, controls, state.activeExample, sampleMeans]);

  const handleAddSamples = useCallback((delta: number) => {
    setControls((prev) => {
      const current = prev ?? createDefaultControls(state.activeExample);
      const currentSize = Number(current.sampleSize ?? 0);
      const next = currentSize + delta;
      return { ...current, sampleSize: next };
    });
    setSeed(Date.now());
  }, [state.activeExample]);

  const handleDrawSamples = useCallback((count: number) => {
    const current = controls ?? createDefaultControls(state.activeExample);
    const nextSeed = Date.now();
    const previous = sampleMeans ?? [];
    setSampleMeans([...previous, ...generateSampleMeans(current, count, nextSeed)]);
    setSeed(nextSeed);
  }, [controls, state.activeExample, sampleMeans]);

  return (
    <div className="module-shell">
      <main className="module-layout">
        <section className="experiment-board">
          <header className="experiment-header">
            <div>
              <p className="eyebrow">{state.config.category}</p>
              <h1>{state.config.title}</h1>
              <p>{state.config.subtitle}</p>
            </div>
          </header>
          <section className="output-dock">
            <div className="output-heading">
              <p className="eyebrow">{state.copy.modelOutput}</p>
              <h2>{state.result.headline}</h2>
              <p>{state.result.narrative}</p>
            </div>
            <div className="chart-frame">
              <Chart spec={state.result.chart} />
            </div>
          </section>
          <section className="metrics-grid">
            {state.result.metrics.map((metric, i) => (
              <article className="metric-card" key={i}>
                <span className="metric-label">{metric.label}</span>
                <strong className="metric-value">{metric.value}</strong>
                {metric.detail && <small className="metric-note">{metric.detail}</small>}
              </article>
            ))}
          </section>
        </section>
        <aside className="teaching-area">
          <section className="teaching-panel parameter-panel">
            <p className="eyebrow">{state.copy.parameters}</p>
            <div className="example-tabs">
              {state.config.examples.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className="example-tab"
                  data-example-id={example.id}
                  data-active={String(example.id === state.activeExample.id)}
                  onClick={() => handleSelectExample(example.id)}
                >
                  {example.title}
                </button>
              ))}
            </div>
            <div className="control-grid">
              {state.activeExample.controls.map((control) =>
                renderControl(control, state.controls, handleUpdateControl),
              )}
            </div>
            <button type="button" className="run-button" onClick={handleRun}>
              {isClt ? localizeText("Redraw", language) : state.copy.run}
            </button>
            {state.config.id === "simulation-random-variable" && (
              <>
                <button
                  type="button"
                  className="sample-quick-button"
                  data-sample-delta={1}
                  onClick={() => handleAddSamples(1)}
                >
                  {state.copy.addOneSample}
                </button>
                <button
                  type="button"
                  className="sample-quick-button"
                  data-sample-delta={20}
                  onClick={() => handleAddSamples(20)}
                >
                  {state.copy.addTwentySamples}
                </button>
              </>
            )}
            {isClt && (
              <div className="sample-quick-actions">
                <button
                  type="button"
                  className="sample-quick-button"
                  onClick={() => handleDrawSamples(1)}
                >
                  {localizeText("Draw 1 Sample", language)}
                </button>
                <button
                  type="button"
                  className="sample-quick-button"
                  onClick={() => handleDrawSamples(20)}
                >
                  {localizeText("Draw 20 Samples", language)}
                </button>
              </div>
            )}
          </section>
          <section className="teaching-panel">
            <p className="eyebrow">{state.copy.conceptKeyIdea}</p>
            <h2>{state.activeExample.title}</h2>
            <p>{state.activeExample.description}</p>
            <ul className="teaching-list">
              {state.activeExample.teachingPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </section>
          <section className="teaching-panel formula-panel">
            <p className="eyebrow">{state.copy.formula}</p>
            <div className="latex-formula">{renderFormula(state)}</div>
            <p>{state.copy.formulaHelper}</p>
          </section>
          <section className="teaching-panel">
            <p className="eyebrow">{state.copy.howToReadThis}</p>
            <h3>{state.result.headline}</h3>
            <p>{state.result.narrative}</p>
          </section>
          {state.result.table && (
            <section className="teaching-panel table-panel">
              <h3>{state.copy.dataTable}</h3>
              <div className="table-scroll">
                <table className="result-table">
                  <thead>
                    <tr>
                      {state.result.table.columns.map((col, i) => (
                        <th key={i}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.result.table.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </aside>
      </main>
    </div>
  );
}
