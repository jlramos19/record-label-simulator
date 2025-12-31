import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": "\"production\""
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "../assets/js/ui-react-spa"),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/spa/main.tsx"),
      formats: ["es"],
      fileName: () => "ui-react-spa.js"
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "ui-react-spa.css";
          }
          return "ui-react-spa.[ext]";
        }
      }
    }
  }
});
