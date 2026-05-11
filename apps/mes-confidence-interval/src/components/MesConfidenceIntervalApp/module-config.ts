import type { ModuleConfig } from "./types";

export const moduleConfig: ModuleConfig = {
  "id": "mes-confidence-interval",
  "repoName": "mes-confidence-interval-visualization",
  "title": "MES Confidence Interval",
  "subtitle": "The WALS/MES confidence interval interval-comparison template.",
  "category": "WALS MES",
  "sourcePath": "apps/MES/ConfidenceInterval",
  "examples": [
    {
      "id": "interval-comparison",
      "title": "Confidence Interval Comparison",
      "kind": "confidence-interval",
      "sourcePath": "apps/MES/ConfidenceInterval/server.R",
      "description": "Compare population-centered and sample-centered intervals around three sample means.",
      "teachingPoints": [
        "Changing the sigma multiplier widens or narrows all intervals.",
        "Sample means can produce intervals that do or do not cover the population mean."
      ],
      "controls": [
        {
          "id": "nSigma",
          "label": "n sigma",
          "type": "number",
          "min": 1,
          "max": 3,
          "step": 1,
          "defaultValue": 2
        },
        {
          "id": "sampleSize",
          "label": "Sample size",
          "type": "number",
          "min": 1,
          "max": 10,
          "step": 1,
          "defaultValue": 5
        },
        {
          "id": "mean1",
          "label": "Sample mean 1",
          "type": "number",
          "min": 27,
          "max": 35,
          "step": 0.1,
          "defaultValue": 31.3
        },
        {
          "id": "mean2",
          "label": "Sample mean 2",
          "type": "number",
          "min": 27,
          "max": 35,
          "step": 0.1,
          "defaultValue": 31.7
        },
        {
          "id": "mean3",
          "label": "Sample mean 3",
          "type": "number",
          "min": 27,
          "max": 35,
          "step": 0.1,
          "defaultValue": 32.5
        }
      ]
    }
  ]
};
