import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const resolveFromRoot = (...segments: string[]) => path.resolve(rootDir, ...segments);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: "dist",
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": resolveFromRoot("src"),
      "@components": resolveFromRoot("src/components"),
      "@features": resolveFromRoot("src/features"),
      "@lib": resolveFromRoot("src/lib"),
      "@routes": resolveFromRoot("src/routes")
    }
  }
});
