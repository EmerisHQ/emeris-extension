import browser from 'webextension-polyfill';

import { SaveWalletError, UnlockWalletError } from '@@/errors';
import { EmerisAccount, EmerisEncryptedWallet, EmerisWallet } from '@@/types';

import { decrypt, encrypt } from './libraries/encryption';
export enum EmerisStorageMode {
  SYNC = 'sync',
  LOCAL = 'local',
}

export default class EmerisStorage {
  private storageMode: EmerisStorageMode;

  constructor(storageMode: EmerisStorageMode) {
    this.storageMode = storageMode;
  }
  async getWhitelistedWebsites(secureKey: Uint8Array): Promise<{ origin: string }[]> {
    if (!secureKey) return [];

    const result = await browser.storage[this.storageMode].get('whitelistedWebsites');

    if (!result.whitelistedWebsites) return [];

    const whitelistedWebsites = JSON.parse(await decrypt(result.whitelistedWebsites, secureKey));
    return whitelistedWebsites;
  }
  async isWhitelistedWebsite(secureKey: Uint8Array, origin: string): Promise<boolean> {
    if (!secureKey) return false;

    const result = await browser.storage[this.storageMode].get('whitelistedWebsites');
    if (!result.whitelistedWebsites) {
      return false;
    } else {
      const whitelistedWebsites = JSON.parse(await decrypt(result.whitelistedWebsites, secureKey));
      const hasPermission = whitelistedWebsites.find((permission) => permission.origin === origin);
      return !!hasPermission;
    }
  }
  async addWhitelistedWebsite(secureKey: Uint8Array, origin: string): Promise<boolean> {
    if (!secureKey) return false;

    try {
      const result = await browser.storage[this.storageMode].get('whitelistedWebsites');
      let whitelistedWebsites;
      if (!result.whitelistedWebsites) {
        whitelistedWebsites = [];
      } else {
        whitelistedWebsites = JSON.parse(await decrypt(result.whitelistedWebsites, secureKey));
      }
      whitelistedWebsites.push({ origin });
      const encryptedWhitelistedWebsites = await encrypt(JSON.stringify(whitelistedWebsites), secureKey);
      await browser.storage[this.storageMode].set({ whitelistedWebsites: encryptedWhitelistedWebsites });
      return true;
    } catch (e) {
      return false;
    }
  }
  async deleteWhitelistedWebsite(secureKey: Uint8Array, origin: string): Promise<boolean> {
    if (!secureKey) return false;

    try {
      const result = await browser.storage[this.storageMode].get('whitelistedWebsites');
      const whitelistedWebsites = JSON.parse(await decrypt(result.whitelistedWebsites, secureKey));
      const newWhitelistedWebsites = whitelistedWebsites.filter((permission) => permission.origin != origin);
      const encryptedWhitelistedWebsites = await encrypt(JSON.stringify(newWhitelistedWebsites), secureKey);
      await browser.storage[this.storageMode].set({ whitelistedWebsites: encryptedWhitelistedWebsites });
      return true;
    } catch (e) {
      return false;
    }
  }
  private async getWallet(): Promise<EmerisEncryptedWallet> {
    const result = await browser.storage[this.storageMode].get('wallet');
    if (result.wallet) {
      return result.wallet;
    } else {
      return null;
    }
  }
  async hasWallet(): Promise<boolean> {
    return !!(await this.getWallet());
  }
  async getLastAccount(): Promise<string | null> {
    const res = await browser.storage[this.storageMode].get('lastAccount');
    return res.lastAccount ?? null;
  }
  async setLastAccount(accountName: string): Promise<void> {
    await browser.storage[this.storageMode].set({ lastAccount: accountName });
  }
  async updateAccount(
    account: Partial<EmerisAccount>,
    targetAccountName: string,
    secureKey: Uint8Array,
  ): Promise<boolean> {
    try {
      const wallet = await this.unlockWallet(secureKey); // always try to unlock first to make sure the password is correct
      const oldAccount = wallet.find((x) => x.accountName === targetAccountName);
      const accounts = wallet.filter((x) => x.accountName != targetAccountName);
      accounts.push({ ...oldAccount, ...account });
      await this.saveWallet(accounts, secureKey);
      return true;
    } catch (e) {
      console.log(e);
      throw new SaveWalletError('Could not save wallet: ' + e);
    }
  }
  async removeAccount(accountName: string, secureKey: Uint8Array): Promise<boolean> {
    try {
      const wallet = await this.unlockWallet(secureKey); // always try to unlock first to make sure the password is correct
      const accounts = wallet.filter((x) => x.accountName != accountName);
      await this.saveWallet(accounts, secureKey);
      return true;
    } catch (e) {
      console.log(e);
      throw new SaveWalletError('Could not save wallet: ' + e);
    }
  }
  async saveAccount(account: EmerisAccount, secureKey: Uint8Array): Promise<boolean> {
    try {
      const wallet = await this.unlockWallet(secureKey); // always try to unlock first to make sure the password is correct
      if (account.isLedger) {
        delete account.accountMnemonic; // just to avoid confusion
      }
      wallet.push(account);
      await this.saveWallet(wallet, secureKey);
      await this.setLastAccount(account.accountName);
      return true;
    } catch (e) {
      console.log(e);
      throw new SaveWalletError('Could not save wallet: ' + e);
    }
  }
  private async saveWallet(wallet: EmerisWallet, secureKey: Uint8Array): Promise<boolean> {
    try {
      const encryptedWallet = await encrypt(JSON.stringify(wallet), secureKey);
      await browser.storage[this.storageMode].set({ wallet: { walletData: encryptedWallet } });
      return true;
    } catch (e) {
      console.log(e);
      throw new SaveWalletError('Could not save wallet: ' + e);
    }
  }
  async unlockWallet(secureKey: Uint8Array): Promise<EmerisWallet> {
    try {
      const encWallet = await this.getWallet();
      if (!encWallet) {
        // ATTENTION if getWallet doesn't return a wallet for ever reason this would overwrite the saved wallet
        await this.saveWallet([], secureKey); // create wallet object if not there
        return [];
      }
      const wallet = JSON.parse(await decrypt(encWallet.walletData, secureKey));
      return wallet;
    } catch (e) {
      throw new UnlockWalletError('Could not unlock wallet: ' + e);
    }
  }
  async extensionReset() {
    await browser.storage[this.storageMode].set({
      secureKey: null,
      wallet: null,
      lastAccount: null,
      whitelistedWebsites: null,
      partialAccountCreationStep: null,
    });
  }
  async setPartialAccountCreationStep(partialAccountCreationStep, password) {
    if (password) {
      const encryptedPartialAccountCreationStep = partialAccountCreationStep
        ? await encrypt(JSON.stringify(partialAccountCreationStep), password)
        : null;
      await browser.storage[this.storageMode].set({ partialAccountCreationStep: encryptedPartialAccountCreationStep });
    } else {
      return;
    }
  }
  async getPartialAccountCreationStep(password) {
    try {
      const { partialAccountCreationStep: encryptedPartialAccountCreationStep } = await browser.storage[
        this.storageMode
      ].get('partialAccountCreationStep');
      if (!encryptedPartialAccountCreationStep) return undefined;
      return await decrypt(encryptedPartialAccountCreationStep, password);
    } catch (e) {
      await browser.storage[this.storageMode].set({ partialAccountCreationStep: null }); // prevent a broken state and the information is not critical
      throw new UnlockWalletError('Could not unlock partialAccountCreationStep: ' + e);
    }
  }
}
