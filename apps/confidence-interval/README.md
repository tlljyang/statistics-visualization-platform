# Confidence Interval Visualization

An interactive web-based visualization tool for demonstrating statistical confidence intervals in classroom settings.

## Features

- **Interactive Parameter Controls**: Adjust sample size, population standard deviation, and confidence level in real-time
- **Dynamic Visualization**: See confidence intervals plotted as they're generated
- **Coverage Tracking**: Monitor the proportion of intervals that contain the true population mean
- **Multiple Sampling Modes**: Add individual samples or generate multiple samples at once
- **Visual Indicators**: Color-coded intervals showing whether they capture the population mean
- **Responsive Design**: Collapsible sidebar for maximized viewing area

## Tech Stack

- **Framework**: Cycle.js (reactive programming)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Visualization**: D3.js
- **Statistics**: jstat
- **Styling**: Bootstrap 5
- **Testing**: Mocha + Chai + jsdom

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Development
```bash
npm run dev
```
Opens the application at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:files
```

### Lint and Format
```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

## Project Structure

```
src/
├── main.ts                           # Application entry point
├── components/
│   └── confidence-interval/
│       ├── index.ts                  # Main component
│       ├── intent.ts                 # User interaction handling
│       ├── model.ts                  # State management logic
│       ├── view.ts                   # UI rendering
│       ├── types.ts                  # TypeScript type definitions
│       └── components/
│           ├── graph.ts              # D3.js graph rendering
│           └── axes.ts               # Axis configuration
└── utils/
    └── dom-helper.ts                 # DOM selection utilities
```

## How It Works

1. **User Input**: Adjust parameters (sample size, population SD, confidence level) via sidebar controls
2. **Sample Generation**: Click "Add Sample" to generate a random sample from the population
3. **Interval Calculation**: The app calculates the confidence interval for each sample
4. **Visualization**: Each interval is plotted as a horizontal line
   - Blue intervals contain the population mean
   - Red intervals do not contain the population mean
5. **Coverage Tracking**: The app tracks and displays the percentage of intervals that captured the true mean

## Educational Purpose

This visualization helps students understand:

- What confidence intervals represent
- How sample size affects interval width
- The relationship between confidence level and interval width
- The concept of coverage probability
- Why some intervals miss the population mean (even at 95% confidence)

## License

MIT
