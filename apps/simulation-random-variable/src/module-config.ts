import type { ModuleConfig } from "@stats-viz/shared/wals/types";

export const moduleConfig: ModuleConfig = {
  "id": "simulation-random-variable",
  "repoName": "simulation-random-variable-visualization",
  "title": "Random Variable Generation",
  "subtitle": "Distribution sampling templates from WALS Simulation/RandomVariable.",
  "category": "WALS Simulation",
  "sourcePath": "apps/Simulation/RandomVariable",
  "examples": [
    {
      "id": "normal-generation",
      "title": "Example 1: Normal Random Variables",
      "kind": "random-normal",
      "sourcePath": "apps/Simulation/RandomVariable/example/1.md",
      "description": "Generate a normal sample and compare its simulated histogram with the target center.",
      "teachingPoints": [
        "Random generators approximate the target distribution in aggregate.",
        "Mean and spread become visible as sample size increases."
      ],
      "controls": [
        {
          "id": "sampleSize",
          "label": "Sample size",
          "type": "number",
          "min": 1,
          "max": 10000,
          "step": 1,
          "defaultValue": 1000
        },
        {
          "id": "mean",
          "label": "Mean",
          "type": "number",
          "min": -5,
          "max": 5,
          "step": 0.5,
          "defaultValue": 0
        },
        {
          "id": "sd",
          "label": "Standard deviation",
          "type": "number",
          "min": 0.2,
          "max": 5,
          "step": 0.1,
          "defaultValue": 1
        }
      ]
    },
    {
      "id": "exponential-generation",
      "title": "Example 2: Exponential Random Variables",
      "kind": "random-exponential",
      "sourcePath": "apps/Simulation/RandomVariable/example/2.md",
      "description": "Generate exponential data and examine how the rate parameter controls the tail.",
      "teachingPoints": [
        "Inverse transform sampling maps uniform draws into exponential draws.",
        "The exponential mean is the reciprocal of the rate."
      ],
      "controls": [
        {
          "id": "sampleSize",
          "label": "Sample size",
          "type": "number",
          "min": 1,
          "max": 10000,
          "step": 1,
          "defaultValue": 1000
        },
        {
          "id": "lambda",
          "label": "Rate lambda",
          "type": "number",
          "min": 0.1,
          "max": 5,
          "step": 0.1,
          "defaultValue": 2
        }
      ]
    },
    {
      "id": "gamma-rejection",
      "title": "Example 7: Gamma Rejection Sampling",
      "kind": "gamma-rejection",
      "sourcePath": "apps/Simulation/RandomVariable/example/7.md",
      "description": "Compare target gamma density with an exponential proposal envelope.",
      "teachingPoints": [
        "Acceptance-rejection sampling needs an envelope that dominates the target.",
        "The accepted sample follows the target only after the rejection rule is applied."
      ],
      "controls": [
        {
          "id": "sampleSize",
          "label": "Candidate draws",
          "type": "number",
          "min": 1,
          "max": 10000,
          "step": 1,
          "defaultValue": 1500
        },
        {
          "id": "alpha",
          "label": "Gamma alpha",
          "type": "number",
          "min": 0.5,
          "max": 5,
          "step": 0.1,
          "defaultValue": 1.5
        },
        {
          "id": "beta",
          "label": "Gamma beta",
          "type": "number",
          "min": 0.2,
          "max": 5,
          "step": 0.1,
          "defaultValue": 1
        },
        {
          "id": "lambda",
          "label": "Proposal lambda",
          "type": "number",
          "min": 0.1,
          "max": 5,
          "step": 0.1,
          "defaultValue": 0.6667
        },
        {
          "id": "envelope",
          "label": "Envelope constant c",
          "type": "number",
          "min": 0.5,
          "max": 5,
          "step": 0.1,
          "defaultValue": 1.258
        }
      ]
    }
  ]
};
