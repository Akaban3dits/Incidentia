import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    // si entras por ngrok, pon aquí tu dominio
    allowedHosts: ["35db34a59967.ngrok-free.app", "localhost", "127.0.0.1"],
    proxy: {
      // cualquier llamada a /api la proxea al backend
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false, // ok porque es http local
        // OJO: tu backend ya está en /api (app.use("/api", routes))
        // así que NO reescribas el path. Si tu back fuera en "/", usarías:
        // rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
