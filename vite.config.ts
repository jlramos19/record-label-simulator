import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  publicDir: "public",
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true
  },
  preview: {
    host: "localhost",
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true
  }
});
