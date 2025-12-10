import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  base: "/", // 👈 served from root domain (ddrarchive.org)
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
      "~@ibm": fileURLToPath(new URL("./node_modules/@ibm", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/ch-graphql": {
        target: "https://api.cooperhewitt.org",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ch-graphql/, "/"),
      },
    },
  },
});
