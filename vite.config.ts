import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    ssr: false,
  },
  vite: {
    server: {
      port: 3000,
    },
  },
});