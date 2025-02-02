import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";
import { version } from "./package.json";


export default defineConfig({
  plugins: [
    vue(),
    createHtmlPlugin({
      inject: {
        data: {
          injectScript: `<script src="./your-inline-script.js"></script>`,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      primevue: path.resolve(__dirname, "node_modules/primevue"),
    },
  },
  build: {
    target: "ESNext",
    rollupOptions: {
      input: "index.html",
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ["primevue"],
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
