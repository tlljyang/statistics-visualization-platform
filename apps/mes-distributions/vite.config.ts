import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "node"
  },
  optimizeDeps: {
    exclude: ["@stats-viz/shared"]
  }
});
