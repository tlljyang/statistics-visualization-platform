import type { ModuleConfig } from "./types";

export const moduleConfig: ModuleConfig = {
  id: "simulation-clt",
  repoName: "simulation-clt-visualization",
  title: "Central Limit Theorem",
  subtitle:
    "Build the sampling distribution of sample means and compare it with the normal approximation.",
  category: "WALS Simulation",
  sourcePath: "apps/Simulation/CentralLimitTheorem",
  examples: [
    {
      id: "clt-lab",
      title: "Sampling Means Lab",
      kind: "central-limit-theorem",
      sourcePath: "apps/Simulation/CentralLimitTheorem",
      description:
        "Repeatedly draw samples from a population, compute each sample mean, and watch those means form a sampling distribution.",
      teachingPoints: [
        "The population can be skewed or uneven while the sample means become more bell-shaped.",
        "Larger sample sizes make sample means less variable.",
        "The observed SD of sample means should move toward the standard error sigma / sqrt(n)."
      ],
      controls: [
        {
          id: "populationShape",
          label: "Population shape",
          type: "select",
          defaultValue: "exponential",
          options: [
            { value: "normal", label: "Normal" },
            { value: "uniform", label: "Uniform" },
            { value: "exponential", label: "Exponential" },
            { value: "skewed", label: "Right-skewed" },
            { value: "bimodal", label: "Bimodal" }
          ]
        },
        {
          id: "sampleSize",
          label: "Sample size n",
          type: "number",
          min: 1,
          max: 200,
          step: 1,
          defaultValue: 5
        }
      ]
    }
  ]
};
