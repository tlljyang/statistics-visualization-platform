import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
      "@utils": "/src/utils",
      "@components": "/src/components",
    },
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
