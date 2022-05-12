import browser from 'webextension-polyfill';

import { ProxyEmeris } from '@@/lib/ProxyEmeris';

import { init } from './init';

console.log(browser);

const emeris = new ProxyEmeris();
init(emeris);
