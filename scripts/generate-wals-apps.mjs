import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(import.meta.url), "../..");

const cities = [
  { city: "海口", GDP: 590.55, completed: 1, planing: 4 },
  { city: "兰州", GDP: 1100.39, completed: 0, planing: 5 },
  { city: "贵阳", GDP: 1383.07, completed: 2, planing: 16 },
  { city: "太原", GDP: 1778.05, completed: 0, planing: 1 },
  { city: "南昌", GDP: 2207.11, completed: 3, planing: 5 },
  { city: "昆明", GDP: 2509.58, completed: 0, planing: 6 },
  { city: "合肥", GDP: 2702.5, completed: 1, planing: 5 },
  { city: "福州", GDP: 3065, completed: 2, planing: 6 },
  { city: "西安", GDP: 3241.49, completed: 2, planing: 2 },
  { city: "长春", GDP: 3329, completed: 1, planing: 3 },
  { city: "哈尔滨", GDP: 3665.9, completed: 1, planing: 1 },
  { city: "济南", GDP: 3910.8, completed: 0, planing: 2 },
  { city: "郑州", GDP: 4002.9, completed: 2, planing: 3 },
  { city: "长沙", GDP: 4500, completed: 4, planing: 11 },
  { city: "沈阳", GDP: 5015, completed: 7, planing: 22 },
  { city: "南京", GDP: 5086, completed: 14, planing: 21 },
  { city: "成都", GDP: 5500, completed: 2, planing: 9 },
  { city: "武汉", GDP: 5515.76, completed: 7, planing: 26 },
  { city: "杭州", GDP: 5945.82, completed: 5, planing: 6 },
  { city: "重庆", GDP: 7894.24, completed: 23, planing: 13 },
  { city: "天津", GDP: 9108.83, completed: 14, planing: 26 },
  { city: "苏州", GDP: 9168, completed: 5, planing: 10 },
  { city: "深圳", GDP: 9510.91, completed: 33, planing: 46 },
  { city: "广州", GDP: 10604.48, completed: 23, planing: 36 },
  { city: "北京", GDP: 13777.9, completed: 6, planing: 11 },
  { city: "上海", GDP: 16872.42, completed: 44, planing: 15 },
  { city: "香港", GDP: 15790, completed: 54, planing: 0 }
];

const modules = [
  {
    id: "simulation-introduction",
    repoName: "simulation-introduction-visualization",
    domainName: "SimulationIntroductionApp",
    title: "Simulation Introduction",
    subtitle: "WALS introductory simulation templates rebuilt as a static Cycle.js teaching app.",
    category: "WALS Simulation",
    sourcePath: "apps/Simulation/Introduction",
    examples: [
      {
        id: "pi-circle",
        title: "Estimation of pi: Drawing a Circle",
        kind: "pi-circle",
        sourcePath: "apps/Simulation/Introduction/example/1.md",
        description:
          "Drop random points into a square and estimate pi from the proportion that lands inside the unit circle.",
        teachingPoints: [
          "Monte Carlo estimators turn geometric areas into frequencies.",
          "The estimate stabilizes as the number of simulated points grows."
        ],
        controls: [
          { id: "points", label: "Number of points", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1000 }
        ]
      },
      {
        id: "buffon-needle",
        title: "Estimation of pi: Buffon's Needle Experiment",
        kind: "buffon",
        sourcePath: "apps/Simulation/Introduction/server.R",
        description:
          "Cast needles across parallel lines and estimate pi from the crossing probability.",
        teachingPoints: [
          "The crossing rate links random angles and distances to pi.",
          "Repeated experiments show convergence and sampling variability."
        ],
        controls: [
          { id: "planeWidth", label: "Plane width", type: "number", min: 1, max: 10, step: 0.5, defaultValue: 6 },
          { id: "trials", label: "Trials per experiment", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1000 },
          { id: "experiments", label: "Experiments", type: "number", min: 1, max: 1000, step: 1, defaultValue: 20 }
        ]
      }
    ]
  },
  {
    id: "simulation-random-variable",
    repoName: "simulation-random-variable-visualization",
    domainName: "SimulationRandomVariableApp",
    title: "Random Variable Generation",
    subtitle: "Distribution sampling templates from WALS Simulation/RandomVariable.",
    category: "WALS Simulation",
    sourcePath: "apps/Simulation/RandomVariable",
    examples: [
      {
        id: "normal-generation",
        title: "Example 1: Normal Random Variables",
        kind: "random-normal",
        sourcePath: "apps/Simulation/RandomVariable/example/1.md",
        description: "Generate a normal sample and compare its simulated histogram with the target center.",
        teachingPoints: ["Random generators approximate the target distribution in aggregate.", "Mean and spread become visible as sample size increases."],
        controls: [
          { id: "sampleSize", label: "Sample size", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1000 },
          { id: "mean", label: "Mean", type: "number", min: -5, max: 5, step: 0.5, defaultValue: 0 },
          { id: "sd", label: "Standard deviation", type: "number", min: 0.2, max: 5, step: 0.1, defaultValue: 1 }
        ]
      },
      {
        id: "exponential-generation",
        title: "Example 2: Exponential Random Variables",
        kind: "random-exponential",
        sourcePath: "apps/Simulation/RandomVariable/example/2.md",
        description: "Generate exponential data and examine how the rate parameter controls the tail.",
        teachingPoints: ["Inverse transform sampling maps uniform draws into exponential draws.", "The exponential mean is the reciprocal of the rate."],
        controls: [
          { id: "sampleSize", label: "Sample size", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1000 },
          { id: "lambda", label: "Rate lambda", type: "number", min: 0.1, max: 5, step: 0.1, defaultValue: 2 }
        ]
      },
      {
        id: "gamma-rejection",
        title: "Example 7: Gamma Rejection Sampling",
        kind: "gamma-rejection",
        sourcePath: "apps/Simulation/RandomVariable/example/7.md",
        description: "Compare target gamma density with an exponential proposal envelope.",
        teachingPoints: ["Acceptance-rejection sampling needs an envelope that dominates the target.", "The accepted sample follows the target only after the rejection rule is applied."],
        controls: [
          { id: "sampleSize", label: "Candidate draws", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1500 },
          { id: "alpha", label: "Gamma alpha", type: "number", min: 0.5, max: 5, step: 0.1, defaultValue: 1.5 },
          { id: "beta", label: "Gamma beta", type: "number", min: 0.2, max: 5, step: 0.1, defaultValue: 1 },
          { id: "lambda", label: "Proposal lambda", type: "number", min: 0.1, max: 5, step: 0.1, defaultValue: 0.6667 },
          { id: "envelope", label: "Envelope constant c", type: "number", min: 0.5, max: 5, step: 0.1, defaultValue: 1.258 }
        ]
      }
    ]
  },
  {
    id: "simulation-variance-reduction",
    repoName: "simulation-variance-reduction-visualization",
    domainName: "SimulationVarianceReductionApp",
    title: "MC Integration and Variance Reduction",
    subtitle: "Nine WALS variance-reduction templates rebuilt as independent teaching tabs.",
    category: "WALS Simulation",
    sourcePath: "apps/Simulation/VarianceReduction",
    examples: [
      { id: "mc-exp-integral", title: "Example 1: Basic Monte Carlo Integration", kind: "mc-integral-exp", sourcePath: "apps/Simulation/VarianceReduction/server.R", description: "Estimate int_2^4 exp(-x) dx and compare with the exact value.", teachingPoints: ["Simple Monte Carlo turns an integral into an average.", "Sampling error is visible even when the estimator is unbiased."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 10000 }] },
      { id: "mc-transform", title: "Example 2: Uniform vs Exponential Sampling", kind: "mc-transform", sourcePath: "apps/Simulation/VarianceReduction/example/2.md", description: "Compare two sampling strategies for the same integral.", teachingPoints: ["Changing the sampling distribution can reduce variance.", "Estimator design matters as much as sample size."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] },
      { id: "normal-cdf", title: "Example 3: Normal CDF Estimation", kind: "normal-cdf", sourcePath: "apps/Simulation/VarianceReduction/example/3.md", description: "Estimate Phi(x) by transformation and by indicator simulation.", teachingPoints: ["Two unbiased estimators can have different precision.", "A grid of x values shows where approximation error changes."], controls: [{ id: "low", label: "Lower bound", type: "number", min: 0.1, max: 2, step: 0.1, defaultValue: 0.1 }, { id: "high", label: "Upper bound", type: "number", min: 0.5, max: 3, step: 0.1, defaultValue: 2.5 }, { id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] },
      { id: "antithetic-exp", title: "Example 4: Antithetic Variables", kind: "antithetic-exp", sourcePath: "apps/Simulation/VarianceReduction/example/4.md", description: "Estimate int_0^1 exp(u) du using paired uniforms U and 1-U.", teachingPoints: ["Negative correlation between paired samples can reduce variance.", "The mean is unchanged while the estimator spread shrinks."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] },
      { id: "antithetic-gamma", title: "Example 5: Antithetic Gamma Integral", kind: "antithetic-gamma", sourcePath: "apps/Simulation/VarianceReduction/example/5.md", description: "Use antithetic variables for a gamma-like integral.", teachingPoints: ["Antithetic sampling can apply beyond simple exponential integrals.", "Standard error is the comparison target."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] },
      { id: "control-exp", title: "Example 6: Control Variates", kind: "control-exp", sourcePath: "apps/Simulation/VarianceReduction/example/6.md", description: "Use U - 1/2 as a control variate for exp(U).", teachingPoints: ["A correlated variable with known expectation can lower variance.", "The coefficient controls how much adjustment is applied."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }, { id: "coefficient", label: "Control coefficient c", type: "number", min: -4, max: 4, step: 0.1, defaultValue: -1.6903 }] },
      { id: "control-ratio", title: "Example 7: Control Variate Ratio Integral", kind: "control-ratio", sourcePath: "apps/Simulation/VarianceReduction/example/7.md", description: "Compare a simple estimator with a control-variate adjusted estimator.", teachingPoints: ["The control coefficient can be estimated from pilot samples.", "Variance reduction is reported as a percent change."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] },
      { id: "importance-power", title: "Example 8: Importance Sampling", kind: "importance-power", sourcePath: "apps/Simulation/VarianceReduction/example/8.md", description: "Estimate E[X^5.1] using an importance density proportional to x^4.", teachingPoints: ["Importance sampling spends more draws where the integrand matters.", "A good proposal can make variance collapse."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] },
      { id: "conditional-circle", title: "Example 9: Conditional Monte Carlo", kind: "conditional-circle", sourcePath: "apps/Simulation/VarianceReduction/example/9.md", description: "Estimate a unit-circle probability by conditioning on one coordinate.", teachingPoints: ["Conditioning replaces a noisy indicator with a smoother expectation.", "The target mean is similar, but estimator variance falls."], controls: [{ id: "sampleSize", label: "Number of simulations", type: "number", min: 100, max: 100000, step: 100, defaultValue: 1000 }] }
    ]
  },
  {
    id: "simulation-resampling",
    repoName: "simulation-resampling-visualization",
    domainName: "SimulationResamplingApp",
    title: "Resampling Methods",
    subtitle: "Bootstrap and resampling workflows from WALS Simulation/Resampling.",
    category: "WALS Simulation",
    sourcePath: "apps/Simulation/Resampling",
    examples: [
      { id: "parametric-bootstrap", title: "Parametric Bootstrap", kind: "bootstrap-max", sourcePath: "apps/Simulation/Resampling/ui.R", description: "Treat the observed sample as a finite population and bootstrap maxima.", teachingPoints: ["Bootstrap distributions approximate sampling variability from observed data.", "The maximum is sensitive to tail behavior and sample size."], controls: [{ id: "data", label: "Data values", type: "text", defaultValue: "0.6939, 0.8069, 0.1412, 0.9245, 0.5227, 0.7899, 0.6966, 0.6325, 0.3847, 0.6208" }, { id: "replicates", label: "Bootstrap replicates", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1000 }] },
      { id: "mean-bootstrap", title: "MeanBoot", kind: "mean-bootstrap", sourcePath: "apps/Simulation/Resampling/server.R", description: "Compare true, sample, and bootstrap estimates of mean and standard error.", teachingPoints: ["Bootstrap samples reuse the observed data with replacement.", "The bootstrap standard error estimates sampling variability."], controls: [{ id: "sampleSize", label: "Generated sample size", type: "number", min: 50, max: 100000, step: 50, defaultValue: 10000 }, { id: "replicates", label: "Bootstrap replicates", type: "number", min: 100, max: 10000, step: 100, defaultValue: 1000 }] }
    ]
  },
  {
    id: "simulation-mcmc",
    repoName: "simulation-mcmc-visualization",
    domainName: "SimulationMcmcApp",
    title: "Markov Chain Monte Carlo",
    subtitle: "MCMC templates from WALS Simulation/MCMC.",
    category: "WALS Simulation",
    sourcePath: "apps/Simulation/MCMC",
    examples: [
      { id: "mixture-normals", title: "Mixture of Normals", kind: "mcmc-mixture", sourcePath: "apps/Simulation/MCMC/server.R", description: "Run a Metropolis-Hastings sampler over a two-component normal mixture.", teachingPoints: ["The chain accepts or rejects proposals using a target-density ratio.", "Burn-in and sample size affect how much of the target surface is explored."], controls: [{ id: "burnin", label: "Burn-in", type: "number", min: 0, max: 5000, step: 50, defaultValue: 200 }, { id: "sampleSize", label: "Number of samples", type: "number", min: 50, max: 5000, step: 50, defaultValue: 400 }] },
      { id: "politician-stumble", title: "Politician's Stumble Case Study", kind: "politician", sourcePath: "apps/Simulation/MCMC/server.R", description: "Simulate a simple Metropolis walk over islands with unequal populations.", teachingPoints: ["Stationary visit frequency is shaped by the acceptance rule.", "Trace plots show dependence between neighboring samples."], controls: [{ id: "steps", label: "Number of steps", type: "number", min: 1000, max: 20000, step: 500, defaultValue: 5000 }] }
    ]
  },
  {
    id: "mes-anova",
    repoName: "mes-anova-visualization",
    domainName: "MesAnovaApp",
    title: "ANOVA",
    subtitle: "WALS Modern Elementary Statistics analysis-of-variance template.",
    category: "WALS MES",
    sourcePath: "apps/MES/ANOVA",
    examples: [
      { id: "anova-workbench", title: "Analysis of Variance Workbench", kind: "anova", sourcePath: "apps/MES/ANOVA/server.R", description: "Generate or load three-group data, inspect group summaries, and compare between-group and within-group variation.", teachingPoints: ["ANOVA partitions total variability into between-group and within-group components.", "The F statistic grows when group means differ relative to within-group noise."], controls: [{ id: "dataset", label: "Dataset", type: "select", defaultValue: "random", options: [{ value: "random", label: "Random Data" }, { value: "fuel", label: "Fuel Consumption" }, { value: "temperature", label: "Temperature Effect" }] }, { id: "n1", label: "Group 1 size", type: "number", min: 5, max: 100, step: 1, defaultValue: 5 }, { id: "n2", label: "Group 2 size", type: "number", min: 5, max: 100, step: 1, defaultValue: 5 }, { id: "n3", label: "Group 3 size", type: "number", min: 5, max: 100, step: 1, defaultValue: 5 }, { id: "mu1", label: "Group 1 mean", type: "number", min: 0, max: 10, step: 0.5, defaultValue: 1 }, { id: "mu2", label: "Group 2 mean", type: "number", min: 0, max: 10, step: 0.5, defaultValue: 2 }, { id: "mu3", label: "Group 3 mean", type: "number", min: 0, max: 10, step: 0.5, defaultValue: 3 }, { id: "sigma", label: "Within-group sigma", type: "number", min: 0.1, max: 5, step: 0.1, defaultValue: 1 }] }
    ]
  },
  {
    id: "mes-confidence-interval",
    repoName: "mes-confidence-interval-visualization",
    domainName: "MesConfidenceIntervalApp",
    title: "MES Confidence Interval",
    subtitle: "The WALS/MES confidence interval interval-comparison template.",
    category: "WALS MES",
    sourcePath: "apps/MES/ConfidenceInterval",
    examples: [
      { id: "interval-comparison", title: "Confidence Interval Comparison", kind: "confidence-interval", sourcePath: "apps/MES/ConfidenceInterval/server.R", description: "Compare population-centered and sample-centered intervals around three sample means.", teachingPoints: ["Changing the sigma multiplier widens or narrows all intervals.", "Sample means can produce intervals that do or do not cover the population mean."], controls: [{ id: "nSigma", label: "n sigma", type: "number", min: 1, max: 3, step: 1, defaultValue: 2 }, { id: "sampleSize", label: "Sample size", type: "number", min: 1, max: 10, step: 1, defaultValue: 5 }, { id: "mean1", label: "Sample mean 1", type: "number", min: 27, max: 35, step: 0.1, defaultValue: 31.3 }, { id: "mean2", label: "Sample mean 2", type: "number", min: 27, max: 35, step: 0.1, defaultValue: 31.7 }, { id: "mean3", label: "Sample mean 3", type: "number", min: 27, max: 35, step: 0.1, defaultValue: 32.5 }] }
    ]
  },
  {
    id: "mes-distributions",
    repoName: "mes-distributions-visualization",
    domainName: "MesDistributionsApp",
    title: "Distributions",
    subtitle: "Continuous and discrete distribution exploration from WALS/MES.",
    category: "WALS MES",
    sourcePath: "apps/MES/Distributions",
    examples: [
      { id: "distribution-explorer", title: "Distribution Explorer", kind: "distribution", sourcePath: "apps/MES/Distributions/server.R", description: "Switch between PDF/PMF and CDF/CMF views for common distributions and calculate interval probabilities.", teachingPoints: ["Parameters reshape location, spread, skew, and tail behavior.", "Interval probability is the area under the density or a CDF difference."], controls: [{ id: "dist", label: "Distribution", type: "select", defaultValue: "norm", options: [{ value: "norm", label: "Normal" }, { value: "t", label: "Student t" }, { value: "beta", label: "Beta" }, { value: "gamma", label: "Gamma" }, { value: "chisq", label: "Chi-squared" }, { value: "exp", label: "Exponential" }, { value: "unif", label: "Uniform" }, { value: "binom", label: "Binomial" }, { value: "geom", label: "Geometric" }, { value: "pois", label: "Poisson" }] }, { id: "mode", label: "PDF/PMF or CDF/CMF", type: "select", defaultValue: "PDF", options: [{ value: "PDF", label: "PDF/PMF" }, { value: "CDF", label: "CDF/CMF" }] }, { id: "a", label: "Parameter a", type: "number", min: 0.1, max: 20, step: 0.1, defaultValue: 0 }, { id: "b", label: "Parameter b", type: "number", min: 0.1, max: 20, step: 0.1, defaultValue: 1 }, { id: "lower", label: "Interval lower", type: "number", min: -10, max: 10, step: 0.1, defaultValue: -2 }, { id: "upper", label: "Interval upper", type: "number", min: -10, max: 10, step: 0.1, defaultValue: 2 }] }
    ]
  },
  {
    id: "mes-linear-regression",
    repoName: "mes-linear-regression-visualization",
    domainName: "MesLinearRegressionApp",
    title: "MES Linear Regression",
    subtitle: "WALS/MES city skyscraper regression template rebuilt with static data.",
    category: "WALS MES",
    sourcePath: "apps/MES/LinearRegression",
    data: { cities },
    examples: [
      { id: "city-regression", title: "Regression Visualization", kind: "linear-regression", sourcePath: "apps/MES/LinearRegression/data/cities.csv", description: "Model planned skyscrapers from either completed buildings or GDP, using the WALS city dataset.", teachingPoints: ["Changing the predictor changes slope, residuals, and R-squared.", "Large cities can exert strong leverage on the fitted line."], controls: [{ id: "feature", label: "Feature", type: "select", defaultValue: "completed", options: [{ value: "completed", label: "Completed buildings" }, { value: "GDP", label: "GDP" }] }, { id: "excludeHighLeverage", label: "Exclude Shanghai and Hong Kong", type: "select", defaultValue: "no", options: [{ value: "no", label: "Keep all cities" }, { value: "yes", label: "Exclude high leverage cities" }] }] }
    ]
  }
];

function write(path, content) {
  const target = resolve(rootDir, path);
  mkdirSync(resolve(target, ".."), { recursive: true });
  writeFileSync(target, content);
}

function cleanApp(id) {
  rmSync(resolve(rootDir, "apps", id), { recursive: true, force: true });
}

function packageJson(module) {
  return `${JSON.stringify(
    {
      name: module.repoName,
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite --host 127.0.0.1",
        build: "tsc && vite build",
        preview: "vite preview --host 127.0.0.1",
        test: "vitest run"
      },
      dependencies: {
        "@cycle/dom": "^23.1.0",
        "@cycle/run": "^5.7.0",
        d3: "^7.9.0",
        xstream: "^11.14.0"
      },
      devDependencies: {
        "@types/d3": "^7.4.3",
        typescript: "~5.9.3",
        vite: "^7.2.7",
        vitest: "^3.2.4"
      }
    },
    null,
    2
  )}\n`;
}

function indexHtml(module) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${module.title}</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
}

function tsconfig() {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "test"]
}
`;
}

function viteConfig() {
  return `import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "node"
  }
});
`;
}

function gitignore() {
  return `node_modules
dist
coverage
.DS_Store
.env
.env.*
`;
}

function mainTs(module) {
  return `import { makeDOMDriver } from "@cycle/dom";
import { run } from "@cycle/run";
import { ${module.domainName} } from "./components/${module.domainName}";
import "./styles/custom.css";

run(${module.domainName}, {
  DOM: makeDOMDriver("#app")
});
`;
}

function typesTs() {
  return `import type { Stream } from "xstream";
import type { DOMSource, VNode } from "@cycle/dom";

export type ControlValue = number | string;
export type ControlType = "number" | "select" | "text";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ControlConfig {
  id: string;
  label: string;
  type: ControlType;
  defaultValue: ControlValue;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
}

export interface ExampleConfig {
  id: string;
  title: string;
  kind: string;
  sourcePath: string;
  description: string;
  teachingPoints: string[];
  controls: ControlConfig[];
}

export interface ModuleConfig {
  id: string;
  repoName: string;
  title: string;
  subtitle: string;
  category: string;
  sourcePath: string;
  examples: ExampleConfig[];
  data?: {
    cities?: CityRecord[];
  };
}

export interface CityRecord {
  city: string;
  GDP: number;
  completed: number;
  planing: number;
}

export interface Metric {
  label: string;
  value: string;
  detail?: string;
}

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  label: string;
  points: ChartPoint[];
  color?: string;
}

export interface ChartBar {
  label: string;
  value: number;
  color?: string;
}

export interface ChartInterval {
  label: string;
  center: number;
  lower: number;
  upper: number;
  color?: string;
}

export type ChartSpec =
  | { type: "scatter"; title: string; xLabel: string; yLabel: string; points: ChartPoint[]; line?: ChartSeries; xDomain?: [number, number]; yDomain?: [number, number] }
  | { type: "line"; title: string; xLabel: string; yLabel: string; series: ChartSeries[]; xDomain?: [number, number]; yDomain?: [number, number] }
  | { type: "bars"; title: string; xLabel: string; yLabel: string; bars: ChartBar[]; yDomain?: [number, number] }
  | { type: "intervals"; title: string; xLabel: string; yLabel: string; intervals: ChartInterval[]; reference?: number; xDomain?: [number, number] };

export interface TableSpec {
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface SimulationResult {
  headline: string;
  narrative: string;
  metrics: Metric[];
  chart: ChartSpec;
  table?: TableSpec;
}

export interface State {
  config: ModuleConfig;
  activeExample: ExampleConfig;
  controls: Record<string, ControlValue>;
  seed: number;
  result: SimulationResult;
}

export interface Sources {
  DOM: DOMSource;
}

export interface Sinks {
  DOM: Stream<VNode>;
}

export interface Actions {
  selectExample$: Stream<string>;
  updateControl$: Stream<{ id: string; value: ControlValue }>;
  runSimulation$: Stream<number>;
}
`;
}

function moduleConfigTs(module) {
  const { domainName: _domainName, ...runtimeConfig } = module;
  return `import type { ModuleConfig } from "./types";

export const moduleConfig: ModuleConfig = ${JSON.stringify(runtimeConfig, null, 2)};
`;
}

function intentTs() {
  return `import xs from "xstream";
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

  const updateControl$ = xs.merge(input$, change$).map((event: unknown) => {
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
`;
}

function modelTs() {
  return `import xs, { type Stream } from "xstream";
import { runExample } from "../../simulation/engine";
import { moduleConfig } from "./module-config";
import type { Actions, ControlValue, ExampleConfig, State } from "./types";

function getExample(exampleId: string): ExampleConfig {
  return (
    moduleConfig.examples.find((example) => example.id === exampleId) ??
    moduleConfig.examples[0]
  );
}

export function createDefaultControls(example: ExampleConfig): Record<string, ControlValue> {
  return Object.fromEntries(
    example.controls.map((control) => [control.id, control.defaultValue])
  );
}

export function createState(
  exampleId = moduleConfig.examples[0].id,
  controls?: Record<string, ControlValue>,
  seed = 510
): State {
  const activeExample = getExample(exampleId);
  const mergedControls = {
    ...createDefaultControls(activeExample),
    ...(controls ?? {})
  };

  return {
    config: moduleConfig,
    activeExample,
    controls: mergedControls,
    seed,
    result: runExample(activeExample, mergedControls, seed, moduleConfig.data)
  };
}

type Reducer = (state: State) => State;

export function model(actions: Actions): Stream<State> {
  const selectReducer$ = actions.selectExample$.map(
    (exampleId): Reducer =>
      (state) =>
        createState(exampleId, undefined, state.seed + 1)
  );

  const updateReducer$ = actions.updateControl$.map(
    ({ id, value }): Reducer =>
      (state) =>
        createState(
          state.activeExample.id,
          {
            ...state.controls,
            [id]: value
          },
          state.seed
        )
  );

  const runReducer$ = actions.runSimulation$.map(
    (seed): Reducer =>
      (state) =>
        createState(state.activeExample.id, state.controls, seed)
  );

  return xs
    .merge(selectReducer$, updateReducer$, runReducer$)
    .fold((state, reducer) => reducer(state), createState());
}
`;
}

function viewTs(module) {
  return `import { h } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import { chartToVNode } from "../../d3/charts";
import type { ControlConfig, ControlValue, State } from "./types";

function compact(children: Array<VNode | null>): VNode[] {
  return children.filter((child): child is VNode => child !== null);
}

function valueFor(control: ControlConfig, controls: Record<string, ControlValue>): ControlValue {
  return controls[control.id] ?? control.defaultValue;
}

function renderControl(control: ControlConfig, controls: Record<string, ControlValue>): VNode {
  const value = valueFor(control, controls);

  if (control.type === "select") {
    return h("label.control-field", [
      h("span.control-label", control.label),
      h(
        "select.control-input",
        {
          attrs: {
            "data-control-id": control.id
          }
        },
        (control.options ?? []).map((option) =>
          h(
            "option",
            {
              attrs: {
                value: option.value,
                selected: String(value) === option.value
              }
            },
            [option.label]
          )
        )
      )
    ]);
  }

  const inputAttrs: Record<string, string | number | boolean> = {
    "data-control-id": control.id,
    type: control.type,
    value: String(value)
  };

  if (control.min !== undefined) inputAttrs.min = control.min;
  if (control.max !== undefined) inputAttrs.max = control.max;
  if (control.step !== undefined) inputAttrs.step = control.step;

  return h("label.control-field", [
    h("span.control-label", control.label),
    h("input.control-input", { attrs: inputAttrs }, [])
  ]);
}

function renderTable(state: State): VNode | null {
  if (!state.result.table) {
    return null;
  }

  return h("div.table-card", [
    h("table.result-table", [
      h("thead", [
        h("tr", state.result.table.columns.map((column) => h("th", column)))
      ]),
      h(
        "tbody",
        state.result.table.rows.map((row) =>
          h("tr", row.map((cell) => h("td", String(cell))))
        )
      )
    ])
  ]);
}

function renderTeachingPoints(state: State): VNode {
  return h("ul.teaching-list", state.activeExample.teachingPoints.map((point) => h("li", point)));
}

export function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) =>
    h("div.app-shell", [
      h("header.hero-panel", [
        h("p.eyebrow", state.config.category),
        h("h1", state.config.title),
        h("p.hero-copy", state.config.subtitle),
        h("p.source-note", \`Source: Bayes-Cluster/WALS/\${state.config.sourcePath}\`)
      ]),
      h("main.workspace", [
        h("aside.control-panel", [
          h("div.panel-section", [
            h("h2", "Templates"),
            h(
              "div.example-tabs",
              state.config.examples.map((example) =>
                h(
                  "button.example-tab",
                  {
                    attrs: {
                      type: "button",
                      "data-example-id": example.id,
                      "data-active": String(example.id === state.activeExample.id)
                    }
                  },
                  [example.title]
                )
              )
            )
          ]),
          h("div.panel-section", [
            h("h2", "Controls"),
            ...state.activeExample.controls.map((control) => renderControl(control, state.controls)),
            h("button.run-button", { attrs: { type: "button" } }, ["Run simulation"])
          ])
        ]),
        h("section.content-stack", [
          h("section.lesson-banner", [
            h("div", [
              h("p.lesson-label", "Current template"),
              h("h2", state.activeExample.title),
              h("p", state.activeExample.description)
            ]),
            h("div.source-chip", state.activeExample.sourcePath)
          ]),
          h("section.chart-card", [
            h("div.chart-card-header", [
              h("h3", state.result.headline),
              h("p", state.result.narrative)
            ]),
            chartToVNode(state.result.chart)
          ]),
          h(
            "section.stats-grid",
            state.result.metrics.map((metric) =>
              h("article.metric-card", compact([
                h("span", metric.label),
                h("strong", metric.value),
                metric.detail ? h("small", metric.detail) : null
              ]))
            )
          ),
          ...compact([renderTable(state)]),
          h("section.explanation-card", [
            h("h3", "Teaching focus"),
            renderTeachingPoints(state)
          ])
        ])
      ]),
      h("footer.module-footer", [
        h("span", "${module.repoName}"),
        h("a", { attrs: { href: "https://github.com/Bayes-Cluster/WALS", target: "_blank", rel: "noreferrer" } }, "WALS source")
      ])
    ])
  );
}
`;
}

function indexTs() {
  return `import type { Sinks, Sources } from "./types";
import { intent } from "./intent";
import { model } from "./model";
import { view } from "./view";

export function App(sources: Sources): Sinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$)
  };
}

export { App as default };
`;
}

function domainIndexTs(module) {
  return `import { App } from "./${module.domainName}/index";

export const ${module.domainName} = App;
`;
}

function randomTs() {
  return `export function createRandom(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalRandom(rng: () => number, mean = 0, sd = 1): number {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z;
}

export function exponentialRandom(rng: () => number, lambda = 1): number {
  return -Math.log(Math.max(1 - rng(), Number.EPSILON)) / lambda;
}

export function gammaRandom(rng: () => number, shape: number, rate: number): number {
  if (shape < 1) {
    return gammaRandom(rng, shape + 1, rate) * Math.pow(rng(), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    const x = normalRandom(rng);
    const v = Math.pow(1 + c * x, 3);
    if (v <= 0) continue;
    const u = rng();
    if (u < 1 - 0.0331 * Math.pow(x, 4)) return (d * v) / rate;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return (d * v) / rate;
  }
}

export function sampleWithReplacement<T>(rng: () => number, values: T[], size: number): T[] {
  return Array.from({ length: size }, () => values[Math.floor(rng() * values.length)]);
}
`;
}

function formatTs() {
  return `export function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Math.min(2, digits)
  }).format(value);
}

export function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values: number[]): number {
  const center = mean(values);
  return values.reduce((sum, value) => sum + (value - center) ** 2, 0) / Math.max(values.length - 1, 1);
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function quantile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}
`;
}

function engineTs() {
  return `import type { ChartBar, ChartPoint, ChartSeries, CityRecord, ControlValue, ExampleConfig, SimulationResult, TableSpec } from "../components/${"${DOMAIN}"}/types";
import { createRandom, exponentialRandom, normalRandom, sampleWithReplacement } from "../utils/random";
import { formatNumber, mean, parseNumberList, quantile, standardDeviation, variance } from "../utils/format";

type ControlMap = Record<string, ControlValue>;

function num(controls: ControlMap, id: string, fallback: number): number {
  const value = controls[id];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(controls: ControlMap, id: string, fallback: string): string {
  const value = controls[id];
  return typeof value === "string" ? value : fallback;
}

function histogram(values: number[], count = 18): ChartBar[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min || 1) / count;
  const bins = Array.from({ length: count }, (_, index) => ({
    label: formatNumber(min + width * (index + 0.5), 2),
    value: 0
  }));

  for (const value of values) {
    const index = Math.min(count - 1, Math.max(0, Math.floor((value - min) / width)));
    bins[index].value += 1;
  }

  return bins;
}

function normalPdf(x: number, mu = 0, sd = 1): number {
  return Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
}

function erf(x: number): number {
  const sign = Math.sign(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x: number, mu = 0, sd = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sd * Math.sqrt(2))));
}

function linearRegression(points: Array<{ x: number; y: number }>) {
  const xMean = mean(points.map((point) => point.x));
  const yMean = mean(points.map((point) => point.y));
  const sxx = points.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const sxy = points.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const fitted = points.map((point) => intercept + slope * point.x);
  const sst = points.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0);
  const sse = points.reduce((sum, point, index) => sum + (point.y - fitted[index]) ** 2, 0);
  const rSquared = 1 - sse / sst;

  return { slope, intercept, rSquared, sse };
}

function result(
  headline: string,
  narrative: string,
  metrics: SimulationResult["metrics"],
  chart: SimulationResult["chart"],
  table?: TableSpec
): SimulationResult {
  return { headline, narrative, metrics, chart, table };
}

function piCircle(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.min(10000, Math.max(100, Math.round(num(controls, "points", 1000))));
  let inside = 0;
  const points: ChartPoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const x = rng() * 2 - 1;
    const y = rng() * 2 - 1;
    const hit = x * x + y * y <= 1;
    if (hit) inside += 1;
    if (i < 1200) points.push({ x, y, color: hit ? "#136f63" : "#d1495b" });
  }
  const estimate = 4 * inside / n;
  return result(
    "Circle-area Monte Carlo estimate",
    "The chart displays a capped preview of simulated points; the metrics use all generated points.",
    [
      { label: "pi estimate", value: formatNumber(estimate, 5), detail: "4 x inside proportion" },
      { label: "inside points", value: String(inside), detail: \`\${n} total draws\` },
      { label: "absolute error", value: formatNumber(Math.abs(Math.PI - estimate), 5), detail: "Compared with Math.PI" }
    ],
    { type: "scatter", title: "Random points in the unit square", xLabel: "x", yLabel: "y", points, xDomain: [-1, 1], yDomain: [-1, 1] }
  );
}

function buffon(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const trials = Math.max(100, Math.round(num(controls, "trials", 1000)));
  const experiments = Math.max(1, Math.round(num(controls, "experiments", 20)));
  const planeWidth = Math.max(1, num(controls, "planeWidth", 6));
  const needleLength = 1;
  const estimates: ChartPoint[] = [];
  let totalCrosses = 0;
  for (let experiment = 1; experiment <= experiments; experiment += 1) {
    let crosses = 0;
    for (let i = 0; i < trials; i += 1) {
      const centerDistance = rng() * (planeWidth / 2);
      const theta = rng() * Math.PI;
      if (centerDistance <= (needleLength / 2) * Math.sin(theta)) crosses += 1;
    }
    totalCrosses += crosses;
    const probability = totalCrosses / (trials * experiment);
    estimates.push({ x: experiment, y: probability > 0 ? (2 * needleLength) / (planeWidth * probability) : 0 });
  }
  const final = estimates.at(-1)?.y ?? 0;
  return result(
    "Buffon's needle convergence",
    "Each point is the cumulative pi estimate after another experiment.",
    [
      { label: "pi estimate", value: formatNumber(final, 5), detail: "Cumulative estimate" },
      { label: "crossing rate", value: formatNumber(totalCrosses / (trials * experiments), 4), detail: "Needles crossing a line" },
      { label: "experiments", value: String(experiments), detail: \`\${trials} trials each\` }
    ],
    { type: "line", title: "Cumulative estimate by experiment", xLabel: "experiment", yLabel: "pi estimate", series: [{ label: "estimate", points: estimates, color: "#136f63" }], yDomain: [0, Math.max(5, final * 1.2)] }
  );
}

function randomNormal(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const targetMean = num(controls, "mean", 0);
  const sd = Math.max(0.1, num(controls, "sd", 1));
  const sample = Array.from({ length: n }, () => normalRandom(rng, targetMean, sd));
  return result(
    "Generated normal sample",
    "Histogram bins show the simulated distribution around the requested mean and standard deviation.",
    [
      { label: "sample mean", value: formatNumber(mean(sample), 4), detail: \`target \${formatNumber(targetMean, 2)}\` },
      { label: "sample sd", value: formatNumber(standardDeviation(sample), 4), detail: \`target \${formatNumber(sd, 2)}\` },
      { label: "sample size", value: String(n), detail: "Box-Muller draws" }
    ],
    { type: "bars", title: "Normal sample histogram", xLabel: "bin center", yLabel: "count", bars: histogram(sample) }
  );
}

function randomExponential(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const lambda = Math.max(0.1, num(controls, "lambda", 2));
  const sample = Array.from({ length: n }, () => exponentialRandom(rng, lambda));
  return result(
    "Generated exponential sample",
    "The histogram displays right-skew and tail length controlled by lambda.",
    [
      { label: "sample mean", value: formatNumber(mean(sample), 4), detail: \`theory \${formatNumber(1 / lambda, 4)}\` },
      { label: "sample sd", value: formatNumber(standardDeviation(sample), 4), detail: \`theory \${formatNumber(1 / lambda, 4)}\` },
      { label: "lambda", value: formatNumber(lambda, 3), detail: "rate parameter" }
    ],
    { type: "bars", title: "Exponential sample histogram", xLabel: "bin center", yLabel: "count", bars: histogram(sample) }
  );
}

function gammaRejection(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1500)));
  const alpha = Math.max(0.2, num(controls, "alpha", 1.5));
  const beta = Math.max(0.2, num(controls, "beta", 1));
  const lambda = Math.max(0.1, num(controls, "lambda", 0.6667));
  const envelope = Math.max(0.5, num(controls, "envelope", 1.258));
  const accepted: number[] = [];
  for (let i = 0; i < n; i += 1) {
    const proposal = exponentialRandom(rng, lambda);
    const targetShape = Math.pow(proposal, alpha - 1) * Math.exp(-beta * proposal);
    const proposalShape = lambda * Math.exp(-lambda * proposal);
    if (rng() <= Math.min(1, targetShape / Math.max(envelope * proposalShape, Number.EPSILON))) {
      accepted.push(proposal);
    }
  }
  return result(
    "Acceptance-rejection preview",
    "Accepted proposal draws form an empirical gamma-like sample.",
    [
      { label: "accepted", value: String(accepted.length), detail: \`\${n} candidates\` },
      { label: "acceptance rate", value: formatNumber(accepted.length / n, 4), detail: "accepted / candidates" },
      { label: "accepted mean", value: formatNumber(mean(accepted.length ? accepted : [0]), 4), detail: \`gamma mean approx \${formatNumber(alpha / beta, 4)}\` }
    ],
    { type: "bars", title: "Accepted sample histogram", xLabel: "bin center", yLabel: "count", bars: histogram(accepted.length ? accepted : [0]) }
  );
}

function mcIntegralExp(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 10000)));
  const values = Array.from({ length: n }, () => Math.exp(-(2 + 2 * rng())) * 2);
  const estimate = mean(values);
  const exact = Math.exp(-2) - Math.exp(-4);
  return result(
    "Monte Carlo integral estimate",
    "The integral is estimated by averaging transformed uniform draws.",
    [
      { label: "estimate", value: formatNumber(estimate, 6), detail: "Monte Carlo" },
      { label: "exact value", value: formatNumber(exact, 6), detail: "exp(-2) - exp(-4)" },
      { label: "absolute error", value: formatNumber(Math.abs(estimate - exact), 6), detail: \`\${n} draws\` }
    ],
    { type: "bars", title: "Contribution histogram", xLabel: "estimate contribution", yLabel: "count", bars: histogram(values) }
  );
}

function mcTransform(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const uniformValues = Array.from({ length: n }, () => {
    const u = Math.max(rng(), Number.EPSILON);
    return 5 * (1 / (u * u)) * Math.sqrt(1 / u - 1) * Math.exp(-(1 / u - 1));
  });
  const exponentialValues = Array.from({ length: n }, () => 5 * Math.sqrt(exponentialRandom(rng)));
  return result(
    "Estimator comparison",
    "Both estimators target the same quantity with different sampling distributions.",
    [
      { label: "uniform estimate", value: formatNumber(mean(uniformValues), 5), detail: \`variance \${formatNumber(variance(uniformValues), 4)}\` },
      { label: "exponential estimate", value: formatNumber(mean(exponentialValues), 5), detail: \`variance \${formatNumber(variance(exponentialValues), 4)}\` },
      { label: "variance ratio", value: formatNumber(variance(uniformValues) / variance(exponentialValues), 3), detail: "uniform / exponential" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "uniform", value: variance(uniformValues) }, { label: "exponential", value: variance(exponentialValues) }] }
  );
}

function normalCdfExample(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const low = num(controls, "low", 0.1);
  const high = num(controls, "high", 2.5);
  const xs = Array.from({ length: 10 }, (_, index) => low + (index * (high - low)) / 9);
  const z = Array.from({ length: n }, () => normalRandom(rng));
  const rows = xs.map((xValue) => {
    const indicator = mean(z.map((value) => (value <= xValue ? 1 : 0)));
    const exact = normalCdf(xValue);
    return [formatNumber(xValue, 3), formatNumber(indicator, 4), formatNumber(exact, 4), formatNumber(Math.abs(indicator - exact), 4)];
  });
  return result(
    "Normal CDF simulation grid",
    "Indicator simulation is compared with the analytic normal CDF.",
    [
      { label: "grid points", value: String(xs.length), detail: \`from \${low} to \${high}\` },
      { label: "draws", value: String(n), detail: "standard normal sample" },
      { label: "max error", value: formatNumber(Math.max(...rows.map((row) => Number(row[3]))), 4), detail: "indicator vs Phi" }
    ],
    { type: "line", title: "Phi(x) estimate", xLabel: "x", yLabel: "CDF", series: [{ label: "indicator", points: xs.map((xValue, index) => ({ x: xValue, y: Number(rows[index][1]) })), color: "#136f63" }, { label: "Phi", points: xs.map((xValue) => ({ x: xValue, y: normalCdf(xValue) })), color: "#d1495b" }] },
    { columns: ["x", "Indicator MC", "Phi(x)", "Abs. error"], rows }
  );
}

function antitheticExp(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const half = Math.floor(n / 2);
  const paired = Array.from({ length: half }, () => {
    const u = rng();
    return (Math.exp(u) + Math.exp(1 - u)) / 2;
  });
  const independent = Array.from({ length: n }, () => Math.exp(rng()));
  const exact = Math.E - 1;
  return result(
    "Antithetic estimator for exp(U)",
    "Paired uniforms U and 1-U reduce estimator variance for a monotone integrand.",
    [
      { label: "antithetic estimate", value: formatNumber(mean(paired), 5), detail: \`exact \${formatNumber(exact, 5)}\` },
      { label: "independent estimate", value: formatNumber(mean(independent), 5), detail: "simple MC" },
      { label: "variance reduction", value: \`\${formatNumber((1 - variance(paired) / variance(independent)) * 100, 2)}%\`, detail: "sample variance basis" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "antithetic", value: variance(paired) }, { label: "independent", value: variance(independent) }] }
  );
}

function antitheticGamma(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const half = Math.floor(n / 2);
  const paired = Array.from({ length: half }, () => {
    const u = Math.max(rng(), Number.EPSILON);
    return (Math.pow(-Math.log(u), 0.9) + Math.pow(-Math.log(1 - u), 0.9)) / 2;
  });
  return result(
    "Antithetic gamma-like integral",
    "The paired estimator mirrors the WALS antithetic integral example.",
    [
      { label: "estimate", value: formatNumber(mean(paired), 5), detail: "antithetic method" },
      { label: "standard error", value: formatNumber(standardDeviation(paired) / Math.sqrt(half), 5), detail: \`\${half} pairs\` },
      { label: "pair variance", value: formatNumber(variance(paired), 5), detail: "variance of pair means" }
    ],
    { type: "bars", title: "Pair-mean histogram", xLabel: "pair mean", yLabel: "count", bars: histogram(paired) }
  );
}

function controlExp(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const coefficient = num(controls, "coefficient", -1.6903);
  const simple = Array.from({ length: n }, () => {
    const u = rng();
    return { simple: Math.exp(u), control: Math.exp(u) + coefficient * (u - 0.5) };
  });
  const simpleValues = simple.map((item) => item.simple);
  const controlValues = simple.map((item) => item.control);
  return result(
    "Control variate estimator",
    "The adjustment uses U - 1/2, whose expectation is zero.",
    [
      { label: "simple estimate", value: formatNumber(mean(simpleValues), 5), detail: \`variance \${formatNumber(variance(simpleValues), 5)}\` },
      { label: "control estimate", value: formatNumber(mean(controlValues), 5), detail: \`variance \${formatNumber(variance(controlValues), 5)}\` },
      { label: "variance reduction", value: \`\${formatNumber((1 - variance(controlValues) / variance(simpleValues)) * 100, 2)}%\`, detail: \`c = \${formatNumber(coefficient, 3)}\` }
    ],
    { type: "bars", title: "Simple vs control variate variance", xLabel: "method", yLabel: "variance", bars: [{ label: "simple", value: variance(simpleValues) }, { label: "control", value: variance(controlValues) }] }
  );
}

function controlRatio(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const pilot = Array.from({ length: 10000 }, () => rng());
  const f = (u: number) => Math.exp(-0.5) / (1 + u * u);
  const g = (u: number) => Math.exp(-u) / (1 + u * u);
  const pilotF = pilot.map(f);
  const pilotG = pilot.map(g);
  const fMean = mean(pilotF);
  const gMean = mean(pilotG);
  const covariance = mean(pilot.map((_, index) => (pilotF[index] - fMean) * (pilotG[index] - gMean)));
  const c = -covariance / variance(pilotF);
  const knownF = Math.exp(-0.5) * Math.PI / 4;
  const simple = Array.from({ length: n }, () => g(rng()));
  const controlled = Array.from({ length: n }, () => {
    const u = rng();
    return g(u) + c * (f(u) - knownF);
  });
  return result(
    "Estimated control-variate coefficient",
    "A pilot simulation estimates the coefficient used for the control-variate correction.",
    [
      { label: "simple estimate", value: formatNumber(mean(simple), 5), detail: \`se \${formatNumber(standardDeviation(simple) / Math.sqrt(n), 5)}\` },
      { label: "controlled estimate", value: formatNumber(mean(controlled), 5), detail: \`se \${formatNumber(standardDeviation(controlled) / Math.sqrt(n), 5)}\` },
      { label: "variance reduction", value: \`\${formatNumber((1 - variance(controlled) / variance(simple)) * 100, 2)}%\`, detail: \`c = \${formatNumber(c, 3)}\` }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "simple", value: variance(simple) }, { label: "controlled", value: variance(controlled) }] }
  );
}

function importancePower(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const importance = Array.from({ length: n }, () => {
    const x = Math.pow(rng(), 1 / 5);
    return Math.pow(x, 5.1) / (5 * Math.pow(x, 4));
  });
  const simple = Array.from({ length: n }, () => Math.pow(rng(), 5));
  return result(
    "Importance sampling comparison",
    "The proposal density concentrates samples near larger x values.",
    [
      { label: "importance estimate", value: formatNumber(mean(importance), 6), detail: \`variance \${formatNumber(variance(importance), 6)}\` },
      { label: "simple estimate", value: formatNumber(mean(simple), 6), detail: \`variance \${formatNumber(variance(simple), 6)}\` },
      { label: "variance ratio", value: formatNumber(variance(simple) / variance(importance), 2), detail: "simple / importance" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "importance", value: variance(importance) }, { label: "simple", value: variance(simple) }] }
  );
}

function conditionalCircle(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const conditional = Array.from({ length: n }, () => {
    const u = rng();
    return Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
  });
  const simple = Array.from({ length: n }, () => {
    const u = rng();
    return u * u + (2 * u - 1) ** 2 < 1 ? 1 : 0;
  });
  return result(
    "Conditional Monte Carlo estimator",
    "Conditioning replaces a binary hit/miss draw with a smooth conditional expectation.",
    [
      { label: "conditional estimate", value: formatNumber(mean(conditional), 5), detail: \`variance \${formatNumber(variance(conditional), 5)}\` },
      { label: "simple estimate", value: formatNumber(mean(simple), 5), detail: \`variance \${formatNumber(variance(simple), 5)}\` },
      { label: "variance reduction", value: \`\${formatNumber((1 - variance(conditional) / variance(simple)) * 100, 2)}%\`, detail: "conditional vs simple" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "conditional", value: variance(conditional) }, { label: "simple", value: variance(simple) }] }
  );
}

function bootstrapMax(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const values = parseNumberList(str(controls, "data", "0.5,0.6,0.7"));
  const replicates = Math.max(100, Math.round(num(controls, "replicates", 1000)));
  const maxima = Array.from({ length: replicates }, () => Math.max(...sampleWithReplacement(rng, values, values.length)));
  return result(
    "Bootstrap distribution of the maximum",
    "Each bootstrap replicate samples observed values with replacement and records the maximum.",
    [
      { label: "bootstrap mean max", value: formatNumber(mean(maxima), 4), detail: "mean of maxima" },
      { label: "95% interval", value: \`\${formatNumber(quantile(maxima, 0.025), 3)} - \${formatNumber(quantile(maxima, 0.975), 3)}\`, detail: "percentile interval" },
      { label: "replicates", value: String(replicates), detail: \`\${values.length} observed values\` }
    ],
    { type: "bars", title: "Bootstrap maxima", xLabel: "max value bin", yLabel: "count", bars: histogram(maxima) }
  );
}

function meanBootstrap(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(50, Math.round(num(controls, "sampleSize", 10000)));
  const replicates = Math.max(100, Math.round(num(controls, "replicates", 1000)));
  const sample = Array.from({ length: n }, () => normalRandom(rng, 5, 2));
  const bootMeans = Array.from({ length: replicates }, () => mean(sampleWithReplacement(rng, sample, Math.min(sample.length, 500))));
  return result(
    "Bootstrap mean summary",
    "The bootstrap reuses the generated sample to estimate the mean's sampling spread.",
    [
      { label: "sample mean", value: formatNumber(mean(sample), 4), detail: "generated sample" },
      { label: "bootstrap mean", value: formatNumber(mean(bootMeans), 4), detail: "mean of bootstrap means" },
      { label: "bootstrap sd", value: formatNumber(standardDeviation(bootMeans), 4), detail: "bootstrap standard error" }
    ],
    { type: "bars", title: "Bootstrap means", xLabel: "mean bin", yLabel: "count", bars: histogram(bootMeans) }
  );
}

function mcmcMixture(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const burnin = Math.max(0, Math.round(num(controls, "burnin", 200)));
  const sampleSize = Math.max(50, Math.round(num(controls, "sampleSize", 400)));
  const density = (x: number, y: number) => 0.5 * Math.exp(-((x - 6) ** 2 + (y - 6) ** 2) / 4) + 0.5 * Math.exp(-(x * x + y * y) / 2);
  let x = rng() * 10 - 2;
  let y = rng() * 10 - 2;
  let accepted = 0;
  const points: ChartPoint[] = [];
  for (let i = 0; i < burnin + sampleSize; i += 1) {
    const px = x + normalRandom(rng, 0, 1);
    const py = y + normalRandom(rng, 0, 1);
    const ratio = density(px, py) / Math.max(density(x, y), Number.EPSILON);
    if (rng() < Math.min(1, ratio)) {
      x = px;
      y = py;
      accepted += 1;
    }
    if (i >= burnin) {
      points.push({ x, y, color: i === burnin ? "#d1495b" : "#136f63" });
    }
  }
  return result(
    "Metropolis-Hastings sample path",
    "The chain moves through a two-mode target density after the selected burn-in.",
    [
      { label: "acceptance rate", value: formatNumber(accepted / (burnin + sampleSize), 4), detail: "accepted proposals" },
      { label: "sample size", value: String(sampleSize), detail: \`\${burnin} burn-in draws\` },
      { label: "mean location", value: \`(\${formatNumber(mean(points.map((p) => p.x)), 2)}, \${formatNumber(mean(points.map((p) => p.y)), 2)})\`, detail: "posterior sample mean" }
    ],
    { type: "scatter", title: "MCMC draws", xLabel: "x1", yLabel: "x2", points, xDomain: [-4, 10], yDomain: [-4, 10] }
  );
}

function politician(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const steps = Math.max(1000, Math.round(num(controls, "steps", 5000)));
  const islands = ["Is1", "Is2", "Is3", "Is4", "Is5", "Is6", "Is7", "Is8", "Is9"];
  const population = [100, 700, 400, 200, 350, 450, 800, 500, 200];
  let current = Math.floor(rng() * islands.length);
  const visits = Array.from({ length: islands.length }, () => 0);
  for (let i = 0; i < steps; i += 1) {
    visits[current] += 1;
    const direction = rng() < 0.5 ? -1 : 1;
    const proposal = (current + direction + islands.length) % islands.length;
    const accept = Math.min(1, population[proposal] / population[current]);
    if (rng() < accept) current = proposal;
  }
  const bars = islands.map((island, index) => ({ label: island, value: visits[index] / steps }));
  return result(
    "Metropolis walk over islands",
    "Visit frequencies approximate the target population proportions.",
    [
      { label: "steps", value: String(steps), detail: "single-chain simulation" },
      { label: "most visited", value: bars.reduce((best, item) => (item.value > best.value ? item : best)).label, detail: "highest empirical frequency" },
      { label: "target largest", value: "Is7", detail: "largest population" }
    ],
    { type: "bars", title: "Visit frequency by island", xLabel: "island", yLabel: "frequency", bars, yDomain: [0, Math.max(...bars.map((bar) => bar.value)) * 1.2] }
  );
}

function anova(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const dataset = str(controls, "dataset", "random");
  const groups: Array<{ label: string; values: number[] }> =
    dataset === "fuel"
      ? [
          { label: "Brand A", values: [7.8, 8.2, 8.65, 8.0, 8.36] },
          { label: "Brand B", values: [9.5, 10.21, 9.85, 10.02, 9.39] },
          { label: "Brand C", values: [8.2, 8.87, 8.35, 9.03, 8.68] }
        ]
      : dataset === "temperature"
        ? [
            { label: "80 C", values: [254, 263, 241, 237, 251] },
            { label: "85 C", values: [234, 218, 235, 227, 216] },
            { label: "90 C", values: [200, 222, 197, 206, 204] }
          ]
        : [
            { label: "Group 1", values: Array.from({ length: Math.round(num(controls, "n1", 5)) }, () => normalRandom(rng, num(controls, "mu1", 1), num(controls, "sigma", 1))) },
            { label: "Group 2", values: Array.from({ length: Math.round(num(controls, "n2", 5)) }, () => normalRandom(rng, num(controls, "mu2", 2), num(controls, "sigma", 1))) },
            { label: "Group 3", values: Array.from({ length: Math.round(num(controls, "n3", 5)) }, () => normalRandom(rng, num(controls, "mu3", 3), num(controls, "sigma", 1))) }
          ];
  const all = groups.flatMap((group) => group.values);
  const grandMean = mean(all);
  const ssBetween = groups.reduce((sum, group) => sum + group.values.length * (mean(group.values) - grandMean) ** 2, 0);
  const ssWithin = groups.reduce((sum, group) => sum + group.values.reduce((inner, value) => inner + (value - mean(group.values)) ** 2, 0), 0);
  const dfBetween = groups.length - 1;
  const dfWithin = all.length - groups.length;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const f = msBetween / msWithin;
  return result(
    "ANOVA summary",
    "The table partitions variability into between-group and within-group components.",
    [
      { label: "F statistic", value: formatNumber(f, 4), detail: "MS between / MS within" },
      { label: "grand mean", value: formatNumber(grandMean, 4), detail: \`\${all.length} observations\` },
      { label: "groups", value: String(groups.length), detail: dataset }
    ],
    { type: "bars", title: "Group means", xLabel: "group", yLabel: "mean", bars: groups.map((group) => ({ label: group.label, value: mean(group.values) })) },
    {
      columns: ["Source", "Df", "Sum Sq", "Mean Sq", "F"],
      rows: [
        ["Between groups", dfBetween, formatNumber(ssBetween, 4), formatNumber(msBetween, 4), formatNumber(f, 4)],
        ["Within groups", dfWithin, formatNumber(ssWithin, 4), formatNumber(msWithin, 4), ""]
      ]
    }
  );
}

function confidenceInterval(controls: ControlMap): SimulationResult {
  const mu = 31.5;
  const sigma = 0.3577;
  const width = num(controls, "nSigma", 2) * Number(sigma.toFixed(2));
  const means = [num(controls, "mean1", 31.3), num(controls, "mean2", 31.7), num(controls, "mean3", 32.5)];
  const intervals = [
    { label: "Population", center: mu, lower: mu - width, upper: mu + width, color: "#136f63" },
    ...means.map((center, index) => ({ label: \`Sample \${index + 1}\`, center, lower: center - width, upper: center + width, color: ["#d1495b", "#f28e2b", "#4e79a7"][index] }))
  ];
  const covering = intervals.slice(1).filter((interval) => interval.lower <= mu && interval.upper >= mu).length;
  return result(
    "Sample-centered confidence intervals",
    "Intervals are drawn at equal width around the population mean and three sample means.",
    [
      { label: "interval half-width", value: formatNumber(width, 3), detail: \`\${num(controls, "nSigma", 2)} sigma\` },
      { label: "covering samples", value: \`\${covering} / 3\`, detail: "sample intervals covering mu" },
      { label: "sample size", value: String(num(controls, "sampleSize", 5)), detail: "kept from WALS control" }
    ],
    { type: "intervals", title: "Intervals around means", xLabel: "value", yLabel: "interval", intervals, reference: mu, xDomain: [29, 34] }
  );
}

function distribution(controls: ControlMap): SimulationResult {
  const dist = str(controls, "dist", "norm");
  const mode = str(controls, "mode", "PDF");
  const a = num(controls, "a", 0);
  const b = Math.max(0.1, num(controls, "b", 1));
  const lower = num(controls, "lower", -2);
  const upper = num(controls, "upper", 2);
  const isDiscrete = ["binom", "geom", "pois"].includes(dist);
  const xs = isDiscrete
    ? Array.from({ length: Math.max(8, Math.round(b) + 1) }, (_, index) => index)
    : Array.from({ length: 160 }, (_, index) => lower - 2 + (index * (upper - lower + 4)) / 159);
  const pdf = (x: number) => {
    if (dist === "exp") return x < 0 ? 0 : b * Math.exp(-b * x);
    if (dist === "unif") return x >= a && x <= b ? 1 / Math.max(b - a, Number.EPSILON) : 0;
    if (dist === "pois") return Math.exp(-b) * Math.pow(b, x) / Math.max(1, Array.from({ length: x }, (_, index) => index + 1).reduce((product, value) => product * value, 1));
    if (dist === "binom") {
      const size = Math.max(1, Math.round(b));
      const p = Math.min(0.95, Math.max(0.05, a || 0.5));
      const choose = Array.from({ length: x }, (_, index) => (size - index) / (index + 1)).reduce((product, value) => product * value, 1);
      return choose * p ** x * (1 - p) ** (size - x);
    }
    return normalPdf(x, a, b);
  };
  const points = xs.map((x) => ({ x, y: mode === "CDF" ? xs.filter((v) => v <= x).reduce((sum, v) => sum + pdf(v), 0) / xs.reduce((sum, v) => sum + pdf(v), 0) : pdf(x) }));
  const probability = dist === "norm" ? normalCdf(upper, a, b) - normalCdf(lower, a, b) : points.filter((point) => point.x >= lower && point.x <= upper).reduce((sum, point) => sum + point.y, 0) / Math.max(points.reduce((sum, point) => sum + point.y, 0), Number.EPSILON);
  return result(
    "Distribution explorer",
    \`\${mode} view for \${dist}; parameter a and b map to the selected distribution's primary controls.\`,
    [
      { label: "distribution", value: dist, detail: mode },
      { label: "interval probability", value: formatNumber(probability, 4), detail: \`P(\${lower} <= X <= \${upper})\` },
      { label: "points rendered", value: String(points.length), detail: isDiscrete ? "discrete support" : "continuous grid" }
    ],
    isDiscrete
      ? { type: "bars", title: \`\${dist} \${mode}\`, xLabel: "x", yLabel: mode, bars: points.map((point) => ({ label: String(point.x), value: point.y })) }
      : { type: "line", title: \`\${dist} \${mode}\`, xLabel: "x", yLabel: mode, series: [{ label: dist, points, color: "#136f63" }] }
  );
}

function linearRegressionExample(controls: ControlMap, _seed: number, data?: { cities?: CityRecord[] }): SimulationResult {
  const feature = str(controls, "feature", "completed") as "completed" | "GDP";
  const exclude = str(controls, "excludeHighLeverage", "no") === "yes";
  const source = data?.cities ?? [];
  const kept = exclude ? source.filter((city) => !["上海", "香港"].includes(city.city)) : source;
  const points = kept.map((city) => ({ x: city[feature], y: city.planing, label: city.city }));
  const fit = linearRegression(points);
  const xMin = Math.min(...points.map((point) => point.x));
  const xMax = Math.max(...points.map((point) => point.x));
  const line: ChartSeries = { label: "least squares fit", color: "#d1495b", points: [{ x: xMin, y: fit.intercept + fit.slope * xMin }, { x: xMax, y: fit.intercept + fit.slope * xMax }] };
  return result(
    "City regression model",
    "The WALS city dataset links planned skyscrapers with either completed buildings or GDP.",
    [
      { label: "slope", value: formatNumber(fit.slope, 5), detail: \`predictor: \${feature}\` },
      { label: "intercept", value: formatNumber(fit.intercept, 4), detail: "least-squares fit" },
      { label: "R-squared", value: formatNumber(fit.rSquared, 4), detail: \`\${kept.length} cities\` }
    ],
    { type: "scatter", title: "Planned skyscrapers regression", xLabel: feature, yLabel: "planned", points, line },
    { columns: ["City", feature, "planned"], rows: kept.map((city) => [city.city, city[feature], city.planing]) }
  );
}

export function runExample(
  example: ExampleConfig,
  controls: ControlMap,
  seed: number,
  data?: { cities?: CityRecord[] }
): SimulationResult {
  switch (example.kind) {
    case "pi-circle":
      return piCircle(controls, seed);
    case "buffon":
      return buffon(controls, seed);
    case "random-normal":
      return randomNormal(controls, seed);
    case "random-exponential":
      return randomExponential(controls, seed);
    case "gamma-rejection":
      return gammaRejection(controls, seed);
    case "mc-integral-exp":
      return mcIntegralExp(controls, seed);
    case "mc-transform":
      return mcTransform(controls, seed);
    case "normal-cdf":
      return normalCdfExample(controls, seed);
    case "antithetic-exp":
      return antitheticExp(controls, seed);
    case "antithetic-gamma":
      return antitheticGamma(controls, seed);
    case "control-exp":
      return controlExp(controls, seed);
    case "control-ratio":
      return controlRatio(controls, seed);
    case "importance-power":
      return importancePower(controls, seed);
    case "conditional-circle":
      return conditionalCircle(controls, seed);
    case "bootstrap-max":
      return bootstrapMax(controls, seed);
    case "mean-bootstrap":
      return meanBootstrap(controls, seed);
    case "mcmc-mixture":
      return mcmcMixture(controls, seed);
    case "politician":
      return politician(controls, seed);
    case "anova":
      return anova(controls, seed);
    case "confidence-interval":
      return confidenceInterval(controls);
    case "distribution":
      return distribution(controls);
    case "linear-regression":
      return linearRegressionExample(controls, seed, data);
    default:
      return result(
        "Template pending",
        \`No calculation engine has been mapped for \${example.kind}.\`,
        [{ label: "source", value: example.sourcePath }],
        { type: "bars", title: "No data", xLabel: "template", yLabel: "value", bars: [{ label: example.id, value: 1 }] }
      );
  }
}
`;
}

function chartTs() {
  return `import { svg } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import * as d3 from "d3";
import type { ChartPoint, ChartSpec } from "../components/${"${DOMAIN}"}/types";

const width = 760;
const height = 380;
const margin = { top: 34, right: 24, bottom: 54, left: 64 };

function extent(values: number[], fallback: [number, number]): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return fallback;
  if (min === max) return [min - 1, max + 1];
  return [min, max];
}

function axisTicks(scale: d3.ScaleLinear<number, number>, orientation: "x" | "y"): VNode[] {
  return scale.ticks(5).map((tick) => {
    const x = orientation === "x" ? scale(tick) : margin.left;
    const y = orientation === "x" ? height - margin.bottom : scale(tick);
    return svg.g([
      orientation === "x"
        ? svg.line({ attrs: { x1: x, x2: x, y1: y, y2: y + 6, stroke: "#94a3b8" } })
        : svg.line({ attrs: { x1: x - 6, x2: x, y1: y, y2: y, stroke: "#94a3b8" } }),
      svg.text(
        {
          attrs: {
            x: orientation === "x" ? x : x - 10,
            y: orientation === "x" ? y + 22 : y + 4,
            "text-anchor": orientation === "x" ? "middle" : "end",
            fill: "#64748b",
            "font-size": 11
          }
        },
        String(Number(tick.toFixed(3)))
      )
    ]);
  });
}

function frame(title: string, xLabel: string, yLabel: string, children: VNode[]): VNode {
  return svg(
    {
      attrs: {
        class: "teaching-chart",
        viewBox: \`0 0 \${width} \${height}\`,
        role: "img",
        "aria-label": title
      }
    },
    [
      svg.rect({ attrs: { x: 0, y: 0, width, height, rx: 8, fill: "#ffffff" } }),
      svg.text({ attrs: { x: margin.left, y: 22, fill: "#111827", "font-size": 16, "font-weight": 700 } }, title),
      svg.text({ attrs: { x: width / 2, y: height - 12, fill: "#475569", "font-size": 12, "text-anchor": "middle" } }, xLabel),
      svg.text({ attrs: { x: 18, y: height / 2, fill: "#475569", "font-size": 12, "text-anchor": "middle", transform: \`rotate(-90 18 \${height / 2})\` } }, yLabel),
      ...children
    ]
  );
}

function renderScatter(spec: Extract<ChartSpec, { type: "scatter" }>): VNode {
  const xDomain = spec.xDomain ?? extent(spec.points.map((point) => point.x).concat(spec.line?.points.map((point) => point.x) ?? []), [0, 1]);
  const yDomain = spec.yDomain ?? extent(spec.points.map((point) => point.y).concat(spec.line?.points.map((point) => point.y) ?? []), [0, 1]);
  const x = d3.scaleLinear().domain(xDomain).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);
  const line = d3.line<ChartPoint>().x((point) => x(point.x)).y((point) => y(point.y));
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    svg.line({ attrs: { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(x, "x"),
    ...axisTicks(y, "y"),
    ...(spec.line ? [svg.path({ attrs: { d: line(spec.line.points) ?? "", fill: "none", stroke: spec.line.color ?? "#d1495b", "stroke-width": 3 } })] : []),
    ...spec.points.map((point) =>
      svg.circle({
        attrs: {
          cx: x(point.x),
          cy: y(point.y),
          r: point.label ? 4.5 : 3,
          fill: point.color ?? "#136f63",
          opacity: 0.78
        }
      })
    )
  ]);
}

function renderLine(spec: Extract<ChartSpec, { type: "line" }>): VNode {
  const points = spec.series.flatMap((series) => series.points);
  const xDomain = spec.xDomain ?? extent(points.map((point) => point.x), [0, 1]);
  const yDomain = spec.yDomain ?? extent(points.map((point) => point.y), [0, 1]);
  const x = d3.scaleLinear().domain(xDomain).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);
  const line = d3.line<ChartPoint>().x((point) => x(point.x)).y((point) => y(point.y));
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    svg.line({ attrs: { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(x, "x"),
    ...axisTicks(y, "y"),
    ...spec.series.map((series) => svg.path({ attrs: { d: line(series.points) ?? "", fill: "none", stroke: series.color ?? "#136f63", "stroke-width": 3 } }))
  ]);
}

function renderBars(spec: Extract<ChartSpec, { type: "bars" }>): VNode {
  const maxValue = Math.max(...spec.bars.map((bar) => bar.value), 1);
  const yDomain = spec.yDomain ?? [0, maxValue * 1.15] as [number, number];
  const x = d3.scaleBand().domain(spec.bars.map((bar) => bar.label)).range([margin.left, width - margin.right]).padding(0.18);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    svg.line({ attrs: { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(y, "y"),
    ...spec.bars.map((bar) =>
      svg.rect({
        attrs: {
          x: x(bar.label) ?? margin.left,
          y: y(bar.value),
          width: x.bandwidth(),
          height: Math.max(0, height - margin.bottom - y(bar.value)),
          fill: bar.color ?? "#136f63",
          opacity: 0.86
        }
      })
    )
  ]);
}

function renderIntervals(spec: Extract<ChartSpec, { type: "intervals" }>): VNode {
  const values = spec.intervals.flatMap((interval) => [interval.lower, interval.upper, interval.center]);
  const xDomain = spec.xDomain ?? extent(values, [0, 1]);
  const x = d3.scaleLinear().domain(xDomain).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleBand().domain(spec.intervals.map((interval) => interval.label)).range([margin.top, height - margin.bottom]).padding(0.35);
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(x, "x"),
    ...(spec.reference !== undefined ? [svg.line({ attrs: { x1: x(spec.reference), x2: x(spec.reference), y1: margin.top, y2: height - margin.bottom, stroke: "#64748b", "stroke-dasharray": "5 5" } })] : []),
    ...spec.intervals.flatMap((interval) => {
      const yCenter = (y(interval.label) ?? 0) + y.bandwidth() / 2;
      return [
        svg.line({ attrs: { x1: x(interval.lower), x2: x(interval.upper), y1: yCenter, y2: yCenter, stroke: interval.color ?? "#136f63", "stroke-width": 5, "stroke-linecap": "round" } }),
        svg.circle({ attrs: { cx: x(interval.center), cy: yCenter, r: 6, fill: interval.color ?? "#136f63" } }),
        svg.text({ attrs: { x: margin.left - 10, y: yCenter + 4, "text-anchor": "end", fill: "#475569", "font-size": 12 } }, interval.label)
      ];
    })
  ]);
}

export function chartToVNode(spec: ChartSpec): VNode {
  if (spec.type === "scatter") return renderScatter(spec);
  if (spec.type === "line") return renderLine(spec);
  if (spec.type === "intervals") return renderIntervals(spec);
  return renderBars(spec);
}
`;
}

function stylesCss() {
  return `:root {
  color: #17202a;
  background: #f4f7f9;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  background: #f4f7f9;
}

.hero-panel {
  display: grid;
  gap: 10px;
  padding: 30px 32px 24px;
  border-bottom: 1px solid #d8e0e8;
  background: #ffffff;
}

.eyebrow,
.lesson-label {
  margin: 0;
  color: #136f63;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

.hero-panel h1 {
  margin-bottom: 0;
  color: #101828;
  font-size: 32px;
  line-height: 1.15;
}

.hero-copy,
.source-note {
  max-width: 820px;
  margin-bottom: 0;
  color: #526071;
  line-height: 1.6;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 22px;
  padding: 24px;
}

.control-panel,
.lesson-banner,
.chart-card,
.metric-card,
.table-card,
.explanation-card {
  border: 1px solid #d8e0e8;
  border-radius: 8px;
  background: #ffffff;
}

.control-panel {
  align-self: start;
  display: grid;
  gap: 18px;
  padding: 18px;
  position: sticky;
  top: 16px;
}

.panel-section {
  display: grid;
  gap: 12px;
}

.panel-section h2 {
  margin-bottom: 0;
  font-size: 16px;
}

.example-tabs {
  display: grid;
  gap: 8px;
}

.example-tab,
.run-button {
  min-height: 40px;
  border: 1px solid #b8c4d2;
  border-radius: 8px;
  color: #243142;
  background: #ffffff;
  cursor: pointer;
}

.example-tab {
  padding: 9px 10px;
  text-align: left;
}

.example-tab[data-active="true"],
.run-button {
  border-color: #136f63;
  color: #ffffff;
  background: #136f63;
}

.control-field {
  display: grid;
  gap: 6px;
}

.control-label {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.control-input {
  width: 100%;
  min-height: 38px;
  padding: 7px 10px;
  border: 1px solid #bcc8d6;
  border-radius: 8px;
  background: #ffffff;
}

.content-stack {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.lesson-banner {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
}

.lesson-banner h2 {
  margin-bottom: 8px;
  font-size: 22px;
}

.source-chip {
  align-self: start;
  max-width: 320px;
  padding: 8px 10px;
  border-radius: 8px;
  color: #425466;
  background: #eef3f6;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.chart-card {
  padding: 18px;
}

.chart-card-header h3 {
  margin-bottom: 6px;
  font-size: 18px;
}

.chart-card-header p {
  color: #526071;
  line-height: 1.5;
}

.teaching-chart {
  display: block;
  width: 100%;
  min-height: 320px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  display: grid;
  gap: 6px;
  padding: 16px;
}

.metric-card span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.metric-card strong {
  color: #101828;
  font-size: 24px;
  line-height: 1.1;
}

.metric-card small {
  color: #526071;
}

.table-card {
  overflow-x: auto;
  padding: 12px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.result-table th,
.result-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.result-table th {
  color: #334155;
  background: #f8fafc;
}

.explanation-card {
  padding: 18px;
}

.teaching-list {
  margin: 0;
  padding-left: 20px;
  color: #475569;
  line-height: 1.55;
}

.module-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  color: #64748b;
  font-size: 13px;
}

.module-footer a {
  color: #136f63;
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .control-panel {
    position: static;
  }

  .lesson-banner,
  .module-footer {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

function testTs(module) {
  return `import { describe, expect, it } from "vitest";
import { moduleConfig } from "../src/components/${module.domainName}/module-config";
import { createDefaultControls, createState } from "../src/components/${module.domainName}/model";
import { runExample } from "../src/simulation/engine";

describe("${module.title}", () => {
  it("keeps the migrated WALS source scope in module metadata", () => {
    expect(moduleConfig.sourcePath).toBe("${module.sourcePath}");
    expect(moduleConfig.examples.length).toBe(${module.examples.length});
  });

  it("creates default controls for every migrated template", () => {
    for (const example of moduleConfig.examples) {
      const controls = createDefaultControls(example);
      expect(Object.keys(controls)).toEqual(example.controls.map((control) => control.id));
    }
  });

  it("calculates a teaching result for the default template", () => {
    const state = createState();
    expect(state.result.metrics.length).toBeGreaterThan(0);
    expect(state.result.chart.title.length).toBeGreaterThan(0);
  });

  it("calculates each migrated template without throwing", () => {
    for (const example of moduleConfig.examples) {
      const controls = createDefaultControls(example);
      const result = runExample(example, controls, 510, moduleConfig.data);
      expect(result.headline.length).toBeGreaterThan(0);
      expect(result.metrics.length).toBeGreaterThan(0);
    }
  });
});
`;
}

function readme(module) {
  return `# ${module.title}

WALS source module: \`Bayes-Cluster/WALS/${module.sourcePath}\`

This repository is a static Cycle.js + TypeScript rewrite of the WALS Shiny teaching template. It follows the same MVI-oriented structure used by the Statistics Learning Teaching Platform visualizers.

## Local Commands

\`\`\`bash
npm install
npm test
npm run build
\`\`\`

## Structure

\`\`\`text
src/main.ts
src/components/${module.domainName}/intent.ts
src/components/${module.domainName}/model.ts
src/components/${module.domainName}/view.ts
src/components/${module.domainName}/types.ts
src/d3/charts.ts
src/simulation/engine.ts
src/utils/
test/module.test.ts
\`\`\`
`;
}

for (const module of modules) {
  cleanApp(module.id);
  const appRoot = `apps/${module.id}`;
  const engine = engineTs().replaceAll("${DOMAIN}", module.domainName);
  const charts = chartTs().replaceAll("${DOMAIN}", module.domainName);

  write(`${appRoot}/package.json`, packageJson(module));
  write(`${appRoot}/.gitignore`, gitignore());
  write(`${appRoot}/index.html`, indexHtml(module));
  write(`${appRoot}/tsconfig.json`, tsconfig());
  write(`${appRoot}/vite.config.ts`, viteConfig());
  write(`${appRoot}/README.md`, readme(module));
  write(`${appRoot}/src/main.ts`, mainTs(module));
  write(`${appRoot}/src/components/${module.domainName}/types.ts`, typesTs());
  write(`${appRoot}/src/components/${module.domainName}/module-config.ts`, moduleConfigTs(module));
  write(`${appRoot}/src/components/${module.domainName}/intent.ts`, intentTs());
  write(`${appRoot}/src/components/${module.domainName}/model.ts`, modelTs());
  write(`${appRoot}/src/components/${module.domainName}/view.ts`, viewTs(module));
  write(`${appRoot}/src/components/${module.domainName}/index.ts`, indexTs());
  write(`${appRoot}/src/components/${module.domainName}.ts`, domainIndexTs(module));
  write(`${appRoot}/src/d3/charts.ts`, charts);
  write(`${appRoot}/src/simulation/engine.ts`, engine);
  write(`${appRoot}/src/utils/format.ts`, formatTs());
  write(`${appRoot}/src/utils/random.ts`, randomTs());
  write(`${appRoot}/src/styles/custom.css`, stylesCss());
  write(`${appRoot}/test/module.test.ts`, testTs(module));
}

console.log(`Generated ${modules.length} WALS apps.`);
