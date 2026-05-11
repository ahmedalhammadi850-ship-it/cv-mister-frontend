import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const BACKEND = 'https://cv-mister-backend-coly.onrender.com';

function hmrKeepalive(): Plugin {
  return {
    name: 'hmr-keepalive',
    apply: 'serve',
    configureServer(server) {
      let timer: ReturnType<typeof setInterval> | null = null;

      server.httpServer?.on('listening', () => {
        timer = setInterval(() => {
          try {
            server.ws.send({ type: 'custom', event: 'keepalive', data: {} });
          } catch {}
        }, 15000);
      });

      server.httpServer?.on('close', () => {
        if (timer) clearInterval(timer);
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    hmrKeepalive(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    hmr: process.env.REPL_ID
      ? { clientPort: 443, protocol: "wss" }
      : true,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/generate-pdf': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/socket.io': {
        target: BACKEND,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
