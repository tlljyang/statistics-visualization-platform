import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
  optimizeDeps: {
    exclude: ["@stats-viz/shared"]
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    target: "es2020",
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
