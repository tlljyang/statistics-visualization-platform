# Regression Teaching Application

An interactive teaching tool for regression analysis built with Cycle.js and D3.js, helping users understand linear regression, correlation, and statistical concepts through visual exploration.

## Features

- **Multiple Dataset Visualization**: Built-in datasets demonstrating various correlation types
  - Positive correlation
  - Negative correlation
  - No correlation
  - Strong linear relationship
  - Exponential growth

- **Interactive Charts**:
  - Scatter plot visualization
  - Toggle linear regression line display
  - Draw custom regression lines
  - Data point hover interactions

- **Real-time Statistics Panel**:
  - Correlation coefficient (r)
  - Coefficient of determination (R²)
  - Regression equation display
  - Data point coordinate information

## Tech Stack

- **Framework**: Cycle.js (reactive frontend framework)
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **Visualization**: D3.js 7
- **Styling**: Bootstrap 5
- **Stream Processing**: xstream

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
regression_teaching/
├── src/
│   ├── main.ts                 # Application entry, component composition
│   ├── components/             # Cycle.js components
│   │   ├── Sidebar/            # Dataset selection sidebar
│   │   ├── RegressionChart/    # Regression chart component
│   │   └── StatisticsPanel/    # Statistics information panel
│   ├── d3/                     # D3.js visualization utilities
│   │   ├── axes.ts             # Axis drawing
│   │   ├── graph.ts            # Chart rendering
│   │   └── regression.ts       # Regression line calculation
│   ├── styles/                 # Custom styles
│   └── _utils/                 # Utility functions
├── public/                     # Static assets
│   └── data/                   # JSON dataset files
└── index.html                  # HTML entry point
```

## Components

### Sidebar
- Dataset selector
- Regression line toggle
- Clear custom line button

### RegressionChart
- D3.js-based scatter plot
- Automatic linear regression line calculation and rendering
- Support for manually drawn custom regression lines
- Dynamic axes and ticks

### StatisticsPanel
- Real-time correlation coefficient calculation
- R² coefficient of determination display
- Regression equation formula
- Data point hover details

## Cycle.js Architecture

This application follows the Cycle.js MVI (Model-View-Intent) pattern:

```
User Input → Intent → Model → View → DOM
                  ↑       ↓
                  └───────┘
```

Each component is an independent Cycle.js component that receives data through `props` stream and returns DOM and HTTP request sinks.

## Dataset Format

Datasets use JSON format, stored in `public/data/` directory:

```json
{
  "name": "Dataset Name",
  "data": [
    { "x": 1, "y": 2 },
    { "x": 2, "y": 4 },
    ...
  ]
}
```

## Development Notes

### Adding New Datasets

1. Create a new JSON file in `public/data/` directory
2. Add the path to the `datasetPaths` array in `src/main.ts`

### TypeScript Configuration

- Target: ES2023
- Strict mode enabled
- No unused variable checks

## License

MIT
