import '@/assets/scss/index.scss';
import '@@/styles/index.scss';
import 'tippy.js/dist/tippy.css';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import VueTippy from 'vue-tippy';
import browserPolyFill from 'webextension-polyfill';

import messages from '@/locales/en.json';
import router from '@@/router/popup';
import BrowserManager from '@@/utils/browser';

import { rootstore } from '../store/index';
import App from './App.vue';

BrowserManager.getInstance().setBrowser(browserPolyFill);

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard',
      },
    },
  },
});

const app = createApp(App);

// @ts-ignore somehow here is a type incompatibility with demeris
app.use(rootstore).use(i18n).use(router).use(VueTippy).mount('#app');
