import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import federation from "@originjs/vite-plugin-federation";
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  base: process.env.PLUGIN_BASE_PATH || './',
  plugins: [
    vue(),
    federation({
        name: 'event-plugin',
        filename: 'plugin.js',
        exposes: {
          './Plugin': './src/components/PluginComponent.vue',
        },
        shared: ['vue']
    }),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla_${i}`
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  /*server: {
    port: 3000,
  },*/
  /*define: {
    'process.env': {},
  },*/
  build: {
    outDir: './dist',
    lib: {
      entry: './src/components/PluginComponent.vue',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  }
});
