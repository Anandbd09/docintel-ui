import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    ssr: false,
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index",
      },
    },
  },
  vite: {
    server: {
      port: 3000,
    },
  },
});