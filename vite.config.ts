import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import inject from '@rollup/plugin-inject';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import manifestJson from 'rollup-plugin-manifest-json';
import { dynamicImport } from 'vite-plugin-dynamic-import';
import envCompatible from 'vite-plugin-env-compatible';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defineConfig } from 'vitest/config';

import * as pkg from './package.json';

// https://vitejs.dev/config/
// eslint-disable-next-line max-lines-per-function
export default () => {
  // Do Node stuff here:
  process.env.VITE_GIT_VERSION = pkg.version;
  process.env.VITE_VERSION = pkg.version;
  return defineConfig({
    css: { preprocessorOptions: { scss: { charset: false } } },
    build: {
      emptyOutDir: false,
      chunkSizeWarningLimit: 1000,
      sourcemap: process.env.NODE_ENV != 'production' ? 'inline' : false,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, './index.html'),
          popup: path.resolve(__dirname, './popup.html'),
        },
        plugins: [
          inject({
            Buffer: ['buffer', 'Buffer'],
          }),
          manifestJson({
            input: 'public/manifest.json', // Required
            minify: true,
            manifest: {
              ...((process.env.NODE_ENV != 'production' ||
                process.env.EXTENSION_ID === 'cklkpejioojjeiigffappdlcmnonmjek') && {
                key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWWKi8PPH3u+bDCFJWTyvCwc9+kUt1l3WBt9vd3cQY7dpmEWGmFaeTNLLVWEE6+cwcUl4sOS9Jgj3J+svRtK8+CupAjL5RMRUh3v9amRZ4Gn0QT+x8K4Cg+KN+3fP6YnTw/QQI0laU2oEIpDbltuYz8x7zcZgmVtAeCo+55YNuR4q1hfc/ciSH5/wvkBplP8D0h4bhNAHNFUwmr39mTBhprr4KocMez09QcDIj7/5XGcaprLf0HpQx1rxD05ajxjUuM266Xz6uy5u6TvnqQoYZmPNo0zJoJIPiJ/qL+McQ6H8FzDs3Lhjv3OePbA+TOyx8uOCG0gNnyHlRAP5uPVzQIDAQAB',
              }),
            },
          }),
        ],
      },
    },
    plugins: [
      vue(),
      vueI18n({
        // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
        compositionOnly: false,

        // you need to set i18n resource including paths !
        include: path.resolve(__dirname, './demeris/src/locales/**'),
      }),
      nodeResolve(),
      dynamicImport(),
      envCompatible(),
      viteStaticCopy({
        targets: [{ src: './demeris/public/assets/fonts', dest: 'assets' }],
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@starport/vuex': path.resolve(__dirname, './demeris/src/utils/EmerisError.ts'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
        stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        '@': path.resolve(__dirname, './demeris/src'),
        '@@': path.resolve(__dirname, './src'),
        ...(process.env.NODE_ENV === 'web'
          ? { 'webextension-polyfill': path.resolve(__dirname, './src/utils/web-browser') }
          : {}),
      },
      extensions: ['.ts', '.vue', '.js', '.json', '.tsx'],
    },
    define: {
      'process.env': process.env,
      ...(process.env.NODE_ENV !== 'test' && { 'process.platform': {} }),
    },
    server: {
      port: 8080,
    },
    optimizeDeps: {
      include: ['bip39'],
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
    test: {
      globals: true,
      environment: 'jsdom',
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
  });
};
