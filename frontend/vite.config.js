import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:5001",
      "/records": "http://localhost:5001",
      "/goals": "http://localhost:5001", // <<< to jest kluczowe
    },
  },
});
