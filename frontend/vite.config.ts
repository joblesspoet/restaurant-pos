import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@api": path.resolve(__dirname, "src/api"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.10.10:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    cors: true,
  },
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
});
