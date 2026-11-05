import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// `base: "./"` keeps the built site portable: it works from a custom domain,
// a GitHub Pages project path, or any static host without a rebuild.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5174, host: true },
  preview: { port: 4174, host: true },
});
