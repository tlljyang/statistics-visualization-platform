# Statistics Visualization Platform

One static GitHub Pages site for three statistics teaching visualizers:

- Confidence interval visualization
- Type I and Type II error visualization
- Regression visualization

## Local Commands

```bash
npm install
npm test
npm run build:pages
```

To preview the exact project Pages path locally:

```bash
rm -rf /tmp/statistics-platform-pages-preview
mkdir -p /tmp/statistics-platform-pages-preview
ln -s "$PWD/dist" /tmp/statistics-platform-pages-preview/statistics-visualization-platform
python3 -m http.server 4180 --directory /tmp/statistics-platform-pages-preview
```

Then open:

```text
http://127.0.0.1:4180/statistics-visualization-platform/
```

## Structure

```text
apps/confidence-interval/
apps/type-error/
apps/regression/
src/
scripts/build.mjs
.github/workflows/deploy.yml
```

The shell page lives in `src/`. Each visualizer is built as an isolated Vite app into `dist/apps/<visualizer>/`.
