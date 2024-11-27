import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';
import webExtension from "vite-plugin-web-extension"

export default defineConfig({
  plugins: [
    vue(),
    createHtmlPlugin({
      inject: {
        data: {
          injectScript: `<script src="./your-inline-script.js"></script>`
        }
      }
    }),
  webExtension()
  ],
  resolve: {
    alias: {
      'primevue': path.resolve(__dirname, 'node_modules/primevue'),
    },
  },
  build: {
    rollupOptions: {
      input: 'index.html',
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['primevue'],
  },
});
