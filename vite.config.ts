import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import federation from "@originjs/vite-plugin-federation";
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Plugin configuration - supports both dev and preview modes
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'event-plugin',
      filename: 'plugin.js',
      exposes: {
        './PluginConfig': './src/index.ts',
        './InfoSidebar': './src/views/info/Sidebar.vue',
        './SettingsContent': './src/views/settings/Content.vue',
        './InfoContent': './src/views/info/Main.vue',
      },
      shared: ['vue'],
      remotes: {
        remoteName: '',
      },
    }),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla_${i}`
    })
  ],

  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dev': path.resolve(__dirname, './dev'),
    },
  },

  optimizeDeps: {
    exclude: ["__federation__"],
  },

  build: {
    outDir: './dist',
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
