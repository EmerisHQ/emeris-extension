import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
  plugins: [vue()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@starport/vuex': path.resolve(__dirname, './demeris/src/utils/EmerisError.ts'),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
      '@': path.resolve(__dirname, './demeris/src'),
      '@@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.vue', '.js', '.json', '.tsx'],
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: process.env.NODE_ENV != 'production' ? 'inline' : false,
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
