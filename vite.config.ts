import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: '/pack-identifier-71767-52313/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && [react()],
              resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
